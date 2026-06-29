# Knowledge Schema

## Overview

Every extracted knowledge item follows this JSON schema. This ensures consistent structure for NotebookLM and downstream consumers.

## Schema Definition

```json
{
  "id": "string (required)",
  "title": "string (required)",
  "category": "string (required, enum)",
  "subcategory": "string (optional)",
  "source_url": "string (required)",
  "source_page": "string (required)",
  "language": "string (required, enum)",
  "summary": "string (optional, 1-2 sentences)",
  "body": "string (required, Markdown format)",
  "tags": "array of strings (optional)",
  "related_topics": "array of strings (optional, IDs)",
  "updated_date": "string (required, ISO 8601)",
  "status": "string (required, enum)"
}
```

---

## Field Definitions

### id
- **Type:** String
- **Required:** Yes
- **Format:** `RAE-<CATEGORY>-<YYYYMMDD>-<SEQ>`
- **Example:** `RAE-RESEARCH-20260629-001`
- **Purpose:** Globally unique identifier
- **Notes:** Auto-generated during normalization

### title
- **Type:** String
- **Required:** Yes
- **Max Length:** 200 characters
- **Source:** Page title or heading
- **Notes:** Extracted as-is, no translation

### category
- **Type:** Enum
- **Required:** Yes
- **Valid Values:**
  - `landing` — Landing page content (hero, services, mission)
  - `research` — Research projects & initiatives
  - `news` — News announcements (filtered by year)
  - `services` — Academic services & support
  - `organization` — Organizational structure & contacts
  - `faq` — Frequently asked questions
  - `other` — Unclassified content
- **Purpose:** High-level content classification

### subcategory
- **Type:** String
- **Required:** No
- **Examples:**
  - `category=landing, subcategory=mission`
  - `category=research, subcategory=active-projects`
  - `category=news, subcategory=announcement`
  - `category=services, subcategory=student-support`
- **Purpose:** Detailed classification

### source_url
- **Type:** String (URL)
- **Required:** Yes
- **Format:** Full HTTPS URL
- **Example:** `https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=2064`
- **Purpose:** Citation & validation

### source_page
- **Type:** String
- **Required:** Yes
- **Format:** Page identifier or filename
- **Example:** `wtms_webpageDetail_wID_2064.html`
- **Purpose:** Map to raw HTML file

### language
- **Type:** Enum
- **Required:** Yes
- **Valid Values:**
  - `th` — Thai
  - `en` — English
- **Purpose:** Content language identifier
- **Notes:** Detected automatically

### summary
- **Type:** String
- **Required:** Optional (but recommended)
- **Max Length:** 500 characters
- **Format:** 1-2 sentences, plain text
- **Purpose:** Quick overview
- **Notes:** Extract from intro or generate from body

### body
- **Type:** String
- **Required:** Yes
- **Format:** Markdown
- **Constraints:**
  - Clean, readable structure
  - Proper heading hierarchy (H1 → H2 → H3)
  - No HTML, CSS, or JavaScript
  - No navigation menus
  - No orphaned markup
  - Preserved institutional knowledge
- **Purpose:** Full content

### tags
- **Type:** Array of Strings
- **Required:** Optional
- **Format:** Lowercase, hyphen-separated
- **Examples:** `["research", "innovation", "technology"]`
- **Max Tags:** 10
- **Purpose:** Searchable metadata

### related_topics
- **Type:** Array of Strings (IDs)
- **Required:** Optional
- **Format:** Item IDs matching this schema
- **Example:** `["RAE-RESEARCH-20260601-001", "RAE-RESEARCH-20260615-003"]`
- **Purpose:** Link related content
- **Notes:** Discovered during normalization

### updated_date
- **Type:** String (ISO 8601)
- **Required:** Yes
- **Format:** `YYYY-MM-DD`
- **Example:** `2026-06-29`
- **Purpose:** Timestamp
- **Notes:** Current date during extraction

### status
- **Type:** Enum
- **Required:** Yes
- **Valid Values:**
  - `extracted` — Raw content from WTMS
  - `normalized` — Schema applied, validated
  - `validated` — Manual review complete
  - `published` — Ready for NotebookLM
- **Purpose:** Pipeline state tracking

---

## Example Items

### Research Item

