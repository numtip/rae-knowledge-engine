# Knowledge Output Specification

**Phase:** K0 — Foundation  
**Date:** 2026-06-29  
**Applies to:** All phases K1–K4

---

## Purpose

Define the canonical format, structure, and quality standards for all knowledge outputs produced by the RAE Knowledge Engine.

---

## Output Tiers

| Tier | Format | Destination | Phase |
|---|---|---|---|
| Raw HTML snapshot | `.html` | `02_CRAWLED/raw-html/` | K1 |
| Extracted plain text | `.txt` | `02_CRAWLED/text/` | K1 |
| Clean Markdown | `.md` | `04_KNOWLEDGE/` | K2 |
| NotebookLM package | `.md` / `.txt` | `03_NOTEBOOKLM/` | K3 |
| Stitch package | JSON + Markdown | `05_EXPORT/stitch/` | K4 |
| Chatbot context | JSON | `05_EXPORT/chatbot/` | K4 |
| AI knowledge dump | JSONL | `05_EXPORT/ai/` | K4 |

---

## Clean Markdown Standard (K2+)

Every knowledge Markdown file must follow this structure:

```markdown
---
source_url: https://rae.mju.ac.th/...
crawled_date: YYYY-MM-DD
processed_date: YYYY-MM-DD
phase: K2
lang: th-TH
category: landing|research|news|services|organization
tags: []
---

# [Title]

## Summary
[2–4 sentence summary in Thai or English]

## Full Content
[Cleaned, structured content]

## Key Facts
- Fact 1
- Fact 2

## Source Links
- [text](url)
```

---

## JSON Knowledge Record Standard

Used in `04_KNOWLEDGE/` and export packages:

```json
{
  "id": "rae-[category]-[slug]",
  "title": "",
  "category": "landing|research|news|services|organization|faq",
  "subcategory": "",
  "source_url": "",
  "crawled_date": "YYYY-MM-DD",
  "processed_date": "YYYY-MM-DD",
  "lang": "th-TH",
  "summary": "",
  "content": "",
  "key_facts": [],
  "tags": [],
  "related_ids": [],
  "phase": "K1|K2|K3|K4",
  "status": "draft|reviewed|approved"
}
```

---

## Taxonomy Categories

```
landing        → Main website, overview, identity
research       → Research services, process, support
services       → Other services provided by RAE
news           → News and PR (2568–2569 only)
organization   → Structure, personnel (public info only)
faq            → Synthesized Q&A from all content
```

---

## Quality Standards

| Criterion | Requirement |
|---|---|
| Encoding | UTF-8, no BOM |
| Thai text | Preserved as-is, no romanization |
| HTML artifacts | Zero tolerance — strip all tags |
| Links | All internal links must be absolute URLs |
| Dates | ISO 8601 (YYYY-MM-DD) for metadata, Buddhist year preserved in content |
| File size | ≤ 400 KB per file (split if larger) |
| Null values | Use `null` not empty string in JSON |

---

## Naming Conventions

| Type | Pattern |
|---|---|
| HTML snapshot | `[category]-[slug]-[date].html` |
| Text extract | `[category]-[slug]-[date].txt` |
| Knowledge Markdown | `[category]-[slug].md` |
| News file | `news-[BE-year]-[month]-[slug].md` |
| JSON record | `[category]-[slug].json` |
