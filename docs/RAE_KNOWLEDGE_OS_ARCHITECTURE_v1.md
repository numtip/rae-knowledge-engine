# RAE Knowledge OS — Architecture v1.0

**Status:** 🧊 FROZEN
**Version:** 1.0.0
**Date:** 2026-06-29
**Phase:** K0.4 — Architecture Freeze
**Authority:** Project Constitution — Section 5

---

## 1. Executive Summary

The RAE Knowledge OS is a modular, pipeline-driven architecture for extracting, organizing, indexing, packaging, and distributing institutional knowledge from the RAE (Research Administration and Engagement) website at Maejo University.

This document freezes the architecture baseline at v1.0, covering the complete lifecycle from raw source ingestion through multi-platform AI-ready delivery. All components, contracts, and interfaces defined herein are immutable until amended via the Architecture Decision Log (Section 19).

### Scope
| Dimension | Boundary |
|---|---|
| Source Domain | `rae.mju.ac.th` only |
| Languages | Thai (th-TH), English (en-US) |
| News Policy | B.E. 2568–2569 only (CE 2025–2026) |
| Deployment | ❌ NOT covered (local-only during K0–K2) |
| GitHub Push | ❌ LOCKED |
| Production Systems | ❌ NEVER modified |

---

## 2. Architecture Principle

### Core Pipeline

```
Raw Knowledge → Canonical → Registry → Graph → Products → Packages → Connectors → Deployment
```

| Stage | Phase | Description | Output Location |
|---|---|---|---|
| **Raw Knowledge** | K0.1–K0.2 | Crawled HTML, extracted text, discovered links | `02_CRAWLED/` |
| **Canonical** | K0.3 | Canonical knowledge records, deduplicated | `04_KNOWLEDGE/registry/` |
| **Registry** | K0.3 | Stable Knowledge IDs (KB-XXXX), metadata index | `04_KNOWLEDGE/registry/` |
| **Graph** | K0.3 | Semantic relationships, dependency links | `04_KNOWLEDGE/graph/` |
| **Products** | K0.3 | Domain-organized knowledge packs (6 types) | `05_EXPORT/ai-products/` |
| **Packages** | K0.3 | Platform-specific output packages | `05_EXPORT/NotebookLM-optimized/` |
| **Connectors** | K1+ | Platform adapters (NotebookLM, ChatGPT, etc.) | `05_EXPORT/` (per platform) |
| **Deployment** | K4+ | Production deployment | OUT OF SCOPE |

### Design Principles
1. **Source of Truth** — The Knowledge Registry is the single source of truth for all records
2. **Immutability** — Once frozen, architecture decisions require an ADR to change
3. **Idempotency** — All pipeline stages are safe to re-run
4. **Preservation** — Never modify legacy content; always create new files
5. **Traceability** — Every record has full source lineage
6. **Platform Agnostic** — Products are platform-independent; connectors handle platform specifics

---

## 3. Standard Folder Architecture

