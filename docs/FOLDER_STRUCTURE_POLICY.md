# Folder Structure Policy

**Phase:** K0.2B+  
**Status:** Active  
**Purpose:** Maintain categorical organization through entire pipeline

---

## 📁 Canonical Folder Structure

### 02_CRAWLED (Raw & Extracted Content)

**MUST NOT flatten text files.** Preserve categorical structure:

```
02_CRAWLED/
├── raw-html/
│   ├── landing/
│   │   └── *.html              (raw HTML from crawl)
│   ├── research/
│   │   └── *.html
│   ├── services/
│   │   └── *.html
│   ├── news/
│   │   └── *.html
│   ├── organization/
│   │   └── *.html
│   └── faq/
│       └── *.html              (if crawled)
│
├── text/
│   ├── landing/
│   │   └── *.txt               (extracted, cleaned text)
│   ├── research/
│   │   └── *.txt
│   ├── services/
│   │   └── *.txt
│   ├── news/
│   │   └── *.txt
│   ├── organization/
│   │   └── *.txt
│   └── faq/
│       └── *.txt
│
├── assets/                      (K0.2B phase)
│   ├── images/
│   │   ├── hero/
│   │   ├── research/
│   │   ├── laboratory/
│   │   ├── community/
│   │   ├── building/
│   │   └── logo/
│   └── documents/
│
└── links/
    ├── landing-links.json
    ├── research-links.json
    ├── services-links.json
    ├── organization-links.json
    ├── news-links.json
    ├── news-undated.json
    └── links.csv
```

### 04_KNOWLEDGE (Processed & Semantic Data)

```
04_KNOWLEDGE/
├── classification/
│   ├── content-classification.csv       (v1)
│   ├── content-classification.json      (v1)
│   ├── wave1-classification-v2.csv      (v2+)
│   ├── wave1-classification-v2.json     (v2+)
│   └── classify.log
│
├── media/
│   ├── media-inventory.csv              (v1)
│   ├── media-inventory.json             (v1)
│   ├── wave1-media-discovery.csv        (v2+)
│   ├── wave1-media-discovery.json       (v2+)
│   ├── wave1-stitch-image-candidates.json (v2+)
│   └── inventory.log
│
├── taxonomy/
│   ├── taxonomy.json
│   ├── category-map.json
│   ├── navigation-map.json
│   └── build-taxonomy.log
│
├── graph/
│   ├── knowledge-graph.json             (v1)
│   ├── knowledge-relationships.csv      (v1)
│   ├── wave1-knowledge-graph-v2.json    (v2+)
│   ├── wave1-knowledge-relationships-v2.csv (v2+)
│   ├── story-graph.json                 (v2+)
│   ├── story-sequence.md                (v2+)
│   └── build-graph.log
│
├── landing/
│   ├── WAVE1_LANDING_REVIEW.md
│   ├── WAVE1_CORE_KNOWLEDGE.json
│   └── [category-specific summaries]
│
├── research/
├── services/
├── news/
├── organization/
├── faq/
└── README.md
```

### 05_EXPORT (Consumption Ready)

```
05_EXPORT/
├── stitch/
│   ├── STITCH_STORY_BRIEF_WAVE1.md
│   ├── STITCH_CONTENT_STRUCTURE_WAVE1.json
│   ├── STITCH_IMAGE_MANIFEST.json
│   └── STITCH_LINK_MAP.json
│
├── chatbot/
│   └── [chatbot-specific formats]
│
├── nextjs/
│   └── [Next.js navigation/content]
│
└── ai/
    └── [AI training data]
```

---

## 🔄 Processing Pipeline with Folder Preservation

### Phase K0.2 — Crawl & Extract

```javascript
// BAD ❌
const files = fs.readdirSync('./02_CRAWLED/text');  // Only root level

// GOOD ✅
const walkSync = (dir) => {
  const files = [];
  for (const file of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      files.push(...walkSync(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
};
const allFiles = walkSync('./02_CRAWLED/text');  // Recursive, preserves structure
```

