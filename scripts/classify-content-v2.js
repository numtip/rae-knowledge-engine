/**
 * RAE Knowledge Engine — Content Classification Engine v2
 * scripts/classify-content.js
 *
 * Phase: K0.2B+
 * Author: RAE Knowledge Engine
 * Date: 2026-06-29
 *
 * PURPOSE:
 *   Analyze extracted content and assign classification actions, importance ratings,
 *   story priority, and metadata to guide normalization and storytelling pipeline.
 *
 *   Input:  02_CRAWLED/text/ (recursive, preserves category folders)
 *   Output: 04_KNOWLEDGE/classification/
 *           - content-classification-v2.csv
 *           - content-classification-v2.json
 *
 * CLASSIFICATION ACTIONS:
 *   - KEEP      — Preserve as-is
 *   - REWRITE   — Valuable but needs restructuring
 *   - MERGE     — Combine multiple fragments
 *   - ARCHIVE   — Preserve but mark as historical
 *   - EXCLUDE   — Do not process
 *
 * STORY PRIORITY:
 *   - hero               — Landing page hero section
 *   - primary-section    — Main content section
 *   - secondary-section  — Supporting section
 *   - footer             — Footer content
 *   - archive            — Historical/reference
 *   - exclude            — Not for storytelling
 *
 * USAGE:
 *   node scripts/classify-content.js [--dry-run]
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  sourceDir: path.resolve(__dirname, '../02_CRAWLED/text'),
  outputDir: path.resolve(__dirname, '../04_KNOWLEDGE/classification'),
  csvFile: path.resolve(__dirname, '../04_KNOWLEDGE/classification/wave1-classification-v2.csv'),
  jsonFile: path.resolve(__dirname, '../04_KNOWLEDGE/classification/wave1-classification-v2.json'),
  logFile: path.resolve(__dirname, '../04_KNOWLEDGE/classification/classify-v2.log'),
};

const ACTIONS = ['KEEP', 'REWRITE', 'MERGE', 'ARCHIVE', 'EXCLUDE'];
const STORY_PRIORITIES = ['hero', 'primary-section', 'secondary-section', 'footer', 'archive', 'exclude'];
const SECTION_CANDIDATES = ['hero', 'services', 'research', 'impact', 'news', 'contact', 'footer', 'none'];
const IMPORTANCE = [1, 2, 3, 4, 5];
const AI_PRIORITIES = ['low', 'medium', 'high', 'critical'];

// ─── Classifier ────────────────────────────────────────────────────────────

class ContentClassifier {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.items = [];
    this.errors = [];
    this.log = [];
  }

  async run() {
    console.log('🏷️  Starting content classification v2...');
    this._log('INFO', `Classification v2 started at ${new Date().toISOString()}`);

    try {
      // Step 1: Read content files (recursively)
      const files = await this._readContentFiles();

      // Step 2: Classify each item
      for (const file of files) {
        await this._classifyFile(file);
      }

      // Step 3: Export results
      if (!this.dryRun) {
        await this._exportResults();
      }

      // Step 4: Report
      this._printReport();
    } catch (error) {
      this._log('ERROR', `Classification failed: ${error.message}`);
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
      } else if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  async _readContentFiles() {
    this._log('INFO', 'Reading content files recursively...');

    if (!fs.existsSync(CONFIG.sourceDir)) {
      throw new Error(`Source directory not found: ${CONFIG.sourceDir}`);
    }

    const files = this._walkSync(CONFIG.sourceDir);

    console.log(`📄 Found ${files.length} content files`);
    return files;
  }

  async _classifyFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath);
      const relativePath = path.relative(CONFIG.sourceDir, filePath);

      const classification = {
        source_url: this._urlFromFilename(filename),
        file_path: relativePath,
        title: this._extractTitle(content),
        category: this._detectCategory(relativePath, content),
        action: 'KEEP',  // default
        importance: 3,   // default
        ai_priority: 'medium',  // default
        story_priority: 'secondary-section',  // new
        section_candidate: 'none',  // new
        homepage_candidate: false,
        research_candidate: false,
        service_candidate: false,
        document_candidate: false,
        rewrite_reason: '',  // new
        merge_target: '',  // new
        duplicate_risk: false,  // new
        reason: '',
        confidence: 0.7,
        notes: '',
      };

      // Apply classification rules
      this._applyClassificationRules(classification, filename, content);

      this.items.push(classification);
      this._log('INFO', `Classified: ${relativePath} → ${classification.action}`);
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      this._log('ERROR', `Failed to classify ${filePath}: ${error.message}`);
    }
  }

  _urlFromFilename(filename) {
    const match = filename.match(/wid_(\d+)/i);
    if (match) {
      return `https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=${match[1]}`;
    }
    if (filename.includes('landing') || filename.includes('index')) {
      return 'https://rae.mju.ac.th/wtms_index.aspx?lang=th-TH';
    }
    return 'https://rae.mju.ac.th/unknown';
  }

  _extractTitle(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim().length > 0) {
        return line.replace(/^#+\s+/, '').trim().substring(0, 100);
      }
    }
    return 'Untitled';
  }

  _detectCategory(relativePath, content) {
    const pathLower = relativePath.toLowerCase();
    const contentLower = content.toLowerCase();

    if (pathLower.includes('landing') || pathLower.includes('index')) return 'landing';
    if (pathLower.includes('research')) return 'research';
    if (pathLower.includes('news')) return 'news';
    if (pathLower.includes('service')) return 'services';
    if (pathLower.includes('organization')) return 'organization';
    if (pathLower.includes('faq')) return 'faq';

    // Fallback to content analysis
    if (contentLower.includes('research') && contentLower.includes('project')) return 'research';
    if (contentLower.includes('service') || contentLower.includes('training')) return 'services';
    if (contentLower.includes('news') || contentLower.includes('announcement')) return 'news';

    return 'other';
  }

  _applyClassificationRules(classification, filename, content) {
    const lower = content.toLowerCase();
    const title = classification.title.toLowerCase();

    // Rule: Mission, Vision, Contact, Core Services → HERO
    if (title.includes('mission') || title.includes('vision') || 
        title.includes('contact') || title.includes('core')) {
      classification.action = 'KEEP';
      classification.importance = 5;
      classification.ai_priority = 'critical';
      classification.story_priority = 'hero';
      classification.section_candidate = 'hero';
      classification.homepage_candidate = true;
      classification.reason = 'Core institutional content';
      classification.confidence = 0.95;
      return;
    }

    // Rule: Research content → PRIMARY SECTION
    if (classification.category === 'research') {
      classification.action = 'KEEP';
      classification.importance = 5;
      classification.ai_priority = 'critical';
      classification.story_priority = 'primary-section';
      classification.section_candidate = 'research';
      classification.research_candidate = true;
      classification.reason = 'Primary research content';
      classification.confidence = 0.95;
      return;
    }

    // Rule: Service descriptions → PRIMARY SECTION
    if (classification.category === 'services') {
      classification.action = 'KEEP';
      classification.importance = 4;
      classification.ai_priority = 'high';
      classification.story_priority = 'primary-section';
      classification.section_candidate = 'services';
      classification.service_candidate = true;
      classification.reason = 'Academic service content';
      classification.confidence = 0.85;
      return;
    }

    // Rule: Organization/Contact → PRIMARY + FOOTER
    if (classification.category === 'organization') {
      classification.action = 'KEEP';
      classification.importance = 4;
      classification.ai_priority = 'high';
      classification.story_priority = 'primary-section';
      classification.section_candidate = 'contact';
      classification.homepage_candidate = true;
      classification.reason = 'Organization structure and contacts';
      classification.confidence = 0.9;
      return;
    }

    // Rule: News items 2568–2569 → SECONDARY SECTION
    if (classification.category === 'news') {
      classification.action = 'KEEP';
      classification.importance = 3;
      classification.ai_priority = 'medium';
      classification.story_priority = 'secondary-section';
      classification.section_candidate = 'news';
      classification.reason = 'Current news (needs date verification)';
      classification.confidence = 0.7;
      return;
    }

    // Rule: Empty/broken content → EXCLUDE
    if (content.trim().length < 100) {
      classification.action = 'EXCLUDE';
      classification.importance = 1;
      classification.ai_priority = 'low';
      classification.story_priority = 'exclude';
      classification.reason = 'Insufficient content';
      classification.confidence = 0.9;
      return;
    }

    // Rule: Navigation/menu fragments → MERGE or EXCLUDE
    if (lower.includes('menu') || lower.includes('navigation') || 
        lower.includes('breadcrumb') || (content.split('\n').length < 5 && lower.includes('home'))) {
      classification.action = 'EXCLUDE';
      classification.importance = 1;
      classification.ai_priority = 'low';
      classification.story_priority = 'exclude';
      classification.reason = 'Navigation fragment';
      classification.confidence = 0.85;
      return;
    }

    // Default: KEEP if > 200 chars meaningful content → SECONDARY SECTION
    if (content.trim().length > 200) {
      classification.action = 'KEEP';
      classification.importance = 3;
      classification.ai_priority = 'medium';
      classification.story_priority = 'secondary-section';
      classification.section_candidate = 'none';
      classification.reason = 'Supporting content';
      classification.confidence = 0.75;
    }
  }

  async _exportResults() {
    this._log('INFO', 'Exporting classification results...');

    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Export CSV
    this._exportCsv();

    // Export JSON
    this._exportJson();

    console.log(`✅ Exported ${this.items.length} classifications`);
  }

  _exportCsv() {
    const headers = [
      'source_url', 'file_path', 'title', 'category', 'action', 'importance', 'ai_priority',
      'story_priority', 'section_candidate', 'homepage_candidate', 'research_candidate', 
      'service_candidate', 'document_candidate', 'rewrite_reason', 'merge_target', 
      'duplicate_risk', 'reason', 'confidence', 'notes'
    ];

    const rows = [headers.join(',')];

    for (const item of this.items) {
      const row = [
        this._escapeCsv(item.source_url),
        this._escapeCsv(item.file_path),
        this._escapeCsv(item.title),
        item.category,
        item.action,
        item.importance,
        item.ai_priority,
        item.story_priority,
        item.section_candidate,
        item.homepage_candidate ? 'true' : 'false',
        item.research_candidate ? 'true' : 'false',
        item.service_candidate ? 'true' : 'false',
        item.document_candidate ? 'true' : 'false',
        this._escapeCsv(item.rewrite_reason),
        this._escapeCsv(item.merge_target),
        item.duplicate_risk ? 'true' : 'false',
        this._escapeCsv(item.reason),
        item.confidence.toFixed(2),
        this._escapeCsv(item.notes),
      ];
      rows.push(row.join(','));
    }

    fs.writeFileSync(CONFIG.csvFile, rows.join('\n'), 'utf8');
    this._log('INFO', `Exported CSV: ${CONFIG.csvFile}`);
  }

  _exportJson() {
    const summary = {
      KEEP: 0,
      REWRITE: 0,
      MERGE: 0,
      ARCHIVE: 0,
      EXCLUDE: 0,
    };

    const storyPriority = {};

    for (const item of this.items) {
      summary[item.action]++;
      const key = item.story_priority;
      storyPriority[key] = (storyPriority[key] || 0) + 1;
    }

    const index = {
      metadata: {
        generated: new Date().toISOString(),
        version: 'v2',
        total_items: this.items.length,
        action_distribution: summary,
        story_priority_distribution: storyPriority,
        importance_distribution: this._computeDistribution('importance'),
        ai_priority_distribution: this._computeDistribution('ai_priority'),
      },
      items: this.items,
    };

    fs.writeFileSync(CONFIG.jsonFile, JSON.stringify(index, null, 2), 'utf8');
    this._log('INFO', `Exported JSON: ${CONFIG.jsonFile}`);
  }

  _computeDistribution(field) {
    const dist = {};
    for (const item of this.items) {
      const key = item[field];
      dist[key] = (dist[key] || 0) + 1;
    }
    return dist;
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
    const summary = {
      KEEP: 0, REWRITE: 0, MERGE: 0, ARCHIVE: 0, EXCLUDE: 0,
    };

    for (const item of this.items) {
      summary[item.action]++;
    }

    console.log('\n📊 Classification Report v2');
    console.log('─'.repeat(50));
    console.log(`Total items: ${this.items.length}`);
    console.log(`Actions: KEEP=${summary.KEEP}, REWRITE=${summary.REWRITE}, MERGE=${summary.MERGE}, ARCHIVE=${summary.ARCHIVE}, EXCLUDE=${summary.EXCLUDE}`);
    console.log(`Output: ${CONFIG.csvFile}`);

    if (!this.dryRun) {
      console.log('\n✅ Classification v2 complete!');
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

  const classifier = new ContentClassifier(options);
  await classifier.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ContentClassifier, CONFIG };
