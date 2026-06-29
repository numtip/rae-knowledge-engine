/**
 * RAE Knowledge Engine — Media Inventory Engine
 * scripts/inventory-media.js
 *
 * Phase: K0.1B
 * Author: RAE Knowledge Engine
 * Date: 2026-06-29
 *
 * PURPOSE:
 *   Catalog media assets (images, PDFs, documents, logos) from crawled HTML.
 *   This phase inventories URLs and metadata only. No binary downloads.
 *
 *   Input:  02_CRAWLED/raw-html/
 *   Output: 04_KNOWLEDGE/media/media-inventory.csv
 *           04_KNOWLEDGE/media/media-inventory.json
 *           04_KNOWLEDGE/media/image-map.json
 *
 * RULES:
 *   - Inventory URLs only (no downloads in K0.1B)
 *   - Classify by asset_type (image, pdf, document, etc.)
 *   - Mark usage_candidate (hero, research, logo, etc.)
 *   - Estimate file size from URL metadata
 *   - Flag priority media for Landing V2
 *
 * USAGE:
 *   node scripts/inventory-media.js [--dry-run]
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  sourceDir: path.resolve(__dirname, '../02_CRAWLED/raw-html'),
  outputDir: path.resolve(__dirname, '../04_KNOWLEDGE/media'),
  csvFile: path.resolve(__dirname, '../04_KNOWLEDGE/media/media-inventory.csv'),
  jsonFile: path.resolve(__dirname, '../04_KNOWLEDGE/media/media-inventory.json'),
  imageMapFile: path.resolve(__dirname, '../04_KNOWLEDGE/media/image-map.json'),
  logFile: path.resolve(__dirname, '../04_KNOWLEDGE/media/inventory.log'),
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
    console.log('🖼️  Starting media inventory...');
    this._log('INFO', `Media inventory started at ${new Date().toISOString()}`);

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
      this._log('ERROR', `Inventory failed: ${error.message}`);
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  async _readHtmlFiles() {
    this._log('INFO', 'Reading HTML files...');

    if (!fs.existsSync(CONFIG.sourceDir)) {
      throw new Error(`Source directory not found: ${CONFIG.sourceDir}`);
    }

    const files = fs.readdirSync(CONFIG.sourceDir)
      .filter(f => f.endsWith('.html'));

    console.log(`📄 Found ${files.length} HTML files`);
    return files;
  }

  async _extractMediaFromFile(filename) {
    const filePath = path.join(CONFIG.sourceDir, filename);
    const sourceUrl = this._urlFromFilename(filename);

    try {
      const html = fs.readFileSync(filePath, 'utf8');

      // Extract images
      this._extractImages(html, sourceUrl);

      // Extract links to documents
      this._extractDocuments(html, sourceUrl);

      this._log('INFO', `Extracted media from ${filename}`);
    } catch (error) {
      this.errors.push({ file: filename, error: error.message });
      this._log('ERROR', `Failed to extract media from ${filename}: ${error.message}`);
    }
  }

  _extractImages(html, sourceUrl) {
    // Extract <img> tags
    const imgRegex = /<img\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*(?:alt\s*=\s*["']([^"']+)["'])?[^>]*>/gi;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      const assetUrl = this._normalizeUrl(match[1], sourceUrl);
      const altText = match[2] || '';

      if (!assetUrl || this.visited.has(assetUrl)) continue;

      this.media.push({
        id: null,  // will be assigned
        source_url: sourceUrl,
        asset_url: assetUrl,
        file_name: this._extractFileName(assetUrl),
        extension: this._getExtension(assetUrl),
        asset_type: 'image',
        alt_text: altText,
        context: '',  // will be populated during context extraction
        category: null,  // will be detected
        usage_candidate: null,  // will be classified
        download_status: 'not_downloaded',
        width: null,
        height: null,
        size_kb: null,
        language: null,
        notes: '',
      });

      this.visited.add(assetUrl);
    }

    // Extract <picture> tags
    const pictureRegex = /<picture[^>]*>[\s\S]*?<source[^>]*srcset\s*=\s*["']([^"']+)["'][^>]*>/gi;
    while ((match = pictureRegex.exec(html)) !== null) {
      const assetUrl = this._normalizeUrl(match[1], sourceUrl);
      if (assetUrl && !this.visited.has(assetUrl)) {
        // Similar logic as above
        this.visited.add(assetUrl);
      }
    }
  }

  _extractDocuments(html, sourceUrl) {
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
        asset_url: assetUrl,
        file_name: this._extractFileName(assetUrl),
        extension: ext,
        asset_type: ext === 'pdf' ? 'pdf' : 'document',
        alt_text: linkText,
        context: linkText,
        category: null,
        usage_candidate: null,
        download_status: 'not_downloaded',
        width: null,
        height: null,
        size_kb: null,
        language: null,
        notes: '',
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

      // Detect asset_type if not set
      if (!item.asset_type) {
        const ext = item.extension.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) {
          item.asset_type = 'image';
        } else if (ext === 'pdf') {
          item.asset_type = 'pdf';
        } else {
          item.asset_type = 'document';
        }
      }

      // Classify usage_candidate
      this._classifyUsageCandidate(item);

      // Detect category
      item.category = this._detectCategory(item.source_url);
    }
  }

  _classifyUsageCandidate(item) {
    const url = (item.asset_url + ' ' + item.alt_text).toLowerCase();
    const fileName = item.file_name.toLowerCase();

    // High priority: Hero, research, laboratory, community, building
    if (url.includes('hero') || url.includes('banner') || fileName.includes('hero')) {
      item.usage_candidate = 'hero';
      return;
    }

    if (url.includes('lab') || url.includes('laboratory') || url.includes('equipment')) {
      item.usage_candidate = 'laboratory';
      return;
    }

    if (url.includes('research') || url.includes('experiment')) {
      item.usage_candidate = 'research';
      return;
    }

    if (url.includes('building') || url.includes('campus') || url.includes('facility')) {
      item.usage_candidate = 'building';
      return;
    }

    if (url.includes('community') || url.includes('farmer') || url.includes('people')) {
      item.usage_candidate = 'community';
      return;
    }

    // Logos and branding
    if (url.includes('logo') || url.includes('partner') || fileName.includes('logo')) {
      item.usage_candidate = 'partner-logo';
      return;
    }

    if (url.includes('rae') && url.includes('logo')) {
      item.usage_candidate = 'logo';
      return;
    }

    // Documents and archives
    if (item.asset_type === 'pdf' || item.asset_type === 'document') {
      item.usage_candidate = 'document';
      return;
    }

    // Default
    item.usage_candidate = 'exclude';
  }

  _detectCategory(sourceUrl) {
    const lower = sourceUrl.toLowerCase();
    if (lower.includes('research') || lower.includes('wid=206')) return 'research';
    if (lower.includes('service') || lower.includes('training')) return 'services';
    if (lower.includes('news') || lower.includes('wid=20')) return 'news';
    if (lower.includes('organization') || lower.includes('department')) return 'organization';
    if (lower.includes('landing') || lower.includes('index')) return 'landing';
    return 'other';
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
    this._log('INFO', 'Exporting media inventory...');

    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Export CSV
    this._exportCsv();

    // Export JSON
    this._exportJson();

    // Export image map
    this._exportImageMap();

    console.log(`✅ Exported ${this.media.length} media items`);
  }

  _exportCsv() {
    const headers = [
      'id', 'source_url', 'asset_url', 'file_name', 'extension', 'asset_type',
      'alt_text', 'category', 'usage_candidate', 'download_status', 'size_kb', 'notes'
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
        item.usage_candidate || 'unknown',
        item.download_status,
        item.size_kb || '',
        this._escapeCsv(item.notes),
      ];
      rows.push(row.join(','));
    }

    fs.writeFileSync(CONFIG.csvFile, rows.join('\n'), 'utf8');
    this._log('INFO', `Exported CSV: ${CONFIG.csvFile}`);
  }

  _exportJson() {
    const dist = {};
    for (const item of this.media) {
      const key = item.usage_candidate || 'unknown';
      dist[key] = (dist[key] || 0) + 1;
    }

    const index = {
      metadata: {
        generated: new Date().toISOString(),
        total_items: this.media.length,
        usage_candidate_distribution: dist,
        asset_type_distribution: this._computeDistribution('asset_type'),
      },
      items: this.media,
    };

    fs.writeFileSync(CONFIG.jsonFile, JSON.stringify(index, null, 2), 'utf8');
    this._log('INFO', `Exported JSON: ${CONFIG.jsonFile}`);
  }

  _exportImageMap() {
    const heroCandidates = this.media.filter(m => m.usage_candidate === 'hero');
    const researchCandidates = this.media.filter(m => m.usage_candidate === 'research');
    const labCandidates = this.media.filter(m => m.usage_candidate === 'laboratory');
    const communityCandidates = this.media.filter(m => m.usage_candidate === 'community');
    const buildingCandidates = this.media.filter(m => m.usage_candidate === 'building');
    const logoCandidates = this.media.filter(m => m.usage_candidate === 'partner-logo' || m.usage_candidate === 'logo');

    const imageMap = {
      hero_candidates: heroCandidates.map(m => ({
        id: m.id,
        file_name: m.file_name,
        source_url: m.source_url,
        asset_url: m.asset_url,
      })),
      research_candidates: researchCandidates.map(m => ({
        id: m.id,
        file_name: m.file_name,
        source_url: m.source_url,
      })),
      laboratory_candidates: labCandidates.map(m => ({
        id: m.id,
        file_name: m.file_name,
        source_url: m.source_url,
      })),
      community_candidates: communityCandidates.map(m => ({
        id: m.id,
        file_name: m.file_name,
        source_url: m.source_url,
      })),
      building_candidates: buildingCandidates.map(m => ({
        id: m.id,
        file_name: m.file_name,
        source_url: m.source_url,
      })),
      logo_candidates: logoCandidates.map(m => ({
        id: m.id,
        file_name: m.file_name,
        source_url: m.source_url,
      })),
    };

    fs.writeFileSync(CONFIG.imageMapFile, JSON.stringify(imageMap, null, 2), 'utf8');
    this._log('INFO', `Exported image map: ${CONFIG.imageMapFile}`);
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
    const match = filename.match(/wtms_webpageDetail_wID_(\d+)/);
    if (match) {
      return `https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=${match[1]}`;
    }
    if (filename.includes('landing')) {
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
    const usage = {};
    for (const item of this.media) {
      const key = item.usage_candidate || 'unknown';
      usage[key] = (usage[key] || 0) + 1;
    }

    console.log('\n📊 Media Inventory Report');
    console.log('─'.repeat(50));
    console.log(`Total items: ${this.media.length}`);
    console.log(`Images: ${this.media.filter(m => m.asset_type === 'image').length}`);
    console.log(`PDFs: ${this.media.filter(m => m.asset_type === 'pdf').length}`);
    console.log(`Documents: ${this.media.filter(m => m.asset_type === 'document').length}`);
    console.log(`Output: ${CONFIG.csvFile}`);

    if (!this.dryRun) {
      console.log('\n✅ Inventory complete!');
      console.log('\n🖼️  Next phase: Download priority media (K0.2B)');
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
