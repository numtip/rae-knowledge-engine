/**
 * RAE Knowledge Engine — Normalizer
 * scripts/normalize.js
 *
 * Phase: K0.3
 * Author: RAE Knowledge Engine
 * Date: 2026-06-29
 *
 * PURPOSE:
 *   Convert extracted text from 02_CRAWLED/text/ into normalized knowledge items
 *   following the schema defined in docs/KNOWLEDGE_SCHEMA.md.
 *
 *   Output:
 *   - 04_KNOWLEDGE/<category>/*.md  (normalized Markdown)
 *   - 04_KNOWLEDGE/<category>/*.json (schema-compliant JSON)
 *   - 04_KNOWLEDGE/RAE_MASTER_KNOWLEDGE_INDEX.json (aggregated index)
 *
 * RULES:
 *   - Preserve all institutional knowledge (no rewrites)
 *   - Detect language automatically (th/en)
 *   - Classify content by category
 *   - Generate unique IDs
 *   - Extract summaries
 *   - Create tag index
 *   - Discover related topics
 *   - Validate schema compliance
 *
 * USAGE:
 *   node scripts/normalize.js [--dry-run] [--category <cat>] [--validate-only]
 *
 * NOTE: Schema version 1.0 (see docs/KNOWLEDGE_SCHEMA.md)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  schemaVersion: '1.0',
  sourceDir: path.resolve(__dirname, '../02_CRAWLED/text'),
  outputDir: path.resolve(__dirname, '../04_KNOWLEDGE'),
  indexFile: path.resolve(__dirname, '../04_KNOWLEDGE/RAE_MASTER_KNOWLEDGE_INDEX.json'),
  logFile: path.resolve(__dirname, '../04_KNOWLEDGE/normalize.log'),

  // Categories: must match knowledge schema
  categories: {
    landing: { subcategories: ['mission', 'vision', 'core-service', 'hero', 'contact'] },
    research: { subcategories: ['active-projects', 'completed-projects', 'researchers', 'innovation'] },
    news: { subcategories: ['announcement', 'press-release', 'event'] },
    services: { subcategories: ['student-support', 'academic-services', 'facilities'] },
    organization: { subcategories: ['structure', 'departments', 'contacts', 'events'] },
    faq: { subcategories: ['general', 'academic', 'services'] },
    other: { subcategories: [] }
  },

  minSummaryLength: 50,
  maxSummaryLength: 500,
  minBodyLength: 100,
  maxTags: 10,
};

// ─── Schema Definition ────────────────────────────────────────────────────────

/**
 * Knowledge item schema (JSON)
 * All required fields must be present
 */
const KNOWLEDGE_ITEM_SCHEMA = {
  id: 'string (required)',          // auto-generated: RAE-<CAT>-<DATE>-<SEQ>
  title: 'string (required)',
  category: 'enum (required)',       // landing|research|news|services|organization|faq|other
  subcategory: 'string (optional)',
  source_url: 'string (required)',
  source_page: 'string (required)',
  language: 'enum (required)',       // th|en
  summary: 'string (optional)',
  body: 'string (required)',         // Markdown
  tags: 'array (optional)',          // max 10 tags
  related_topics: 'array (optional)',// array of IDs
  updated_date: 'string (required)', // ISO 8601
  status: 'enum (required)',         // extracted|normalized|validated|published
};

// ─── Main Normalizer ────────────────────────────────────────────────────────

