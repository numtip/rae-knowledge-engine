/**
 * RAE Knowledge Engine — Media Discovery Engine v2
 * scripts/inventory-media-v2.js
 *
 * Phase: K0.2B
 * Author: RAE Knowledge Engine
 * Date: 2026-06-29
 *
 * PURPOSE:
 *   Catalog media assets from crawled HTML with quality metrics and Stitch candidacy.
 *   This phase discovers and catalogs URLs only. No binary downloads.
 *
 *   Input:  02_CRAWLED/raw-html/ (recursive)
 *   Output: 04_KNOWLEDGE/media/
 *           - wave1-media-discovery.csv
 *           - wave1-media-discovery.json
 *           - wave1-stitch-image-candidates.json
 *
 * VISUAL ROLES:
 *   - hero               — Landing page hero image (PRIORITY)
 *   - research           — Research lab/photos (HIGH PRIORITY)
 *   - laboratory         — Laboratory equipment (HIGH PRIORITY)
 *   - community          — Farmers/community engagement (HIGH PRIORITY)
 *   - building           — Campus/facility photos (MEDIUM PRIORITY)
 *   - partner-logo       — Partner logos (MEDIUM PRIORITY)
 *   - document           — Document/publication thumbnails (LOW)
 *   - archive            — Old/low-quality images (SKIP)
 *   - exclude            — Broken/decorative only (EXCLUDE)
 *
 * USAGE:
 *   node scripts/inventory-media-v2.js [--dry-run]
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  sourceDir: path.resolve(__dirname, '../02_CRAWLED/raw-html'),
  outputDir: path.resolve(__dirname, '../04_KNOWLEDGE/media'),
  csvFile: path.resolve(__dirname, '../04_KNOWLEDGE/media/wave1-media-discovery.csv'),
  jsonFile: path.resolve(__dirname, '../04_KNOWLEDGE/media/wave1-media-discovery.json'),
  stitchCandidatesFile: path.resolve(__dirname, '../04_KNOWLEDGE/media/wave1-stitch-image-candidates.json'),
  logFile: path.resolve(__dirname, '../04_KNOWLEDGE/media/discovery-v2.log'),
};

// ─── Media Inventory ────────────────────────────────────────────────────────

class MediaInventory {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.media = [];
    this.visited = new Set();
    this.errors = [];
    this.log = [];
  }

  async run() {
    console.log('🖼️  Starting media discovery v2...');
    this._log('INFO', `Media discovery v2 started at ${new Date().toISOString()}`);

    try {
      // Step 1: Read HTML files
      const files = await this._readHtmlFiles();

      // Step 2: Extract media references
      for (const file of files) {
        await this._extractMediaFromFile(file);
      }

      // Step 3: Classify and deduplicate
      await this._classifyMedia();
      await this._deduplicateMedia();

      // Step 4: Export results
      if (!this.dryRun) {
        await this._exportResults();
      }

      // Step 5: Report
      this._printReport();
    } catch (error) {
      this._log('ERROR', `Discovery failed: ${error.message}`);
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  _walkSync(dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;
    for (const file of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        files.push(...this._walkSync(fullPath));
      } else if (file.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  async _readHtmlFiles() {
    this._log('INFO', 'Reading HTML files recursively...');

    if (!fs.existsSync(CONFIG.sourceDir)) {
      throw new Error(`Source directory not found: ${CONFIG.sourceDir}`);
    }

    const files = this._walkSync(CONFIG.sourceDir);

    console.log(`📄 Found ${files.length} HTML files`);
    return files;
  }

  async _extractMediaFromFile(filePath) {
    const filename = path.basename(filePath);
    const relativePath = path.relative(CONFIG.sourceDir, filePath);
    const sourceUrl = this._urlFromFilename(filename);

    try {
      const html = fs.readFileSync(filePath, 'utf8');

      // Extract images
      this._extractImages(html, sourceUrl, relativePath);

      // Extract links to documents
      this._extractDocuments(html, sourceUrl, relativePath);

      this._log('INFO', `Extracted media from ${relativePath}`);
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      this._log('ERROR', `Failed to extract media from ${relativePath}: ${error.message}`);
    }
  }

  _extractImages(html, sourceUrl, sourcePath) {
    // Extract <img> tags
    const imgRegex = /<img\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*(?:alt\s*=\s*["']([^"']+)["'])?[^>]*>/gi;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      const assetUrl = this._normalizeUrl(match[1], sourceUrl);
      const altText = match[2] || '';

      if (!assetUrl || this.visited.has(assetUrl)) continue;

      this.media.push({
        id: null,
        source_url: sourceUrl,
        source_path: sourcePath,
        asset_url: assetUrl,
        file_name: this._extractFileName(assetUrl),
        extension: this._getExtension(assetUrl),
        asset_type: 'image',
        alt_text: altText,
        visual_role: 'exclude',  // will be classified
        category: null,
        estimated_quality: 'unknown',  // high, medium, low, unknown
        stitch_candidate: false,
        download_priority: 'skip',  // high, medium, low, skip
        width: null,
        height: null,
        size_kb: null,
        reason: '',
        notes: '',
      });

      this.visited.add(assetUrl);
    }
  }

  _extractDocuments(html, sourceUrl, sourcePath) {
    // Extract links to PDFs and documents
    const linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']+\.(?:pdf|doc|docx|xls|xlsx|zip))["'][^>]*>([^<]*)<\/a>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const assetUrl = this._normalizeUrl(match[1], sourceUrl);
      const linkText = match[2].trim();

      if (!assetUrl || this.visited.has(assetUrl)) continue;

      const ext = this._getExtension(assetUrl).toLowerCase();

      this.media.push({
        id: null,
        source_url: sourceUrl,
        source_path: sourcePath,
        asset_url: assetUrl,
        file_name: this._extractFileName(assetUrl),
        extension: ext,
        asset_type: ext === 'pdf' ? 'pdf' : 'document',
        alt_text: linkText,
        visual_role: 'document',
        category: null,
        estimated_quality: 'medium',
        stitch_candidate: false,
        download_priority: 'low',
        width: null,
        height: null,
        size_kb: null,
        reason: 'Document link',
        notes: linkText,
      });

      this.visited.add(assetUrl);
    }
  }

  _classifyMedia() {
    this._log('INFO', 'Classifying media items...');

    let id = 1;
    for (const item of this.media) {
      item.id = `MEDIA-${String(id).padStart(3, '0')}`;
      id++;

      // Classify visual role
      this._classifyVisualRole(item);

      // Detect category
      item.category = this._detectCategory(item.source_url);

      // Assess Stitch candidacy
      this._assessStitchCandidate(item);
    }
  }

  _classifyVisualRole(item) {
    const url = (item.asset_url + ' ' + item.alt_text).toLowerCase();
    const fileName = item.file_name.toLowerCase();

    // High Priority: Hero images
    if (url.includes('hero') || url.includes('banner') || fileName.includes('hero')) {
      item.visual_role = 'hero';
      item.estimated_quality = 'high';
      item.download_priority = 'high';
      item.reason = 'Hero image candidate for landing page';
      return;
    }

    // High Priority: Laboratory
    if (url.includes('lab') || url.includes('laboratory') || url.includes('equipment') || 
        url.includes('facility')) {
      item.visual_role = 'laboratory';
      item.estimated_quality = 'high';
      item.download_priority = 'high';
      item.reason = 'Laboratory/equipment photo';
      return;
    }

    // High Priority: Research
    if (url.includes('research') || url.includes('experiment') || url.includes('project')) {
      item.visual_role = 'research';
      item.estimated_quality = 'high';
      item.download_priority = 'high';
      item.reason = 'Research activity photo';
      return;
    }

    // High Priority: Community/Farmers
    if (url.includes('community') || url.includes('farmer') || url.includes('people') || 
        url.includes('farmer') || url.includes('agriculture')) {
      item.visual_role = 'community';
      item.estimated_quality = 'high';
      item.download_priority = 'high';
      item.reason = 'Community/farmer engagement photo';
      return;
    }

    // Medium Priority: Building/Campus
    if (url.includes('building') || url.includes('campus') || url.includes('facility')) {
      item.visual_role = 'building';
      item.estimated_quality = 'medium';
      item.download_priority = 'medium';
      item.reason = 'Campus/facility photo';
      return;
    }

    // Medium Priority: Logos
    if (url.includes('logo') || url.includes('partner') || fileName.includes('logo') ||
        fileName.includes('icon')) {
      if (url.includes('rae') && url.includes('logo')) {
        item.visual_role = 'partner-logo';
        item.download_priority = 'medium';
      } else {
        item.visual_role = 'partner-logo';
        item.download_priority = 'medium';
      }
      item.estimated_quality = 'high';
      item.reason = 'Logo/branding asset';
      return;
    }

    // Documents
    if (item.asset_type === 'pdf' || item.asset_type === 'document') {
      item.visual_role = 'document';
      item.estimated_quality = 'medium';
      item.download_priority = 'low';
      item.reason = 'Document/publication reference';
      return;
    }

    // Archive: Old images
    if (url.includes('2564') || url.includes('2565') || url.includes('2566') || 
        url.includes('2567')) {
      item.visual_role = 'archive';
      item.estimated_quality = 'low';
      item.download_priority = 'skip';
      item.reason = 'Old content (pre-2568)';
      return;
    }

    // Default: Low priority decorative
    item.visual_role = 'exclude';
    item.estimated_quality = 'low';
    item.download_priority = 'skip';
    item.reason = 'Decorative or low-value asset';
  }

  _detectCategory(sourceUrl) {
    const lower = sourceUrl.toLowerCase();
    if (lower.includes('research')) return 'research';
    if (lower.includes('service')) return 'services';
    if (lower.includes('news')) return 'news';
    if (lower.includes('organization')) return 'organization';
    if (lower.includes('landing') || lower.includes('index')) return 'landing';
    return 'other';
  }

  _assessStitchCandidate(item) {
    // Stitch candidates: hero, research, laboratory, community, building, partner-logo
    const stitchRoles = ['hero', 'research', 'laboratory', 'community', 'building', 'partner-logo'];
    if (stitchRoles.includes(item.visual_role) && item.estimated_quality !== 'low') {
      item.stitch_candidate = true;
    }
  }

  _deduplicateMedia() {
    this._log('INFO', 'Deduplicating media...');

    const seen = new Map();
    const unique = [];

    for (const item of this.media) {
      const key = item.asset_url;
      if (!seen.has(key)) {
        seen.set(key, item);
        unique.push(item);
      }
    }

    const removed = this.media.length - unique.length;
    this.media = unique;
    this._log('INFO', `Deduplicated: removed ${removed} duplicates`);
  }

  async _exportResults() {
    this._log('INFO', 'Exporting media discovery...');

    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Export CSV
    this._exportCsv();

    // Export JSON
    this._exportJson();

    // Export Stitch candidates
    this._exportStitchCandidates();

    console.log(`✅ Exported ${this.media.length} media items`);
  }

  _exportCsv() {
    const headers = [
      'id', 'source_url', 'asset_url', 'file_name', 'extension', 'asset_type',
      'alt_text', 'category', 'visual_role', 'estimated_quality', 'stitch_candidate',
      'download_priority', 'size_kb', 'reason', 'notes'
    ];

    const rows = [headers.join(',')];

    for (const item of this.media) {
      const row = [
        item.id,
        this._escapeCsv(item.source_url),
        this._escapeCsv(item.asset_url),
        this._escapeCsv(item.file_name),
        item.extension,
        item.asset_type,
        this._escapeCsv(item.alt_text),
        item.category || 'unknown',
        item.visual_role,
        item.estimated_quality,
        item.stitch_candidate ? 'yes' : 'no',
        item.download_priority,
        item.size_kb || '',
        this._escapeCsv(item.reason),
        this._escapeCsv(item.notes),
      ];
      rows.push(row.join(','));
    }

    fs.writeFileSync(CONFIG.csvFile, rows.join('\n'), 'utf8');
    this._log('INFO', `Exported CSV: ${CONFIG.csvFile}`);
  }

  _exportJson() {
    const dist = {};
    const qualityDist = {};
    const priorityDist = {};

    for (const item of this.media) {
      const key = item.visual_role || 'unknown';
      dist[key] = (dist[key] || 0) + 1;
      qualityDist[item.estimated_quality] = (qualityDist[item.estimated_quality] || 0) + 1;
      priorityDist[item.download_priority] = (priorityDist[item.download_priority] || 0) + 1;
    }

    const index = {
      metadata: {
        generated: new Date().toISOString(),
        version: 'v2',
        total_items: this.media.length,
        stitch_candidates: this.media.filter(m => m.stitch_candidate).length,
        visual_role_distribution: dist,
        quality_distribution: qualityDist,
        priority_distribution: priorityDist,
        asset_type_distribution: this._computeDistribution('asset_type'),
      },
      items: this.media,
    };

    fs.writeFileSync(CONFIG.jsonFile, JSON.stringify(index, null, 2), 'utf8');
    this._log('INFO', `Exported JSON: ${CONFIG.jsonFile}`);
  }

  _exportStitchCandidates() {
    const candidates = this.media.filter(m => m.stitch_candidate);

    const byRole = {};
    for (const item of candidates) {
      if (!byRole[item.visual_role]) {
        byRole[item.visual_role] = [];
      }
      byRole[item.visual_role].push({
        id: item.id,
        file_name: item.file_name,
        asset_url: item.asset_url,
        source_url: item.source_url,
        quality: item.estimated_quality,
        alt_text: item.alt_text,
      });
    }

    const stitchData = {
      metadata: {
        generated: new Date().toISOString(),
        total_candidates: candidates.length,
        by_role: Object.keys(byRole).map(role => ({
          role,
          count: byRole[role].length,
        })),
      },
      candidates_by_role: byRole,
    };

    fs.writeFileSync(CONFIG.stitchCandidatesFile, JSON.stringify(stitchData, null, 2), 'utf8');
    this._log('INFO', `Exported Stitch candidates: ${CONFIG.stitchCandidatesFile}`);
  }

  _computeDistribution(field) {
    const dist = {};
    for (const item of this.media) {
      const key = item[field] || 'unknown';
      dist[key] = (dist[key] || 0) + 1;
    }
    return dist;
  }

  _normalizeUrl(href, sourceUrl) {
    try {
      if (!href) return null;
      if (href.startsWith('http')) return href;
      if (href.startsWith('/')) return `https://rae.mju.ac.th${href}`;
      return new URL(href, sourceUrl).toString();
    } catch (e) {
      return null;
    }
  }

  _extractFileName(url) {
    try {
      return new URL(url).pathname.split('/').pop();
    } catch (e) {
      return 'unknown';
    }
  }

  _getExtension(url) {
    const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
    return match ? match[1].toLowerCase() : 'unknown';
  }

  _urlFromFilename(filename) {
    if (filename.includes('wid')) {
      const match = filename.match(/wid[_=](\d+)/i);
      if (match) {
        return `https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=${match[1]}`;
      }
    }
    if (filename.includes('landing') || filename.includes('index')) {
      return 'https://rae.mju.ac.th/wtms_index.aspx?lang=th-TH';
    }
    return 'https://rae.mju.ac.th/unknown';
  }

  _escapeCsv(value) {
    if (!value) return '""';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  _log(level, message) {
    const entry = `[${new Date().toISOString()}] ${level.padEnd(5)} ${message}`;
    this.log.push(entry);
  }

  _printReport() {
    const candidates = this.media.filter(m => m.stitch_candidate).length;
    const highPriority = this.media.filter(m => m.download_priority === 'high').length;

    console.log('\n📊 Media Discovery Report v2');
    console.log('─'.repeat(50));
    console.log(`Total items: ${this.media.length}`);
    console.log(`Stitch candidates: ${candidates}`);
    console.log(`High priority: ${highPriority}`);
    console.log(`Output: ${CONFIG.csvFile}`);

    if (!this.dryRun) {
      console.log('\n✅ Discovery v2 complete!');
    } else {
      console.log('\n🏃 Dry-run mode — no files saved');
    }
  }
}

// ─── CLI Entry Point ────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
  };

  const inventory = new MediaInventory(options);
  await inventory.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { MediaInventory, CONFIG };