```
G:\ProjectAI\RAE Knowledge Engine/
├── 00_PROJECT/                    # Project constitution, scope lock
│   ├── PROJECT_CONSTITUTION.md
│   └── SCOPE_LOCK.md
├── 01_SOURCE/                     # Target URLs, seed documents, images
│   ├── target-urls.csv
│   ├── documents/
│   ├── images/
│   ├── landing/
│   ├── news/
│   │   └── archive/              # News older than B.E. 2568
│   └── research/
├── 02_CRAWLED/                    # Raw crawl outputs
│   ├── assets/                    # Discovered media assets
│   ├── links/                     # Discovered links (CSV + JSON)
│   ├── raw-html/                  # Raw HTML snapshots
│   │   ├── landing/
│   │   ├── news/
│   │   ├── organization/
│   │   ├── research/
│   │   └── services/
│   └── text/                      # Extracted plain text
├── 03_NOTEBOOKLM/                 # Legacy NotebookLM sources (UNCHANGED)
│   ├── landing/
│   ├── news-2568-2569/
│   ├── organization/
│   ├── research/
│   └── services/
├── 04_KNOWLEDGE/                  # Knowledge base (canonical + structured)
│   ├── classification/            # Content classification decisions
│   ├── faq/                       # Synthesized FAQ (K2+)
│   ├── graph/                     # Knowledge graph + semantic links
│   │   ├── knowledge-graph.json
│   │   ├── knowledge-links.json   # ← K0.3 Semantic Links
│   │   ├── knowledge-relationships.csv
│   │   ├── story-graph.json
│   │   └── story-sequence.md
│   ├── landing/                   # Landing knowledge records
│   ├── media/                     # Media inventory
│   ├── news/                      # News knowledge (B.E. 2568–2569)
│   ├── organization/              # Organization knowledge
│   ├── registry/                  # ← K0.3 Knowledge Registry
│   │   └── knowledge-registry.json
│   ├── research/                  # Research knowledge
│   ├── services/                  # Services knowledge
│   ├── taxonomy/                  # Taxonomy + navigation maps
│   ├── validation/                # Validation reports
│   └── RAE_MASTER_KNOWLEDGE_INDEX.json
├── 05_EXPORT/                     # All export packages
│   ├── MASTER_MANIFEST.json
│   ├── NotebookLM/                # Original K0.2E exports (UNCHANGED)
│   ├── NotebookLM-optimized/      # ← K0.3 Optimized (by reasoning domain)
│   ├── ai-products/               # ← K0.3 AI Knowledge Products
│   ├── ai/                        # Original AI dump (UNCHANGED)
│   ├── chatbot/                   # Original chatbot context (UNCHANGED)
│   ├── ChatGPT/                   # ChatGPT exports (UNCHANGED)
│   ├── Cursor/                    # Cursor exports (UNCHANGED)
│   ├── Google-Stitch/             # Stitch exports (UNCHANGED)
│   ├── Microsoft365/              # M365 exports (UNCHANGED)
│   ├── embedding-prep/            # ← K0.3 Embedding metadata
│   ├── nextjs/                    # Next.js export (UNCHANGED)
│   └── stitch/                    # Stitch export (UNCHANGED)
├── docs/                          # All documentation
│   ├── adr/                       # ← K0.4 Architecture Decision Records
│   ├── KNOWLEDGE_PIPELINE.md
│   ├── KNOWLEDGE_SCHEMA.md
│   ├── KNOWLEDGE_OUTPUT_SPEC.md
│   ├── KNOWLEDGE_GRAPH_POLICY.md
│   ├── CRAWL_POLICY.md
│   ├── ... (other policy docs)
│   └── K0_*.md                    # Phase completion reports
├── scripts/                       # Pipeline scripts
│   ├── build-knowledge-graph.js
│   ├── build-story-graph.js
│   ├── build-taxonomy.js
│   ├── classify-content.js
│   ├── classify-content-v2.js
│   ├── crawl-rae-sources.js
│   ├── discover-links.js
│   ├── export-notebooks.js
│   ├── extract-text.js
│   ├── generate-master-manifest.js
│   ├── inventory-media.js
│   ├── inventory-media-v2.js
│   ├── normalize.js
│   ├── package-notebooks.js
│   ├── package-platforms.js
│   └── validate-knowledge.js
└── PROJECT_README.md
```

---

## 4. Knowledge Object Model

Every knowledge item in the system follows this canonical model:

```json
{
  "kb_id": "KB-XXXX",
  "version": 1,
  "canonical": true|false,
  "title": "string",
  "category": "landing|research|services|news|organization|faq|documents",
  "subcategory": "string",
  "description": "string",
  "source_url": "https://...",
  "source_file": "path/to/source.txt",
  "language": "th|en",
  "importance": 1-5,
  "confidence": 0.0-1.0,
  "status": "draft|reviewed|approved|deprecated",
  "tags": ["tag1", "tag2"],
  "related_ids": ["KB-XXXX", "KB-YYYY"],
  "target_platforms": ["notebooklm", "chatgpt", "cursor", "stitch", "m365", "claude", "gemini"],
  "created": "YYYY-MM-DD",
  "updated": "YYYY-MM-DD",
  "lineage": [
    {"stage": "crawl", "date": "YYYY-MM-DD", "tool": "crawl-rae-sources.js"},
    {"stage": "extract", "date": "YYYY-MM-DD", "tool": "extract-text.js"},
    {"stage": "classify", "date": "YYYY-MM-DD", "tool": "classify-content.js"},
    {"stage": "register", "date": "YYYY-MM-DD", "tool": "knowledge-registry.json"}
  ]
}
```

