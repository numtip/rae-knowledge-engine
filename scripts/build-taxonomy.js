/**
 * RAE Knowledge Engine — Taxonomy Builder
 * scripts/build-taxonomy.js
 *
 * Phase: K0.1B
 * Author: RAE Knowledge Engine
 * Date: 2026-06-29
 *
 * PURPOSE:
 *   Organize classified content into hierarchical taxonomy and navigation structure.
 *
 *   Input:  04_KNOWLEDGE/classification/
 *   Output: 04_KNOWLEDGE/taxonomy/taxonomy.json
 *           04_KNOWLEDGE/taxonomy/category-map.json
 *           04_KNOWLEDGE/taxonomy/navigation-map.json
 *
 * PROCESS:
 *   1. Load classified content
 *   2. Build category tree
 *   3. Define navigation structure
 *   4. Generate category maps
 *   5. Export JSON
 *
 * USAGE:
 *   node scripts/build-taxonomy.js [--dry-run]
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  sourceDir: path.resolve(__dirname, '../04_KNOWLEDGE/classification'),
  outputDir: path.resolve(__dirname, '../04_KNOWLEDGE/taxonomy'),
  taxonomyFile: path.resolve(__dirname, '../04_KNOWLEDGE/taxonomy/taxonomy.json'),
  categoryMapFile: path.resolve(__dirname, '../04_KNOWLEDGE/taxonomy/category-map.json'),
  navMapFile: path.resolve(__dirname, '../04_KNOWLEDGE/taxonomy/navigation-map.json'),
  logFile: path.resolve(__dirname, '../04_KNOWLEDGE/taxonomy/build-taxonomy.log'),
};

// ─── Taxonomy Definition ─────────────────────────────────────────────────

const TAXONOMY_STRUCTURE = {
  landing: {
    path: '/',
    label: 'Landing',
    priority: 0,
    icon: 'home',
    subcategories: [],
  },
  about: {
    path: '/about',
    label: 'About',
    priority: 0,
    icon: 'info',
    subcategories: ['mission', 'vision', 'organization', 'contact'],
  },
  research: {
    path: '/research',
    label: 'Research',
    priority: 1,
    icon: 'microscope',
    subcategories: ['research-areas', 'projects', 'publications', 'researchers', 'facilities'],
  },
  'academic-services': {
    path: '/services',
    label: 'Academic Services',
    priority: 1,
    icon: 'briefcase',
    subcategories: ['training', 'consulting', 'lab-services', 'extension', 'certification'],
  },
  'document-center': {
    path: '/documents',
    label: 'Document Center',
    priority: 1,
    icon: 'file',
    subcategories: ['research-guides', 'service-guides', 'forms', 'reports', 'manuals'],
  },
  news: {
    path: '/news',
    label: 'News',
    priority: 1,
    icon: 'newspaper',
    subcategories: ['research-news', 'service-news', 'announcements', 'events'],
  },
  organization: {
    path: '/organization',
    label: 'Organization',
    priority: 2,
    icon: 'organization',
    subcategories: ['departments', 'contacts', 'structure'],
  },
  partners: {
    path: '/partners',
    label: 'Partners',
    priority: 2,
    icon: 'link',
    subcategories: [],
  },
  media: {
    path: '/media',
    label: 'Media',
    priority: 3,
    icon: 'images',
    subcategories: [],
  },
  archive: {
    path: '/archive',
    label: 'Archive',
    priority: 99,
    icon: 'archive',
    subcategories: [],
  },
};

// ─── Navigation Structure ────────────────────────────────────────────────

const NAVIGATION_STRUCTURE = {
  main_navigation: [
    {
      label: 'Home',
      path: '/',
      icon: 'home',
    },
    {
      label: 'About',
      path: '/about',
      icon: 'info',
      submenu: [
        { label: 'Mission & Vision', path: '/about/mission' },
        { label: 'Organization', path: '/about/organization' },
        { label: 'Contact', path: '/about/contact' },
      ],
    },
    {
      label: 'Research',
      path: '/research',
      icon: 'microscope',
      submenu: [
        { label: 'Research Areas', path: '/research/areas' },
        { label: 'Active Projects', path: '/research/projects' },
        { label: 'Publications', path: '/research/publications' },
        { label: 'Researchers', path: '/research/researchers' },
      ],
    },
    {
      label: 'Services',
      path: '/services',
      icon: 'briefcase',
      submenu: [
        { label: 'Training', path: '/services/training' },
        { label: 'Consulting', path: '/services/consulting' },
        { label: 'Lab Services', path: '/services/lab-services' },
        { label: 'Extension', path: '/services/extension' },
      ],
    },
    {
      label: 'Documents',
      path: '/documents',
      icon: 'file',
      submenu: [
        { label: 'Research Guides', path: '/documents/research' },
        { label: 'Service Guides', path: '/documents/services' },
        { label: 'Forms', path: '/documents/forms' },
      ],
    },
    {
      label: 'News',
      path: '/news',
      icon: 'newspaper',
      submenu: [
        { label: 'Latest', path: '/news/latest' },
        { label: 'B.E. 2569', path: '/news/2569' },
        { label: 'B.E. 2568', path: '/news/2568' },
      ],
    },
  ],
  footer_navigation: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Contact', path: '/contact' },
  ],
};

// ─── Taxonomy Builder ────────────────────────────────────────────────────

class TaxonomyBuilder {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.taxonomy = {};
    this.categoryMap = {};
    this.log = [];
  }

  async run() {
    console.log('📋 Starting taxonomy construction...');
    this._log('INFO', `Taxonomy construction started at ${new Date().toISOString()}`);

    try {
      // Step 1: Load classifications
      const items = await this._loadClassifications();

      // Step 2: Build category tree
      await this._buildCategoryTree(items);

      // Step 3: Build navigation maps
      await this._buildNavigationMaps();

      // Step 4: Validate
      await this._validateTaxonomy();

      // Step 5: Export
      if (!this.dryRun) {
        await this._exportTaxonomy();
      }

      // Step 6: Report
      this._printReport();
    } catch (error) {
      this._log('ERROR', `Taxonomy construction failed: ${error.message}`);
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  async _loadClassifications() {
    this._log('INFO', 'Loading classifications...');

    const jsonFile = path.join(CONFIG.sourceDir, 'content-classification.json');
    if (!fs.existsSync(jsonFile)) {
      throw new Error(`Classification file not found: ${jsonFile}`);
    }

    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    console.log(`📊 Loaded ${data.items.length} classified items`);
    return data.items;
  }

  async _buildCategoryTree(items) {
    this._log('INFO', 'Building category tree...');

    // Initialize category map from taxonomy
    for (const [cat, spec] of Object.entries(TAXONOMY_STRUCTURE)) {
      this.categoryMap[cat] = {
        ...spec,
        items_count: 0,
        items: [],
      };
    }

    // Count items by category
    for (const item of items) {
      const cat = item.category || 'other';
      if (this.categoryMap[cat]) {
        this.categoryMap[cat].items_count++;
        if (item.action !== 'EXCLUDE') {
          this.categoryMap[cat].items.push({
            source_url: item.source_url,
            title: item.title,
            importance: item.importance,
          });
        }
      }
    }

    console.log(`📊 Categorized ${items.length} items`);
  }

  async _buildNavigationMaps() {
    this._log('INFO', 'Building navigation maps...');

    // Deep copy navigation structure
    this.navigation = JSON.parse(JSON.stringify(NAVIGATION_STRUCTURE));

    // Calculate item counts for nav items
    for (const navItem of this.navigation.main_navigation) {
      const catMatch = Object.entries(this.categoryMap).find(
        ([_, cat]) => cat.path === navItem.path
      );
      if (catMatch) {
        navItem.items_count = catMatch[1].items_count;
      }
    }
  }

  async _validateTaxonomy() {
    this._log('INFO', 'Validating taxonomy...');

    let valid = 0;
    let issues = 0;

    for (const [cat, spec] of Object.entries(this.categoryMap)) {
      if (spec.path && spec.label) {
        valid++;
      } else {
        issues++;
        this._log('WARN', `Invalid category: ${cat}`);
      }
    }

    console.log(`✓ ${valid} valid categories, ✗ ${issues} issues`);
  }

  async _exportTaxonomy() {
    this._log('INFO', 'Exporting taxonomy...');

    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Export taxonomy.json
    const taxonomy = {
      metadata: {
        generated: new Date().toISOString(),
        version: '1.0',
        total_categories: Object.keys(this.categoryMap).length,
      },
      categories: this.categoryMap,
    };
    fs.writeFileSync(CONFIG.taxonomyFile, JSON.stringify(taxonomy, null, 2), 'utf8');
    this._log('INFO', `Exported taxonomy: ${CONFIG.taxonomyFile}`);

    // Export category-map.json (lightweight)
    const categoryMap = {};
    for (const [cat, spec] of Object.entries(this.categoryMap)) {
      categoryMap[cat] = {
        path: spec.path,
        label: spec.label,
        priority: spec.priority,
        icon: spec.icon,
        items_count: spec.items_count,
      };
    }
    fs.writeFileSync(CONFIG.categoryMapFile, JSON.stringify(categoryMap, null, 2), 'utf8');
    this._log('INFO', `Exported category map: ${CONFIG.categoryMapFile}`);

    // Export navigation-map.json
    fs.writeFileSync(CONFIG.navMapFile, JSON.stringify(this.navigation, null, 2), 'utf8');
    this._log('INFO', `Exported navigation map: ${CONFIG.navMapFile}`);
  }

  _log(level, message) {
    const entry = `[${new Date().toISOString()}] ${level.padEnd(5)} ${message}`;
    this.log.push(entry);
  }

  _printReport() {
    const totalItems = Object.values(this.categoryMap)
      .reduce((sum, cat) => sum + cat.items_count, 0);

    console.log('\n📊 Taxonomy Report');
    console.log('─'.repeat(50));
    console.log(`Total categories: ${Object.keys(this.categoryMap).length}`);
    console.log(`Total items: ${totalItems}`);
    console.log(`Navigation items: ${this.navigation.main_navigation.length}`);
    console.log(`Output:`);
    console.log(`  - ${CONFIG.taxonomyFile}`);
    console.log(`  - ${CONFIG.categoryMapFile}`);
    console.log(`  - ${CONFIG.navMapFile}`);

    if (!this.dryRun) {
      console.log('\n✅ Taxonomy construction complete!');
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

  const builder = new TaxonomyBuilder(options);
  await builder.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TaxonomyBuilder, CONFIG };
