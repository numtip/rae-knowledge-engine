# Knowledge Extraction Pipeline

## Overview

The Knowledge Extraction Pipeline transforms WTMS website content into structured, consumable Markdown packages.

```
Input → Crawl → Extract → Parse → Normalize → Index → Package → Export
```

## Pipeline Stages

### Stage 0: Discovery (K0.1B Pre-Processing)

**Phase:** K0.1B Foundation Hardening  
**Process:**
1. **Classify Content** → Assign actions, importance, AI priority
2. **Inventory Media** → Catalog images, PDFs, documents, logos
3. **Build Taxonomy** → Organize into category hierarchy
4. **Build Knowledge Graph** → Map entity relationships

**Tools:**
- `scripts/classify-content.js` — Classification actions (KEEP|REWRITE|MERGE|ARCHIVE|EXCLUDE)
- `scripts/inventory-media.js` — Media asset catalog
- `scripts/build-taxonomy.js` — Category organization
- `scripts/build-knowledge-graph.js` — Entity relationships

**Outputs:**
- `04_KNOWLEDGE/classification/` — Classification decisions
- `04_KNOWLEDGE/media/` — Media inventory
- `04_KNOWLEDGE/taxonomy/` — Category structure
- `04_KNOWLEDGE/graph/` — Knowledge graph

---

### Stage 1: Crawl (02_CRAWLED/raw-html)

**Input:** target-urls.csv from 01_SOURCE/

**Process:**
1. Read target URLs
2. Fetch page via HTTP
3. Save raw HTML
4. Record metadata (timestamp, status, size)
5. Discover internal links

**Output:**
- `02_CRAWLED/raw-html/` — Raw HTML files (named by page ID)
- `02_CRAWLED/links/links.csv` — Discovered links (source, target, depth, category)

**Tool:** `scripts/crawl-rae-sources.js`

**Constraints:**
- Only crawl `rae.mju.ac.th` domain
- Respect robots.txt
- Skip binary files
- Skip external links
- Skip duplicate pages
- Skip news older than B.E. 2568

---

### Stage 2: Extract (02_CRAWLED/text)

**Input:** Raw HTML from Stage 1

**Process:**
1. Parse HTML
2. Extract main content (skip headers, footers, nav)
3. Convert to readable text
4. Preserve structure (headings, lists, paragraphs)
5. Remove JavaScript, CSS, inline styles

**Output:**
- `02_CRAWLED/text/` — Clean text files (one per page)

**Tool:** `scripts/extract-text.js` (creates readable text)

**Quality Checks:**
- No orphaned markup
- Proper heading hierarchy
- Readable paragraphs
- Preserved lists and tables

---

### Stage 3: Parse (02_CRAWLED)

**Input:** Clean text from Stage 2

**Process:**
1. Identify page type (landing, research, news, etc.)
2. Extract metadata (title, date, author)
3. Segment content (intro, body, conclusion)
4. Identify internal references
5. Detect language

**Output:**
- Parsed metadata attached to content

**Tool:** Built into normalizer

---

### Stage 4: Normalize (04_KNOWLEDGE)

**Input:** Parsed content from Stage 3

**Process:**
1. Apply knowledge schema
2. Generate unique IDs
3. Classify content
4. Extract summary
5. Generate tags
6. Link related topics
7. Validate completeness

**Output:**
- `04_KNOWLEDGE/<category>/` — Normalized JSON + Markdown
- `04_KNOWLEDGE/RAE_MASTER_KNOWLEDGE_INDEX.json` — Master index

**Tool:** `scripts/normalize.js`

**Schema Compliance:**
```json
{
  "id": "auto-generated",
  "title": "extracted",
  "category": "classified",
  "subcategory": "detected",
  "source_url": "preserved",
  "source_page": "tracked",
  "language": "detected",
  "summary": "generated",
  "body": "normalized markdown",
  "tags": "extracted",
  "related_topics": "discovered",
  "updated_date": "current",
  "status": "normalized"
}
```

---

### Stage 5: Package (03_NOTEBOOKLM)

**Input:** Normalized knowledge from Stage 4

**Process:**
1. Group by topic/category
2. Create Markdown notebooks
3. Generate table of contents
4. Create README files
5. Organize for NotebookLM consumption

**Output:**
- `03_NOTEBOOKLM/Notebook00-Master/` — Master knowledge package
- `03_NOTEBOOKLM/Notebook01-Landing/` — Landing page package
- `03_NOTEBOOKLM/Notebook02-Research/` — Research package
- `03_NOTEBOOKLM/Notebook03-News-2568/` — News B.E. 2568
- `03_NOTEBOOKLM/Notebook04-News-2569/` — News B.E. 2569
- `03_NOTEBOOKLM/Notebook05-Organization/` — Organization & services