### Field Definitions

| Field | Type | Required | Description |
|---|---|---|---|
| `kb_id` | string | ✅ | Stable Knowledge ID (KB-XXXX format) |
| `version` | integer | ✅ | Monotonically increasing version number |
| `canonical` | boolean | ✅ | True = canonical record; False = reference record |
| `title` | string | ✅ | Human-readable title (max 200 chars) |
| `category` | enum | ✅ | High-level classification category |
| `subcategory` | string | optional | Granular classification within category |
| `description` | string | ✅ | 1-3 sentence description of the knowledge item |
| `source_url` | string | ✅ | Original source URL (rae.mju.ac.th only) |
| `source_file` | string | ✅ | Relative path to source file in workspace |
| `language` | enum | ✅ | Content language (th or en) |
| `importance` | integer | ✅ | 1 (low) to 5 (critical) |
| `confidence` | float | ✅ | Confidence score 0.0–1.0 |
| `status` | enum | ✅ | Lifecycle status |
| `tags` | array | optional | Semantic tags for discovery |
| `related_ids` | array | optional | Cross-references to other KB IDs |
| `target_platforms` | array | ✅ | Intended target platforms |
| `created` | date | ✅ | Creation date |
| `updated` | date | ✅ | Last update date |
| `lineage` | array | ✅ | Full processing history |

---

## 5. Knowledge Build Pipeline

The pipeline transforms raw source content into platform-ready knowledge packages.

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  CRAWL   │───→│ EXTRACT  │───→│ CLASSIFY │───→│ NORMALIZE│───→│ PACKAGE  │───→│  EXPORT  │
│ Stage 1  │    │ Stage 2  │    │ Stage 3  │    │ Stage 4  │    │ Stage 5  │    │ Stage 6  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼               ▼
  02_CRAWLED/     02_CRAWLED/    04_KNOWLEDGE/   04_KNOWLEDGE/   03_NOTEBOOKLM/   05_EXPORT/
  raw-html/       text/           classification/ registry/                        NotebookLM/
                                                               graph/               ai-products/
                                                                                    embedding-prep/
