# Content Classification Policy

## Overview

The Content Classification Engine analyzes extracted content and assigns standardized actions, importance ratings, and metadata to guide the knowledge normalization pipeline.

Every piece of content is evaluated and classified before normalization to ensure:
- Strategic prioritization (mission-critical vs. supporting)
- Quality control (exclude low-value duplicates)
- Smart bundling (group related items)
- Proper archiving (preserve historical content)
- AI readiness (mark priority items for LLM training)

## Classification Actions

### KEEP
- **Definition:** Preserve as-is
- **Applies to:** Core institutional content
- **Example:** Mission statement, contact information
- **Output:** Normalize to schema, include in all exports

### REWRITE
- **Definition:** Content is valuable but needs restructuring
- **Applies to:** Dense HTML tables, poorly formatted text, redundant sections
- **Example:** Research descriptions with embedded navigation
- **Output:** Extract, reorganize, normalize, include in exports

### MERGE
- **Definition:** Combine multiple fragments into single item
- **Applies to:** Content split across multiple pages
- **Example:** Multi-page research project description
- **Output:** Consolidate, normalize as single item

### ARCHIVE
- **Definition:** Preserve but mark as historical
- **Applies to:** Outdated but historically valuable content
- **Example:** News older than 2568, old research reports
- **Output:** Store separately, exclude from primary exports, include in archive
- **Tag:** `archived`, `historical`

### EXCLUDE
- **Definition:** Do not process further
- **Applies to:** Duplicates, broken links, empty pages
- **Example:** Menu fragments, duplicate navigation, 404s
- **Output:** Log reason, skip normalization

---

## Classification Fields

### Metadata
- **id** — Item identifier (will be assigned during normalization)
- **source_url** — Original WTMS URL
- **title** — Page/content title

### Classification
- **category** — landing | research | news | services | organization | faq | other
- **action** — KEEP | REWRITE | MERGE | ARCHIVE | EXCLUDE
- **reason** — Why this action (brief text)
- **confidence** — 0.0–1.0 (accuracy of classification)

### Importance
- **importance** — 1–5 scale
  - **5:** Mission-critical (must preserve)
  - **4:** Important (high value)
  - **3:** Useful (supporting content)
  - **2:** Supporting (secondary)
  - **1:** Low priority (nice-to-have)

### Content Candidacy
- **homepage_candidate** — true | false (suitable for Landing V2 homepage)
- **research_candidate** — true | false (research notebook material)
- **service_candidate** — true | false (academic service material)
- **document_candidate** — true | false (document center material)

### AI Priority
- **ai_priority** — low | medium | high | critical
  - **critical:** Use for LLM fine-tuning
  - **high:** Include in AI training sets
  - **medium:** Include if space available
  - **low:** Optional for AI training

### Metadata
- **notes** — Additional context or flags

---

## Classification Rules

### Core Institutional Content
**Pattern:** Mission, Vision, Contact, Core Services  
**Action:** KEEP or REWRITE  
**Importance:** 5  
**AI Priority:** critical  
**Rule:** Preserve exactly as institutional record; rewrite only if formatting interferes with content extraction

### Historical News
**Pattern:** News with date < B.E. 2568  
**Action:** ARCHIVE or EXCLUDE  
**Importance:** 1–3  
**Rule:** If historically valuable, archive; if redundant/promotional, exclude

### Navigation Fragments
**Pattern:** Menu items, duplicate headings, breadcrumbs  
**Action:** EXCLUDE  
**Importance:** 1  
**Reason:** Non-substantive; filtered during extraction

### Research Content
**Pattern:** Content linked from wID=2064 or tagged "research"  
**Action:** KEEP or REWRITE  
**Importance:** 4–5  
**AI Priority:** high–critical  
**research_candidate:** true  
**Rule:** Preserve research quality; rewrite if poorly formatted HTML

### Service Descriptions
**Pattern:** Academic services, public services  
**Action:** KEEP or REWRITE  
**Importance:** 4–5  
**AI Priority:** high  
**service_candidate:** true

### Broken/Empty Pages
**Pattern:** HTTP 404, empty content, <100 bytes  
**Action:** EXCLUDE  
**Importance:** 1  
**Reason:** No substantive content

### Duplicate Content
**Pattern:** Same text on multiple pages  
**Action:** MERGE or EXCLUDE  
**Importance:** 1–3  
**Rule:** If intentional redundancy (for different audiences), keep separate; if accidental duplication, merge or exclude

