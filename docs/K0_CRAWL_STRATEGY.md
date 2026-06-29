# K0 Crawl Strategy

**Phase:** K0 — Knowledge Foundation  
**Date:** 2026-06-29  
**Status:** SCAFFOLD ONLY — No live crawl yet

---

## Overview

This document defines the crawl strategy for the RAE Knowledge Engine.  
All crawls are staged and require manual review before expansion.

---

## Stage 1 — Landing & Research (K1 Target)

### Target 1: Landing Page
```
URL:     https://rae.mju.ac.th/wtms_index.aspx?&lang=th-TH
Output:  02_CRAWLED/raw-html/landing/
Text:    02_CRAWLED/text/landing/
Links:   02_CRAWLED/links/landing-links.json
```

**Extraction goals:**
- Hero section / tagline
- Navigation menu structure
- Department overview text
- Quick-link targets
- Contact information

### Target 2: Research Page
```
URL:     https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=2064
Output:  02_CRAWLED/raw-html/research/
Text:    02_CRAWLED/text/research/
Links:   02_CRAWLED/links/research-links.json
```

**Extraction goals:**
- Research services description
- Process / workflow steps
- Contact details for research unit
- Downloadable document links (for Stage 2)

---

## Stage 2 — News Discovery (K1 Target, date-filtered)

- Discover news listing pages from the landing page links
- Filter: Only Buddhist year 2568–2569 (CE 2025–2026)
- Check date in URL, page title, or meta tags before fetching body
- Archive anything older without downloading full content

---

## Stage 3 — Document Collection (K2)

- PDFs and downloadable docs discovered in Stage 1–2
- Size limit: ≤ 5 MB per file
- Save to: `01_SOURCE/documents/`
- Log all skipped large files to: `02_CRAWLED/links/skipped-large-files.json`

---

## Crawler Technical Constraints

| Rule | Value |
|---|---|
| Allowed domain | `rae.mju.ac.th` only |
| Max crawl depth | 3 levels from seed URL |
| Request delay | ≥ 1500ms between requests (polite crawl) |
| User-Agent | `RAE-KnowledgeEngine/1.0 (research; contact: admin)` |
| JavaScript rendering | No (static fetch only in K1; Playwright optional in K2) |
| Max file size | 10 MB (skip larger) |
| Retry limit | 3 retries with exponential backoff |

---

## Output Structure

```
02_CRAWLED/
  raw-html/
    landing/          ← full HTML snapshots
    research/
    news/
  text/
    landing/          ← extracted plain text
    research/
    news/
  links/
    landing-links.json
    research-links.json
    news-index.json
    skipped-large-files.json
  assets/             ← (future: images, PDFs)
```

---

## Manual Review Checkpoints

- [ ] After Stage 1: Review extracted text for accuracy
- [ ] After Stage 1: Verify all discovered links before Stage 2
- [ ] After Stage 2: Validate date filtering — confirm no pre-2568 content included
- [ ] Before Stage 3: Approve document download list
