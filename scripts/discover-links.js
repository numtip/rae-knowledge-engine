/**
 * RAE Knowledge Engine — Link Discovery
 * scripts/discover-links.js
 *
 * Phase: K0.2 (post-crawl)
 * Author: RAE Knowledge Engine
 * Date: 2026-06-29
 *
 * PURPOSE:
 *   Extract and analyze links from crawled HTML files.
 *
 *   Input:  02_CRAWLED/raw-html/
 *   Output: 02_CRAWLED/links/links.csv
 *
 * PROCESSES:
 *   1. Read all HTML files from 02_CRAWLED/raw-html/
 *   2. Extract all <a> tags and their attributes
 *   3. Classify links (internal/external)
 *   4. Categorize by target content
 *   5. Mark as visited/unvisited
 *   6. Export to CSV
 *
 * CSV FORMAT:
 *   source_url, target_url, link_text, link_type, category, visited
 *
 * USAGE:
 *   node scripts/discover-links.js [--dry-run]
 *
 * NOTE: This script runs after crawl completes (K0.2 phase).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  inputDir: path.resolve(__dirname, '../02_CRAWLED/raw-html'),
  outputFile: path.resolve(__dirname, '../02_CRAWLED/links/links.csv'),
  logFile: path.resolve(__dirname, '../02_CRAWLED/discover-links.log'),
  allowedDomain: 'rae.mju.ac.th',
};

// ─── Link Categories ────────────────────────────────────────────────────────

const CATEGORY_PATTERNS = {
  landing: [
    /wtms_index\.aspx/i,
    /default\.aspx/i,
    /home\.aspx/i,
  ],
  research: [
    /wtms_webpageDetail\.aspx\?wID=206\d/i,  // wID=206x pattern
    /research/i,
  ],
  news: [
    /wtms_webpageDetail\.aspx\?wID=20[0-9][0-9]/i,  // wID=20xx pattern
    /news/i,
    /announcement/i,
  ],
  services: [
    /services/i,
    /academic/i,
    /support/i,
  ],
  organization: [
    /organization/i,
    /department/i,
    /staff/i,
    /contact/i,
  ],
  faq: [
    /faq/i,
    /frequently/i,
    /question/i,
  ],
};

// ─── Link Discoverer ────────────────────────────────────────────────────────

class LinkDiscoverer {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.links = [];
    this.visitedUrls = new Set();
    this.errors = [];
    this.log = [];
  }

  async run() {
    console.log('🔗 Starting link discovery...');
    this._log('INFO', `Link discovery started at ${new Date().toISOString()}`);

    try {
      // Step 1: Read HTML files
      await this._readHtmlFiles();

      // Step 2: Extract links
      await this._extractLinks();

      // Step 3: Classify links
      await this._classifyLinks();

      // Step 4: Deduplicate
      await this._deduplicate();

      // Step 5: Export
      if (!this.dryRun) {
        await this._exportCsv();
      }

      // Step 6: Report
      this._printReport();
    } catch (error) {
      this._log('ERROR', `Link discovery failed: ${error.message}`);
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  /**
   * Read all HTML files
   */
  async _readHtmlFiles() {
    this._log('INFO', 'Reading HTML files...');

    if (!fs.existsSync(CONFIG.inputDir)) {
      throw new Error(`Input directory not found: ${CONFIG.inputDir}`);
    }

    const files = fs.readdirSync(CONFIG.inputDir)
      .filter(f => f.endsWith('.html'));

    console.log(`📄 Found ${files.length} HTML files`);
    this._log('INFO', `Found ${files.length} HTML files`);

    return files;
  }

  /**
   * Extract links from HTML files
   */
  async _extractLinks() {
    this._log('INFO', 'Extracting links...');

    const files = fs.readdirSync(CONFIG.inputDir)
      .filter(f => f.endsWith('.html'));

    let linksFound = 0;

    for (const file of files) {
      const filePath = path.join(CONFIG.inputDir, file);
      try {
        const html = fs.readFileSync(filePath, 'utf8');
        const sourceUrl = this._urlFromFilename(file);

        // Simple regex to find <a> tags (note: this is basic; production would use HTML parser)
        const linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
        let match;

        while ((match = linkRegex.exec(html)) !== null) {
          const href = match[1];
          const text = match[2].trim();

          // Skip empty or whitespace-only links
          if (!href || href.length === 0) continue;

          this.links.push({
            source_url: sourceUrl,
            target_url: this._normalizeUrl(href, sourceUrl),
            link_text: text.substring(0, 100),  // truncate long text
            link_type: 'unknown',  // will be determined in classification
            category: 'unknown',
            visited: false,
          });

          linksFound++;
        }
      } catch (error) {
        this._log('ERROR', `Failed to extract links from ${file}: ${error.message}`);
      }
    }

    console.log(`🔗 Found ${linksFound} links`);
    this._log('INFO', `Extracted ${linksFound} links`);
  }

  /**
   * Normalize URL relative to source
   */
  _normalizeUrl(href, sourceUrl) {
    try {
      // Handle relative URLs
      if (href.startsWith('/')) {
        // Absolute path
        return `https://${CONFIG.allowedDomain}${href}`;
      } else if (href.startsWith('http://') || href.startsWith('https://')) {
        // Already absolute
        return href;
      } else if (href.startsWith('..') || href.startsWith('.')) {
        // Relative to source
        const baseUrl = new URL(sourceUrl);
        return new URL(href, baseUrl).toString();
      } else {
        // Assume same directory as source
        const baseUrl = new URL(sourceUrl);
        return new URL(href, baseUrl).toString();
      }
    } catch (error) {
      this._log('WARN', `Failed to normalize URL: ${href}`);
      return null;
    }
  }

  /**
   * Reconstruct URL from filename
   */
  _urlFromFilename(filename) {
    // Example: wtms_webpageDetail_wID_2064.html → https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=2064
    const match = filename.match(/wtms_webpageDetail_wID_(\d+)/);
    if (match) {
      return `https://${CONFIG.allowedDomain}/wtms_webpageDetail.aspx?wID=${match[1]}`;
    }

    if (filename.includes('landing')) {
      return `https://${CONFIG.allowedDomain}/wtms_index.aspx?lang=th-TH`;
    }

    // Generic: construct from filename
    return `https://${CONFIG.allowedDomain}/${filename.replace(/.html$/, '.aspx')}`;
  }

  /**
   * Classify links
   */
  async _classifyLinks() {
    this._log('INFO', 'Classifying links...');

    for (const link of this.links) {
      if (!link.target_url) {
        link.link_type = 'invalid';
        continue;
      }

      const url = new URL(link.target_url);

      // Determine link type
      if (url.hostname.includes(CONFIG.allowedDomain)) {
        link.link_type = 'internal';
      } else {
        link.link_type = 'external';
      }

      // Categorize
      link.category = this._categorizeUrl(link.target_url);

      // Mark visited (if in crawled files)
      link.visited = this._isVisited(link.target_url);
    }
  }

  /**
   * Categorize URL based on patterns
   */
  _categorizeUrl(url) {
    for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(url)) {
          return category;
        }
      }
    }
    return 'unknown';
  }

  /**
   * Check if URL was already crawled
   */
  _isVisited(url) {
    // Simple check: see if corresponding HTML file exists
    const wIdMatch = url.match(/wID=(\d+)/);
    if (wIdMatch) {
      const expectedFile = path.join(CONFIG.inputDir, `wtms_webpageDetail_wID_${wIdMatch[1]}.html`);
      return fs.existsSync(expectedFile);
    }
    return false;
  }

  /**
   * Deduplicate links
   */
  async _deduplicate() {
    this._log('INFO', 'Deduplicating links...');

    const seen = new Set();
    const unique = [];

    for (const link of this.links) {
      const key = `${link.source_url}|${link.target_url}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(link);
      }
    }

    const removed = this.links.length - unique.length;
    this.links = unique;

    console.log(`✓ Deduplicated (removed ${removed} duplicates)`);
    this._log('INFO', `Deduplicated links (removed ${removed} duplicates)`);
  }

  /**
   * Export to CSV
   */
  async _exportCsv() {
    this._log('INFO', 'Exporting CSV...');

    // Ensure output directory exists
    const outputDir = path.dirname(CONFIG.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create CSV header
    const headers = ['source_url', 'target_url', 'link_text', 'link_type', 'category', 'visited'];
    const rows = [headers.join(',')];

    // Add data rows
    for (const link of this.links) {
      const row = [
        this._escapeCsv(link.source_url),
        this._escapeCsv(link.target_url),
        this._escapeCsv(link.link_text),
        link.link_type,
        link.category,
        link.visited ? 'true' : 'false',
      ];
      rows.push(row.join(','));
    }

    // Write to file
    fs.writeFileSync(CONFIG.outputFile, rows.join('\n'), 'utf8');

    console.log(`📊 Exported ${this.links.length} links to ${CONFIG.outputFile}`);
    this._log('INFO', `Exported ${this.links.length} links`);
  }

  /**
   * Escape CSV values
   */
  _escapeCsv(value) {
    if (!value) return '""';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
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
    const internal = this.links.filter(l => l.link_type === 'internal').length;
    const external = this.links.filter(l => l.link_type === 'external').length;
    const visited = this.links.filter(l => l.visited).length;

    console.log('\n📊 Link Discovery Report');
    console.log('─'.repeat(50));
    console.log(`Total links: ${this.links.length}`);
    console.log(`  - Internal: ${internal}`);
    console.log(`  - External: ${external}`);
    console.log(`  - Visited: ${visited}`);
    console.log(`Output: ${CONFIG.outputFile}`);
    console.log(`Log: ${CONFIG.logFile}`);

    if (!this.dryRun) {
      console.log('\n✅ Link discovery complete!');
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

  const discoverer = new LinkDiscoverer(options);
  await discoverer.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { LinkDiscoverer, CONFIG, CATEGORY_PATTERNS };
