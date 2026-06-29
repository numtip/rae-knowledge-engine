# RAE Knowledge Engine — Scope Lock

**Version:** 1.0.0  
**Phase:** K0  
**Date:** 2026-06-29  
**Status:** LOCKED

---

## ⛔ SCOPE BOUNDARIES — DO NOT CROSS

### Allowed Crawl Domains
```
rae.mju.ac.th
```
**All other domains are EXCLUDED.**

---

### Allowed Target URLs (K0 Priority Tier)

| Priority | URL | Type |
|---|---|---|
| P1 | https://rae.mju.ac.th/wtms_index.aspx?&lang=th-TH | Landing / Main |
| P1 | https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=2064 | Research Page |
| P2 | News pages — Buddhist year 2568–2569 only | News / PR |

---

### News Date Policy
- **INCLUDE:** Buddhist years 2568 and 2569 (CE 2025–2026)
- **EXCLUDE / ARCHIVE:** Any news older than B.E. 2568
- **Archive destination:** `01_SOURCE/news/archive/` (do not mix with active)

---

### File Type Restrictions (K0)
| File Type | Action |
|---|---|
| HTML | ✅ Fetch and save |
| Plain text | ✅ Extract and save |
| PDF (≤ 5 MB) | ✅ Save to `01_SOURCE/documents/` |
| Images | ❌ Skip for now (index URLs only) |
| Large binaries (> 10 MB) | ❌ Skip entirely |
| JavaScript/CSS | ❌ Skip |

---

### Workspace Constraint
- **Root:** `G:\ProjectAI\RAE Knowledge Engine`
- **Never write outside this folder**
- **Never modify:** Any Next.js project, any production file, any shared config

---

### Deploy / Push Lock
| Action | Status |
|---|---|
| `git push` | 🔒 LOCKED |
| `git push --force` | 🔒 LOCKED |
| Deploy to server | 🔒 LOCKED |
| Publish to CDN | 🔒 LOCKED |

---

## Amendment Log
To unlock any boundary, document the reason here with date and operator signature.

| Date | Boundary Changed | Reason | Operator |
|---|---|---|---|
| — | — | — | — |
