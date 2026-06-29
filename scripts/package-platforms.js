/**
 * RAE Knowledge Engine — Multi-Platform Packaging Engine
 * scripts/package-stitch.js, package-chatgpt.js, package-cursor.js, package-m365.js
 *
 * Phase: K0.2E
 * Author: RAE Knowledge Engine
 * Date: 2026-06-29
 *
 * PURPOSE:
 *   Package validated knowledge for 4 consumer platforms with platform-specific formats.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Shared Configuration ────────────────────────────────────────────────────

const CONFIG = {
  classificationFile: path.resolve(__dirname, '../04_KNOWLEDGE/classification/wave1-classification-v2.json'),
  storyGraphFile: path.resolve(__dirname, '../04_KNOWLEDGE/graph/story-graph.json'),
  mediaFile: path.resolve(__dirname, '../04_KNOWLEDGE/media/wave1-media-discovery.json'),
  outputDirStitch: path.resolve(__dirname, '../05_EXPORT/Google-Stitch'),
  outputDirChatGPT: path.resolve(__dirname, '../05_EXPORT/ChatGPT'),
  outputDirCursor: path.resolve(__dirname, '../05_EXPORT/Cursor'),
  outputDirM365: path.resolve(__dirname, '../05_EXPORT/Microsoft365'),
};

// ─── Base Packager ────────────────────────────────────────────────────────

class BasePackager {
  constructor(platform, outputDir) {
    this.platform = platform;
    this.outputDir = outputDir;
    this.classifications = [];
    this.storyGraph = null;
    this.media = [];
    this.dryRun = false;
    this.log = [];
  }

  async loadData() {
    if (fs.existsSync(CONFIG.classificationFile)) {
      const data = JSON.parse(fs.readFileSync(CONFIG.classificationFile, 'utf8'));
      this.classifications = data.items || [];
    }
    if (fs.existsSync(CONFIG.storyGraphFile)) {
      this.storyGraph = JSON.parse(fs.readFileSync(CONFIG.storyGraphFile, 'utf8'));
    }
    if (fs.existsSync(CONFIG.mediaFile)) {
      const data = JSON.parse(fs.readFileSync(CONFIG.mediaFile, 'utf8'));
      this.media = data.items || [];
    }
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  _log(level, message) {
    this.log.push(`[${new Date().toISOString()}] ${level.padEnd(5)} ${message}`);
  }
}

// ─── Google Stitch Packager ────────────────────────────────────────────────

class StitchPackager extends BasePackager {
  async run() {
    console.log('🔗 Packaging for Google Stitch...');
    this._log('INFO', 'Stitch packaging started');

    await this.loadData();
    this.ensureOutputDir();

    const package_ = {
      metadata: {
        platform: 'Google Stitch',
        generated: new Date().toISOString(),
        version: 'v1',
        content_count: this.classifications.length,
      },
      landing_page_structure: this._buildLandingStructure(),
      content_index: this._buildContentIndex(),
      media_manifest: this._buildMediaManifest(),
      story_flow: this.storyGraph,
    };

    if (!this.dryRun) {
      fs.writeFileSync(
        path.join(this.outputDir, 'stitch-package.json'),
        JSON.stringify(package_, null, 2),
        'utf8'
      );
      this._exportReadme('Stitch');
      this._log('INFO', 'Stitch package exported');
    }

    console.log(`✅ Stitch package ready (${this.classifications.length} items)`);
  }

  _buildLandingStructure() {
    const sections = {};
    
    for (const item of this.classifications) {
      const section = item.section_candidate || 'none';
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push({
        title: item.title,
        story_priority: item.story_priority,
        importance: item.importance,
        source_url: item.source_url,
      });
    }

    return sections;
  }

  _buildContentIndex() {
    return {
      total_items: this.classifications.length,
      by_category: this._groupBy(this.classifications, 'category'),
      by_action: this._groupBy(this.classifications, 'action'),
    };
  }

  _buildMediaManifest() {
    const candidates = this.media.filter(m => m.stitch_candidate);
    return {
      total_candidates: candidates.length,
      by_role: this._groupBy(candidates, 'visual_role'),
      hero_images: candidates.filter(m => m.visual_role === 'hero'),
    };
  }

  _groupBy(arr, key) {
    const result = {};
    for (const item of arr) {
      const k = item[key] || 'unknown';
      result[k] = (result[k] || 0) + 1;
    }
    return result;
  }

  _exportReadme(platform) {
    let readme = `# RAE Knowledge — ${platform} Package\n\n`;
    readme += `**Generated:** ${new Date().toISOString()}\n`;
    readme += `**Platform:** Google Stitch\n`;
    readme += `**Items:** ${this.classifications.length}\n`;
    readme += `**Media:** ${this.media.filter(m => m.stitch_candidate).length} candidates\n\n`;
    
    readme += '## Package Contents\n\n';
    readme += '- Landing page structure with section mapping\n';
    readme += '- Content index with category distribution\n';
    readme += '- Media manifest with high-priority images\n';
    readme += '- Story flow for narrative context\n\n';
    
    readme += '## Integration Steps\n\n';
    readme += '1. Import JSON into Stitch dashboard\n';
    readme += '2. Configure landing page sections\n';
    readme += '3. Map media candidates to sections\n';
    readme += '4. Deploy to Stitch multi-channel\n\n';

    fs.writeFileSync(path.join(this.outputDir, 'README.md'), readme, 'utf8');
  }
}

// ─── ChatGPT Packager ────────────────────────────────────────────────────

class ChatGPTPackager extends BasePackager {
  async run() {
    console.log('🤖 Packaging for ChatGPT...');
    this._log('INFO', 'ChatGPT packaging started');

    await this.loadData();
    this.ensureOutputDir();

    const package_ = {
      metadata: {
        platform: 'ChatGPT',
        generated: new Date().toISOString(),
        version: 'v1',
        model_version: 'gpt-4',
        content_count: this.classifications.length,
      },
      knowledge_base: this._buildKnowledgeBase(),
      system_prompt: this._buildSystemPrompt(),
      knowledge_index: this._buildKnowledgeIndex(),
    };

    if (!this.dryRun) {
      fs.writeFileSync(
        path.join(this.outputDir, 'chatgpt-knowledge.json'),
        JSON.stringify(package_, null, 2),
        'utf8'
      );
      this._exportReadme('ChatGPT');
      this._log('INFO', 'ChatGPT package exported');
    }

    console.log(`✅ ChatGPT package ready (${this.classifications.length} items)`);
  }

  _buildKnowledgeBase() {
    return this.classifications
      .filter(c => c.action === 'KEEP' || c.action === 'REWRITE')
      .map(c => ({
        id: c.title.replace(/\s+/g, '-').toLowerCase(),
        title: c.title,
        category: c.category,
        importance: c.importance,
        content_summary: `${c.title} (${c.category})`,
        source: c.source_url,
      }));
  }

  _buildSystemPrompt() {
    return {
      role: 'system',
      content: `You are an assistant trained on Royal Agricultural Extension (RAE) knowledge.
Provide accurate information about RAE's research, services, organization, and impact.
When asked, cite source URLs and importance levels.
Maintain institutional voice and brand consistency.
For unknown topics, defer to primary sources.`,
      knowledge_source: 'RAE Wave 1 Knowledge Base',
      last_updated: new Date().toISOString(),
    };
  }

  _buildKnowledgeIndex() {
    const index = {};
    for (const item of this.classifications) {
      const cat = item.category || 'other';
      if (!index[cat]) index[cat] = [];
      index[cat].push(item.title);
    }
    return index;
  }

  _exportReadme(platform) {
    let readme = `# RAE Knowledge — ${platform} Package\n\n`;
    readme += `**Generated:** ${new Date().toISOString()}\n`;
    readme += `**Platform:** ChatGPT / OpenAI API\n`;
    readme += `**Items:** ${this.classifications.length}\n\n`;
    
    readme += '## Integration with ChatGPT\n\n';
    readme += '### Using with Custom GPT\n';
    readme += '1. Upload `chatgpt-knowledge.json` to Custom GPT\n';
    readme += '2. Set system prompt from knowledge file\n';
    readme += '3. Configure knowledge base indexing\n';
    readme += '4. Test with sample queries\n\n';
    
    readme += '### Using with OpenAI API\n';
    readme += '1. Ingest knowledge-base items into vector store\n';
    readme += '2. Configure retrieval augmented generation (RAG)\n';
    readme += '3. Set system prompt for institutional voice\n';
    readme += '4. Deploy as chatbot\n\n';

    fs.writeFileSync(path.join(this.outputDir, 'README.md'), readme, 'utf8');
  }
}

// ─── Cursor IDE Packager ────────────────────────────────────────────────────

class CursorPackager extends BasePackager {
  async run() {
    console.log('✏️  Packaging for Cursor IDE...');
    this._log('INFO', 'Cursor packaging started');

    await this.loadData();
    this.ensureOutputDir();

    const package_ = {
      metadata: {
        platform: 'Cursor IDE',
        generated: new Date().toISOString(),
        version: 'v1',
        indexed_for: 'context window + long context',
        content_count: this.classifications.length,
      },
      cursor_config: this._buildCursorConfig(),
      searchable_knowledge: this._buildSearchableKnowledge(),
      reference_structure: this._buildReferenceStructure(),
    };

    if (!this.dryRun) {
      fs.writeFileSync(
        path.join(this.outputDir, 'cursor-knowledge.json'),
        JSON.stringify(package_, null, 2),
        'utf8'
      );
      this._exportCursorRules();
      this._exportReadme('Cursor');
      this._log('INFO', 'Cursor package exported');
    }

    console.log(`✅ Cursor package ready (${this.classifications.length} items)`);
  }

  _buildCursorConfig() {
    return {
      knowledge_tags: ['RAE', 'research', 'agriculture', 'thailand'],
      context_type: 'reference-material',
      search_enabled: true,
      max_context_length: 100000,
      categories: ['landing', 'research', 'services', 'news', 'organization'],
    };
  }

  _buildSearchableKnowledge() {
    return this.classifications.map(c => ({
      title: c.title,
      category: c.category,
      tags: [c.category, ...(c.importance >= 4 ? ['high-priority'] : [])],
      searchable_text: `${c.title} ${c.category}`,
      source_url: c.source_url,
      section_candidate: c.section_candidate,
    }));
  }

  _buildReferenceStructure() {
    const structure = {};
    for (const item of this.classifications) {
      if (!structure[item.category]) {
        structure[item.category] = { items: [], count: 0 };
      }
      structure[item.category].items.push(item.title);
      structure[item.category].count++;
    }
    return structure;
  }

  _exportCursorRules() {
    const rules = {
      name: 'RAE Knowledge Reference',
      description: 'Reference rules for RAE knowledge context',
      rules: [
        {
          trigger: ['RAE', 'research', 'agriculture'],
          context: 'Load RAE knowledge base context',
          action: 'search-knowledge',
        },
        {
          trigger: ['what does RAE', 'who is RAE'],
          context: 'Institution overview',
          action: 'return-mission-vision',
        },
        {
          trigger: ['services', 'training', 'consulting'],
          context: 'Services inquiry',
          action: 'search-services-category',
        },
      ],
    };

    fs.writeFileSync(
      path.join(this.outputDir, 'cursor-rules.json'),
      JSON.stringify(rules, null, 2),
      'utf8'
    );
  }

  _exportReadme(platform) {
    let readme = `# RAE Knowledge — ${platform} Package\n\n`;
    readme += `**Generated:** ${new Date().toISOString()}\n`;
    readme += `**IDE:** Cursor\n`;
    readme += `**Items:** ${this.classifications.length}\n\n`;
    
    readme += '## Integration with Cursor\n\n';
    readme += '1. Copy `cursor-knowledge.json` to project root\n';
    readme += '2. Add rules to `.cursor/rules.md`\n';
    readme += '3. Enable knowledge indexing in settings\n';
    readme += '4. Reference with @RAE-knowledge in prompts\n\n';
    
    readme += '## Usage in Cursor\n\n';
    readme += '- Type `@RAE` to search knowledge base\n';
    readme += '- Use `#RAE` for category-specific context\n';
    readme += '- Reference sources with `[RAE-source-url]`\n\n';

    fs.writeFileSync(path.join(this.outputDir, 'README.md'), readme, 'utf8');
  }
}

// ─── Microsoft 365 Packager ────────────────────────────────────────────────

class M365Packager extends BasePackager {
  async run() {
    console.log('☁️  Packaging for Microsoft 365...');
    this._log('INFO', 'M365 packaging started');

    await this.loadData();
    this.ensureOutputDir();

    const package_ = {
      metadata: {
        platform: 'Microsoft 365',
        generated: new Date().toISOString(),
        version: 'v1',
        services: ['Teams', 'SharePoint', 'Copilot', 'Graph API'],
        content_count: this.classifications.length,
      },
      teams_content: this._buildTeamsContent(),
      sharepoint_structure: this._buildSharePointStructure(),
      copilot_training: this._buildCopilotTraining(),
      graph_api_manifest: this._buildGraphManifest(),
    };

    if (!this.dryRun) {
      fs.writeFileSync(
        path.join(this.outputDir, 'm365-knowledge.json'),
        JSON.stringify(package_, null, 2),
        'utf8'
      );
      this._exportReadme('Microsoft 365');
      this._log('INFO', 'M365 package exported');
    }

    console.log(`✅ Microsoft 365 package ready (${this.classifications.length} items)`);
  }

  _buildTeamsContent() {
    return {
      bot_knowledge: this.classifications.filter(c => c.importance >= 4).map(c => ({
        title: c.title,
        category: c.category,
        description: c.title,
        source: c.source_url,
      })),
      adaptive_cards: {
        landing_hero: { title: 'RAE Overview', category: 'landing' },
        research_card: { title: 'Research Programs', category: 'research' },
        services_card: { title: 'Academic Services', category: 'services' },
      },
    };
  }

  _buildSharePointStructure() {
    return {
      library_name: 'RAE Knowledge Base',
      folders: [
        'Research',
        'Services',
        'News & Events',
        'Documents',
        'Organization',
      ],
      content_types: ['Research Project', 'Service Offering', 'News Item', 'Document'],
      retention_policy: '7 years',
    };
  }

  _buildCopilotTraining() {
    return {
      training_data: this.classifications.map(c => ({
        prompt: `Tell me about ${c.title.toLowerCase()}`,
        response: `${c.title} is a key resource in RAE's ${c.category} domain.`,
        source: c.source_url,
        confidence: c.confidence,
      })),
      rag_config: {
        enabled: true,
        index: 'rae-knowledge-v1',
        similarity_threshold: 0.7,
      },
    };
  }

  _buildGraphManifest() {
    return {
      app_name: 'RAE Knowledge App',
      app_id: 'rae-knowledge-m365',
      permissions: [
        'Sites.Read.All',
        'People.Read.All',
        'Calendars.Read.Shared',
      ],
      search_scope: ['RAE Knowledge Library'],
    };
  }

  _exportReadme(platform) {
    let readme = `# RAE Knowledge — ${platform} Package\n\n`;
    readme += `**Generated:** ${new Date().toISOString()}\n`;
    readme += `**Services:** Teams, SharePoint, Copilot, Graph API\n`;
    readme += `**Items:** ${this.classifications.length}\n\n`;
    
    readme += '## Microsoft 365 Integration\n\n';
    readme += '### Teams Bot\n';
    readme += '1. Register bot in Azure AD\n';
    readme += '2. Deploy knowledge JSON to Bot Framework\n';
    readme += '3. Add Teams app manifest\n';
    readme += '4. Deploy to Teams store\n\n';
    
    readme += '### SharePoint\n';
    readme += '1. Create document library\n';
    readme += '2. Configure content types from manifest\n';
    readme += '3. Upload knowledge items\n';
    readme += '4. Enable search indexing\n\n';
    
    readme += '### Copilot Pro / Microsoft 365 Copilot\n';
    readme += '1. Upload knowledge to SharePoint\n';
    readme += '2. Configure RAG with Graph connectors\n';
    readme += '3. Set up training data\n';
    readme += '4. Deploy to enterprise\n\n';

    fs.writeFileSync(path.join(this.outputDir, 'README.md'), readme, 'utf8');
  }
}

// ─── Main Execution ────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  // Create packagers with proper output directories
  const stitchPackager = new StitchPackager('Stitch', CONFIG.outputDirStitch);
  const chatgptPackager = new ChatGPTPackager('ChatGPT', CONFIG.outputDirChatGPT);
  const cursorPackager = new CursorPackager('Cursor', CONFIG.outputDirCursor);
  const m365Packager = new M365Packager('M365', CONFIG.outputDirM365);

  const packagers = [stitchPackager, chatgptPackager, cursorPackager, m365Packager];

  for (const packager of packagers) {
    packager.dryRun = dryRun;
    await packager.run();
  }

  console.log('\n✅ All platform packages complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { StitchPackager, ChatGPTPackager, CursorPackager, M365Packager };