### Phase K0.2B — Discover (Media, Classification, etc.)

**Scripts must read recursively:**
- `scripts/classify-content.js` — Read text/ recursively
- `scripts/inventory-media.js` — Read raw-html/ recursively
- `scripts/build-taxonomy.js` — Read classification/ recursively
- `scripts/build-knowledge-graph.js` — Read classification/ recursively
- `scripts/normalize.js` — Read text/ recursively, write to 04_KNOWLEDGE/<category>/

### Phase K0.3 — Normalize

```javascript
// Input: 02_CRAWLED/text/<category>/*.txt
// Output: 04_KNOWLEDGE/<category>/*.json + *.md
// MUST preserve category grouping
```

### Phase K0.4 — Package

```javascript
// Input: 04_KNOWLEDGE/<category>/
// Output: 03_NOTEBOOKLM/Notebook*/
// Use category-based organization for notebook assembly
```

---

## 🏷️ Filename Conventions

### Text Files (02_CRAWLED/text/)

Format: `{source_type}_{wid_or_slug}_{date}.txt`

Examples:
- `landing_index_2026-06-29.txt`
- `research_wid_2064_2026-06-29.txt`
- `services_academic_services_2026-06-29.txt`
- `news_wid_2065_2026-06-29.txt`
- `organization_structure_2026-06-29.txt`

### Knowledge Files (04_KNOWLEDGE/)

Format: `{base_name}[-v2|-v3...][.csv|.json|.md]`

Examples:
- `content-classification.csv` (v1)
- `wave1-classification-v2.csv` (v2)
- `wave1-classification-v3.csv` (v3)
- `knowledge-graph.json` (v1)
- `wave1-knowledge-graph-v2.json` (v2)
- `story-graph.json` (stable versioning)

### Export Files (05_EXPORT/)

Format: `{format}_{destination}_{wave}[_segment].{ext}`

Examples:
- `STITCH_STORY_BRIEF_WAVE1.md`
- `STITCH_CONTENT_STRUCTURE_WAVE1.json`
- `STITCH_IMAGE_MANIFEST.json`

---

## ✅ Compliance Checklist

### When Implementing New Script

- [ ] Read source files recursively (don't assume flat structure)
- [ ] Preserve category folders in output (if applicable)
- [ ] Use versioning for output files (v1, v2, v3...)
- [ ] Follow filename conventions
- [ ] Include category in metadata
- [ ] Log folder structure in report

### When Modifying Existing Script

- [ ] Convert to recursive file reading if currently flat
- [ ] Update output path handling
- [ ] Update documentation
- [ ] Bump version number (v1 → v2, etc.)
- [ ] Test with categorized inputs

---

## 📋 Benefits of Categorical Organization

1. **Scalability:** Easy to add new categories (faq/, partners/, media/, etc.)
2. **Traceability:** Know original source category for every processed item
3. **Parallelization:** Process categories independently in future phases
4. **Quality Control:** Category-specific validation rules
5. **Content Reuse:** Map items to multiple categories without duplication
6. **UI Navigation:** Natural alignment with website navigation structure
7. **Debugging:** Easy to reprocess single category if issues found

---

## 🔗 Cross-References

- [scripts/classify-content.js](../scripts/classify-content.js) — Must read recursively
- [scripts/inventory-media.js](../scripts/inventory-media.js) — Must read recursively
- [scripts/normalize.js](../scripts/normalize.js) — Input recursive, output categorized
- [K0.2A Report](K0_2A_SAFE_CRAWL_WAVE1_REPORT.md) — Initial crawl structure
- [K0.1B Report](K0_1B_FOUNDATION_HARDENING_REPORT.md) — K0.1B pipeline architecture

---

**Status:** Active policy  
**Last Updated:** 2026-06-29  
**Apply To:** K0.2B+ phases
