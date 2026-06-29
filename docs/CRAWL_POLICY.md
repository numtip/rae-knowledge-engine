# Crawl Policy

## Overview

This document defines the crawling rules, constraints, and methodology for extracting content from the WTMS website.

## Scope

### In Scope
- **Domain:** rae.mju.ac.th (HTTPS only)
- **Entry Points:**
  - Landing: https://rae.mju.ac.th/wtms_index.aspx?lang=th-TH
  - Research: https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=2064
  - News: See news policy (B.E. 2568–2569 only)
  - Services: Discovered via internal links
  - Organization: Discovered via internal links

- **Content Types:**
  - HTML pages
  - Text content
  - Structured data (where available)

### Out of Scope
- **Excluded Domains:**
  - External URLs (non-rae.mju.ac.th)
  - CDN resources
  - Third-party services

- **Excluded Content:**
  - Binary files (images, PDFs, videos, archives)
  - JavaScript files
  - CSS files
  - Media files (mp3, mp4, etc.)
  - News older than B.E. 2568 (Buddhist Era)
  - Admin pages
  - Login pages

## Crawl Constraints

### Rate Limiting
- **Delay:** 1-2 seconds between requests
- **Concurrent Requests:** 1 (sequential crawl)
- **Max Retries:** 3
- **Timeout:** 30 seconds per request

### robots.txt Compliance
- Read and respect `https://rae.mju.ac.th/robots.txt`
- Follow Disallow rules
- Honor Crawl-Delay directives
- Identify as: `RAE-KnowledgeExtractor/1.0`

### User-Agent
```
User-Agent: RAE-KnowledgeExtractor/1.0 (Knowledge Extraction Pipeline)
```

### Duplicate Prevention
- Track visited URLs in memory
- Skip if already crawled in this session
- Use URL normalization (remove fragments, sort query params)

### Error Handling

| Status | Action |
|--------|--------|
| 200 OK | Save HTML, extract text, discover links |
| 301/302 (Redirect) | Follow redirect (max 3 hops) |
| 304 (Not Modified) | Skip, already cached |
| 400 Bad Request | Log error, skip, continue |
| 403 Forbidden | Log error, skip, continue |
| 404 Not Found | Log error, skip, continue |
| 429 Too Many Requests | Wait 60s, retry 1x |
| 500+ Server Error | Retry 3x with exponential backoff |
| Timeout | Retry 3x, then skip |

### Content Validation
- Minimum content size: 100 bytes
- Must contain actual text (not empty/redirect)
- Reject if HTML is malformed beyond recovery
- Validate UTF-8 encoding

---

## Crawl Strategy

### Phase 1: Entry Point Crawl
1. Start with landing page
2. Extract main content + internal links
3. Discover research, services, organization pages
4. Queue discovered URLs

### Phase 2: Breadth-First Discovery
1. Crawl queued URLs level-by-level
2. Depth limit: 3 levels from entry point
3. Maintain visited set
4. Build link graph

### Phase 3: Category-Specific Crawl
1. Focus crawl on priority categories:
   - **P1:** Landing + Research (required)
   - **P2:** News (B.E. 2568–2569 only)
   - **P3:** Services + Organization
   - **P4:** FAQ + Other

### Phase 4: Link Validation
1. Post-crawl: validate all discovered links
2. Mark as internal/external
3. Categorize by target category
4. Export links.csv

---

## Output Structure

### Raw HTML Files
```
02_CRAWLED/raw-html/
├── wtms_index_landing.html
├── wtms_webpageDetail_wID_2064.html
├── wtms_webpageDetail_wID_2022.html
└── ... (one file per URL)
```

**Filename Format:** `<page_identifier>.html`
- Sanitized URL component
- Based on page ID or slug
- Lowercase, hyphens for spaces

**Metadata:** Stored in JSON alongside HTML
```json
{
  "url": "https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=2064",
  "status": 200,
  "size_bytes": 12450,
  "encoding": "utf-8",
  "crawled_at": "2026-06-29T10:15:30Z",
  "title": "Research Page Title",
  "discovered_links": ["url1", "url2", ...]
}
```

### Links File
```
02_CRAWLED/links/links.csv
```

**Format:**
```csv
source_url,target_url,link_text,link_type,category,visited
https://rae.mju.ac.th/wtms_index.aspx?lang=th-TH,https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=2064,Research,internal,research,true
...
```

**Columns:**
- `source_url` — Page containing the link
- `target_url` — URL being linked to
- `link_text` — Anchor text
- `link_type` — internal | external | other
- `category` — landing | research | news | services | organization | unknown
- `visited` — true | false (whether target was crawled)

---

## News Policy

### Buddhist Era Filtering
- **Include:** B.E. 2568 (A.D. 2025), B.E. 2569 (A.D. 2026)
- **Exclude:** B.E. 2567 and earlier

### News Page IDs (Priority)

**B.E. 2569 (2026):**
- wID=2022
- wID=2387
- wID=1960
- wID=1908
- wID=1941
- wID=2042
- wID=2043
- wID=2463

**B.E. 2568 (2025):**
- wID=2012
- wID=2013
- wID=954

### Crawl Strategy for News
1. Start with known page IDs above
2. Extract date metadata
3. Skip if year < 2568
4. Discover related news pages
5. Stop at depth 2 for news discovery

---

## Crawl Logging

Log file: `02_CRAWLED/crawl.log`

**Log Format:**
```
[2026-06-29T10:15:30Z] INFO  Starting crawl...
[2026-06-29T10:15:31Z] INFO  Crawled: https://rae.mju.ac.th/wtms_index.aspx (200 OK, 12.4 KB)
[2026-06-29T10:15:33Z] INFO  Discovered 15 internal links
[2026-06-29T10:15:34Z] WARN  Skipped: https://example.com/external (external domain)
[2026-06-29T10:15:35Z] ERROR Failed: https://rae.mju.ac.th/old-page (404 Not Found)
[2026-06-29T10:20:00Z] INFO  Crawl complete: 42 pages, 0 errors
```

---

## Resumability

The crawl can be resumed if interrupted:

1. **Progress File:** `02_CRAWLED/.crawl-state.json`
   ```json
   {
     "started_at": "2026-06-29T10:00:00Z",
     "last_crawled_at": "2026-06-29T10:15:35Z",
     "crawled_urls": ["url1", "url2", ...],
     "queue": ["url3", "url4", ...],
     "errors": {"url": "error message", ...}
   }
   ```

2. **Resume Command:**
   ```bash
   rtk node scripts/crawl-rae-sources.js --resume
   ```

3. **Behavior:**
   - Skip already-crawled URLs
   - Resume from queue
   - Append to crawl.log

---

## Performance Targets

- **Crawl Speed:** ~50 pages/minute (respecting rate limits)
- **Total Crawl Time:** ~30 minutes for 1500+ pages
- **Disk Usage:** ~2-5 MB (HTML only, no images)
- **Memory Usage:** <100 MB (URL tracking + queue)

---

## Quality Assurance

### Pre-Crawl
- [ ] Verify target URLs are valid
- [ ] Test robots.txt parsing
- [ ] Verify User-Agent format
- [ ] Check directory permissions (02_CRAWLED/)

### During Crawl
- [ ] Monitor error rate (should be <5%)
- [ ] Verify HTML size distribution
- [ ] Check for redirect loops
- [ ] Monitor memory usage

### Post-Crawl
- [ ] Verify all files saved
- [ ] Validate links.csv format
- [ ] Spot-check HTML content
- [ ] Verify crawl.log completeness
- [ ] Generate crawl report

---

**Last Updated:** 2026-06-29
