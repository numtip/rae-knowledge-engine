# News Policy — Buddhist Year 2568–2569

**Phase:** K0  
**Date:** 2026-06-29  
**Status:** ENFORCED

---

## Policy Statement

Only news and PR content published during **Buddhist Era years 2568 and 2569** (CE 2025–2026) shall be included in the active knowledge base of the RAE Knowledge Engine.

---

## Year Reference

| Buddhist Year | Gregorian Year | Approximate Date Range |
|---|---|---|
| B.E. 2568 | CE 2025 | 1 Jan 2025 – 31 Dec 2025 |
| B.E. 2569 | CE 2026 | 1 Jan 2026 – 31 Dec 2026 |

---

## Inclusion Rules

| Rule | Detail |
|---|---|
| ✅ Include | News dated B.E. 2568 (CE 2025) or B.E. 2569 (CE 2026) |
| ✅ Include | News where date appears in URL, title, or page meta |
| ❌ Exclude | Any news older than B.E. 2568 |
| ❌ Exclude | News with no detectable date (flag for manual review) |
| ⚠️ Archive | Pre-2568 content → `01_SOURCE/news/archive/` |

---

## Date Detection Strategy

The crawler must detect news dates using these methods (in order):

1. **URL pattern** — Look for year patterns: `/2568/`, `/2569/`, `?year=2568`
2. **Page `<title>`** — Scan for year string `256[89]`
3. **Meta tags** — `<meta name="date">`, `<meta property="article:published_time">`
4. **Visible date text** — Regex scan for `256[89]` or `2025|2026` in first 2000 chars of body
5. **Fallback** — If no date found: save to `02_CRAWLED/links/news-undated.json` for manual review

---

## Archive Handling

- Archived news is **not deleted** — it is moved to `01_SOURCE/news/archive/`
- Archive index: `01_SOURCE/news/archive/archive-index.csv`
- Archive format: `[url, detected_year, reason_excluded, date_checked]`
- Archive content is **never** included in NotebookLM or export packages

---

## NotebookLM Placement

Active news (2568–2569) → `03_NOTEBOOKLM/news-2568-2569/`  
Archive news → NOT imported to any NotebookLM notebook

---

## Compliance Checkpoint

Before any news file enters `04_KNOWLEDGE/news/`, the following must be confirmed:

- [ ] Date is confirmed B.E. 2568 or 2569
- [ ] Source URL is recorded
- [ ] Content is from `rae.mju.ac.th` only
- [ ] No PII (personal data) included beyond publicly listed contacts
- [ ] File is clean Markdown (no HTML artifacts)
