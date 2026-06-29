/**
 * RAE Knowledge Engine — NotebookLM Packaging Engine
 * scripts/package-notebooks.js
 *
 * Phase: K0.2E
 * Author: RAE Knowledge Engine
 * Date: 2026-06-29
 *
 * PURPOSE:
 *   Package validated knowledge into 6 NotebookLM-ready notebooks with metadata,
 *   content structure, taxonomy, and story mapping for each.
 *
 *   Input:  04_KNOWLEDGE/classification/wave1-classification-v2.json
 *           04_KNOWLEDGE/graph/story-graph.json
 *           04_KNOWLEDGE/media/wave1-stitch-image-candidates.json
 *
 *   Output: 05_EXPORT/NotebookLM/
 *           - Notebook00_Master.json
 *           - Notebook01_Landing.json
 *           - Notebook02_Research.json
 *           - Notebook03_Academic-Service.json
 *           - Notebook04_News.json
 *           - Notebook05_Document-Center.json
 *           - README.md
 *           - notebooks-manifest.json
 *
 * NOTEBOOK STRUCTURE:
 *   1. Notebook00_Master    — All content, comprehensive reference
 *   2. Notebook01_Landing   — Hero + research + services + impact
 *   3. Notebook02_Research  — Research excellence + knowledge creation
 *   4. Notebook03_Academic  — Academic services + technology transfer
 *   5. Notebook04_News      — News 2568-2569
 *   6. Notebook05_Documents — Document center
 *
 * USAGE:
 *   node scripts/package-notebooks.js [--dry-run]
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  classificationFile: path.resolve(__dirname, '../04_KNOWLEDGE/classification/wave1-classification-v2.json'),
  storyGraphFile: path.resolve(__dirname, '../04_KNOWLEDGE/graph/story-graph.json'),
  mediaCandidatesFile: path.resolve(__dirname, '../04_KNOWLEDGE/media/wave1-stitch-image-candidates.json'),
  outputDir: path.resolve(__dirname, '../05_EXPORT/NotebookLM'),
  readmeFile: path.resolve(__dirname, '../05_EXPORT/NotebookLM/README.md'),
  manifestFile: path.resolve(__dirname, '../05_EXPORT/NotebookLM/notebooks-manifest.json'),
};

const NOTEBOOKS = [
  {
    id: '00',
    name: 'Master',
    filename: 'Notebook00_Master.json',
    title: 'RAE Master Knowledge',
    description: 'Comprehensive reference with all content',
    storyPositions: ['mission', 'research', 'knowledge-creation', 'innovation', 'academic-services', 'technology-transfer', 'community-impact', 'sustainable-agriculture', 'knowledge-ecosystem', 'future'],
    categories: ['landing', 'research', 'services', 'organization', 'news', 'faq'],
  },
  {
    id: '01',
    name: 'Landing',
    filename: 'Notebook01_Landing.json',
    title: 'Landing Page Knowledge',
    description: 'Hero, research, services, impact for Landing V2',
    storyPositions: ['mission', 'research', 'knowledge-creation', 'innovation', 'academic-services', 'community-impact', 'sustainable-agriculture'],
    categories: ['landing', 'research', 'services'],
  },
  {
    id: '02',
    name: 'Research',
    filename: 'Notebook02_Research.json',
    title: 'Research Excellence',
    description: 'Research programs, projects, achievements',
    storyPositions: ['research', 'knowledge-creation', 'innovation'],
    categories: ['research'],
  },
  {
    id: '03',
    name: 'Academic-Service',
    filename: 'Notebook03_Academic-Service.json',
    title: 'Academic Services',
    description: 'Training, consulting, laboratory services',
    storyPositions: ['academic-services', 'technology-transfer'],
    categories: ['services'],
  },
  {
    id: '04',
    name: 'News',
    filename: 'Notebook04_News.json',
    title: 'News & Events (2568-2569)',
    description: 'Recent announcements and achievements',
    storyPositions: ['community-impact', 'sustainable-agriculture'],
    categories: ['news'],
  },
  {
    id: '05',
    name: 'Document-Center',
    filename: 'Notebook05_Document-Center.json',
    title: 'Document & Resource Center',
    description: 'Publications, reports, resources',
    storyPositions: ['knowledge-ecosystem'],
    categories: ['faq', 'other'],
  },
];

// ─── Packager ────────────────────────────────────────────────────────────

class NotebookPackager {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.classifications = [];
    this.storyGraph = null;
    this.mediaCandidates = null;
    this.notebooks = [];
    this.log = [];
  }

  async run() {
    console.log('📚 Starting NotebookLM packaging...');
    this._log('INFO', `Packaging started at ${new Date().toISOString()}`);

    try {
      // Step 1: Load data
      await this._loadData();

      // Step 2: Package each notebook
      for (const notebookDef of NOTEBOOKS) {
        await this._packageNotebook(notebookDef);
      }

      // Step 3: Export results
      if (!this.dryRun) {
        await this._exportResults();
      }

      // Step 4: Report
      this._printReport();
    } catch (error) {
      this._log('ERROR', `Packaging failed: ${error.message}`);
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  async _loadData() {
    this._log('INFO', 'Loading knowledge sources...');

    if (fs.existsSync(CONFIG.classificationFile)) {
      const data = JSON.parse(fs.readFileSync(CONFIG.classificationFile, 'utf8'));
      this.classifications = data.items || [];
      console.log(`📋 Loaded ${this.classifications.length} items`);
    }

    if (fs.existsSync(CONFIG.storyGraphFile)) {
      this.storyGraph = JSON.parse(fs.readFileSync(CONFIG.storyGraphFile, 'utf8'));
      console.log('📖 Loaded story graph');
    }

    if (fs.existsSync(CONFIG.mediaCandidatesFile)) {
      this.mediaCandidates = JSON.parse(fs.readFileSync(CONFIG.mediaCandidatesFile, 'utf8'));
      console.log('🖼️  Loaded media candidates');
    }
  }

  async _packageNotebook(def) {
    const notebook = {
      metadata: {
        notebook_id: def.id,
        notebook_name: def.name,
        title: def.title,
        description: def.description,
        generated: new Date().toISOString(),
        version: 'v1',
        story_positions: def.storyPositions,
        categories: def.categories,
      },
      content_sections: [],
      taxonomy: this._buildTaxonomy(def),
      story_mapping: this._buildStoryMapping(def),
      source_manifest: {
        total_items: 0,
        items: [],
      },
    };

    // Organize content by story position (if applicable)
    for (const position of def.storyPositions) {
      const positionContent = this._filterContentForPosition(position, def.categories);
      
      if (positionContent.length > 0) {
        notebook.content_sections.push({
          story_position: position,
          position_title: this._getPositionTitle(position),
          items: positionContent,
          item_count: positionContent.length,
        });

        notebook.source_manifest.items.push(...positionContent.map(item => ({
          title: item.title,
          category: item.category,
          source_url: item.source_url,
          importance: item.importance,
        })));
      }
    }

    notebook.source_manifest.total_items = notebook.source_manifest.items.length;

    this.notebooks.push({
      definition: def,
      notebook: notebook,
      itemCount: notebook.source_manifest.total_items,
    });

    this._log('INFO', `Packaged ${def.name} notebook with ${notebook.source_manifest.total_items} items`);
  }

  _filterContentForPosition(position, categories) {
    const items = [];

    for (const item of this.classifications) {
      if (!categories.includes(item.category)) continue;
      if (item.action !== 'KEEP' && item.action !== 'REWRITE') continue;

      // Map categories to positions
      if (position === 'mission' && item.title.toLowerCase().includes('mission')) {
        items.push(item);
      } else if (position === 'research' && item.category === 'research') {
        items.push(item);
      } else if (position === 'academic-services' && item.category === 'services') {
        items.push(item);
      } else if (position === 'news' && item.category === 'news') {
        items.push(item);
      } else if (position === 'knowledge-ecosystem' && item.category === 'faq') {
        items.push(item);
      } else if (!['mission', 'research', 'academic-services', 'news', 'knowledge-ecosystem'].includes(position)) {
        // Generic positions get category matches
        if (item.category === 'landing' || item.category === 'organization') {
          items.push(item);
        }
      }
    }

    return items;
  }

  _getPositionTitle(position) {
    const titles = {
      'mission': 'Mission & Vision',
      'research': 'Research Excellence',
      'knowledge-creation': 'Knowledge Creation',
      'innovation': 'Innovation',
      'academic-services': 'Academic Services',
      'technology-transfer': 'Technology Transfer',
      'community-impact': 'Community Impact',
      'sustainable-agriculture': 'Sustainable Agriculture',
      'knowledge-ecosystem': 'Knowledge Ecosystem',
      'future': 'Future Agriculture',
    };
    return titles[position] || position;
  }

  _buildTaxonomy(def) {
    const taxItems = this.classifications.filter(c => def.categories.includes(c.category));
    const byCategory = {};

    for (const item of taxItems) {
      if (!byCategory[item.category]) {
        byCategory[item.category] = [];
      }
      byCategory[item.category].push(item.title);
    }

    return {
      categories: def.categories,
      distribution: byCategory,
      coverage: Object.keys(byCategory).length,
    };
  }

  _buildStoryMapping(def) {
    const mapping = {};

    for (const position of def.storyPositions) {
      const storyNode = this.storyGraph?.arc?.find(n => n.id === position);
      mapping[position] = {
        title: storyNode?.title || this._getPositionTitle(position),
        narrative_role: storyNode?.narrative_role || 'context',
        recommended_section: storyNode?.recommended_section || 'other',
        confidence: storyNode?.confidence || 0,
      };
    }

    return mapping;
  }

  async _exportResults() {
    this._log('INFO', 'Exporting notebooks...');

    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Export each notebook
    for (const nb of this.notebooks) {
      const filepath = path.join(CONFIG.outputDir, nb.definition.filename);
      fs.writeFileSync(filepath, JSON.stringify(nb.notebook, null, 2), 'utf8');
      this._log('INFO', `Exported ${nb.definition.name} notebook`);
    }

    // Export manifest
    const manifest = {
      metadata: {
        generated: new Date().toISOString(),
        version: 'v1',
        total_notebooks: this.notebooks.length,
        total_items: this.notebooks.reduce((sum, n) => sum + n.itemCount, 0),
      },
      notebooks: this.notebooks.map(n => ({
        id: n.definition.id,
        name: n.definition.name,
        filename: n.definition.filename,
        title: n.definition.title,
        description: n.definition.description,
        item_count: n.itemCount,
      })),
    };

    fs.writeFileSync(CONFIG.manifestFile, JSON.stringify(manifest, null, 2), 'utf8');
    this._log('INFO', `Exported manifest`);

    // Export README
    this._exportReadme();

    console.log('✅ Exported NotebookLM packages');
  }

  _exportReadme() {
    let readme = '# RAE Knowledge — NotebookLM Notebooks\n\n';
    readme += '**Generated:** ' + new Date().toISOString() + '\n';
    readme += '**Version:** v1\n\n';

    readme += '## Overview\n\n';
    readme += 'Six specialized NotebookLM notebooks containing RAE knowledge for different use cases:\n\n';

    for (const nb of this.notebooks) {
      readme += `### Notebook${nb.definition.id}: ${nb.definition.name}\n`;
      readme += `**${nb.definition.title}**\n\n`;
      readme += `${nb.definition.description}\n\n`;
      readme += `- **Items:** ${nb.itemCount}\n`;
      readme += `- **Categories:** ${nb.definition.categories.join(', ')}\n`;
      readme += `- **Filename:** ${nb.definition.filename}\n\n`;
    }

    readme += '## Import Instructions\n\n';
    readme += '1. Download notebook JSON file\n';
    readme += '2. In NotebookLM: Create new notebook\n';
    readme += '3. Import from notebook JSON\n';
    readme += '4. Verify content structure\n\n';

    readme += '## Compatibility\n\n';
    readme += '- **NotebookLM:** v1+ ✅\n';
    readme += '- **Storage:** JSON UTF-8\n';
    readme += '- **Size:** See individual files\n\n';

    fs.writeFileSync(CONFIG.readmeFile, readme, 'utf8');
  }

  _log(level, message) {
    const entry = `[${new Date().toISOString()}] ${level.padEnd(5)} ${message}`;
    this.log.push(entry);
  }

  _printReport() {
    console.log('\n📚 NotebookLM Packaging Report');
    console.log('─'.repeat(50));
    console.log(`Notebooks Packaged: ${this.notebooks.length}`);
    console.log(`Total Items: ${this.notebooks.reduce((sum, n) => sum + n.itemCount, 0)}`);

    for (const nb of this.notebooks) {
      console.log(`  ${nb.definition.name}: ${nb.itemCount} items`);
    }

    if (!this.dryRun) {
      console.log('\n✅ Packaging complete!');
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

  const packager = new NotebookPackager(options);
  await packager.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { NotebookPackager, CONFIG };
