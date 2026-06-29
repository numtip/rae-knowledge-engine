# Content Classification Policy — v2
**RAE Knowledge Engine**  
**Phase:** K0.2B+  
**Status:** Active  
**Generated:** 2026-06-29

---

## Table of Contents
1. [Overview](#overview)
2. [Classification Actions](#classification-actions)
3. [Classification Fields](#classification-fields)
4. [Story Priority](#story-priority)
5. [Section Candidates](#section-candidates)
6. [Classification Rules](#classification-rules)
7. [Importance Scale](#importance-scale)
8. [AI Priority Scale](#ai-priority-scale)
9. [Quality Assurance](#quality-assurance)

---

## Overview

The **Content Classification Engine v2** extends v1 with story-driven field mapping to guide landing page construction and Stitch/NotebookLM export. Every content item receives:
- **Action assignment** (KEEP, REWRITE, MERGE, ARCHIVE, EXCLUDE)
- **Importance rating** (1–5)
- **Story priority** (hero, primary-section, secondary-section, footer, archive, exclude)
- **Section placement** (hero, services, research, impact, news, contact, footer, none)
- **AI priority** (low, medium, high, critical)
- **Confidence score** (0.0–1.0)

**Input:** `02_CRAWLED/text/` (recursive)  
**Output:** 
- `04_KNOWLEDGE/classification/wave1-classification-v2.csv`
- `04_KNOWLEDGE/classification/wave1-classification-v2.json`

**Creator:** `scripts/classify-content-v2.js`

---

## Classification Actions

### KEEP
- **Definition:** Preserve as-is, no restructuring needed
- **Applies to:** Core mission/vision, clear service descriptions, well-formatted research
- **Story Role:** Maps to primary or secondary story positions
- **Example:** Mission statement, lab description, service overview
- **Confidence:** 0.90–0.95 (high certainty)
- **Export:** Include in all normalizations and Stitch exports

### REWRITE
- **Definition:** Valuable content requiring restructuring/modernization
- **Applies to:** Legacy HTML with useful facts, dense narrative needing formatting, research with embedded navigation
- **Story Role:** Maps to primary or secondary positions after rewrite
- **Markers:** Flags with `rewrite_reason` explaining specific issues
- **Example:** "2567 research report using outdated formatting; facts still relevant", "Navigation embedded in service description"
- **Confidence:** 0.75–0.85 (good content, needs work)
- **Export:** Include in exports but mark as `requires_editorial_review`

### MERGE
- **Definition:** Combine multiple fragments into cohesive single item
- **Applies to:** Content split across multiple pages, repeated navigation, fragmented stories
- **Story Role:** Creates unified story position
- **Markers:** Includes `merge_target` pointing to primary content item
- **Example:** Multi-page research project spread across 3 pages merged as 1
- **Confidence:** 0.70–0.80 (fragments verified as related)
- **Export:** Skip individual fragments, include merged result only

### ARCHIVE
- **Definition:** Preserve but mark as historical, exclude from primary outputs
- **Applies to:** News older than 2568, deprecated research, obsolete services
- **Story Role:** `archive` priority
- **Markers:** Set `story_priority: archive`
- **Example:** News from 2567, old lab reports, discontinued service
- **Confidence:** 0.85–0.90 (clearly historical)
- **Export:** Store separately in `archive/` namespace, exclude from Stitch public outputs

### EXCLUDE
- **Definition:** Do not process further
- **Applies to:** Navigation fragments, broken links, empty content, duplicates
- **Story Role:** `exclude` priority
- **Markers:** `duplicate_risk: true` if detected as duplicate
- **Example:** Menu items, breadcrumbs, repeated nav, <100 chars of content
- **Confidence:** 0.85–0.95 (clearly not primary content)
- **Export:** Skip entirely, log reason for audit trail

---

## Classification Fields

### Core Metadata (Required)
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `source_url` | URL | Original WTMS URL | `https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=2064` |
| `file_path` | Path | Relative file path in 02_CRAWLED/text | `research/wid_2064_research.txt` |
| `title` | Text | Content title | `Plant Breeding Research Program` |
| `category` | Enum | Document category | landing, research, news, services, organization, faq, other |

### Classification Core
| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `action` | Enum | KEEP, REWRITE, MERGE, ARCHIVE, EXCLUDE | Primary classification decision |
| `reason` | Text | Explanation | Why action chosen (e.g., "Core mission statement") |
| `confidence` | Decimal | 0.0–1.0 | Classification certainty |
| `notes` | Text | Additional context | For editors (optional) |

### Story & Section Mapping (NEW v2)
| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `story_priority` | Enum | hero, primary-section, secondary-section, footer, archive, exclude | Where in story arc |
| `section_candidate` | Enum | hero, services, research, impact, news, contact, footer, none | Landing page section |
| `rewrite_reason` | Text | Why rewrite needed | "Outdated phrasing", "Mixed navigation" |
| `merge_target` | Text | Parent content | ID/title of item to merge with |
| `duplicate_risk` | Bool | true, false | Flag for potential duplicate content |

### Importance & Priority
| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `importance` | Integer | 1–5 | Strategic priority (see scale below) |
| `ai_priority` | Enum | low, medium, high, critical | LLM training priority |

### Content Suitability (Candidate Flags)
| Field | Type | Description | Example Use |
|-------|------|-------------|-------------|
| `homepage_candidate` | Bool | Suitable for Landing V2 | Mission, hero image content |
| `research_candidate` | Bool | Research notebook material | Lab descriptions, findings |
| `service_candidate` | Bool | Academic service material | Training programs, consulting |
| `document_candidate` | Bool | Document center material | Whitepapers, reports |

---

## Story Priority

Maps content to 10-position narrative arc for landing page & Stitch organization:

### Priority Values

| Priority | Story Positions | Landing Section | Visibility | Expansion Phase |
|----------|-----------------|-----------------|------------|-----------------|
| `hero` | Mission/Vision | Hero section (top) | CRITICAL | K0.2B (wave 1) |
| `primary-section` | Research, Services, Organization | Main sections (mid-page) | HIGH | K0.2B (wave 1) |
| `secondary-section` | Support, Context, Details | Secondary panels | MEDIUM | K0.2B–K0.3 |
| `footer` | Future, Contact, Closing | Footer | LOW | K0.3+ |
| `archive` | Historical reference | Archived collection | ARCHIVE | K0.2C+ |
| `exclude` | Navigation, duplicates | Not published | NONE | — |

### Assignment Rules

| Content Type | Rule | Example | Priority |
|--------------|------|---------|----------|
| Mission/Vision statement | Assign `hero` | "RAE advances research and education" | hero |
| Core service description | Assign `primary-section` | "Laboratory testing services" | primary-section |
| Research program overview | Assign `primary-section` | "Plant breeding research" | primary-section |
| Supporting detail/context | Assign `secondary-section` | "Lab hours: 8-5 weekdays" | secondary-section |
| Future vision/roadmap | Assign `footer` | "Emerging technologies for 2030" | footer |
| Legacy/undated news | Assign `archive` | News from 2567 | archive |
| Navigation/duplicate | Assign `exclude` | Menu items, breadcrumbs | exclude |

---

## Section Candidates

Maps to **landing page section structure** for content editors and Stitch export:

| Section | Story Nodes | Use Case | Landing Position | Content Style |
|---------|------------|----------|------------------|---------------|
| `hero` | Mission, Vision | "Why RAE" hook | Top, full-width | Large imagery + tagline |
| `research` | Research Excellence, Knowledge Creation | Deep technical dive | Mid-page panel | Detailed narrative, lab photos |
| `services` | Academic Services, Technology Transfer | "How to engage" | Mid-page section | Feature cards, CTA buttons |
| `impact` | Community Impact, Sustainable Agriculture | "Real benefits" | Mid-page section | Testimonials, outcome metrics |
| `news` | News items (2568–2569) | Current events | News carousel | Date-sorted items |
| `contact` | Organization, Contact info | "Get in touch" | Lower mid-page | Contact form, office location |
| `footer` | Future vision | Closing thoughts | Bottom bar | Short message + links |
| `none` | Miscellaneous, reference | Not suitable for landing | Archive | Document center |

### Assignment Rules

**Rule Set for Section Candidates:**

1. **Mission/Vision → hero**
   - Content mentions mission, vision, or core purpose
   - Confidence: 0.95

2. **Research content → research**
   - Category = 'research' OR content mentions research, studies, experiments
   - Confidence: 0.90

3. **Service content → services**
   - Category = 'services' OR mentions training, consulting, lab testing
   - Confidence: 0.90

4. **Community/impact content → impact**
   - News items OR content about community, farmers, benefits
   - Confidence: 0.85

5. **News items (2568–2569) → news**
   - Category = 'news' AND year in 2568–2569 range
   - Confidence: 0.90

6. **Organization/Contact → contact**
   - Category = 'organization' OR content about departments, staff, contact info
   - Confidence: 0.85

7. **Future vision → footer**
   - Content mentions future, strategic, roadmap, next-generation
   - Confidence: 0.70

8. **Unmatched/reference → none**
   - No section match found, useful as reference only
   - Confidence: varies

---

## Classification Rules

### v2 Rule Set (K0.2B+)

**Rule 1: Core Institutional Content**
```
IF title.includes(mission | vision | core | principal)
THEN
  action = KEEP
  importance = 5
  ai_priority = critical
  story_priority = hero
  section_candidate = hero
  homepage_candidate = true
  confidence = 0.95
```

**Rule 2: Research Content**
```
IF category = research OR title.includes(research | project | study)
THEN
  action = KEEP (or REWRITE if legacy)
  importance = 5 (or 4)
  ai_priority = critical (or high)
  story_priority = primary-section
  section_candidate = research
  research_candidate = true
  confidence = 0.90 (or 0.75)
```

**Rule 3: Service Content**
```
IF category = services OR title.includes(service | training | consulting)
THEN
  action = KEEP (or REWRITE)
  importance = 4
  ai_priority = high
  story_priority = primary-section
  section_candidate = services
  service_candidate = true
  confidence = 0.85 (or 0.75)
```

**Rule 4: Organization/Contact**
```
IF category = organization OR title.includes(organization | contact | department)
THEN
  action = KEEP
  importance = 4
  ai_priority = high
  story_priority = primary-section
  section_candidate = contact
  homepage_candidate = true
  confidence = 0.90
```

**Rule 5: News Items**
```
IF category = news
  IF year >= 2568
  THEN
    action = KEEP (or ARCHIVE if undated)
    importance = 3–4
    ai_priority = medium
    story_priority = secondary-section (or archive)
    section_candidate = news (or none)
    confidence = 0.85
  ELSE (pre-2568)
    action = ARCHIVE
    importance = 2
    ai_priority = low
    story_priority = archive
    section_candidate = none
    confidence = 0.90
```

**Rule 6: Navigation/Menu Fragments**
```
IF content.includes(menu | navigation | breadcrumb) AND length < 5 lines
THEN
  action = EXCLUDE
  importance = 1
  ai_priority = low
  story_priority = exclude
  confidence = 0.90
```

**Rule 7: Empty/Broken Content**
```
IF content.length < 100 (insufficient text)
THEN
  action = EXCLUDE
  importance = 1
  ai_priority = low
  story_priority = exclude
  reason = "Insufficient content"
  confidence = 0.90
```

**Rule 8: Rewrite Detection**
```
IF action = REWRITE
THEN
  rewrite_reason = one_of(
    "Legacy phrasing (content accurate, needs modernization)",
    "Mixed navigation (remove embedded menus)",
    "Table-format content (convert to prose)",
    "Broken formatting (extract text, rebuild structure)"
  )
  importance = maintain_or_reduce
  confidence = reduce_by(0.10–0.15)
```

**Rule 9: Merge Detection**
```
IF duplicate_risk = true OR action = MERGE
THEN
  merge_target = "ID of primary content item"
  importance = check_for_unique_details
  duplicate_risk = true
  reason = "Fragment of larger story"
  confidence = 0.70–0.80
```

---

## Importance Scale

### 1–5 Scale Definition

| Level | Label | Definition | Example | Story Priority | Export |
|-------|-------|-----------|---------|-----------------|--------|
| **5** | CRITICAL | Mission-critical, must preserve | Mission statement, core service | hero | All outputs |
| **4** | IMPORTANT | High-value content | Research program, key service | primary | All outputs |
| **3** | USEFUL | Supporting, enriching context | Lab hours, team member bio | secondary | Main + specialized |
| **2** | SUPPORTING | Secondary detail | Archived research, old service | footer/archive | Archive only |
| **1** | LOW | Nice-to-have, reference only | Discontinued program, old news | exclude/archive | Reference only |

### Scoring Rules

- **5 (Critical):** Institutional mission, core vision, principal service
- **4 (Important):** Active research, current academic services, organization structure
- **3 (Useful):** Supporting research details, service specifics, community engagement
- **2 (Supporting):** Legacy content with historical value, archived programs
- **1 (Low):** Navigation fragments, old news, minimal content

---

## AI Priority Scale

Maps content to LLM training pipeline:

| Priority | Usage | Selection Criteria | % of Content | Training Use |
|----------|-------|-------------------|-------------|--------------|
| `critical` | LLM fine-tuning source | Mission, core services, research | 5–10% | Primary training set |
| `high` | LLM training, context | Important research, active services | 15–25% | Augmented training |
| `medium` | Reference material | Supporting details, context | 30–40% | Retrieval-augmented generation |
| `low` | Archive/reference | Historical, minimal content | 25–35% | Specialized retrieval only |

### Assignment Rules

```
IF importance >= 4 AND confidence >= 0.85 THEN ai_priority = critical
ELSE IF importance >= 3 AND confidence >= 0.70 THEN ai_priority = high
ELSE IF importance >= 2 THEN ai_priority = medium
ELSE ai_priority = low
```

---

## Quality Assurance

### Pre-Export Checklist

- [ ] All items have valid `action` values
- [ ] Confidence scores populated for all items
- [ ] Story priority assigned for all KEEP/REWRITE items
- [ ] No items marked KEEP with importance < 2
- [ ] Homepage candidates verified (max 10–12 items)
- [ ] Merge targets verified (all point to valid items)
- [ ] Duplicate risk flagged items reviewed manually
- [ ] Archive items properly categorized (not KEEP)
- [ ] At least 80% of items have confidence >= 0.70

### Post-Export Review

- [ ] CSV imports without formatting errors
- [ ] JSON valid and parseable
- [ ] Distribution check: KEEP 60–80%, REWRITE 10–20%, others 5–10%
- [ ] Homepage candidates suitable for Landing V2 design
- [ ] Story priorities map correctly to landing sections
- [ ] No data loss in CSV/JSON conversion
- [ ] Confidence scores correlate with manual review spot-checks

---

## References

- **Classification Engine:** `scripts/classify-content-v2.js`
- **Story Graph Policy:** `docs/STORY_GRAPH_POLICY.md` (uses story_priority)
- **Media Inventory Policy:** `docs/MEDIA_INVENTORY_POLICY.md`
- **Folder Structure Policy:** `docs/FOLDER_STRUCTURE_POLICY.md`

---

**Last Updated:** 2026-06-29  
**Version:** v2  
**Phase:** K0.2B  
**Status:** Active
