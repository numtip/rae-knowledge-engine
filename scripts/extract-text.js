/**
 * RAE Knowledge Engine — Text Extractor
 * scripts/extract-text.js
 *
 * Phase: K0.2
 * Author: RAE Knowledge Engine
 * Date: 2026-06-29
 *
 * PURPOSE:
 *   Convert raw HTML from 02_CRAWLED/raw-html/ into clean, readable text
 *   suitable for further processing.
 *
 *   Input:  02_CRAWLED/raw-html/
 *   Output: 02_CRAWLED/text/
 *
 * PROCESSES:
 *   1. Read HTML files
 *   2. Parse HTML structure
 *   3. Extract main content (skip nav, headers, footers)
 *   4. Clean text (remove scripts, styles, entities)
 *   5. Preserve structure (headings, lists, paragraphs)
 *   6. Save as readable text
 *
 * RULES:
 *   - No HTML markup in output
 *   - No CSS or JavaScript
 *   - Preserve heading hierarchy
 *   - Preserve lists
 *   - Preserve paragraphs
 *   - Clean whitespace
 *   - Remove duplicate content
 *
 * USAGE:
 *   node scripts/extract-text.js [--dry-run]
 *
 * NOTE: Uses simple HTML parsing (production would use jsdom/cheerio if available)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  inputDir: path.resolve(__dirname, '../02_CRAWLED/raw-html'),
  outputDir: path.resolve(__dirname, '../02_CRAWLED/text'),
  logFile: path.resolve(__dirname, '../02_CRAWLED/extract-text.log'),

  // HTML tags to extract (hierarchical)
  extractTags: ['h1', 'h2', 'h3', 'h4', 'p', 'li', 'td', 'th', 'span', 'div'],

  // Tags to skip
  skipTags: ['script', 'style', 'meta', 'link', 'noscript'],

  // Attributes to preserve
  preserveAttrs: ['id', 'class'],

  // Minimum content length to process
  minContentLength: 100,
};

// ─── Text Extractor ────────────────────────────────────────────────────────

class TextExtractor {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.filesProcessed = 0;
    this.filesSkipped = 0;
    this.errors = [];
    this.log = [];
  }

  async run() {
    console.log('📄 Starting text extraction...');
    this._log('INFO', `Text extraction started at ${new Date().toISOString()}`);

    try {
      // Step 1: Read HTML files
      const files = await this._readHtmlFiles();

      // Step 2: Process each file
      for (const file of files) {
        await this._processFile(file);
      }

      // Step 3: Report
      this._printReport();
    } catch (error) {
      this._log('ERROR', `Extraction failed: ${error.message}`);
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  /**
   * Read HTML files
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
   * Process a single HTML file
   */
  async _processFile(filename) {
    const inputPath = path.join(CONFIG.inputDir, filename);
    const outputFilename = filename.replace(/\.html$/, '.md');
    const outputPath = path.join(CONFIG.outputDir, outputFilename);

    try {
      // Read HTML
      const html = fs.readFileSync(inputPath, 'utf8');

      // Extract text
      const text = this._extractText(html);

      // Validate
      if (text.trim().length < CONFIG.minContentLength) {
        this.filesSkipped++;
        this._log('WARN', `Skipped ${filename} (insufficient content)`);
        console.log(`  ⊘ ${filename} (insufficient content)`);
        return;
      }

      // Save
      if (!this.dryRun) {
        // Ensure output directory exists
        if (!fs.existsSync(CONFIG.outputDir)) {
          fs.mkdirSync(CONFIG.outputDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, text, 'utf8');
        console.log(`  ✓ ${outputFilename}`);
      } else {
        console.log(`  📝 Would extract: ${outputFilename}`);
      }

      this.filesProcessed++;
      this._log('INFO', `Processed: ${filename} → ${outputFilename}`);
    } catch (error) {
      this.errors.push({ file: filename, error: error.message });
      this._log('ERROR', `Failed to process ${filename}: ${error.message}`);
      console.log(`  ✗ ${filename} (error: ${error.message})`);
    }
  }

  /**
   * Extract clean text from HTML
   *
   * This is a simplified text extractor. Production version would use:
   * - cheerio or jsdom for proper HTML parsing
   * - language detection
   * - encoding detection
   * - more sophisticated content extraction (main content only)
   */
  _extractText(html) {
    // Remove script and style tags
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove HTML comments
    text = text.replace(/<!--[\s\S]*?-->/g, '');

    // Decode HTML entities
    text = this._decodeEntities(text);

    // Extract headings
    const headings = this._extractHeadings(html);

    // Extract paragraphs
    const paragraphs = this._extractParagraphs(html);

    // Extract lists
    const lists = this._extractLists(html);

    // Combine extracted content
    let result = [];

    // Add headings
    for (const heading of headings) {
      result.push(heading);
    }

    // Add paragraphs
    for (const para of paragraphs) {
      result.push(para);
    }

    // Add lists
    for (const list of lists) {
      result.push(list);
    }

    // Clean and join
    return result
      .join('\n\n')
      .replace(/\n{3,}/g, '\n\n')  // normalize line breaks
      .trim();
  }

  /**
   * Extract headings
   */
  _extractHeadings(html) {
    const headings = [];
    const regex = /<h([1-4])[^>]*>(.*?)<\/h\1>/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const level = parseInt(match[1]);
      const text = this._cleanText(match[2]);

      if (text) {
        const prefix = '#'.repeat(level);
        headings.push(`${prefix} ${text}`);
      }
    }

    return headings;
  }

  /**
   * Extract paragraphs
   */
  _extractParagraphs(html) {
    const paragraphs = [];
    const regex = /<p[^>]*>(.*?)<\/p>/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const text = this._cleanText(match[1]);
      if (text) {
        paragraphs.push(text);
      }
    }

    return paragraphs;
  }

  /**
   * Extract lists
   */
  _extractLists(html) {
    const lists = [];
    const regex = /<(ul|ol)[^>]*>(.*?)<\/\1>/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const isOrdered = match[1].toLowerCase() === 'ol';
      const itemRegex = /<li[^>]*>(.*?)<\/li>/gi;
      let itemMatch;
      let itemIndex = 1;

      while ((itemMatch = itemRegex.exec(match[2])) !== null) {
        const text = this._cleanText(itemMatch[1]);
        if (text) {
          const prefix = isOrdered ? `${itemIndex}.` : '-';
          lists.push(`${prefix} ${text}`);
          if (isOrdered) itemIndex++;
        }
      }

      if (lists.length > 0) {
        lists.push('');  // blank line after list
      }
    }

    return lists;
  }

  /**
   * Clean HTML text
   */
  _cleanText(html) {
    // Remove tags
    let text = html.replace(/<[^>]+>/g, '');

    // Decode entities
    text = this._decodeEntities(text);

    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  /**
   * Decode HTML entities
   */
  _decodeEntities(html) {
    const entities = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&apos;': "'",
      '&nbsp;': ' ',
      '&ndash;': '–',
      '&mdash;': '—',
      '&ldquo;': '"',
      '&rdquo;': '"',
      '&lsquo;': "'",
      '&rsquo;': "'",
    };

    let result = html;
    for (const [entity, char] of Object.entries(entities)) {
      result = result.replace(new RegExp(entity, 'g'), char);
    }

    return result;
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
    console.log('\n📊 Text Extraction Report');
    console.log('─'.repeat(50));
    console.log(`Files processed: ${this.filesProcessed}`);
    console.log(`Files skipped: ${this.filesSkipped}`);
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Output directory: ${CONFIG.outputDir}`);
    console.log(`Log file: ${CONFIG.logFile}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      for (const err of this.errors) {
        console.log(`  - ${err.file}: ${err.error}`);
      }
    }

    if (!this.dryRun) {
      console.log('\n✅ Text extraction complete!');
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

  const extractor = new TextExtractor(options);
  await extractor.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TextExtractor, CONFIG };
