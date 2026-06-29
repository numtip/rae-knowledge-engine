# Stitch Source Package Specification

**Phase:** K0 — Foundation  
**Date:** 2026-06-29  
**Folder:** `05_EXPORT/stitch/`

---

## Purpose

This document specifies the structure, format, and content requirements for all Stitch source packages produced by the RAE Knowledge Engine.

---

## Package Directory Layout

```
05_EXPORT/stitch/
  landing/
    manifest.json
    knowledge.jsonl
    index.md
    chunks/
  research/
    manifest.json
    knowledge.jsonl
    index.md
    chunks/
  news-2568-2569/
    manifest.json
    knowledge.jsonl
    index.md
    chunks/
  services/
    manifest.json
    knowledge.jsonl
    index.md
    chunks/
  organization/
    manifest.json
    knowledge.jsonl
    index.md
    chunks/
```

---

## Package Build Prerequisites

Before building any Stitch package, the following must be complete:

| Prerequisite | Check |
|---|---|
| K2 clean Markdown exists in `04_KNOWLEDGE/[category]/` | [ ] |
| All records have passed quality gate (see `KNOWLEDGE_OUTPUT_SPEC.md`) | [ ] |
| News records confirmed B.E. 2568–2569 | [ ] |
| `RAE_MASTER_KNOWLEDGE_INDEX.json` is up to date | [ ] |

---

## `manifest.json` Full Schema

```json
{
  "package_id": "rae-stitch-[category]-v[N]",
  "version": "1.0.0",
  "created": "YYYY-MM-DD",
  "source_project": "RAE Knowledge Engine",
  "organization": "RAE — Research Administration and Engagement, MJU",
  "category": "landing|research|news|services|organization",
  "lang": "th-TH",
  "encoding": "UTF-8",
  "record_count": 0,
  "chunk_count": 0,
  "total_tokens_estimate": 0,
  "phase": "K4",
  "quality_gate_passed": false,
  "notes": ""
}
```

---

## `knowledge.jsonl` Record Schema

Each line is a valid JSON object:

```json
{
  "id": "rae-[category]-[slug]",
  "title": "",
  "category": "",
  "subcategory": "",
  "summary": "",
  "content": "",
  "source_url": "",
  "crawled_date": "YYYY-MM-DD",
  "processed_date": "YYYY-MM-DD",
  "lang": "th-TH",
  "tags": [],
  "chunk_ids": [],
  "status": "approved"
}
```

---

## Chunk Specification

| Property | Value |
|---|---|
| Max size | 512 tokens (~1800 Thai characters) |
| Overlap | 50 tokens |
| Split on | Paragraph break (`\n\n`) or sentence boundary |
| File format | `.md` with metadata header |
| Naming | `chunk-001.md`, `chunk-002.md`, … |

### Chunk file header
```markdown
---
chunk_id: [package_id]-chunk-[NNN]
parent_id: [record id]
source_url: [url]
category: [category]
---
[content]
```

---

## Build Script (K4 — to be created)

```
scripts/build-stitch-package.js
  --category [name]
  --input 04_KNOWLEDGE/[category]/
  --output 05_EXPORT/stitch/[category]/
  --validate
```

---

## Versioning

- Package version increments on every rebuild: `v1`, `v2`, …
- Keep previous versions in `05_EXPORT/stitch/[category]/archive/`
- Never overwrite an approved package without creating a backup first
