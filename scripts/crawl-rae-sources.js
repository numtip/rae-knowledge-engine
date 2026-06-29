/**
 * RAE Knowledge Engine — Crawl Script Scaffold
 * scripts/crawl-rae-sources.js
 *
 * Phase: K1 (scaffold created in K0)
 * Author: RAE Knowledge Engine
 * Date: 2026-06-29
 *
 * PURPOSE:
 *   Fetch target URLs from 01_SOURCE/target-urls.csv, extract content,
 *   and save outputs to 02_CRAWLED/.
 *
 * RULES:
 *   - Only crawls rae.mju.ac.th
 *   - Does not follow external links
 *   - News: only Buddhist year 2568–2569 (CE 2025–2026)
 *   - Does not download large binary files (> 10 MB)
 *   - Polite crawl: ≥ 1500ms delay between requests
 *   - Max crawl depth: 3 from seed URL
 *
 * USAGE:
 *   node scripts/crawl-rae-sources.js [--dry-run] [--category landing|research|news]
 *
 * NOTE: This is a SCAFFOLD. Do not run a broad crawl without manual review.
 *       Run with --dry-run first to validate configuration.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  allowedDomain: 'rae.mju.ac.th',
  maxDepth: 3,
  requestDelayMs: 1500,          // polite crawl delay
  maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB — skip larger files
  userAgent: 'RAE-KnowledgeEngine/1.0 (research; contact: admin@rae.mju.ac.th)',
  retryLimit: 3,
  retryDelayMs: 3000,
  buddhistYearMin: 2568,         // inclusive
  buddhistYearMax: 2569,         // inclusive

  // Paths (relative to project root — resolve at runtime)
  paths: {
    targetUrls:  path.resolve(__dirname, '../01_SOURCE/target-urls.csv'),
    rawHtml:     path.resolve(__dirname, '../02_CRAWLED/raw-html'),
    text:        path.resolve(__dirname, '../02_CRAWLED/text'),
    links:       path.resolve(__dirname, '../02_CRAWLED/links'),
    assets:      path.resolve(__dirname, '../02_CRAWLED/assets'),
    newsArchive: path.resolve(__dirname, '../01_SOURCE/news/archive'),
  },
};

// ─── Argument Parsing ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN   = args.includes('--dry-run');
const CATEGORY  = (() => {
  const idx = args.indexOf('--category');
  return idx !== -1 ? args[idx + 1] : null;
})();

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Sleep for the given number of milliseconds.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse a simple CSV file with a header row.
 * Returns array of objects keyed by header names.
 */
function parseCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

/**
 * Ensure a directory exists (recursive).
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write a file, creating parent directories as needed.
 */
function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Append a JSON record to a .json array file (or create it).
 */
function appendToJsonArray(filePath, record) {
  ensureDir(path.dirname(filePath));
  let arr = [];
  if (fs.existsSync(filePath)) {
    try { arr = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (_) {}
  }
  arr.push(record);
  fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf8');
}

/**
 * Safe URL validation — only allow the configured domain.
 */
function isAllowedUrl(urlString) {
  try {
    const u = new URL(urlString);
    return u.hostname === CONFIG.allowedDomain;
  } catch (_) {
    return false;
  }
}

/**
 * Detect Buddhist year from URL, title, or body text.
 * Returns the detected year (number) or null if not found.
 *
 * TODO (K1): Improve this regex for the actual RAE URL/page patterns.
 */
function detectBuddhistYear(urlString, bodyText) {
  const yearRegex = /256[0-9]/g;

  // 1. Try URL
  const urlMatch = urlString.match(yearRegex);
  if (urlMatch) return parseInt(urlMatch[0], 10);

  // 2. Try first 2000 chars of body
  const bodySlice = (bodyText || '').slice(0, 2000);
  const bodyMatch = bodySlice.match(yearRegex);
  if (bodyMatch) return parseInt(bodyMatch[0], 10);

  return null;
}

/**
 * Check if a Buddhist year falls within the allowed range.
 */
function isAllowedBuddhistYear(year) {
  if (year === null) return null; // unknown — needs manual review
  return year >= CONFIG.buddhistYearMin && year <= CONFIG.buddhistYearMax;
}

// ─── HTTP Fetch ───────────────────────────────────────────────────────────────

/**
 * Fetch a URL with retry logic.
 * Returns { statusCode, headers, body } or throws on failure.
 *
 * TODO (K1): Add response size check from Content-Length header before download.
 */
function fetchUrl(urlString, retryCount = 0) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlString);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        'User-Agent': CONFIG.userAgent,
        'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8',
      },
    };

    const req = https.request(options, res => {
      // Check content-length before buffering
      const contentLength = parseInt(res.headers['content-length'] || '0', 10);
      if (contentLength > CONFIG.maxFileSizeBytes) {
        reject(new Error(`SKIP: File too large (${contentLength} bytes) — ${urlString}`));
        req.destroy();
        return;
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        // Post-download size check
        if (body.length > CONFIG.maxFileSizeBytes) {
          reject(new Error(`SKIP: Downloaded file too large (${body.length} bytes) — ${urlString}`));
          return;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body.toString('utf8'),
        });
      });
    });

    req.on('error', async err => {
      if (retryCount < CONFIG.retryLimit) {
        console.warn(`  ↻ Retry ${retryCount + 1}/${CONFIG.retryLimit}: ${urlString}`);
        await sleep(CONFIG.retryDelayMs * (retryCount + 1));
        try {
          resolve(await fetchUrl(urlString, retryCount + 1));
        } catch (retryErr) {
          reject(retryErr);
        }
      } else {
        reject(err);
      }
    });

    req.end();
  });
}