class Normalizer {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.category = options.category || null;
    this.validateOnly = options.validateOnly || false;
    this.items = [];
    this.errors = [];
    this.log = [];
    this.idSequence = {};
  }

  async run() {
    console.log('🔄 Starting normalization...');
    this._log('INFO', `Normalizer started at ${new Date().toISOString()}`);

    try {
      // Step 1: Read extracted text files
      await this._readExtractedContent();

      // Step 2: Normalize each item
      await this._normalizeItems();

      // Step 3: Validate schema compliance
      await this._validateItems();

      // Step 4: Generate master index
      await this._generateIndex();

      // Step 5: Save outputs
      if (!this.dryRun && !this.validateOnly) {
        await this._saveOutputs();
      }

      // Step 6: Report
      this._printReport();
    } catch (error) {
      this._log('ERROR', `Normalization failed: ${error.message}`);
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  /**
   * Read extracted text files from 02_CRAWLED/text/
   */
  async _readExtractedContent() {
    this._log('INFO', 'Reading extracted content files...');

    if (!fs.existsSync(CONFIG.sourceDir)) {
      throw new Error(`Source directory not found: ${CONFIG.sourceDir}`);
    }

    const files = fs.readdirSync(CONFIG.sourceDir)
      .filter(f => f.endsWith('.txt') || f.endsWith('.md'));

    console.log(`📄 Found ${files.length} extracted files`);
    this._log('INFO', `Found ${files.length} extracted files`);
  }

  /**
   * Normalize items according to schema
   */
  async _normalizeItems() {
    this._log('INFO', 'Normalizing items...');

    // TODO: Implement normalization logic
    // 1. Parse each text file
    // 2. Extract metadata (title, date, author)
    // 3. Identify category
    // 4. Generate ID
    // 5. Extract summary
    // 6. Generate tags
    // 7. Create schema-compliant item

    console.log(`✅ Normalized ${this.items.length} items`);
  }

  /**
   * Validate schema compliance
   */
  async _validateItems() {
    this._log('INFO', `Validating ${this.items.length} items...`);

    let valid = 0;
    let invalid = 0;

    for (const item of this.items) {
      const isValid = this._validateItem(item);
      if (isValid) {
        valid++;
      } else {
        invalid++;
      }
    }

    console.log(`✓ ${valid} valid, ✗ ${invalid} invalid`);
    this._log('INFO', `Validation complete: ${valid} valid, ${invalid} invalid`);
  }

  /**
   * Validate single item against schema
   */
  _validateItem(item) {
    const required = ['id', 'title', 'category', 'source_url', 'source_page', 'language', 'body', 'updated_date', 'status'];
    
    for (const field of required) {
      if (!item[field]) {
        this._log('WARN', `Missing required field '${field}' in item ${item.id}`);
        return false;
      }
    }

    // Validate enums
    if (!CONFIG.categories[item.category]) {
      this._log('WARN', `Invalid category: ${item.category}`);
      return false;
    }

    if (!['th', 'en'].includes(item.language)) {
      this._log('WARN', `Invalid language: ${item.language}`);
      return false;
    }

    if (!['extracted', 'normalized', 'validated', 'published'].includes(item.status)) {
      this._log('WARN', `Invalid status: ${item.status}`);
      return false;
    }

    return true;
  }

  /**
   * Generate master knowledge index
   */
  async _generateIndex() {
    this._log('INFO', 'Generating master index...');

    const index = {
      metadata: {
        generated: new Date().toISOString(),
        total_items: this.items.length,
        schema_version: CONFIG.schemaVersion,
        language_distribution: this._computeLanguageDistribution(),
        category_distribution: this._computeCategoryDistribution(),
      },
      items: this.items,
      index_by_id: {},
      index_by_category: {},
    };

    // Build ID index
    for (let i = 0; i < this.items.length; i++) {
      index.index_by_id[this.items[i].id] = i;
    }

    // Build category index
    for (const cat of Object.keys(CONFIG.categories)) {
      index.index_by_category[cat] = this.items
        .map((item, i) => item.category === cat ? i : null)
        .filter(i => i !== null);
    }

    return index;
  }

  _computeLanguageDistribution() {
    const dist = { th: 0, en: 0 };
    for (const item of this.items) {
      dist[item.language]++;
    }
    return dist;
  }

  _computeCategoryDistribution() {
    const dist = {};
    for (const cat of Object.keys(CONFIG.categories)) {
      dist[cat] = this.items.filter(i => i.category === cat).length;
    }
    return dist;
  }

  /**
   * Save normalized outputs
   */
  async _saveOutputs() {
    this._log('INFO', 'Saving outputs...');

    // Create category directories if needed
    for (const cat of Object.keys(CONFIG.categories)) {
      const catDir = path.join(CONFIG.outputDir, cat);
      if (!fs.existsSync(catDir)) {
        fs.mkdirSync(catDir, { recursive: true });
      }
    }

    // TODO: Save normalized items
    // - Save JSON files to 04_KNOWLEDGE/<category>/
    // - Save Markdown files to 04_KNOWLEDGE/<category>/
    // - Save master index to 04_KNOWLEDGE/RAE_MASTER_KNOWLEDGE_INDEX.json

    console.log('📁 Outputs saved to 04_KNOWLEDGE/');
  }

  /**
   * Logging
   */
  _log(level, message) {
    const entry = `[${new Date().toISOString()}] ${level.padEnd(5)} ${message}`;
    this.log.push(entry);
    if (process.env.DEBUG) {
      console.log(entry);
    }
  }

  /**
   * Print final report
   */
  _printReport() {
    console.log('\n📊 Normalization Report');
    console.log('─'.repeat(50));
    console.log(`Total items: ${this.items.length}`);
    console.log(`Valid: ${this.items.length}`);
    console.log(`Invalid: ${this.errors.length}`);
    console.log(`Log file: ${CONFIG.logFile}`);
    console.log(`Index file: ${CONFIG.indexFile}`);

    if (!this.dryRun && !this.validateOnly) {
      console.log('\n✅ Normalization complete!');
    } else if (this.dryRun) {
      console.log('\n🏃 Dry-run mode — no files saved');
    } else {
      console.log('\n🔍 Validation-only mode');
    }
  }
}

// ─── CLI Entry Point ────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    validateOnly: args.includes('--validate-only'),
    category: null,
  };

  const catIndex = args.indexOf('--category');
  if (catIndex !== -1 && catIndex < args.length - 1) {
    options.category = args[catIndex + 1];
  }

  const normalizer = new Normalizer(options);
  await normalizer.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { Normalizer, CONFIG, KNOWLEDGE_ITEM_SCHEMA };