```json
{
  "id": "RAE-RESEARCH-20260629-001",
  "title": "Thai Language Natural Language Processing",
  "category": "research",
  "subcategory": "active-projects",
  "source_url": "https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=2064",
  "source_page": "wtms_webpageDetail_wID_2064.html",
  "language": "th",
  "summary": "Research initiative focused on developing NLP tools and techniques for Thai language processing.",
  "body": "# Thai Language NLP\n\n## Overview\n...",
  "tags": ["nlp", "thai-language", "technology", "research"],
  "related_topics": ["RAE-RESEARCH-20260615-002", "RAE-SERVICES-20260501-005"],
  "updated_date": "2026-06-29",
  "status": "normalized"
}
```

### News Item (2569)

```json
{
  "id": "RAE-NEWS-20260629-001",
  "title": "RAE Hosts International Conference 2569",
  "category": "news",
  "subcategory": "announcement",
  "source_url": "https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=2022",
  "source_page": "wtms_webpageDetail_wID_2022.html",
  "language": "th",
  "summary": "RAE announced the hosting of an international conference bringing together researchers from across Southeast Asia.",
  "body": "# RAE International Conference 2569\n\n...",
  "tags": ["conference", "2569", "international"],
  "related_topics": ["RAE-ORGANIZATION-20260401-003"],
  "updated_date": "2026-06-29",
  "status": "normalized"
}
```

### Landing Page Item

```json
{
  "id": "RAE-LANDING-20260629-001",
  "title": "Mission Statement",
  "category": "landing",
  "subcategory": "mission",
  "source_url": "https://rae.mju.ac.th/wtms_index.aspx?lang=th-TH",
  "source_page": "wtms_index_landing.html",
  "language": "th",
  "summary": "RAE's core mission to advance research and education.",
  "body": "# Mission\n\n...",
  "tags": ["mission", "vision", "core-values"],
  "related_topics": ["RAE-LANDING-20260629-002"],
  "updated_date": "2026-06-29",
  "status": "normalized"
}
```

---

## Master Knowledge Index

The `04_KNOWLEDGE/RAE_MASTER_KNOWLEDGE_INDEX.json` file aggregates all items:

```json
{
  "metadata": {
    "generated": "2026-06-29T10:00:00Z",
    "total_items": 250,
    "total_size_kb": 4500,
    "language_distribution": {
      "th": 248,
      "en": 2
    },
    "category_distribution": {
      "research": 80,
      "news": 60,
      "landing": 25,
      "services": 50,
      "organization": 25,
      "faq": 10
    }
  },
  "items": [
    { ... item 1 ... },
    { ... item 2 ... },
    { ... item N ... }
  ],
  "index_by_id": {
    "RAE-RESEARCH-20260629-001": 0,
    "RAE-NEWS-20260629-001": 1
  },
  "index_by_category": {
    "research": [0, 2, 5, ...],
    "news": [1, 3, 7, ...]
  }
}
```

---

## Validation Rules

### Required Fields
- Every item **must** have: `id`, `title`, `category`, `source_url`, `source_page`, `language`, `body`, `updated_date`, `status`

### Constraints
- **id** — Must be unique globally, match format
- **title** — Max 200 chars, non-empty
- **body** — Min 50 chars, valid Markdown
- **language** — Must be `th` or `en`
- **status** — Must be one of: `extracted`, `normalized`, `validated`, `published`
- **related_topics** — Must reference valid IDs

### Content Quality
- No duplicate paragraphs
- No broken links
- No orphaned HTML markup
- Proper heading hierarchy
- Clean whitespace

---

## Processing Rules

### Auto-Generation
- `id` — Generated during normalization
- `summary` — Extracted or generated from body
- `tags` — Extracted from title + body keywords
- `related_topics` — Discovered via content links
- `updated_date` — Current date during processing

### Preservation
- `source_url` — Preserved from crawl
- `source_page` — Mapped from filename
- `body` — Original Thai text preserved
- `title` — Extracted as-is

### Detection
- `language` — Detected from content
- `category` — Determined from URL/structure
- `status` — Tracked through pipeline

---

## Schema Evolution

If schema changes:
1. Increment schema version
2. Create migration script
3. Re-process affected items
4. Update RAE_MASTER_KNOWLEDGE_INDEX.json

Current Schema Version: **1.0** (2026-06-29)

---

**Last Updated:** 2026-06-29