// ─── HTML Processing ──────────────────────────────────────────────────────────

/**
 * Strip HTML tags and collapse whitespace for plain text extraction.
 *
 * TODO (K1): Replace with a proper HTML parser (e.g. node-html-parser or cheerio)
 *            for better Thai text extraction and structure preservation.
 *            npm install node-html-parser
 */
function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#[0-9]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract all <a href> links from HTML.
 * Returns array of absolute URLs (allowed domain only).
 *
 * TODO (K1): Replace with a proper HTML parser for accuracy.
 */
function extractLinks(html, baseUrl) {
  const linkRegex = /href=["']([^"']+)["']/gi;
  const links = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1].trim();
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;

    try {
      const absolute = new URL(href, baseUrl).toString();
      if (isAllowedUrl(absolute)) {
        links.push(absolute);
      }
    } catch (_) {
      // invalid URL — skip
    }
  }

  return [...new Set(links)]; // deduplicate
}

// ─── Slug Generation ──────────────────────────────────────────────────────────

/**
 * Generate a filesystem-safe slug from a URL.
 */
function urlToSlug(urlString) {
  const u = new URL(urlString);
  return (u.pathname + u.search)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/, '')
    .slice(0, 80);
}

// ─── Core Crawl Logic ─────────────────────────────────────────────────────────

/**
 * Process a single target URL.
 * Fetches, saves raw HTML, extracts text, discovers links.
 */
