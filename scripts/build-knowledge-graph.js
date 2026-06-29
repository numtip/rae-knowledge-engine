/**
 * RAE Knowledge Engine — Knowledge Graph Builder
 * scripts/build-knowledge-graph.js
 *
 * Phase: K0.1B
 * Author: RAE Knowledge Engine
 * Date: 2026-06-29
 *
 * PURPOSE:
 *   Build a structured network of concepts, entities, and relationships
 *   from classified content.
 *
 *   Input:  04_KNOWLEDGE/classification/
 *   Output: 04_KNOWLEDGE/graph/knowledge-graph.json
 *           04_KNOWLEDGE/graph/knowledge-relationships.csv
 *
 * PROCESS:
 *   1. Extract entities from content
 *   2. Identify relationships
 *   3. Calculate confidence scores
 *   4. Build graph structure
 *   5. Export to JSON and CSV
 *
 * USAGE:
 *   node scripts/build-knowledge-graph.js [--dry-run]
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  sourceDir: path.resolve(__dirname, '../04_KNOWLEDGE/classification'),
  outputDir: path.resolve(__dirname, '../04_KNOWLEDGE/graph'),
  graphFile: path.resolve(__dirname, '../04_KNOWLEDGE/graph/knowledge-graph.json'),
  relFile: path.resolve(__dirname, '../04_KNOWLEDGE/graph/knowledge-relationships.csv'),
  logFile: path.resolve(__dirname, '../04_KNOWLEDGE/graph/build-graph.log'),
};

const NODE_TYPES = [
  'mission', 'vision', 'organization', 'service', 'research', 'project',
  'researcher', 'news', 'document', 'partner', 'community', 'impact', 'contact'
];

const RELATIONSHIP_TYPES = [
  'supports', 'belongs_to', 'provides', 'produces', 'benefits', 'related_to',
  'references', 'contact_for', 'part_of'
];

// ─── Knowledge Graph Builder ────────────────────────────────────────────────

class KnowledgeGraphBuilder {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.nodes = new Map();
    this.relationships = [];
    this.log = [];
  }

  async run() {
    console.log('🔗 Starting knowledge graph construction...');
    this._log('INFO', `Graph construction started at ${new Date().toISOString()}`);

    try {
      // Step 1: Load classified content
      await this._loadClassifications();

      // Step 2: Extract entities
      await this._extractEntities();

      // Step 3: Discover relationships
      await this._discoverRelationships();

      // Step 4: Validate graph
      await this._validateGraph();

      // Step 5: Export results
      if (!this.dryRun) {
        await this._exportGraph();
      }

      // Step 6: Report
      this._printReport();
    } catch (error) {
      this._log('ERROR', `Graph construction failed: ${error.message}`);
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
    this._log('INFO', `Loaded ${data.items.length} classified items`);

    return data.items;
  }

  async _extractEntities() {
    this._log('INFO', 'Extracting entities...');

    const items = await this._loadClassifications();
    let nodeId = 1;

    // Seed nodes: mission, vision, organization, and key entities
    this._addSeedNode('MISSION-001', 'Advance Research and Education', 'mission', 'landing', 5);
    this._addSeedNode('VISION-001', 'Strategic Vision', 'vision', 'landing', 5);
    this._addSeedNode('ORG-001', 'RAE Organization', 'organization', 'organization', 5);
    this._addSeedNode('RESEARCH-PROJECTS', 'Research Projects', 'research', 'research', 5);
    this._addSeedNode('RESEARCHERS', 'Research Team', 'researcher', 'organization', 4);
    this._addSeedNode('INNOVATION-001', 'Innovation Hub', 'innovation', 'research', 5);
    this._addSeedNode('LABS-001', 'Laboratories & Facilities', 'laboratory', 'services', 4);
    this._addSeedNode('SERVICES-001', 'Academic Services', 'service', 'services', 5);
    this._addSeedNode('COMMUNITY-001', 'Farmer Communities', 'community', 'organization', 4);
    this._addSeedNode('DOCUMENTS', 'Knowledge Base', 'document', 'research', 3);
    this._addSeedNode('CONTACT-001', 'Contact & Support', 'contact', 'organization', 4);

    // Extract nodes from classified items
    let nodeCounter = 1;
    for (const item of items) {
      if (item.action === 'KEEP' || item.action === 'REWRITE') {
        const nodeType = this._detectNodeType(item);
        const nodeLabel = item.title;
        const nodeId = `RAE-NODE-${nodeType.toUpperCase()}-${String(nodeCounter++).padStart(3, '0')}`;

        this._addNode(nodeId, nodeLabel, nodeType, item.category, item.importance, [item.source_url]);
      }
    }

    console.log(`🔗 Extracted ${this.nodes.size} entities`);
    this._log('INFO', `Extracted ${this.nodes.size} entities`);
  }

  _addSeedNode(id, label, type, category, importance) {
    this.nodes.set(id, {
      id,
      label,
      type,
      category,
      importance,
      source_ids: [],
      description: label,
      keywords: [],
    });
  }

  _addNode(id, label, type, category, importance, sourceUrls) {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, {
        id,
        label,
        type,
        category,
        importance,
        source_ids: sourceUrls,
        description: label,
        keywords: this._extractKeywords(label),
      });
    }
  }

  _detectNodeType(item) {
    if (item.research_candidate) return 'research';
    if (item.service_candidate) return 'service';
    if (item.homepage_candidate) return item.category === 'landing' ? 'mission' : 'organization';
    if (item.category === 'news') return 'news';
    if (item.category === 'organization') return 'organization';
    return 'document';
  }

  _extractKeywords(text) {
    // Simple keyword extraction
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    return [...new Set(words)].slice(0, 5);
  }

  async _discoverRelationships() {
    this._log('INFO', 'Discovering relationships...');

    // Define core relationship model
    const nodeArray = Array.from(this.nodes.values());

    // Seed relationships (foundation)
    this._addRelationship('RESEARCH-PROJECTS', 'RESEARCHERS', 'part_of', 0.95);
    this._addRelationship('RESEARCH-PROJECTS', 'INNOVATION-001', 'produces', 0.90);
    this._addRelationship('INNOVATION-001', 'SERVICES-001', 'supports', 0.85);
    this._addRelationship('SERVICES-001', 'LABS-001', 'provided_by', 0.80);
    this._addRelationship('COMMUNITY-001', 'SERVICES-001', 'benefits', 0.85);
    this._addRelationship('DOCUMENTS', 'RESEARCH-PROJECTS', 'documents', 0.70);
    this._addRelationship('CONTACT-001', 'COMMUNITY-001', 'supports', 0.75);
    this._addRelationship('ORG-001', 'MISSION-001', 'drives', 0.95);
    this._addRelationship('ORG-001', 'VISION-001', 'guides', 0.95);

    // Relationship rules for extracted content
    for (const node of nodeArray) {
      // Research produces innovation
      if (node.type === 'research' && node.id !== 'RESEARCH-PROJECTS') {
        const innovation = this.nodes.get('INNOVATION-001');
        if (innovation && !this._relationshipExists(node.id, innovation.id, 'produces')) {
          this._addRelationship(node.id, innovation.id, 'produces', 0.85);
        }
      }

      // Service supports community
      if (node.type === 'service' && node.id !== 'SERVICES-001') {
        const community = this.nodes.get('COMMUNITY-001');
        if (community && !this._relationshipExists(node.id, community.id, 'benefits')) {
          this._addRelationship(node.id, community.id, 'benefits', 0.80);
        }
      }

      // Items belong to organization (but not seed nodes)
      if (node.type !== 'mission' && node.type !== 'vision' && node.type !== 'organization' && 
          !node.id.match(/^[A-Z]+-001$|^[A-Z]+S$/)) {
        const org = this.nodes.get('ORG-001');
        if (org && !this._relationshipExists(node.id, org.id, 'belongs_to')) {
          this._addRelationship(node.id, org.id, 'belongs_to', 0.75);
        }
      }

      // Researchers part of research projects
      if (node.type === 'researcher' && node.id !== 'RESEARCHERS') {
        const projects = this.nodes.get('RESEARCH-PROJECTS');
        if (projects && !this._relationshipExists(node.id, projects.id, 'part_of')) {
          this._addRelationship(node.id, projects.id, 'part_of', 0.80);
        }
      }
    }

    console.log(`🔗 Discovered ${this.relationships.length} relationships`);
    this._log('INFO', `Discovered ${this.relationships.length} relationships`);
  }

  _relationshipExists(sourceId, targetId, type) {
    return this.relationships.some(
      r => r.source_id === sourceId && r.target_id === targetId && r.type === type
    );
  }

  _findNodeByType(type) {
    for (const node of this.nodes.values()) {
      if (node.type === type) return node;
    }
    return null;
  }

  _addRelationship(sourceId, targetId, type, confidence) {
    if (!sourceId || !targetId || sourceId === targetId) return;

    const existing = this.relationships.find(r =>
      r.source_id === sourceId && r.target_id === targetId && r.relationship_type === type
    );

    if (!existing) {
      this.relationships.push({
        source_id: sourceId,
        target_id: targetId,
        relationship_type: type,
        confidence,
        evidence: ['content analysis'],
        weight: confidence,
      });
    }
  }

  async _validateGraph() {
    this._log('INFO', 'Validating graph...');

    let valid = 0;
    let invalid = 0;

    for (const rel of this.relationships) {
      if (this.nodes.has(rel.source_id) && this.nodes.has(rel.target_id)) {
        valid++;
      } else {
        invalid++;
        this._log('WARN', `Invalid relationship: ${rel.source_id} → ${rel.target_id}`);
      }
    }

    console.log(`✓ ${valid} valid relationships, ✗ ${invalid} invalid`);
  }

  async _exportGraph() {
    this._log('INFO', 'Exporting graph...');

    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Export JSON
    const graph = {
      metadata: {
        generated: new Date().toISOString(),
        total_nodes: this.nodes.size,
        total_relationships: this.relationships.length,
        node_type_distribution: this._computeDistribution('type'),
      },
      nodes: Array.from(this.nodes.values()),
      relationships: this.relationships,
    };

    fs.writeFileSync(CONFIG.graphFile, JSON.stringify(graph, null, 2), 'utf8');
    this._log('INFO', `Exported graph JSON: ${CONFIG.graphFile}`);

    // Export CSV
    this._exportRelationshipsCsv();
  }

  _exportRelationshipsCsv() {
    const headers = [
      'source_id', 'source_label', 'target_id', 'target_label',
      'relationship_type', 'confidence', 'weight'
    ];

    const rows = [headers.join(',')];

    for (const rel of this.relationships) {
      const source = this.nodes.get(rel.source_id);
      const target = this.nodes.get(rel.target_id);

      if (source && target) {
        const row = [
          rel.source_id,
          this._escapeCsv(source.label),
          rel.target_id,
          this._escapeCsv(target.label),
          rel.relationship_type,
          rel.confidence.toFixed(2),
          rel.weight.toFixed(2),
        ];
        rows.push(row.join(','));
      }
    }

    fs.writeFileSync(CONFIG.relFile, rows.join('\n'), 'utf8');
    this._log('INFO', `Exported relationships CSV: ${CONFIG.relFile}`);
  }

  _computeDistribution(field) {
    const dist = {};
    for (const node of this.nodes.values()) {
      const key = node[field] || 'unknown';
      dist[key] = (dist[key] || 0) + 1;
    }
    return dist;
  }

  _escapeCsv(value) {
    if (!value) return '""';
    const str = String(value);
    if (str.includes(',') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  _log(level, message) {
    const entry = `[${new Date().toISOString()}] ${level.padEnd(5)} ${message}`;
    this.log.push(entry);
  }

  _printReport() {
    console.log('\n📊 Knowledge Graph Report');
    console.log('─'.repeat(50));
    console.log(`Total nodes: ${this.nodes.size}`);
    console.log(`Total relationships: ${this.relationships.length}`);
    console.log(`Output: ${CONFIG.graphFile}`);

    if (!this.dryRun) {
      console.log('\n✅ Graph construction complete!');
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

  const builder = new KnowledgeGraphBuilder(options);
  await builder.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { KnowledgeGraphBuilder, CONFIG };
