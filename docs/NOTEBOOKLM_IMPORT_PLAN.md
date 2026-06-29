# NotebookLM Import Plan

**Phase:** K0 — Foundation  
**Date:** 2026-06-29  
**Target Platform:** Google NotebookLM

---

## Purpose

Define how crawled and processed RAE content will be packaged and imported into NotebookLM for AI-assisted research, Q&A, and knowledge synthesis.

---

## NotebookLM Source Constraints (as of 2025–2026)

| Constraint | Value |
|---|---|
| Max sources per notebook | 50 |
| Max source size | ~500 KB text per source |
| Supported formats | PDF, TXT, Markdown (paste), Google Docs, YouTube URL, Web URL |
| Best for | Plain text, structured Markdown, clean PDFs |

---

## Import Strategy

### Notebook 1 — RAE Landing & Overview
**Folder:** `03_NOTEBOOKLM/landing/`

Sources to prepare:
- `landing-overview.md` — Full extracted text from landing page
- `landing-navigation.md` — Menu structure and link targets
- `landing-contact.md` — Contact info, addresses, phone numbers
- `landing-quick-facts.md` — Core identity, mission, tagline

### Notebook 2 — RAE Research Services
**Folder:** `03_NOTEBOOKLM/research/`

Sources to prepare:
- `research-services-overview.md`
- `research-process-steps.md`
- `research-contact-unit.md`
- `research-documents-index.md` (list of available downloads)

### Notebook 3 — News & PR (B.E. 2568–2569 only)
**Folder:** `03_NOTEBOOKLM/news-2568-2569/`

Sources to prepare:
- One `.md` file per significant news article
- `news-summary-index.md` — master list of all included news
- Naming: `news-YYYY-MM-DD-slug.md`

### Notebook 4 — Organization Structure
**Folder:** `03_NOTEBOOKLM/organization/`

Sources to prepare:
- `org-structure.md` — Departments, units, roles
- `org-personnel-public.md` — Publicly listed staff contacts

### Notebook 5 — Services Overview
**Folder:** `03_NOTEBOOKLM/services/`

Sources to prepare:
- `services-overview.md`
- `services-faq.md` (from K2 synthesis)

---

## File Preparation Rules

1. All files must be clean UTF-8 text or Markdown
2. Remove all HTML tags, JavaScript, CSS artifacts
3. Use Thai text as-is — NotebookLM supports Thai
4. Add a metadata header to each file:
   ```
   Source: [URL]
   Crawled: [Date]
   Phase: [K1/K2/K3]
   Lang: th-TH
   ```
5. Max 400 KB per file (split if larger)

---

## Import Workflow

```
K1 Crawl → K2 Clean Markdown → K3 NotebookLM Package → Manual Import
```

**Step-by-step:**
1. Complete K1 crawl and K2 text extraction
2. Run `scripts/build-notebooklm-package.js` (to be created in K2)
3. Review files in `03_NOTEBOOKLM/` manually
4. Import into NotebookLM via:
   - Upload PDF/TXT for files
   - Paste Markdown for short content
   - Direct URL for stable public pages
5. Test notebook with sample questions in Thai and English

---

## Quality Gates Before Import

- [ ] All files pass UTF-8 validation
- [ ] No HTML tags remain in text files
- [ ] All news files confirmed B.E. 2568–2569
- [ ] Source URLs recorded in each file header
- [ ] File sizes all ≤ 400 KB
