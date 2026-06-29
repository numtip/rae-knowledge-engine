# Google Stitch Consumption Plan

**Phase:** K0 — Foundation  
**Date:** 2026-06-29  
**Target Platform:** Google Stitch (AI content pipeline)

---

## Purpose

Define how RAE Knowledge Engine outputs will be structured and consumed by Google Stitch for AI-driven content generation, summarization, and pipeline automation.

---

## What is Google Stitch?

Google Stitch is an AI-powered content pipeline tool that ingests structured knowledge sources and generates contextualized outputs for websites, chatbots, and AI products.

---

## Source Package Structure

All Stitch-ready content is assembled in:
```
05_EXPORT/stitch/
```

See: `05_EXPORT/stitch/STITCH_SOURCE_PACKAGE_SPEC.md`

---

## Content Categories for Stitch

| Category | Source Folder | Stitch Use Case |
|---|---|---|
| Landing / Overview | `04_KNOWLEDGE/landing/` | Website hero copy, about section |
| Research Services | `04_KNOWLEDGE/research/` | Service descriptions, process guides |
| News (2568–2569) | `04_KNOWLEDGE/news/` | News summaries, press releases |
| Organization | `04_KNOWLEDGE/organization/` | Team bios, department descriptions |
| FAQ | `04_KNOWLEDGE/faq/` | Chatbot Q&A, help center |

---

## Stitch Package Format

Each Stitch source package is a folder containing:

```
05_EXPORT/stitch/[category]/
  manifest.json         ← package metadata
  knowledge.jsonl       ← line-delimited JSON records
  chunks/               ← individual content chunks (≤ 512 tokens each)
    chunk-001.md
    chunk-002.md
    ...
  index.md              ← human-readable summary of package
```

### `manifest.json` Schema
```json
{
  "package_id": "rae-stitch-[category]-v1",
  "version": "1.0.0",
  "created": "YYYY-MM-DD",
  "source": "RAE Knowledge Engine",
  "category": "",
  "record_count": 0,
  "chunk_count": 0,
  "lang": "th-TH",
  "encoding": "UTF-8",
  "phase": "K4"
}
```

### `knowledge.jsonl` Record Schema
```json
{"id":"","title":"","category":"","summary":"","content":"","source_url":"","date":"","tags":[],"chunk_ids":[]}
```

---

## Chunking Strategy

| Rule | Value |
|---|---|
| Max chunk size | 512 tokens (~1800 Thai characters) |
| Overlap | 50 tokens between adjacent chunks |
| Split boundary | Paragraph or sentence boundary preferred |
| Chunk naming | `chunk-[NNN].md` (zero-padded 3 digits) |

---

## Stitch Pipeline Workflow

```
K2 Clean Markdown
    ↓
K3 NotebookLM Review (quality gate)
    ↓
K4 Stitch Packaging
    ↓ scripts/build-stitch-package.js (K4 — to be created)
05_EXPORT/stitch/[category]/
    ↓
Manual review of manifest + sample chunks
    ↓
Import to Google Stitch
```

---

## Stitch Consumption Notes

- Thai content is supported by Stitch — do not translate unless explicitly requested
- Metadata fields (`source_url`, `date`, `tags`) improve Stitch retrieval quality
- Keep chunk files small — oversized chunks degrade AI output quality
- All chunks must be self-contained (include enough context to be understood alone)

---

## Next Steps (K4)

- [ ] Create `scripts/build-stitch-package.js`
- [ ] Define chunking algorithm for Thai text
- [ ] Produce pilot package from `04_KNOWLEDGE/landing/`
- [ ] Validate pilot with Stitch import test
