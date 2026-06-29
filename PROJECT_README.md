# RAE Knowledge Engine — Phase K0

## Mission

Transform the legacy WTMS website into structured Markdown knowledge packages for NotebookLM.

```
WTMS (rae.mju.ac.th)
  ↓
Knowledge Extractor
  ↓
Markdown Knowledge Packages
  ↓
NotebookLM → Google Stitch / ChatGPT / Cursor / AI Assistants
```

## Key Rules

- ✅ Only extract, classify, normalize
- ❌ Never redesign, rewrite, or summarize
- ❌ Never modify Next.js projects
- ❌ Never deploy or push to GitHub
- ✅ Build reusable extraction pipeline
- ✅ Respect robots.txt and crawl ethics
- ✅ Focus on B.E. 2568–2569 news only

## Workspace

```
G:\ProjectAI\RAE Knowledge Engine\

00_PROJECT/               → Project governance & scope
01_SOURCE/                → Target URLs & initial source data
02_CRAWLED/               → Raw HTML, extracted text, discovered links
  ├── raw-html/
  ├── text/
  └── links/
03_NOTEBOOKLM/            → NotebookLM input packages
  ├── landing/
  ├── research/
  ├── news-2568-2569/
  ├── organization/
  └── services/
04_KNOWLEDGE/             → Master knowledge index & structured data
  ├── faq/
  ├── graph/
  ├── landing/
  ├── news/
  ├── organization/
  ├── research/
  ├── services/
  ├── taxonomy/
  └── RAE_MASTER_KNOWLEDGE_INDEX.json
05_EXPORT/                → Export formats for external consumption
  ├── ai/
  ├── chatbot/
  ├── nextjs/
  └── stitch/
docs/                     → Pipeline documentation
scripts/                   → Extraction & normalization tools
```

## Knowledge Schema

Every extracted item supports:

```json
{
  "id": "RAE-2024-001",
  "title": "Research Topic Name",
  "category": "research|landing|services|news|organization",
  "subcategory": "specific_type",
  "source_url": "https://rae.mju.ac.th/...",
  "source_page": "raw_page_identifier",
  "language": "th|en",
  "summary": "Brief overview (1-2 sentences)",
  "body": "Full extracted content in Markdown",
  "tags": ["tag1", "tag2"],
  "related_topics": ["topic-id-1", "topic-id-2"],
  "updated_date": "2026-06-29",
  "status": "extracted|normalized|validated|published"
}
```

## Workflow Phases

### Phase K0 — Foundation ✅
- Folder structure
- Documentation framework
- Crawler scaffold
- Normalizer scaffold
- Link discovery scaffold

### Phase K0.1 — Foundation Complete ✅
- All K0 deliverables
- Production-ready scaffolds

### Phase K0.1B — Foundation Hardening 🔨 (THIS PHASE)
- Content Classification Engine
- Media Inventory Engine
- Knowledge Graph Engine
- Taxonomy Engine
- Discovery pipeline & dry-runs
- Updated documentation

### Phase K0.2 — Safe Crawl
- Execute crawl pipeline (polite crawl, rate-limited)
- Extract raw HTML
- Convert to readable text
- Discover internal links
- Save to 02_CRAWLED/

### Phase K0.2B — Media Download
- Download priority media (hero, research, laboratory, community)
- Store in 02_CRAWLED/assets/
- Update media inventory with local paths

### Phase K0.3 — Normalize
- Convert HTML/text → Markdown
- Apply knowledge schema
- Use classification decisions
- Generate 04_KNOWLEDGE/ files
- Create structured index
- Apply taxonomy organization
- Enrich with knowledge graph

### Phase K0.4 — Package
- Assemble 03_NOTEBOOKLM/ notebooks
- Create README files
- Prepare for NotebookLM import

### Phase K0.5 — Export
- Generate Stitch format
- Export AI-ready packages
- Create consumable assets

## Terminal Commands

All commands start with `rtk`:

```bash
# Run crawler
rtk node scripts/crawl-rae-sources.js

# Run normalizer
rtk node scripts/normalize.js

# Discover links
rtk node scripts/discover-links.js

# Export notebooks
rtk node scripts/export-notebooks.js
```

## Primary Sources

### Landing
- https://rae.mju.ac.th/wtms_index.aspx?&lang=th-TH

### Research
- https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=2064
- (and related research pages)

### News (B.E. 2568–2569 ONLY)
- 2569: wID=2022, 2387, 1960, 1908, 1941, 2042, 2043, 2463
- 2568: wID=2012, 2013, 954
- (Older news ignored per policy)

### Services & Organization
- To be catalogued in K0.2

## Expected Outputs

By Phase K0.4:

```
03_NOTEBOOKLM/
├── Notebook00-Master/
│   ├── README.md
│   ├── Mission.md
│   ├── Vision.md
│   ├── Organization.md
│   ├── Research.md
│   ├── Academic-Service.md
│   └── FAQ.md
├── Notebook01-Landing/
│   ├── README.md
│   ├── Landing.md
│   ├── Hero.md
│   ├── Core-Service.md
│   └── Contact.md
├── Notebook02-Research/
│   ├── README.md
│   ├── Research.md
│   ├── Projects.md
│   └── Innovation.md
├── Notebook03-News-2568/
│   ├── README.md
│   └── news-items.md
├── Notebook04-News-2569/
│   ├── README.md
│   └── news-items.md
└── Notebook05-Organization/
    ├── README.md
    ├── Structure.md
    └── Services.md
```

## Quality Standards

Markdown output must be:

- ✅ Clean, readable, heading-based
- ❌ No navigation menus
- ❌ No JavaScript or CSS
- ❌ No HTML tables (unless data-critical)
- ❌ No duplicate paragraphs
- ✅ Preserved institutional knowledge
- ✅ Original language (Thai)
- ✅ Source attribution

## Documentation

See [docs/](docs/) for:
- [KNOWLEDGE_PIPELINE.md](docs/KNOWLEDGE_PIPELINE.md) — Detailed extraction workflow
- [K0_CRAWL_STRATEGY.md](docs/K0_CRAWL_STRATEGY.md) — Crawl methodology
- [NEWS_POLICY_2568_2569.md](docs/NEWS_POLICY_2568_2569.md) — News filtering rules
- [KNOWLEDGE_SCHEMA.md](docs/KNOWLEDGE_SCHEMA.md) — Data structure spec
- [NOTEBOOKLM_IMPORT_PLAN.md](docs/NOTEBOOKLM_IMPORT_PLAN.md) — NotebookLM workflow

## Status

🟢 **Phase K0.1** — Foundation construction in progress

---

**Last Updated:** 2026-06-29  
**Maintained By:** RAE Knowledge Engineering Team  
**Workspace:** G:\ProjectAI\RAE Knowledge Engine