async function processUrl(targetRow) {
  const { source_type, url, priority } = targetRow;
  const category = source_type;

  console.log(`\n[${category.toUpperCase()}] ${url}`);

  if (!isAllowedUrl(url)) {
    console.error(`  ✗ BLOCKED: URL not in allowed domain — ${url}`);
    return;
  }

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would fetch: ${url}`);
    return;
  }

  let response;
  try {
    response = await fetchUrl(url);
  } catch (err) {
    console.error(`  ✗ FETCH ERROR: ${err.message}`);
    appendToJsonArray(
      path.join(CONFIG.paths.links, 'fetch-errors.json'),
      { url, category, error: err.message, timestamp: new Date().toISOString() }
    );
    return;
  }

  if (response.statusCode !== 200) {
    console.warn(`  ⚠ HTTP ${response.statusCode} — ${url}`);
    return;
  }

  const slug = urlToSlug(url);
  const dateStamp = new Date().toISOString().slice(0, 10);

  // ── Save raw HTML ──────────────────────────────────────────────────────────
  const htmlDir  = path.join(CONFIG.paths.rawHtml, category);
  const htmlFile = path.join(htmlDir, `${slug}-${dateStamp}.html`);
  writeFile(htmlFile, response.body);
  console.log(`  ✓ HTML saved: ${htmlFile}`);

  // ── Extract and save plain text ────────────────────────────────────────────
  const text = htmlToText(response.body);
  const textDir  = path.join(CONFIG.paths.text, category);
  const textFile = path.join(textDir, `${slug}-${dateStamp}.txt`);
  writeFile(textFile, text);
  console.log(`  ✓ Text saved: ${textFile} (${text.length} chars)`);

  // ── News date check ────────────────────────────────────────────────────────
  if (category === 'news') {
    const detectedYear = detectBuddhistYear(url, text);
    const allowed = isAllowedBuddhistYear(detectedYear);

    if (allowed === false) {
      // Pre-2568 — archive it
      console.warn(`  ⚠ NEWS ARCHIVED: Detected B.E. ${detectedYear} — outside 2568–2569 range`);
      const archiveRecord = { url, detected_year: detectedYear, reason: 'pre-2568', date_checked: new Date().toISOString() };
      appendToJsonArray(
        path.join(CONFIG.paths.newsArchive, 'archive-index.json'),
        archiveRecord
      );
      return; // Do not save links or continue with this news item
    } else if (allowed === null) {
      // Unknown date — flag for manual review
      console.warn(`  ⚠ NEWS DATE UNKNOWN: No Buddhist year detected — flagged for manual review`);
      appendToJsonArray(
        path.join(CONFIG.paths.links, 'news-undated.json'),
        { url, timestamp: new Date().toISOString() }
      );
      // TODO (K1 MANUAL REVIEW): Check undated news items manually before processing
    } else {
      console.log(`  ✓ News date confirmed: B.E. ${detectedYear}`);
    }
  }

  // ── Extract and save links ─────────────────────────────────────────────────
  const links = extractLinks(response.body, url);
  const linksFile = path.join(CONFIG.paths.links, `${category}-links.json`);
  const linkRecord = {
    source_url: url,
    crawled_at: new Date().toISOString(),
    link_count: links.length,
    links,
  };
  appendToJsonArray(linksFile, linkRecord);
  console.log(`  ✓ Links saved: ${links.length} links → ${linksFile}`);

  // ── TODO markers for manual review ────────────────────────────────────────
  // TODO (K1 MANUAL REVIEW): Review extracted text for accuracy and completeness
  // TODO (K1 MANUAL REVIEW): Validate all discovered links before deeper crawl
  // TODO (K1 MANUAL REVIEW): Check for pagination — some pages may have multiple pages of content
  // TODO (K1 MANUAL REVIEW): Check if JavaScript rendering is needed for full content
}

// ─── Main Entrypoint ──────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(' RAE Knowledge Engine — Crawler Scaffold');
  console.log(` Phase: K1 | Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  if (CATEGORY) console.log(` Category filter: ${CATEGORY}`);
  console.log('═══════════════════════════════════════════════════════');

  // ── Safety gate ─────────────────────────────────────────────────────────
  // TODO (K1 PRE-FLIGHT): Uncomment and complete before running live crawl:
  //   1. Confirm 01_SOURCE/target-urls.csv URLs are correct
  //   2. Run with --dry-run first
  //   3. Get manual approval for live crawl
  //   4. Remove or comment out this warning after review

  if (!DRY_RUN) {
    console.warn('\n⚠  WARNING: LIVE CRAWL MODE');
    console.warn('   Run with --dry-run first to validate configuration.');
    console.warn('   Proceeding in 3 seconds... (Ctrl+C to cancel)\n');
    await sleep(3000);
  }

  // ── Load target URLs ──────────────────────────────────────────────────────
  if (!fs.existsSync(CONFIG.paths.targetUrls)) {
    console.error(`✗ target-urls.csv not found: ${CONFIG.paths.targetUrls}`);
    process.exit(1);
  }

  const targets = parseCsv(CONFIG.paths.targetUrls);
  console.log(`\nLoaded ${targets.length} target URL(s) from target-urls.csv`);

  // ── Ensure output directories exist ──────────────────────────────────────
  Object.values(CONFIG.paths).forEach(p => {
    if (typeof p === 'string') ensureDir(p);
  });

  // ── Process each target ───────────────────────────────────────────────────
  let processed = 0;
  let skipped   = 0;

  for (const target of targets) {
    // Category filter (CLI arg)
    if (CATEGORY && target.source_type !== CATEGORY) {
      skipped++;
      continue;
    }

    // P3 sources skip by default unless explicitly requested
    // TODO (K1): Uncomment to enforce priority gating:
    // if (target.priority === 'P3' && !args.includes('--include-p3')) {
    //   console.log(`[SKIP P3] ${target.url}`);
    //   skipped++;
    //   continue;
    // }

    await processUrl(target);
    processed++;

    // Polite delay between requests
    if (processed < targets.length - skipped) {
      console.log(`  ⏳ Waiting ${CONFIG.requestDelayMs}ms...`);
      await sleep(CONFIG.requestDelayMs);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(` Crawl complete: ${processed} processed, ${skipped} skipped`);
  console.log(` Mode: ${DRY_RUN ? 'DRY RUN — no files written' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('\nNext steps:');
  console.log('  1. Review 02_CRAWLED/text/ for extraction quality');
  console.log('  2. Review 02_CRAWLED/links/ for discovered URLs');
  console.log('  3. Check 02_CRAWLED/links/news-undated.json for manual review items');
  console.log('  4. Check 01_SOURCE/news/archive/ for archived pre-2568 content');
  console.log('  5. Proceed to K2: clean Markdown extraction');
}

main().catch(err => {
  console.error('\n✗ FATAL ERROR:', err.message);
  process.exit(1);
});