### Legacy/Archived Pages
**Pattern:** Old research, discontinued services  
**Action:** ARCHIVE  
**Importance:** 2–3  
**Rule:** Mark as historical, preserve for reference

---

## Importance Scale

| Level | Criteria | Examples | Action |
|-------|----------|----------|--------|
| 5 | Mission-critical, institution-defining | Mission, Vision, Contact, Core Services, Strategic Research | KEEP (always) |
| 4 | Important, core institutional function | Research projects, Academic services, Key news | KEEP or REWRITE |
| 3 | Useful, supports primary content | Supporting research, Service details, Older news | KEEP or ARCHIVE |
| 2 | Supporting, nice-to-have | Background info, Related resources | REWRITE or ARCHIVE |
| 1 | Low priority, optional | Promotional content, Duplicate navigation, Old announcements | EXCLUDE or ARCHIVE |

---

## AI Priority Scale

| Priority | Criteria | Use Case |
|----------|----------|----------|
| critical | Institution-defining, unique knowledge | Fine-tune LLMs for RAE-specific language |
| high | Core content, strategic importance | Training AI assistants for primary functions |
| medium | Supporting content, useful reference | Optional for enhanced AI training |
| low | Supplementary, promotional | Optional for completeness |

---

## Homepage Candidacy

Content suitable for **Landing V2 homepage**:

- Mission statement (importance 5)
- Vision statement (importance 5)
- Core services overview (importance 5)
- Latest news from 2569 (importance 4)
- Key research initiatives (importance 4)
- Quick links to major sections (importance 4)
- Contact information (importance 5)
- Partner logos (importance 3)

**NOT suitable:**
- Duplicate navigation
- Historical/archived content
- Internal administrative pages
- Broken links

---

## Output Formats

### Classification CSV

```csv
source_url,title,category,action,importance,ai_priority,homepage_candidate,research_candidate,service_candidate,document_candidate,reason,confidence
https://rae.mju.ac.th/wtms_index.aspx?lang=th-TH,RAE Landing,landing,KEEP,5,critical,true,false,false,false,Core institutional entry point,0.95
https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=2064,Research Portal,research,KEEP,5,critical,false,true,false,false,Main research hub,0.98
...
```

### Classification JSON

```json
{
  "metadata": {
    "generated": "2026-06-29T10:00:00Z",
    "total_items": 250,
    "action_distribution": {
      "KEEP": 120,
      "REWRITE": 50,
      "MERGE": 20,
      "ARCHIVE": 40,
      "EXCLUDE": 20
    },
    "importance_distribution": {
      "5": 30,
      "4": 80,
      "3": 90,
      "2": 40,
      "1": 10
    }
  },
  "items": [
    {
      "source_url": "https://rae.mju.ac.th/...",
      "title": "Content Title",
      "category": "research",
      "action": "KEEP",
      "importance": 5,
      "ai_priority": "critical",
      "homepage_candidate": false,
      "research_candidate": true,
      "service_candidate": false,
      "document_candidate": false,
      "reason": "Core research content",
      "confidence": 0.95,
      "notes": "Key research hub"
    }
  ]
}
```

---

## Classification Workflow

### Step 1: Content Ingestion
- Read extracted items from 02_CRAWLED/text/
- Map to source URLs

### Step 2: Category Detection
- Identify category from URL pattern
- Validate against landing|research|news|services|organization|faq|other

### Step 3: Content Analysis
- Check for duplicates
- Evaluate content length
- Detect language
- Identify structural patterns

### Step 4: Action Assignment
- Apply classification rules
- Assign importance
- Set AI priority
- Identify candidacy

### Step 5: Quality Assurance
- Validate classifications
- Flag low-confidence items
- Generate report

### Step 6: Output Generation
- Export CSV for review
- Export JSON for downstream processing
- Generate classification report

---

## Dry-Run Workflow

```bash
rtk node scripts/classify-content.js --dry-run
```

**Dry-run output:**
- Loads extracted content
- Applies classification rules
- Reports: action counts, importance distribution, confidence scores
- Does NOT modify 04_KNOWLEDGE/

**To commit classifications:**
```bash
rtk node scripts/classify-content.js
```

---

## Review & Adjustment

After dry-run, classification results should be reviewed:

1. **Identify low-confidence items** (< 0.7 confidence)
2. **Validate action assignments** (spot-check categories)
3. **Adjust importance ratings** if needed
4. **Mark homepage candidates** for Landing V2
5. **Confirm archival decisions**

Adjustments can be made in the CSV, then re-imported for processing.

---

**Last Updated:** 2026-06-29