```

### Stage Details

| Stage | Script | Input | Output | Idempotent |
|---|---|---|---|---|
| 1. Crawl | `crawl-rae-sources.js` | `01_SOURCE/target-urls.csv` | `02_CRAWLED/raw-html/` + `links/` | ✅ Skips existing |
| 2. Extract | `extract-text.js` | `02_CRAWLED/raw-html/` | `02_CRAWLED/text/` | ✅ Skips existing |
| 3. Classify | `classify-content.js` | `02_CRAWLED/text/` | `04_KNOWLEDGE/classification/` | ✅ Re-processes |
| 4. Normalize | `normalize.js` | Classification + text | `04_KNOWLEDGE/registry/` + per-category | ✅ Re-processes |
| 5. Package | `export-notebooks.js` | Knowledge records | `03_NOTEBOOKLM/` + `05_EXPORT/NotebookLM/` | ✅ Re-creates |
| 6. Export | `package-platforms.js` | Knowledge records | `05_EXPORT/` (per platform) | ✅ Re-creates |

### Phase Mapping
| Phase | Pipeline Stages | Status |
|---|---|---|
| K0.1 | Foundation (documents + scripts) | ✅ Complete |
| K0.1B | Discovery (classify, inventory, taxonomy, graph) | ✅ Complete |
| K0.2A–K0.2E | Crawl → Extract → Classify → Normalize → Package | ✅ Complete |
| K0.3 | Registry + Graph + Products + Embedding Prep | ✅ Complete |
| K0.4 | Architecture Freeze | ✅ **CURRENT** |
| K1 | Full Pipeline Execution | PENDING |
| K2 | AI Integration | PENDING |
| K3 | Continuous Pipeline | PENDING |

---

## 6. Knowledge Registry Contract

**File:** `04_KNOWLEDGE/registry/knowledge-registry.json`

### Contract
- The registry is the **single source of truth** for all knowledge records
- Every record has a unique `kb_id` in the format `KB-XXXX` (zero-padded, sequential)
- Records are classified as **canonical** (core, stable) or **reference** (supporting, extensible)
- The registry must always pass validation (Section 13)

### Schema Compliance
```json
{
  "metadata": {
    "registry_version": "string (semver)",
    "phase": "string",
    "generated": "date (ISO 8601)",
    "project": "RAE Knowledge Engine",
    "organization": "string",
    "total_records": "integer",
    "canonical_count": "integer",
    "reference_count": "integer",
    "status": "seed|active|frozen"
  },
  "records": [
    {
      "kb_id": "KB-XXXX",
      "title": "string",
      "category": "enum",
      "subcategory": "string (optional)",
      "type": "canonical|reference",
      "description": "string",
      "source_url": "string (URL)",
      "source_file": "string (relative path)",
      "language": "th|en",
      "importance": "1-5",
      "tags": ["string"],
      "related_ids": ["KB-XXXX"],
      "created": "date (ISO 8601)",
      "status": "canonical|reference"
    }
  ],
  "summary": {
    "total_records": "integer",
    "by_category": {},
    "by_type": {},
    "by_importance": {}
  },
  "validation": {
    "all_ids_unique": true|false,
    "canonical_ids": [],
    "orphan_references": [],
    "duplicate_source_urls": []
  }
}
```

### Current Registry State (v1.0)
- **Total Records:** 44
- **ID Range:** KB-0001 to KB-0044
- **Canonical:** 10
- **Reference:** 34
- **Status:** seed

---

## 7. Semantic Graph Contract

**File:** `04_KNOWLEDGE/graph/knowledge-links.json`

### Contract
- Every link connects two valid KB IDs
- Links are directional unless marked `bidirectional: true`
- Relationship types are drawn from a controlled vocabulary
- Weight values range from 0.0 (weak) to 1.0 (strong)

### Relationship Vocabulary
| Type | Description | Direction |
|---|---|---|
| `part_of` | Component of larger entity | Source → Target |
| `references` | Content reference or citation | Source → Target |
| `related_to` | Peer-level semantic relationship | Bidirectional |
| `supports` | Foundational support relationship | Source → Target |
| `governs` | Governance or authority relationship | Source → Target |
| `drives` | Strategic driving force | Source → Target |
| `produces` | Output or creation relationship | Source → Target |
| `benefits` | Beneficiary relationship | Source → Target |

### Schema Compliance
```json
{
  "metadata": {
    "graph_version": "string (semver)",
    "phase": "string",
    "generated": "date (ISO 8601)",
    "total_links": "integer",
    "link_types": ["string"]
  },
  "links": [
    {
      "link_id": "LINK-XXXX",
      "source_id": "KB-XXXX",
      "source_title": "string",
      "target_id": "KB-XXXX",
      "target_title": "string",
      "relationship": "enum",
      "description": "string",
      "weight": 0.0-1.0,
      "bidirectional": true|false
    }
  ],
  "graph_summary": {}
}
```

### Current Graph State (v1.0)
- **Total Links:** 48
- **Relationship Types:** 6
- **Bidirectional:** 8
- **Hub Node:** KB-0004 (degree 18)

---

## 8. Product Package Contract

**File Location:** `05_EXPORT/ai-products/`

### Contract
- Products are **platform-independent** knowledge packs
- Each product targets a specific audience or use case
- Products may overlap in content (same KB IDs appear in multiple products)
- All KB IDs referenced must exist in the Knowledge Registry

### Product Types
| Type | Audience | Content Scope |
|---|---|---|
| **Executive Pack** | Administrators, decision-makers | Mission, vision, org structure, contacts, highlights |
| **Landing Pack** | Web developers, UX teams | Hero, navigation, history, visual identity |
| **Research Pack** | Researchers, faculty, grant writers | Research services, detail pages, academic services |
| **Governance Pack** | Policy makers, compliance | Org structure, management, personnel, general pages |
| **AI Assistant Pack** | AI systems, chatbots, RAG pipelines | **All** records with domain grouping + system prompts |
| **FAQ Pack** | General public, website visitors | Synthesized Q&A (bilingual: Thai + English) |

### Schema Compliance
```json
{
  "metadata": {
    "pack_id": "string",
    "pack_name": "string",
    "title": "string",
    "generated": "date (ISO 8601)",
    "phase": "string",
    "target_audience": "string",
    "item_count": "integer",
    "knowledge_ids": ["KB-XXXX"]
  },
  "content": {
    "domain_section": [
      {"kb_id": "KB-XXXX", "title": "string", "importance": "1-5"}
    ]
  },
  "usage_notes": {
    "recommended_use": "string",
    "ai_context_size": "compact|medium|large|full",
    "priority_level": "low|medium|high|critical"
  }
}
```

### Current Product State (v1.0)
- **Total Products:** 6
- **Total KB References:** 44 (complete coverage via AI Assistant Pack)
- **FAQ Questions:** 20 (bilingual)

---

## 9. Connector Contract

Connectors are platform-specific adapters that transform generic knowledge products into platform-native formats. The connector layer ensures platform independence of the core knowledge pipeline.

### 9.1 NotebookLM Connector

| Property | Value |
|---|---|
| Format | JSON (Notebook structure) |
| Location | `05_EXPORT/NotebookLM/` + `05_EXPORT/NotebookLM-optimized/` |
| Status | ✅ READY (v1.0) |
| Import Method | Manual upload via NotebookLM web UI |
| Notes | Optimized notebooks organized by reasoning domain |

**Output Files:**
- `Notebook00_Master.json` (original)
- `Notebook01_Landing.json` (original)
- `Notebook-Opt-A_Identity-Mission.json` (optimized)
- `Notebook-Opt-B_Organization-Governance.json` (optimized)
- `Notebook-Opt-C_Research-Services.json` (optimized)
- `Notebook-Opt-D_News-Events.json` (optimized)
- `Notebook-Opt-E_Funding-Documents.json` (optimized)

### 9.2 ChatGPT Connector

| Property | Value |
|---|---|
| Format | JSON (Knowledge base + prompts) |
| Location | `05_EXPORT/ChatGPT/` |
| Status | ✅ READY (v1.0) |
| Import Method | GPT Action / Custom GPT knowledge |

**Output Files:**
- `chatgpt-knowledge.json`

### 9.3 Cursor Connector

| Property | Value |
|---|---|
| Format | JSON (Searchable reference) |
| Location | `05_EXPORT/Cursor/` |
| Status | ✅ READY (v1.0) |
| Import Method | `.cursorrules` or reference file |

**Output Files:**
- `cursor-knowledge.json`
- `cursor-rules.json`

### 9.4 Google Stitch Connector

| Property | Value |
|---|---|
| Format | JSON (Landing structure) |
| Location | `05_EXPORT/Google-Stitch/` |
| Status | ✅ READY (v1.0) |
| Import Method | Stitch pipeline import |

**Output Files:**
- `stitch-package.json`

### 9.5 Microsoft 365 / Copilot Connector

| Property | Value |
|---|---|
| Format | JSON (Teams/SharePoint/Copilot) |
| Location | `05_EXPORT/Microsoft365/` |
| Status | ✅ READY (v1.0) |
| Import Method | SharePoint upload / Copilot grounding |

**Output Files:**
- `m365-knowledge.json`

### 9.6 Future Claude / Gemini Connector

| Property | Value |
|---|---|
| Format | TBD (likely JSON/JSONL) |
| Location | `05_EXPORT/` (future subdirectory) |
| Status | 🔮 PLANNED (K2) |
| Prerequisites | AI Assistant Pack (v1.0) + Embedding Prep |

**Strategy:** AI Assistant Pack (`ai-assistant-pack.json`) is designed as the universal source for future LLM connectors. Embedding preparation files (`semantic-index.json`, `references.json`, `chunks.json`) provide the metadata layer needed for RAG pipeline integration.

---

## 10. Versioning Rules

### Registry Versioning
- **Format:** `major.minor.patch` (semver)
- **Major** — Breaking change to registry schema or ID numbering
- **Minor** — Addition of new records, new categories, new fields
- **Patch** — Metadata updates, corrections, status changes

### Graph Versioning
- **Format:** `major.minor.patch` (semver)
- **Major** — Breaking change to relationship vocabulary or schema
- **Minor** — Addition of new link types or bulk new links
- **Patch** — Individual link corrections

### Product Versioning
- **Format:** `major.minor.patch` (semver)
- **Major** — Structural change to product schema or content model
- **Minor** — Addition of new products or new sections
- **Patch** — Content corrections within existing products

### Document Versioning
- Policy and architecture documents use `major.minor.patch` (semver)
- Phase reports use the phase code (e.g., `K0.3`, `K0.4`)
- All versioned documents have a version header in the frontmatter

---

## 11. Lineage Rules

Every knowledge record must maintain a complete processing history.

### Lineage Entry Format
```json
{
  "stage": "crawl|extract|classify|register|package|export",
  "date": "YYYY-MM-DD",
  "tool": "script-name.js",
  "operator": "human|automated",
  "notes": "optional context"
}
```

### Lineage Requirements
| Stage | Required | Tool | Notes |
|---|---|---|---|
| Crawl | ✅ | `crawl-rae-sources.js` | Must record source URL and crawl date |
| Extract | ✅ | `extract-text.js` | Must record extraction date |
| Classify | ✅ | `classify-content.js` | Must record classification action |
| Register | ✅ | Registry creation | Must record registry version |
| Package | optional | `export-notebooks.js` | Record when regenerated |
| Export | optional | `package-platforms.js` | Record when regenerated |

### Lineage Validation
- Every canonical record must have at minimum: Crawl → Extract → Classify → Register
- Reference records must have: Register
- Timestamps must be in chronological order
- Tools must exist in `scripts/` directory

---

## 12. Confidence Rules

### Confidence Score Definitions
| Score | Label | Meaning |
|---|---|---|
| 1.0 | Certain | Directly extracted verbatim from authoritative source |
| 0.9–0.99 | Very High | Extracted with minor cleanup; source clearly identified |
| 0.8–0.89 | High | Extracted from reliable source; some AI-assisted cleanup |
| 0.7–0.79 | Moderate | Synthesized from multiple reliable sources |
| 0.5–0.69 | Low | AI-generated summary; human review recommended |
| 0.0–0.49 | Unreliable | Requires human verification before use |

### Default Confidence by Record Type
| Record Type | Default Confidence | Notes |
|---|---|---|
| Canonical (direct extract) | 0.95 | Verbatim from source |
| Canonical (synthesized) | 0.85 | Multi-source synthesis |
| Reference (direct) | 0.90 | Direct link reference |
| Reference (discovered) | 0.75 | Discovered via link analysis |
| FAQ (direct) | 0.85 | Direct from source content |
| FAQ (synthesized) | 0.70 | AI-synthesized from multiple records |

### Confidence Override Rules
- Human review can override any confidence score
- Override must be logged in the record's lineage
- Confidence must never exceed 1.0
- Records below 0.5 confidence must be flagged as `status: draft`

---

## 13. Validation Rules

### 13.1 ID Uniqueness
- All KB IDs in the registry must be unique
- All LINK IDs in the graph must be unique
- All CHUNK IDs in embedding prep must be unique

### 13.2 Reference Integrity
- Every `related_ids` reference must point to an existing KB ID
- No circular dependencies (A → B → A)
- Every `link.source_id` and `link.target_id` must exist in the registry

### 13.3 Schema Compliance
- Every record must conform to the Knowledge Object Model (Section 4)
- Required fields must be present and non-null
- Enum fields must use only valid values

### 13.4 Cross-File Consistency
- KB IDs used in products must exist in the registry
- KB IDs used in the graph must exist in the registry
- KB IDs used in embedding prep must exist in the registry

### 13.5 Preservation Rules
- No file in `02_CRAWLED/` may be modified by pipeline scripts (append only)
- No file in `03_NOTEBOOKLM/` may be modified (legacy preservation)
- No file in `05_EXPORT/` may be modified; only new files may be created
- No file in `01_SOURCE/` may be modified by pipeline scripts

### 13.6 Quality Gates
| Gate | Check | Blocker |
|---|---|---|
| **Registry** | IDs unique, references resolve | ❌ Blocks packaging |
| **Graph** | Links reference valid IDs | ❌ Blocks export |
| **Products** | All KB IDs exist in registry | ❌ Blocks release |
| **Lineage** | Required entries present | ⚠️ Warning |
| **Confidence** | Below 0.5 flagged | ⚠️ Warning |

---

## 14. Release Blockers

The following conditions **block** any release (export, package generation, or deployment):

### Critical Blockers
| # | Condition | Affects |
|---|---|---|
| B1 | Registry validation fails (duplicate IDs, orphan references) | All exports |
| B2 | Graph contains references to non-existent KB IDs | Graph-dependent exports |
| B3 | Products reference KB IDs not in registry | Product export |
| B4 | Source URL domain is not `rae.mju.ac.th` | All processing |
| B5 | News content date is outside B.E. 2568–2569 range | News processing |
| B6 | Attempt to write to restricted directories | All operations |
| B7 | `git push` attempted (K0–K2 restriction) | Deployment |

### Warning Blockers (advisory)
| # | Condition | Action |
|---|---|---|
| W1 | Confidence score < 0.5 | Flag for human review |
| W2 | Missing lineage entry | Log warning |
| W3 | Duplicate source URLs in different KB IDs | Flag for merge review |
| W4 | Product has 0 items | Skip product generation |

---

## 15. GitHub Pages Integration

### Status: 🔒 LOCKED (Not Available During K0–K2)

### Planned Integration (K3+)
- Knowledge registry published as static JSON via GitHub Pages
- Knowledge graph rendered as interactive visualization
- Product catalogs available as downloadable bundles
- ADR index published for transparency

### Technical Notes
- Target repository: `rae-knowledge-engine` (separate from production)
- Deployment: `gh-pages` branch
- Domain: Custom domain or `*.github.io`
- Content: Static site generated from `05_EXPORT/` contents
- Automation: GitHub Action trigger on registry update

---

## 16. Microsoft 365 Integration

### Status: ✅ READY (Export Format Complete)

### Current Capabilities
- M365 knowledge pack available at `05_EXPORT/Microsoft365/m365-knowledge.json`
- Format compatible with SharePoint / Teams / Copilot import
- Includes structured knowledge records for grounding

### Planned Enhancements (K2+)
- SharePoint list synchronization
- Teams bot integration using knowledge graph
- Copilot grounding via Microsoft Graph connectors
- OneDrive automatic sync of knowledge packages

### Format Compatibility
| M365 Service | Format | Status |
|---|---|---|
| SharePoint | JSON list import | ✅ Ready |
| Teams | Bot framework context | ⚠️ Requires adapter |
| Copilot | Knowledge grounding | ⚠️ Requires Graph connector |
| OneDrive | File sync | ✅ Ready |

---

## 17. AI Platform Integration

### Current Platform Support
| Platform | Status | Format | Notes |
|---|---|---|---|
| NotebookLM | ✅ Ready | JSON | Manual upload; optimized by domain |
| ChatGPT / GPTs | ✅ Ready | JSON | Custom GPT knowledge + prompts |
| Cursor IDE | ✅ Ready | JSON | `.cursorrules` compatible |
| Google Stitch | ✅ Ready | JSON | Pipeline-ready |
| Microsoft 365 / Copilot | ✅ Ready | JSON | SharePoint/Teams/Copilot |
| Claude (Future) | 🔮 Planned | JSON (AI Assistant Pack) | Universal source ready |
| Gemini (Future) | 🔮 Planned | JSON (AI Assistant Pack) | Universal source ready |
| Custom RAG Pipelines | ✅ Ready | JSON + Embedding Prep | All metadata prepared |

### Platform-Agnostic Foundation
The AI Assistant Pack (`05_EXPORT/ai-products/ai-assistant-pack.json`) serves as the universal source for all AI platform integrations. It contains:
- All 44 knowledge records grouped by domain
- System prompt prefix for consistent AI behavior
- Quick reference map for rapid lookup
- Cross-platform compatibility notes

---

## 18. Future Roadmap

### K1 — Knowledge Runtime
| Item | Description | Target |
|---|---|---|
| Full Pipeline Execution | Run all 6 pipeline stages end-to-end | K1 |
| Crawl Remaining Pages | Crawl all discovered research detail pages | K1.1 |
| Extract All Text | Extract clean text from all crawled HTML | K1.2 |
| Classify All Content | Apply classification to all extracted content | K1.3 |
| Normalize to Registry | Register all classified content | K1.4 |
| Update Knowledge Graph | Rebuild graph with new connections | K1.5 |

### K2 — AI Integration
| Item | Description | Target |
|---|---|---|
| AI Assistant Refinement | Improve AI Assistant Pack with usage analytics | K2.1 |
| FAQ Expansion | Expand FAQ from 20 to 50+ questions | K2.2 |
| Claude/Gemini Connectors | Build platform adapters for Claude and Gemini | K2.3 |
| Vector Embedding Generation | Generate actual embeddings using selected model | K2.4 |
| RAG Pipeline Prototype | Build prototype RAG pipeline | K2.5 |

### K3 — Continuous Knowledge Pipeline
| Item | Description | Target |
|---|---|---|
| Automated Crawl Scheduling | Weekly/daily crawl cycles | K3.1 |
| Change Detection | Detect and process content changes | K3.2 |
| Automated Export | Scheduled export package regeneration | K3.3 |
| GitHub Pages Publication | Static site for knowledge browsing | K3.4 |
| CI/CD Pipeline | GitHub Actions for build/test/package | K3.5 |

### K4 — Production Ready
| Item | Description | Target |
|---|---|---|
| Deployment Authorization | Human review and unlock | K4.1 |
| Production Connectors | All platform connectors production-tested | K4.2 |
| Monitoring & Alerting | Pipeline health monitoring | K4.3 |
| Documentation Complete | All docs reviewed and finalized | K4.4 |

---

## 19. Architecture Decision Log

### ADR-0001: Knowledge OS Architecture Freeze
| Field | Value |
|---|---|
| Date | 2026-06-29 |
| Status | ✅ ACCEPTED |
| Decision | Freeze the Knowledge OS architecture at v1.0 baseline |
| File | `docs/adr/ADR-0001_KNOWLEDGE_OS_ARCHITECTURE_FREEZE.md` |

### ADR Index (Active)
| ADR | Title | Date | Status |
|---|---|---|---|
| ADR-0001 | Knowledge OS Architecture Freeze | 2026-06-29 | ✅ Accepted |

### ADR Creation Rules
1. Every architecture change requires a new ADR
2. ADRs are numbered sequentially (ADR-XXXX)
3. ADRs are never deleted; superseded ADRs are marked as `SUPERSEDED`
4. ADRs are stored in `docs/adr/`
5. ADR format: Context, Decision, Consequences, Alternatives, Status

---

## 20. Freeze Statement

**Effective Date:** 2026-06-29
**Freeze Version:** v1.0.0
**Scope:** All architecture components, contracts, interfaces, and rules defined in this document

### What is Frozen
- ✅ Knowledge Object Model (Section 4)
- ✅ Pipeline Architecture (Section 5)
- ✅ Registry Contract (Section 6)
- ✅ Graph Contract (Section 7)
- ✅ Product Contract (Section 8)
- ✅ Connector Contract (Section 9)
- ✅ Versioning Rules (Section 10)
- ✅ Lineage Rules (Section 11)
- ✅ Confidence Rules (Section 12)
- ✅ Validation Rules (Section 13)
- ✅ Release Blockers (Section 14)
- ✅ Folder Architecture (Section 3)
- ✅ Architecture Principles (Section 2)

### What is NOT Frozen (Active Development)
- ❌ Pipeline scripts (may be updated for K1+)
- ❌ Connector implementations (K1+ development)
- ❌ Deployment configurations (out of scope)
- ❌ GitHub integration (K3+ planned)

### Amendment Process
1. Proposer creates an ADR in `docs/adr/ADR-NNNN_TITLE.md`
2. ADR must document: context, decision, consequences, alternatives
3. Human operator reviews and accepts/rejects
4. If accepted: architecture document is updated, freeze statement amended
5. Version number incremented according to semver

### Consequences of Freeze
1. All existing K0.1–K0.3 deliverables are validated against this architecture
2. All future K1+ phases must conform to these contracts
3. Deviations require an ADR before implementation
4. The freeze may be lifted only by the human operator with a dated amendment

---

*End of Architecture Document v1.0.0 — Frozen 2026-06-29*
