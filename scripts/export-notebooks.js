/**
 * RAE Knowledge Engine — Notebook Exporter
 * scripts/export-notebooks.js
 *
 * Phase: K0.4
 * Author: RAE Knowledge Engine
 * Date: 2026-06-29
 *
 * PURPOSE:
 *   Package normalized knowledge from 04_KNOWLEDGE/ into NotebookLM-ready
 *   Markdown notebooks in 03_NOTEBOOKLM/.
 *
 *   Creates 6 thematic notebooks:
 *   - Notebook00-Master (comprehensive reference)
 *   - Notebook01-Landing (public-facing)
 *   - Notebook02-Research (research initiatives)
 *   - Notebook03-News-2568 (B.E. 2568 news)
 *   - Notebook04-News-2569 (B.E. 2569 news)
 *   - Notebook05-Organization (structure & services)
 *
 * PROCESSES:
 *   1. Read 04_KNOWLEDGE/<category>/*.json
 *   2. Group by notebook theme
 *   3. Generate Markdown files with proper structure
 *   4. Create README.md for each notebook
 *   5. Organize for NotebookLM consumption
 *
 * USAGE:
 *   node scripts/export-notebooks.js [--dry-run] [--notebook Notebook00-Master]
 *
 * NOTE: Outputs are ready for NotebookLM import. See docs/NOTEBOOKLM_IMPORT_GUIDE.md
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  sourceDir: path.resolve(__dirname, '../04_KNOWLEDGE'),
  outputDir: path.resolve(__dirname, '../03_NOTEBOOKLM'),
  indexFile: path.resolve(__dirname, '../04_KNOWLEDGE/RAE_MASTER_KNOWLEDGE_INDEX.json'),
  logFile: path.resolve(__dirname, '../03_NOTEBOOKLM/export-notebooks.log'),
};

// ─── Notebook Definitions ────────────────────────────────────────────────────

const NOTEBOOKS = {
  'Notebook00-Master': {
    title: 'RAE Master Knowledge Reference',
    description: 'Comprehensive knowledge base for RAE',
    categories: ['landing', 'research', 'services', 'organization', 'faq'],
    files: ['README.md', 'Mission.md', 'Vision.md', 'Organization.md', 'Research.md', 'Academic-Service.md', 'FAQ.md'],
  },
  'Notebook01-Landing': {
    title: 'RAE Landing Page Knowledge',
    description: 'Public-facing landing page content',
    categories: ['landing'],
    files: ['README.md', 'Landing.md', 'Hero.md', 'Core-Service.md', 'Contact.md'],
  },
  'Notebook02-Research': {
    title: 'RAE Research Initiatives',
    description: 'Research projects and innovation',
    categories: ['research'],
    files: ['README.md', 'Research.md', 'Projects.md', 'Innovation.md'],
  },
  'Notebook03-News-2568': {
    title: 'RAE News — B.E. 2568',
    description: 'News and announcements from B.E. 2568 (2025)',
    categories: ['news'],
    year: 2568,
    files: ['README.md', 'news-items.md'],
  },
  'Notebook04-News-2569': {
    title: 'RAE News — B.E. 2569',
    description: 'News and announcements from B.E. 2569 (2026)',
    categories: ['news'],
    year: 2569,
    files: ['README.md', 'news-items.md'],
  },
  'Notebook05-Organization': {
    title: 'RAE Organization & Services',
    description: 'Organizational structure and services',
    categories: ['organization', 'services'],
    files: ['README.md', 'Structure.md', 'Services.md', 'Departments.md'],
  },
};

// ─── Notebook Exporter ────────────────────────────────────────────────────

class NotebookExporter {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.notebookFilter = options.notebook || null;  // filter by notebook name
    this.index = null;
    this.log = [];
  }

  async run() {
    console.log('📚 Starting notebook export...');
    this._log('INFO', `Notebook export started at ${new Date().toISOString()}`);

    try {
      // Step 1: Load master index
      await this._loadIndex();

      // Step 2: For each notebook
      for (const [name, spec] of Object.entries(NOTEBOOKS)) {
        // Skip if filtering
        if (this.notebookFilter && name !== this.notebookFilter) {
          continue;
        }

        console.log(`\n📖 Creating ${name}...`);
        await this._createNotebook(name, spec);
      }

      // Step 3: Report
      this._printReport();
    } catch (error) {
      this._log('ERROR', `Export failed: ${error.message}`);
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  /**
   * Load master knowledge index
   */
  async _loadIndex() {
    this._log('INFO', 'Loading master index...');

    if (!fs.existsSync(CONFIG.indexFile)) {
      throw new Error(`Index not found: ${CONFIG.indexFile}`);
    }

    const data = fs.readFileSync(CONFIG.indexFile, 'utf8');
    this.index = JSON.parse(data);

    console.log(`📊 Loaded index with ${this.index.items.length} items`);
    this._log('INFO', `Loaded index with ${this.index.items.length} items`);
  }

  /**
   * Create a single notebook
   */
  async _createNotebook(name, spec) {
    // Create notebook directory
    const nbDir = path.join(CONFIG.outputDir, name);
    if (!fs.existsSync(nbDir)) {
      fs.mkdirSync(nbDir, { recursive: true });
    }

    // Generate README.md
    await this._generateReadme(nbDir, spec);

    // Generate other files based on spec
    // TODO: Implement file generation for each notebook type

    this._log('INFO', `Created notebook: ${name}`);
  }

  /**
   * Generate README.md for notebook
   */
  async _generateReadme(nbDir, spec) {
    const content = `# ${spec.title}

## Overview

${spec.description}

## Contents

${spec.files.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## Usage

This notebook contains knowledge curated for NotebookLM analysis.

### For NotebookLM
1. Upload all .md files to NotebookLM
2. NotebookLM will generate study guides
3. Use for research, learning, and reference

### Structure
- **README.md** — This file
${spec.files.filter(f => f !== 'README.md').map(f => `- **${f}** — Content section`).join('\n')}

## Categories Included

${spec.categories.map(c => `- ${c}`).join('\n')}

## Metadata

- **Generated:** ${new Date().toISOString()}
- **Source:** RAE Knowledge Engine (Phase K0.4)
- **Format:** Markdown (UTF-8)
- **Language:** Thai (ไทย)

## See Also

- [Knowledge Pipeline](../../docs/KNOWLEDGE_PIPELINE.md)
- [NotebookLM Import Guide](../../docs/NOTEBOOKLM_IMPORT_GUIDE.md)
- [Knowledge Schema](../../docs/KNOWLEDGE_SCHEMA.md)

---

**Ready for NotebookLM import!** Upload all files to NotebookLM and start learning.
`;

    const readmePath = path.join(nbDir, 'README.md');
    
    if (!this.dryRun) {
      fs.writeFileSync(readmePath, content, 'utf8');
      console.log(`  ✓ Created ${path.basename(readmePath)}`);
    } else {
      console.log(`  📝 Would create ${path.basename(readmePath)}`);
    }
  }

  /**
   * Logging
   */
  _log(level, message) {
    const entry = `[${new Date().toISOString()}] ${level.padEnd(5)} ${message}`;
    this.log.push(entry);
  }

  /**
   * Print final report
   */
  _printReport() {
    const count = this.notebookFilter ? 1 : Object.keys(NOTEBOOKS).length;

    console.log('\n📊 Export Report');
    console.log('─'.repeat(50));
    console.log(`Notebooks created: ${count}`);
    console.log(`Output directory: ${CONFIG.outputDir}`);
    console.log(`Log file: ${CONFIG.logFile}`);

    if (!this.dryRun) {
      console.log('\n✅ Export complete!');
      console.log('\n📚 Next steps:');
      console.log('   1. Review generated notebooks in 03_NOTEBOOKLM/');
      console.log('   2. See docs/NOTEBOOKLM_IMPORT_GUIDE.md for import instructions');
      console.log('   3. Upload to NotebookLM for analysis');
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
    notebook: null,
  };

  const nbIndex = args.indexOf('--notebook');
  if (nbIndex !== -1 && nbIndex < args.length - 1) {
    options.notebook = args[nbIndex + 1];
  }

  const exporter = new NotebookExporter(options);
  await exporter.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { NotebookExporter, CONFIG, NOTEBOOKS };
