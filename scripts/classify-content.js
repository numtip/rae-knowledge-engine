/**
 * RAE Knowledge Engine — Content Classification Engine
 * scripts/classify-content.js
 *
 * Phase: K0.1B
 * Author: RAE Knowledge Engine
 * Date: 2026-06-29
 *
 * PURPOSE:
 *   Analyze extracted content and assign classification actions, importance ratings,
 *   and metadata to guide normalization pipeline.
 *
 *   Input:  02_CRAWLED/text/
 *   Output: 04_KNOWLEDGE/classification/content-classification.csv
 *           04_KNOWLEDGE/classification/content-classification.json
 *
 * CLASSIFICATION ACTIONS:
 *   - KEEP      — Preserve as-is
 *   - REWRITE   — Valuable but needs restructuring
 *   - MERGE     — Combine multiple fragments
 *   - ARCHIVE   — Preserve but mark as historical
 *   - EXCLUDE   — Do not process
 *
 * RULES:
 *   - Mission, Vision, Contact, Core Services = KEEP/REWRITE, importance 5
 *   - News older than 2568 = ARCHIVE/EXCLUDE
 *   - Duplicate navigation = EXCLUDE
 *   - Research (wID=2064) = KEEP/REWRITE, importance 4–5
 *   - Services = KEEP/REWRITE, importance 4–5
 *   - Broken/empty = EXCLUDE
 *
 * USAGE:
 *   node scripts/classify-content.js [--dry-run] [--category landing]
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  sourceDir: path.resolve(__dirname, '../02_CRAWLED/text'),
  outputDir: path.resolve(__dirname, '../04_KNOWLEDGE/classification'),
  csvFile: path.resolve(__dirname, '../04_KNOWLEDGE/classification/content-classification.csv'),
  jsonFile: path.resolve(__dirname, '../04_KNOWLEDGE/classification/content-classification.json'),
  logFile: path.resolve(__dirname, '../04_KNOWLEDGE/classification/classify.log'),
};

const ACTIONS = ['KEEP', 'REWRITE', 'MERGE', 'ARCHIVE', 'EXCLUDE'];
const IMPORTANCE = [1, 2, 3, 4, 5];
const AI_PRIORITIES = ['low', 'medium', 'high', 'critical'];

// ─── Classifier ────────────────────────────────────────────────────────────

class ContentClassifier {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.categoryFilter = options.category || null;
    this.items = [];
    this.errors = [];
    this.log = [];
  }

  async run() {
    console.log('🏷️  Starting content classification...');
    this._log('INFO', `Classification started at ${new Date().toISOString()}`);

    try {
      // Step 1: Read content files
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

      const classification = {
        source_url: this._urlFromFilename(filename),
        title: this._extractTitle(content),
        category: this._detectCategory(filename, content),
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
      this._log('INFO', `Classified: ${filename} → ${classification.action}`);
    } catch (error) {
      this.errors.push({ file: filename, error: error.message });
      this._log('ERROR', `Failed to classify ${filename}: ${error.message}`);
    }
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

  _extractTitle(content) {
    // Extract first line or H1
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim().length > 0) {
        return line.replace(/^#+ /, '').trim().substring(0, 100);
      }
    }
    return 'Untitled';
  }

  _detectCategory(filename, content) {
    const lower = filename.toLowerCase() + ' ' + content.toLowerCase();

    if (lower.includes('landing') || lower.includes('index')) return 'landing';
    if (lower.includes('research') || lower.includes('wid=206')) return 'research';
    if (lower.includes('news') || lower.includes('announcement')) return 'news';
    if (lower.includes('service') || lower.includes('training')) return 'services';
    if (lower.includes('organization') || lower.includes('department')) return 'organization';
    if (lower.includes('faq') || lower.includes('question')) return 'faq';

    return 'other';
  }

  _applyClassificationRules(classification, filename, content) {
    const lower = content.toLowerCase();
    const title = classification.title.toLowerCase();

    // Rule: Mission, Vision, Contact, Core Services
    if (title.includes('mission') || title.includes('vision') || 
        title.includes('contact') || title.includes('core')) {
      classification.action = 'KEEP';
      classification.importance = 5;
      classification.ai_priority = 'critical';
      classification.homepage_candidate = true;
      classification.reason = 'Core institutional content';
      classification.confidence = 0.95;
      return;
    }

    // Rule: Research content (wID=206x)
    if (filename.includes('wID_206') || classification.category === 'research') {
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

    // Rule: Service descriptions
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

    // Rule: News items 2568–2569
    if (classification.category === 'news') {
      if (filename.includes('wID_20') && (
          filename.includes('wID_2012') || filename.includes('wID_2013') ||
          filename.includes('wID_954') ||  // 2568
          filename.includes('wID_2022') || filename.includes('wID_2387') ||
          filename.includes('wID_1960') || filename.includes('wID_1908') ||
          filename.includes('wID_1941') || filename.includes('wID_2042') ||
          filename.includes('wID_2043') || filename.includes('wID_2463')  // 2569
      )) {
        classification.action = 'KEEP';
        classification.importance = 4;
        classification.ai_priority = 'high';
        classification.reason = 'Current news (2568–2569)';
        classification.confidence = 0.9;
        return;
      }

      // Older news
      classification.action = 'ARCHIVE';
      classification.importance = 2;
      classification.ai_priority = 'low';
      classification.reason = 'Historical news (pre-2568)';
      classification.confidence = 0.8;
      return;
    }

    // Rule: Empty/broken content
    if (content.trim().length < 100) {
      classification.action = 'EXCLUDE';
      classification.importance = 1;
      classification.ai_priority = 'low';
      classification.reason = 'Insufficient content';
      classification.confidence = 0.9;
      return;
    }

    // Rule: Navigation/menu fragments
    if (lower.includes('menu') || lower.includes('navigation') || 
        lower.includes('breadcrumb') || (content.split('\n').length < 5 && lower.includes('home'))) {
      classification.action = 'EXCLUDE';
      classification.importance = 1;
      classification.ai_priority = 'low';
      classification.reason = 'Navigation fragment';
      classification.confidence = 0.85;
      return;
    }

    // Default: KEEP if > 200 chars meaningful content
    if (content.trim().length > 200) {
      classification.action = 'KEEP';
      classification.importance = 3;
      classification.ai_priority = 'medium';
      classification.reason = 'Supporting content';
      classification.confidence = 0.75;
    }
  }

  async _exportResults() {
    this._log('INFO', 'Exporting classification results...');

    // Ensure output directory exists
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
      'source_url', 'title', 'category', 'action', 'importance', 'ai_priority',
      'homepage_candidate', 'research_candidate', 'service_candidate', 'document_candidate',
      'reason', 'confidence', 'notes'
    ];

    const rows = [headers.join(',')];

    for (const item of this.items) {
      const row = [
        this._escapeCsv(item.source_url),
        this._escapeCsv(item.title),
        item.category,
        item.action,
        item.importance,
        item.ai_priority,
        item.homepage_candidate ? 'true' : 'false',
        item.research_candidate ? 'true' : 'false',
        item.service_candidate ? 'true' : 'false',
        item.document_candidate ? 'true' : 'false',
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

    for (const item of this.items) {
      summary[item.action]++;
    }

    const index = {
      metadata: {
        generated: new Date().toISOString(),
        total_items: this.items.length,
        action_distribution: summary,
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

    console.log('\n📊 Classification Report');
    console.log('─'.repeat(50));
    console.log(`Total items: ${this.items.length}`);
    console.log(`Actions: KEEP=${summary.KEEP}, REWRITE=${summary.REWRITE}, MERGE=${summary.MERGE}, ARCHIVE=${summary.ARCHIVE}, EXCLUDE=${summary.EXCLUDE}`);
    console.log(`Output: ${CONFIG.csvFile}`);

    if (!this.dryRun) {
      console.log('\n✅ Classification complete!');
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
    category: null,
  };

  const catIndex = args.indexOf('--category');
  if (catIndex !== -1 && catIndex < args.length - 1) {
    options.category = args[catIndex + 1];
  }

  const classifier = new ContentClassifier(options);
  await classifier.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ContentClassifier, CONFIG };