**Tool:** `scripts/export-notebooks.js`

---

### Stage 6: Export (05_EXPORT)

**Input:** Packaged notebooks from Stage 5

**Process:**
1. Convert to multiple formats
2. Generate Stitch-compatible JSON
3. Create AI-assistant prompts
4. Package for external consumption

**Output:**
- `05_EXPORT/ai/` — AI assistant packages
- `05_EXPORT/chatbot/` — Chatbot training data
- `05_EXPORT/stitch/` — Google Stitch format
- `05_EXPORT/nextjs/` — Next.js consumable

**Tool:** `scripts/export-*.js`

---

## Data Flow

```
01_SOURCE/target-urls.csv
        ↓
scripts/crawl-rae-sources.js
        ↓
02_CRAWLED/raw-html/
        ↓
scripts/extract-text.js + scripts/inventory-media.js
        ↓
02_CRAWLED/text/ + 04_KNOWLEDGE/media/
        ↓
scripts/classify-content.js
        ↓
04_KNOWLEDGE/classification/
        ↓
scripts/build-taxonomy.js + scripts/build-knowledge-graph.js
        ↓
04_KNOWLEDGE/taxonomy/ + 04_KNOWLEDGE/graph/
        ↓
scripts/normalize.js
        ↓
04_KNOWLEDGE/<category>/ (normalized)
        ↓
scripts/export-notebooks.js
        ↓
03_NOTEBOOKLM/Notebook*/
        ↓
scripts/export-formats.js
        ↓
05_EXPORT/<format>/
        ↓1B (Discovery – DRY-RUN FIRST)
0. `rtk node scripts/classify-content.js --dry-run`
   - Review classification decisions
1. `rtk node scripts/inventory-media.js --dry-run`
   - Review media catalog
2. `rtk node scripts/build-taxonomy.js --dry-run`
   - Review category organization
3. `rtk node scripts/build-knowledge-graph.js --dry-run`
   - Review entity relationships

Then commit:
- `rtk node scripts/classify-content.js` → 04_KNOWLEDGE/classification/
- `rtk node scripts/inventory-media.js` → 04_KNOWLEDGE/media/
- `rtk node scripts/build-taxonomy.js` → 04_KNOWLEDGE/taxonomy/
- `rtk node scripts/build-knowledge-graph.js` → 04_KNOWLEDGE/graph/

### Phase K0.2 (Crawl)
1. `rtk node scripts/crawl-rae-sources.js`
   - Populates 02_CRAWLED/raw-html/
   - Discovers links → 02_CRAWLED/links/links.csv

### Phase K0.2B (Extract)
2. `rtk node scripts/extract-text.js`
   - Populates 02_CRAWLED/text/

### Phase K0.3 (Normalize)### Phase K0.2 (Crawl)
1. `rtk node scripts/crawl-rae-sources.js`
   - Populates 02_CRAWLED/raw-html/
   - Discovers links → 02_CRAWLED/links/links.csv

### Phase K0.3 (Extract & Normalize)
2. `rtk node scripts/extract-text.js`
   - Populates 02_CRAWLED/text/

3. `rtk node scripts/normalize.js`
   - Populates 04_KNOWLEDGE/<category>/
   - Creates RAE_MASTER_KNOWLEDGE_INDEX.json

### Phase K0.4 (Package)
4. `rtk node scripts/export-notebooks.js`
   - Populates 03_NOTEBOOKLM/Notebook*/

### Phase K0.5 (Export)
5. `rtk node scripts/export-formats.js`
   - Populates 05_EXPORT/<format>/

---

## Error Handling

| Stage | Error | Action |
|-------|-------|--------|
| Crawl | HTTP timeout | Retry 3x, then skip |
| Crawl | 404/403 | Log, skip, continue |
| Extract | Malformed HTML | Fall back to raw text |
| Parse | Unknown page type | Tag as "unclassified" |
| Normalize | Missing required field | Warn, set status to "incomplete" |
| Package | Empty category | Create minimal notebook |
| Export | Format error | Log, skip format |

---

## Performance Notes

- **Crawl:** ~50-100 pages/minute (respect robots.txt)
- **Extract:** ~1000 pages/minute (local processing)
- **Normalize:** ~500 pages/minute (schema validation)
- **Package:** ~100 notebooks/second (grouping)
- **Export:** ~1000 items/second (format conversion)

---

## Idempotency

All stages are **idempotent**:
- Running Stage N twice = same output
- Safe to re-run pipeline
- Completed items are skipped
- Partial runs can be resumed

---

**Last Updated:** 2026-06-29
