# RAE Knowledge Engine — Project Constitution

**Version:** 1.0.0  
**Phase:** K0 — Knowledge Foundation  
**Date:** 2026-06-29  
**Status:** ACTIVE

---

## 1. Project Identity

| Field | Value |
|---|---|
| Project Name | RAE Knowledge Engine |
| Organization | RAE — Research Administration and Engagement, MJU |
| Workspace | `G:\ProjectAI\RAE Knowledge Engine` |
| Primary Source | https://rae.mju.ac.th |
| Language | Thai (th-TH), English (en-US) |

---

## 2. Mission

To extract, organize, and prepare legacy RAE website content into structured knowledge packages suitable for:

- **NotebookLM** — grounded AI research assistant
- **Google Stitch** — AI-driven content pipelines
- **ChatGPT / GPT-based agents** — domain Q&A and task automation
- **Cursor Agent** — developer-facing knowledge retrieval
- **Future AI Assistants** — extensible knowledge graph

---

## 3. Governing Principles

1. **No destructive crawling** — Crawls are scoped, staged, and reviewed manually before expansion.
2. **No external domain leakage** — Only `rae.mju.ac.th` is a valid crawl target.
3. **Date policy strictly enforced** — News content: Buddhist year 2568–2569 only. Older = archived.
4. **No Next.js project modification** — This engine is standalone. Never modify production projects.
5. **No deployment** — Export only. No push, no publish without explicit human approval.
6. **No GitHub push** — Local-only during K0–K2 phases.
7. **Token discipline** — All terminal commands MUST use the `rtk` prefix.

---

## 4. Phase Map

| Phase | Name | Goal | Status |
|---|---|---|---|
| K0 | Knowledge Foundation | Folder structure, seed files, crawler scaffold | ✅ ACTIVE |
| K1 | Crawl & Extract | Run safe crawler, extract text/links from target pages | PENDING |
| K2 | Structure & Tag | Parse HTML → clean Markdown, assign taxonomy | PENDING |
| K3 | NotebookLM Package | Assemble NotebookLM-ready source bundles | PENDING |
| K4 | Export & Stitch | Produce Stitch packages, chatbot context, AI exports | PENDING |

---

## 5. Authority

All decisions about scope, inclusion, exclusion, and export format rest with the human operator.  
This constitution may be amended only by the human operator with a dated revision entry.

---

## 6. Revision History

| Date | Version | Change |
|---|---|---|
| 2026-06-29 | 1.0.0 | Initial constitution created — K0 |
