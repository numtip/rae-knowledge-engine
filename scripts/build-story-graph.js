/**
 * RAE Knowledge Engine — Story Graph Builder
 * scripts/build-story-graph.js
 *
 * Phase: K0.2B
 * Author: RAE Knowledge Engine
 * Date: 2026-06-29
 *
 * PURPOSE:
 *   Build a narrative-driven story graph for Stitch/NotebookLM consumption.
 *   Maps content to story positions in a coherent agricultural-innovation narrative.
 *
 *   Input:  04_KNOWLEDGE/classification/wave1-classification-v2.json
 *   Output: 04_KNOWLEDGE/graph/story-graph.json
 *           04_KNOWLEDGE/graph/story-sequence.md
 *           05_EXPORT/stitch/STITCH_STORY_BRIEF_WAVE1.md
 *           05_EXPORT/stitch/STITCH_CONTENT_STRUCTURE_WAVE1.json
 *
 * STORY ARC:
 *   Mission/Vision (Why we exist)
 *   ↓
 *   Research Excellence (What we know)
 *   ↓
 *   Knowledge Creation (How we discover)
 *   ↓
 *   Innovation (What we create)
 *   ↓
 *   Academic Services (How we serve)
 *   ↓
 *   Technology Transfer (How we scale)
 *   ↓
 *   Community Impact (Who benefits)
 *   ↓
 *   Sustainable Agriculture (Why it matters)
 *   ↓
 *   Knowledge Ecosystem (How it connects)
 *   ↓
 *   Future Agriculture (Where we're going)
 *
 * USAGE:
 *   node scripts/build-story-graph.js [--dry-run]
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  classificationFile: path.resolve(__dirname, '../04_KNOWLEDGE/classification/wave1-classification-v2.json'),
  outputDir: path.resolve(__dirname, '../04_KNOWLEDGE/graph'),
  storyGraphFile: path.resolve(__dirname, '../04_KNOWLEDGE/graph/story-graph.json'),
  storySequenceFile: path.resolve(__dirname, '../04_KNOWLEDGE/graph/story-sequence.md'),
  stitchStoryBriefFile: path.resolve(__dirname, '../05_EXPORT/stitch/STITCH_STORY_BRIEF_WAVE1.md'),
  stitchStructureFile: path.resolve(__dirname, '../05_EXPORT/stitch/STITCH_CONTENT_STRUCTURE_WAVE1.json'),
  logFile: path.resolve(__dirname, '../04_KNOWLEDGE/graph/story-graph.log'),
};

const STORY_ARC = [
  {
    id: 'mission',
    title: 'Mission & Vision',
    narrative_role: 'opening',
    description: 'Why RAE exists and where it\'s going',
    priority: 1,
    section: 'hero',
  },
  {
    id: 'research',
    title: 'Research Excellence',
    narrative_role: 'credibility',
    description: 'Scientific expertise and research achievements',
    priority: 2,
    section: 'at-a-glance',
  },
  {
    id: 'knowledge-creation',
    title: 'Knowledge Creation',
    narrative_role: 'capability',
    description: 'How we discover and validate knowledge',
    priority: 3,
    section: 'research',
  },
  {
    id: 'innovation',
    title: 'Innovation',
    narrative_role: 'capability',
    description: 'Technologies and solutions we develop',
    priority: 4,
    section: 'services',
  },
  {
    id: 'academic-services',
    title: 'Academic Services',
    narrative_role: 'service',
    description: 'Training, consulting, and laboratory services',
    priority: 5,
    section: 'services',
  },
  {
    id: 'technology-transfer',
    title: 'Technology Transfer',
    narrative_role: 'proof',
    description: 'How innovations reach practitioners',
    priority: 6,
    section: 'services',
  },
  {
    id: 'community-impact',
    title: 'Community Impact',
    narrative_role: 'impact',
    description: 'Real-world benefits to farmers and communities',
    priority: 7,
    section: 'impact',
  },
  {
    id: 'sustainable-agriculture',
    title: 'Sustainable Agriculture',
    narrative_role: 'ecosystem',
    description: 'Environmental and social responsibility',
    priority: 8,
    section: 'impact',
  },
  {
    id: 'knowledge-ecosystem',
    title: 'Knowledge Ecosystem',
    narrative_role: 'ecosystem',
    description: 'Networks and partnerships',
    priority: 9,
    section: 'knowledge-ecosystem',
  },
  {
    id: 'future',
    title: 'Future of Agriculture',
    narrative_role: 'future',
    description: 'Vision for next-generation agriculture',
    priority: 10,
    section: 'footer',
  },
];

// ─── Story Graph Builder ────────────────────────────────────────────────────

class StoryGraphBuilder {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.classifications = [];
    this.storyNodes = [];
    this.storySequence = [];
    this.errors = [];
    this.log = [];
  }

  async run() {
    console.log('📖 Starting story graph construction...');
    this._log('INFO', `Story graph construction started at ${new Date().toISOString()}`);

    try {
      // Step 1: Load classifications
      await this._loadClassifications();

      // Step 2: Build story arc
      this._buildStoryArc();

      // Step 3: Map content to story positions
      await this._mapContentToStory();

      // Step 4: Validate story completeness
      await this._validateStory();

      // Step 5: Export results
      if (!this.dryRun) {
        await this._exportResults();
      }

      // Step 6: Report
      this._printReport();
    } catch (error) {
      this._log('ERROR', `Story graph failed: ${error.message}`);
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  async _loadClassifications() {
    this._log('INFO', 'Loading classifications...');

    if (!fs.existsSync(CONFIG.classificationFile)) {
      throw new Error(`Classification file not found: ${CONFIG.classificationFile}`);
    }

    const data = JSON.parse(fs.readFileSync(CONFIG.classificationFile, 'utf8'));
    this.classifications = data.items || [];

    console.log(`📊 Loaded ${this.classifications.length} classified items`);
    this._log('INFO', `Loaded ${this.classifications.length} classified items`);
  }

  _buildStoryArc() {
    this._log('INFO', 'Building story arc...');

    for (const arcNode of STORY_ARC) {
      this.storyNodes.push({
        id: arcNode.id,
        title: arcNode.title,
        narrative_role: arcNode.narrative_role,
        priority: arcNode.priority,
        recommended_section: arcNode.section,
        source_ids: [],  // Will be filled from classifications
        evidence: [],
        missing_content: [],
        confidence: 0,
      });
    }

    console.log(`📖 Built story arc with ${this.storyNodes.length} positions`);
    this._log('INFO', `Built ${this.storyNodes.length} story arc nodes`);
  }

  async _mapContentToStory() {
    this._log('INFO', 'Mapping content to story positions...');

    for (const item of this.classifications) {
      if (item.action !== 'KEEP' && item.action !== 'REWRITE') continue;

      const category = item.category || 'other';
      const title = item.title.toLowerCase();

      // Route to story position based on category and content
      const targets = this._findStoryTargets(category, title, item);

      for (const storyNodeId of targets) {
        const node = this.storyNodes.find(n => n.id === storyNodeId);
        if (node) {
          node.source_ids.push(item.title);
          node.evidence.push({
            content: item.title,
            source_url: item.source_url,
            importance: item.importance,
            confidence: item.confidence,
          });
        }
      }
    }

    this._log('INFO', 'Completed content mapping');
  }

  _findStoryTargets(category, title, item) {
    const targets = [];

    // Mission/Vision → Story positions
    if (title.includes('mission') || title.includes('vision')) {
      targets.push('mission');
    }

    // Research → Research Excellence + Knowledge Creation
    if (category === 'research' || title.includes('research')) {
      targets.push('research', 'knowledge-creation');
    }

    // Services → Academic Services + Innovation
    if (category === 'services' || title.includes('service')) {
      targets.push('academic-services', 'innovation', 'technology-transfer');
    }

    // Organization → Ecosystem
    if (category === 'organization' || title.includes('organization')) {
      targets.push('knowledge-ecosystem');
    }

    // News → Impact
    if (category === 'news') {
      targets.push('community-impact', 'sustainable-agriculture');
    }

    // Landing → All positions (distribute)
    if (category === 'landing') {
      targets.push('mission', 'research', 'academic-services', 'community-impact');
    }

    return targets.length > 0 ? targets : ['knowledge-ecosystem'];
  }

  async _validateStory() {
    this._log('INFO', 'Validating story completeness...');

    for (const node of this.storyNodes) {
      if (node.source_ids.length === 0) {
        node.missing_content.push(`No content found for ${node.title}`);
      }
      // Calculate confidence
      node.confidence = Math.min(1, node.source_ids.length / 3);  // Max with 3 sources
    }

    this._log('INFO', 'Story validation complete');
  }

  async _exportResults() {
    this._log('INFO', 'Exporting story graph...');

    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Ensure Stitch export directory exists
    const stitchDir = path.dirname(CONFIG.stitchStoryBriefFile);
    if (!fs.existsSync(stitchDir)) {
      fs.mkdirSync(stitchDir, { recursive: true });
    }

    // Export story graph JSON
    this._exportStoryGraphJson();

    // Export story sequence Markdown
    this._exportStorySequenceMd();

    // Export Stitch story brief
    this._exportStitchStoryBrief();

    // Export Stitch content structure
    this._exportStitchContentStructure();

    console.log('✅ Exported story graph outputs');
  }

  _exportStoryGraphJson() {
    const storyGraph = {
      metadata: {
        generated: new Date().toISOString(),
        version: 'v1',
        total_positions: this.storyNodes.length,
        coverage: this._calculateCoverage(),
      },
      arc: this.storyNodes,
    };

    fs.writeFileSync(CONFIG.storyGraphFile, JSON.stringify(storyGraph, null, 2), 'utf8');
    this._log('INFO', `Exported story graph JSON: ${CONFIG.storyGraphFile}`);
  }

  _exportStorySequenceMd() {
    let md = '# Story Sequence for Landing Page\n\n';
    md += '**Generated:** ' + new Date().toISOString() + '\n\n';
    md += '## Story Arc (10 Positions)\n\n';

    for (const node of this.storyNodes) {
      md += `### ${node.priority}. ${node.title} (${node.narrative_role})\n\n`;
      md += `**Narrative Role:** ${node.narrative_role}\n\n`;
      md += `**Recommended Section:** ${node.recommended_section}\n\n`;

      if (node.source_ids.length > 0) {
        md += `**Source Content:** ${node.source_ids.join(', ')}\n\n`;
      } else {
        md += `**⚠️ Missing Content** — No matching source items\n\n`;
      }

      md += `**Coverage:** ${(node.confidence * 100).toFixed(0)}%\n\n`;
      md += '---\n\n';
    }

    fs.writeFileSync(CONFIG.storySequenceFile, md, 'utf8');
    this._log('INFO', `Exported story sequence: ${CONFIG.storySequenceFile}`);
  }

  _exportStitchStoryBrief() {
    let md = '# Stitch Story Brief — Wave 1\n\n';
    md += '**Prepared for:** Stitch Consumption Pipeline\n';
    md += '**Date:** ' + new Date().toISOString() + '\n';
    md += '**Wave:** K0.2B Wave 1\n\n';

    md += '## Landing Page Narrative Structure\n\n';

    md += '### Hero Section\n';
    const heroNode = this.storyNodes.find(n => n.recommended_section === 'hero');
    if (heroNode && heroNode.source_ids.length > 0) {
      md += `**Content:** ${heroNode.source_ids[0]}\n`;
      md += `**Purpose:** ${heroNode.title}\n\n`;
    } else {
      md += 'No hero section content available — needs addition\n\n';
    }

    md += '### At-a-Glance Section\n';
    const ataglance = this.storyNodes.find(n => n.recommended_section === 'at-a-glance');
    if (ataglance && ataglance.source_ids.length > 0) {
      md += `**Content:** ${ataglance.source_ids.join(', ')}\n`;
      md += `**Purpose:** ${ataglance.title}\n\n`;
    }

    md += '### Main Sections\n';
    for (const section of ['research', 'services', 'impact', 'knowledge-ecosystem']) {
      const nodes = this.storyNodes.filter(n => n.recommended_section === section);
      for (const node of nodes) {
        if (node.source_ids.length > 0) {
          md += `**${node.title}:** ${node.source_ids[0]}\n`;
        }
      }
    }
    md += '\n';

    md += '### Footer\n';
    const footer = this.storyNodes.find(n => n.recommended_section === 'footer');
    if (footer) {
      md += `**Final Message:** ${footer.title}\n\n`;
    }

    md += '## Missing Content\n\n';
    let hasMissing = false;
    for (const node of this.storyNodes) {
      if (node.missing_content.length > 0) {
        hasMissing = true;
        md += `- ${node.title}: ${node.missing_content.join('; ')}\n`;
      }
    }
    if (!hasMissing) {
      md += 'All story positions have supporting content.\n';
    }
    md += '\n';

    md += '## Recommendations for K0.3 Expansion\n\n';
    md += '1. Add specific research project examples\n';
    md += '2. Expand community impact stories with farmer testimonials\n';
    md += '3. Add detailed service offerings for each academic service\n';
    md += '4. Develop partnership/ecosystem details\n';
    md += '5. Include future vision/roadmap content\n';

    fs.writeFileSync(CONFIG.stitchStoryBriefFile, md, 'utf8');
    this._log('INFO', `Exported Stitch story brief: ${CONFIG.stitchStoryBriefFile}`);
  }

  _exportStitchContentStructure() {
    const sections = {};

    for (const node of this.storyNodes) {
      const sectionId = node.recommended_section;
      if (!sections[sectionId]) {
        sections[sectionId] = {
          id: sectionId,
          title: this._sectionTitle(sectionId),
          story_nodes: [],
          content_items: [],
        };
      }

      sections[sectionId].story_nodes.push({
        node_id: node.id,
        node_title: node.title,
        narrative_role: node.narrative_role,
      });

      for (const sourceId of node.source_ids) {
        sections[sectionId].content_items.push({
          title: sourceId,
          source: 'Wave 1 Classification',
        });
      }
    }

    const structure = {
      metadata: {
        generated: new Date().toISOString(),
        wave: 'K0.2B Wave 1',
        total_sections: Object.keys(sections).length,
      },
      content_structure: Object.values(sections),
    };

    fs.writeFileSync(CONFIG.stitchStructureFile, JSON.stringify(structure, null, 2), 'utf8');
    this._log('INFO', `Exported Stitch content structure: ${CONFIG.stitchStructureFile}`);
  }

  _sectionTitle(sectionId) {
    const titles = {
      'hero': 'Hero Section',
      'at-a-glance': 'At-a-Glance Overview',
      'research': 'Research Excellence',
      'services': 'Academic Services',
      'impact': 'Community Impact',
      'knowledge-ecosystem': 'Knowledge Ecosystem',
      'footer': 'Footer',
    };
    return titles[sectionId] || 'Section';
  }

  _calculateCoverage() {
    const covered = this.storyNodes.filter(n => n.source_ids.length > 0).length;
    return (covered / this.storyNodes.length) * 100;
  }

  _log(level, message) {
    const entry = `[${new Date().toISOString()}] ${level.padEnd(5)} ${message}`;
    this.log.push(entry);
  }

  _printReport() {
    const coverage = this._calculateCoverage();
    const totalSources = this.storyNodes.reduce((sum, n) => sum + n.source_ids.length, 0);

    console.log('\n📖 Story Graph Report');
    console.log('─'.repeat(50));
    console.log(`Total positions: ${this.storyNodes.length}`);
    console.log(`Coverage: ${coverage.toFixed(0)}%`);
    console.log(`Total content mappings: ${totalSources}`);
    console.log(`Output: ${CONFIG.storyGraphFile}`);

    if (!this.dryRun) {
      console.log('\n✅ Story graph construction complete!');
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

  const builder = new StoryGraphBuilder(options);
  await builder.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { StoryGraphBuilder, CONFIG };
