# 04_KNOWLEDGE — Knowledge Base

**Phase:** K0 → ongoing  
**Last updated:** 2026-06-29

---

## Structure

```
04_KNOWLEDGE/
  landing/          ← Knowledge from RAE main landing page
  research/         ← Research services knowledge
  services/         ← Other RAE services
  news/             ← News & PR (B.E. 2568–2569 only)
  organization/     ← Org structure, departments, public contacts
  faq/              ← Synthesized FAQ (created in K2+)
  taxonomy/         ← Tag taxonomy, category maps (K2+)
  graph/            ← Knowledge graph edges (K2+)
  RAE_MASTER_KNOWLEDGE_INDEX.json  ← Master index of all records
```

---

## File Naming Convention

| Type | Pattern | Example |
|---|---|---|
| Landing knowledge | `landing-[slug].md` | `landing-overview.md` |
| Research knowledge | `research-[slug].md` | `research-services.md` |
| News article | `news-[BE_year]-[slug].md` | `news-2568-grant-open.md` |
| Organization | `org-[slug].md` | `org-structure.md` |
| FAQ | `faq-[topic].md` | `faq-research-submission.md` |

---

## Status per Category

| Category | Records | Phase Ready |
|---|---|---|
| landing | 0 | K1 |
| research | 0 | K1 |
| services | 0 | K2 |
| news | 0 | K1 (date-filtered) |
| organization | 0 | K2 |
| faq | 0 | K2 |
| taxonomy | — | K2 |
| graph | — | K2 |

---

## Master Index

See `RAE_MASTER_KNOWLEDGE_INDEX.json` for the machine-readable record index.  
Update this index after every crawl and processing run.

---

## Quality Standards

See: `docs/KNOWLEDGE_OUTPUT_SPEC.md`

Every file in this folder must pass:
- UTF-8 encoding
- No HTML artifacts
- Metadata header present
- Source URL recorded
- Date confirmed (for news: B.E. 2568–2569 only)
