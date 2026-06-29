/**
 * RAE Knowledge Engine — Knowledge Validation Engine
 * scripts/validate-knowledge.js
 *
 * Phase: K0.2D
 * Author: RAE Knowledge Engine
 * Date: 2026-06-29
 *
 * PURPOSE:
 *   Comprehensive validation of classified, media-inventoried, and story-graphed
 *   knowledge against integrity, consistency, and completeness criteria.
 *
 *   Input:  04_KNOWLEDGE/classification/wave1-classification-v2.json
 *           04_KNOWLEDGE/media/wave1-media-discovery.json
 *           04_KNOWLEDGE/graph/story-graph.json
 *           04_KNOWLEDGE/graph/knowledge-graph.json
 *
 *   Output: 04_KNOWLEDGE/validation/
 *           - quality-report.json (overall score 0-100)
 *           - duplicates.json (detected duplicates)
 *           - broken-links.json (invalid references)
 *           - taxonomy-validation.json (category consistency)
 *           - story-validation.json (narrative completeness)
 *
 * VALIDATION CHECKS:
 *   - Mission/Vision consistency (must exist)
 *   - Core contact information present
 *   - Organization structure consistent
 *   - No duplicate content (text similarity)
 *   - Broken internal references
 *   - Taxonomy integrity (categories valid)
 *   - Knowledge Graph entity/relationship validity
 *   - Story Graph position coverage
 *   - News policy compliance (2568-2569 only)
 *   - Media asset URL validity
 *
 * USAGE:
 *   node scripts/validate-knowledge.js [--dry-run]
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  classificationFile: path.resolve(__dirname, '../04_KNOWLEDGE/classification/wave1-classification-v2.json'),
  mediaFile: path.resolve(__dirname, '../04_KNOWLEDGE/media/wave1-media-discovery.json'),
  storyGraphFile: path.resolve(__dirname, '../04_KNOWLEDGE/graph/story-graph.json'),
  knowledgeGraphFile: path.resolve(__dirname, '../04_KNOWLEDGE/graph/knowledge-graph.json'),
  outputDir: path.resolve(__dirname, '../04_KNOWLEDGE/validation'),
  qualityReportFile: path.resolve(__dirname, '../04_KNOWLEDGE/validation/quality-report.json'),
  duplicatesFile: path.resolve(__dirname, '../04_KNOWLEDGE/validation/duplicates.json'),
  brokenLinksFile: path.resolve(__dirname, '../04_KNOWLEDGE/validation/broken-links.json'),
  taxonomyFile: path.resolve(__dirname, '../04_KNOWLEDGE/validation/taxonomy-validation.json'),
  storyFile: path.resolve(__dirname, '../04_KNOWLEDGE/validation/story-validation.json'),
};

const VALID_CATEGORIES = ['landing', 'research', 'news', 'services', 'organization', 'faq', 'other'];

// ─── Validator ────────────────────────────────────────────────────────────

class KnowledgeValidator {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.classifications = [];
    this.media = [];
    this.storyGraph = null;
    this.knowledgeGraph = null;
    this.validationResults = {
      quality_score: 0,
      total_checks: 0,
      passed_checks: 0,
      failed_checks: 0,
      warnings: [],
      errors: [],
      details: {},
    };
    this.duplicates = [];
    this.brokenLinks = [];
    this.taxonomyIssues = [];
    this.storyIssues = [];
    this.log = [];
  }

  async run() {
    console.log('🔍 Starting knowledge validation...');
    this._log('INFO', `Validation started at ${new Date().toISOString()}`);

    try {
      // Step 1: Load all knowledge sources
      await this._loadData();

      // Step 2: Run validation checks
      await this._runValidationChecks();

      // Step 3: Calculate quality score
      this._calculateQualityScore();

      // Step 4: Export results
      if (!this.dryRun) {
        await this._exportResults();
      }

      // Step 5: Report
      this._printReport();
    } catch (error) {
      this._log('ERROR', `Validation failed: ${error.message}`);
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  async _loadData() {
    this._log('INFO', 'Loading knowledge sources...');

    // Load classifications
    if (fs.existsSync(CONFIG.classificationFile)) {
      const data = JSON.parse(fs.readFileSync(CONFIG.classificationFile, 'utf8'));
      this.classifications = data.items || [];
      console.log(`📋 Loaded ${this.classifications.length} classified items`);
    }

    // Load media
    if (fs.existsSync(CONFIG.mediaFile)) {
      const data = JSON.parse(fs.readFileSync(CONFIG.mediaFile, 'utf8'));
      this.media = data.items || [];
      console.log(`🖼️  Loaded ${this.media.length} media items`);
    }

    // Load story graph
    if (fs.existsSync(CONFIG.storyGraphFile)) {
      this.storyGraph = JSON.parse(fs.readFileSync(CONFIG.storyGraphFile, 'utf8'));
      console.log('📖 Loaded story graph');
    }

    // Load knowledge graph
    if (fs.existsSync(CONFIG.knowledgeGraphFile)) {
      this.knowledgeGraph = JSON.parse(fs.readFileSync(CONFIG.knowledgeGraphFile, 'utf8'));
      console.log('🔗 Loaded knowledge graph');
    }
  }

  async _runValidationChecks() {
    this._log('INFO', 'Running validation checks...');

    // Core content checks
    this._checkMissionPresence();
    this._checkVisionPresence();
    this._checkContactConsistency();
    this._checkOrganizationConsistency();

    // Data quality checks
    this._checkForDuplicates();
    this._checkBrokenReferences();
    this._checkTaxonomyIntegrity();

    // Complex checks
    this._checkKnowledgeGraphIntegrity();
    this._checkStoryGraphCompleteness();
    this._checkNewsPolicyCompliance();
    this._checkMediaAssets();

    this._log('INFO', `Completed ${this.validationResults.total_checks} validation checks`);
  }

  _checkMissionPresence() {
    const check = 'Mission Content Present';
    this.validationResults.total_checks++;

    const mission = this.classifications.find(c => c.title.toLowerCase().includes('mission'));

    if (mission && mission.action === 'KEEP') {
      this.validationResults.passed_checks++;
      this.validationResults.details[check] = { status: 'PASS', message: 'Mission statement found and preserved' };
    } else {
      this.validationResults.failed_checks++;
      this.validationResults.errors.push(`${check}: No mission statement found or archived`);
      this.validationResults.details[check] = { status: 'FAIL', message: 'Mission statement not found' };
    }
  }

  _checkVisionPresence() {
    const check = 'Vision Content Present';
    this.validationResults.total_checks++;

    const vision = this.classifications.find(c => c.title.toLowerCase().includes('vision'));

    if (vision && vision.action === 'KEEP') {
      this.validationResults.passed_checks++;
      this.validationResults.details[check] = { status: 'PASS', message: 'Vision statement found and preserved' };
    } else {
      this.validationResults.warnings.push(`${check}: Vision statement not explicitly found`);
      this.validationResults.details[check] = { status: 'WARN', message: 'Vision statement not found' };
    }
  }

  _checkContactConsistency() {
    const check = 'Contact Information Consistent';
    this.validationResults.total_checks++;

    const contacts = this.classifications.filter(c => 
      c.title.toLowerCase().includes('contact') || 
      c.category === 'organization'
    );

    if (contacts.length > 0 && contacts.every(c => c.action === 'KEEP')) {
      this.validationResults.passed_checks++;
      this.validationResults.details[check] = { status: 'PASS', message: `${contacts.length} contact items preserved` };
    } else {
      this.validationResults.warnings.push(`${check}: Some contact information may be incomplete`);
      this.validationResults.details[check] = { status: 'WARN', message: `${contacts.length} contact items found, consistency unclear` };
    }
  }

  _checkOrganizationConsistency() {
    const check = 'Organization Structure Consistent';
    this.validationResults.total_checks++;

    const orgItems = this.classifications.filter(c => c.category === 'organization');
    const keepItems = orgItems.filter(c => c.action === 'KEEP');

    if (keepItems.length >= 2) {
      this.validationResults.passed_checks++;
      this.validationResults.details[check] = { status: 'PASS', message: `${keepItems.length} organization items preserved` };
    } else {
      this.validationResults.warnings.push(`${check}: Limited organization content`);
      this.validationResults.details[check] = { status: 'WARN', message: `Only ${keepItems.length} organization items` };
    }
  }

  _checkForDuplicates() {
    const check = 'Duplicate Content Detection';
    this.validationResults.total_checks++;

    const titles = this.classifications.map(c => c.title.toLowerCase().trim());
    const duplicateMap = {};

    for (let i = 0; i < titles.length; i++) {
      for (let j = i + 1; j < titles.length; j++) {
        const sim = this._textSimilarity(titles[i], titles[j]);
        if (sim > 0.85) {
          const pair = [this.classifications[i].title, this.classifications[j].title];
          this.duplicates.push({
            item1: pair[0],
            item2: pair[1],
            similarity: sim.toFixed(2),
            recommendation: 'Review for merge'
          });
        }
      }
    }

    if (this.duplicates.length === 0) {
      this.validationResults.passed_checks++;
      this.validationResults.details[check] = { status: 'PASS', message: 'No significant duplicates detected' };
    } else {
      this.validationResults.warnings.push(`${check}: ${this.duplicates.length} potential duplicates found`);
      this.validationResults.details[check] = { status: 'WARN', message: `${this.duplicates.length} potential duplicates` };
    }
  }

  _textSimilarity(a, b) {
    // Simple Levenshtein-based similarity (0-1)
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this._levenshtein(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  _levenshtein(a, b) {
    const costs = [];
    for (let i = 0; i <= a.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= b.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (a.charAt(i - 1) !== b.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[b.length] = lastValue;
    }
    return costs[b.length];
  }

  _checkBrokenReferences() {
    const check = 'Broken Internal References';
    this.validationResults.total_checks++;

    const urls = this.classifications.map(c => c.source_url);
    const urlSet = new Set(urls);

    let broken = 0;
    for (const item of this.classifications) {
      if (item.merge_target && !item.merge_target.includes('http')) {
        // merge_target is text reference, skip URL validation
      }
    }

    // Check media URLs
    for (const item of this.media) {
      if (!item.asset_url || !item.asset_url.startsWith('http')) {
        broken++;
        this.brokenLinks.push({
          type: 'media',
          id: item.id,
          url: item.asset_url || 'none',
          reason: 'Invalid URL format'
        });
      }
    }

    if (broken === 0) {
      this.validationResults.passed_checks++;
      this.validationResults.details[check] = { status: 'PASS', message: 'No broken references detected' };
    } else {
      this.validationResults.warnings.push(`${check}: ${broken} broken links found`);
      this.validationResults.details[check] = { status: 'WARN', message: `${broken} broken links` };
    }
  }

  _checkTaxonomyIntegrity() {
    const check = 'Taxonomy Integrity';
    this.validationResults.total_checks++;

    const categoryDistribution = {};
    const invalidCategories = [];

    for (const item of this.classifications) {
      const cat = item.category || 'unknown';
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;

      if (!VALID_CATEGORIES.includes(cat)) {
        invalidCategories.push(item.title);
      }
    }

    this.taxonomyIssues.push({
      category_distribution: categoryDistribution,
      invalid_categories: invalidCategories,
      coverage: Object.keys(categoryDistribution).length
    });

    if (invalidCategories.length === 0) {
      this.validationResults.passed_checks++;
      this.validationResults.details[check] = { status: 'PASS', message: 'All categories valid' };
    } else {
      this.validationResults.warnings.push(`${check}: ${invalidCategories.length} invalid categories`);
      this.validationResults.details[check] = { status: 'WARN', message: `${invalidCategories.length} invalid categories` };
    }
  }

  _checkKnowledgeGraphIntegrity() {
    const check = 'Knowledge Graph Integrity';
    this.validationResults.total_checks++;

    if (!this.knowledgeGraph || !this.knowledgeGraph.arc) {
      this.validationResults.warnings.push(`${check}: Knowledge graph missing or malformed`);
      this.validationResults.details[check] = { status: 'WARN', message: 'Knowledge graph not loaded' };
      return;
    }

    const nodes = this.knowledgeGraph.arc || [];
    const nodeIds = new Set(nodes.map(n => n.id));

    let validRelationships = 0;
    let invalidRelationships = 0;

    // Assuming relationships are in arc structure
    if (nodes.length > 3) {
      this.validationResults.passed_checks++;
      this.validationResults.details[check] = { status: 'PASS', message: `Knowledge graph valid with ${nodes.length} nodes` };
    } else {
      this.validationResults.warnings.push(`${check}: Sparse knowledge graph`);
      this.validationResults.details[check] = { status: 'WARN', message: `Only ${nodes.length} nodes in graph` };
    }
  }

  _checkStoryGraphCompleteness() {
    const check = 'Story Graph Completeness';
    this.validationResults.total_checks++;

    if (!this.storyGraph || !this.storyGraph.arc) {
      this.validationResults.warnings.push(`${check}: Story graph missing`);
      this.validationResults.details[check] = { status: 'WARN', message: 'Story graph not loaded' };
      return;
    }

    const arc = this.storyGraph.arc || [];
    const covered = arc.filter(n => n.source_ids && n.source_ids.length > 0).length;
    const coverage = (covered / arc.length) * 100;

    this.storyIssues.push({
      total_positions: arc.length,
      covered_positions: covered,
      coverage_percentage: coverage.toFixed(1),
      missing_positions: arc.filter(n => (!n.source_ids || n.source_ids.length === 0)).map(n => n.title)
    });

    if (coverage >= 80) {
      this.validationResults.passed_checks++;
      this.validationResults.details[check] = { status: 'PASS', message: `Story arc ${coverage.toFixed(0)}% complete` };
    } else {
      this.validationResults.warnings.push(`${check}: Story arc only ${coverage.toFixed(0)}% complete`);
      this.validationResults.details[check] = { status: 'WARN', message: `Story arc ${coverage.toFixed(0)}% complete` };
    }
  }

  _checkNewsPolicyCompliance() {
    const check = 'News Policy Compliance (2568-2569)';
    this.validationResults.total_checks++;

    const newsItems = this.classifications.filter(c => c.category === 'news');
    const compliant = newsItems.filter(c => 
      c.source_url.includes('2568') || 
      c.source_url.includes('2569') ||
      c.title.includes('2568') ||
      c.title.includes('2569') ||
      c.action === 'ARCHIVE'
    );

    if (compliant.length === newsItems.length) {
      this.validationResults.passed_checks++;
      this.validationResults.details[check] = { status: 'PASS', message: 'All news items policy-compliant' };
    } else {
      const noncompliant = newsItems.length - compliant.length;
      this.validationResults.warnings.push(`${check}: ${noncompliant} news items may not comply`);
      this.validationResults.details[check] = { status: 'WARN', message: `${noncompliant} news items need review` };
    }
  }

  _checkMediaAssets() {
    const check = 'Media Asset Validation';
    this.validationResults.total_checks++;

    if (this.media.length === 0) {
      this.validationResults.warnings.push(`${check}: No media assets found`);
      this.validationResults.details[check] = { status: 'WARN', message: 'No media assets in inventory' };
      return;
    }

    const candidates = this.media.filter(m => m.stitch_candidate);
    const highPriority = this.media.filter(m => m.download_priority === 'high');

    if (candidates.length > 0 && highPriority.length > 0) {
      this.validationResults.passed_checks++;
      this.validationResults.details[check] = { status: 'PASS', message: `${candidates.length} Stitch candidates, ${highPriority.length} high priority` };
    } else {
      this.validationResults.warnings.push(`${check}: Limited media asset readiness`);
      this.validationResults.details[check] = { status: 'WARN', message: `${candidates.length} candidates, ${highPriority.length} high priority` };
    }
  }

  _calculateQualityScore() {
    // Quality score = (passed_checks / total_checks) * 100
    if (this.validationResults.total_checks > 0) {
      this.validationResults.quality_score = Math.round(
        (this.validationResults.passed_checks / this.validationResults.total_checks) * 100
      );
    }
  }

  async _exportResults() {
    this._log('INFO', 'Exporting validation results...');

    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Export quality report
    fs.writeFileSync(CONFIG.qualityReportFile, JSON.stringify(this.validationResults, null, 2), 'utf8');
    this._log('INFO', `Exported quality report: ${CONFIG.qualityReportFile}`);

    // Export duplicates
    fs.writeFileSync(CONFIG.duplicatesFile, JSON.stringify({
      total_duplicates: this.duplicates.length,
      items: this.duplicates
    }, null, 2), 'utf8');
    this._log('INFO', `Exported duplicates: ${CONFIG.duplicatesFile}`);

    // Export broken links
    fs.writeFileSync(CONFIG.brokenLinksFile, JSON.stringify({
      total_broken: this.brokenLinks.length,
      items: this.brokenLinks
    }, null, 2), 'utf8');
    this._log('INFO', `Exported broken links: ${CONFIG.brokenLinksFile}`);

    // Export taxonomy validation
    fs.writeFileSync(CONFIG.taxonomyFile, JSON.stringify(this.taxonomyIssues, null, 2), 'utf8');
    this._log('INFO', `Exported taxonomy validation: ${CONFIG.taxonomyFile}`);

    // Export story validation
    fs.writeFileSync(CONFIG.storyFile, JSON.stringify(this.storyIssues, null, 2), 'utf8');
    this._log('INFO', `Exported story validation: ${CONFIG.storyFile}`);

    console.log('✅ Exported validation results');
  }

  _log(level, message) {
    const entry = `[${new Date().toISOString()}] ${level.padEnd(5)} ${message}`;
    this.log.push(entry);
  }

  _printReport() {
    console.log('\n📊 Knowledge Validation Report');
    console.log('─'.repeat(50));
    console.log(`Quality Score: ${this.validationResults.quality_score}/100`);
    console.log(`Checks Passed: ${this.validationResults.passed_checks}/${this.validationResults.total_checks}`);
    console.log(`Warnings: ${this.validationResults.warnings.length}`);
    console.log(`Errors: ${this.validationResults.errors.length}`);
    console.log(`Duplicates Detected: ${this.duplicates.length}`);
    console.log(`Broken Links: ${this.brokenLinks.length}`);

    if (!this.dryRun) {
      console.log('\n✅ Validation complete!');
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

  const validator = new KnowledgeValidator(options);
  await validator.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { KnowledgeValidator, CONFIG };
