# Media Inventory Policy — v2
**RAE Knowledge Engine**  
**Phase:** K0.2B  
**Status:** Active  
**Generated:** 2026-06-29

---

## Table of Contents
1. [Overview](#overview)
2. [Visual Roles](#visual-roles)
3. [Quality Assessment](#quality-assessment)
4. [Asset Types](#asset-types)
5. [Discovery Process](#discovery-process)
6. [Stitch Candidacy](#stitch-candidacy)
7. [Download Priority](#download-priority)
8. [Inventory Format](#inventory-format)
9. [Verification Checklist](#verification-checklist)

---

## Overview

The **Media Inventory Engine v2** discovers and catalogs media assets from crawled HTML with enhanced metadata supporting smart media selection for Stitch/NotebookLM integration and Landing V2 redesign.

**Current Phase:** URL inventory only (no binary downloads)  
**Future Phase (K0.2C):** Binary download based on `download_priority` field

**Key Features:**
- Recursive HTML scanning with image extraction
- Visual role classification (hero, research, lab, community, building, logo, document, archive, exclude)
- Quality estimation based on filename/context patterns
- Stitch candidacy assessment (which images suitable for public export)
- Download priority guidance (high, medium, low, skip)
- Duplicate detection with URL-based deduplication

**Input:** `02_CRAWLED/raw-html/` (recursive)  
**Output:**
- `04_KNOWLEDGE/media/wave1-media-discovery.csv`
- `04_KNOWLEDGE/media/wave1-media-discovery.json`
- `04_KNOWLEDGE/media/wave1-stitch-image-candidates.json`

**Creator:** `scripts/inventory-media-v2.js`

---

## Visual Roles

Classifies media by intended **visual purpose and narrative contribution**:

### High-Priority Roles

#### Hero
- **Description:** Landing page hero section imagery
- **Use Case:** Large, compelling image at top of Landing V2
- **Stitch Priority:** CRITICAL (flagship image)
- **Download Priority:** HIGH
- **Quality Requirement:** High resolution, professional composition
- **Estimated Quality:** high (or medium for backup)
- **Examples:** RAE campus aerial, research team in field, innovative lab equipment
- **Selection Criteria:**
  - Filename contains 'hero', 'banner', 'splash'
  - Full-width banner-style images (typically 1920+ width)
  - Professional photography, not screenshots
  - University/institutional branding clear

#### Research
- **Description:** Research activities, experiments, publications
- **Use Case:** Research Excellence section imagery
- **Stitch Priority:** HIGH
- **Download Priority:** HIGH
- **Quality Requirement:** High (lab/field authenticity)
- **Estimated Quality:** high
- **Examples:** Lab technician at work, research plots, data visualization, publication cover
- **Selection Criteria:**
  - Filename contains 'research', 'experiment', 'project', 'lab'
  - Shows actual research activity (not just logos)
  - Professional quality, authentic context
  - Clearly RAE-affiliated

#### Laboratory
- **Description:** Laboratory facilities, equipment, testing services
- **Use Case:** Services/Capabilities section, lab tour galleries
- **Stitch Priority:** HIGH
- **Download Priority:** HIGH
- **Quality Requirement:** High (shows capability)
- **Estimated Quality:** high
- **Examples:** Lab equipment overview, testing procedure, safety protocols, sample analysis
- **Selection Criteria:**
  - Filename contains 'lab', 'laboratory', 'equipment', 'facility'
  - Shows actual equipment/facilities (not diagrams)
  - Professional photography
  - Clearly demonstrates capability

#### Community
- **Description:** Community engagement, farmer interactions, field demonstrations
- **Use Case:** Impact section, outreach programs
- **Stitch Priority:** HIGH
- **Download Priority:** HIGH
- **Quality Requirement:** High (authentic engagement)
- **Estimated Quality:** high
- **Examples:** Farmer training workshop, field demonstration, community event, farmer portrait
- **Selection Criteria:**
  - Filename contains 'farmer', 'community', 'field', 'people', 'agricultural'
  - Shows human interaction/engagement
  - Authentic setting (not studio)
  - Reflects real impact/work

### Medium-Priority Roles

#### Building
- **Description:** Campus facilities, buildings, institutional infrastructure
- **Use Case:** About/Organization section, campus tour
- **Stitch Priority:** MEDIUM
- **Download Priority:** MEDIUM
- **Quality Requirement:** Medium (facility showcase)
- **Estimated Quality:** medium
- **Examples:** Main campus building, research center exterior, office building, entrance
- **Selection Criteria:**
  - Filename contains 'building', 'campus', 'facility', 'office'
  - Institutional property visible
  - Clear, professional photograph

#### Partner-Logo
- **Description:** Partner organization logos, consortium marks, accreditation badges
- **Use Case:** Partnerships/Ecosystem section, footer credits
- **Stitch Priority:** MEDIUM
- **Download Priority:** MEDIUM
- **Quality Requirement:** Medium (logo clarity)
- **Estimated Quality:** high (logos typically high-res)
- **Examples:** University logo, ministry seal, international consortium mark, accreditation badge
- **Selection Criteria:**
  - Filename contains 'logo', 'partner', 'accreditation', 'badge'
  - Logo/symbol/seal formats
  - Clear visibility, readable text

### Low-Priority Roles

#### Document
- **Description:** Document thumbnails, report covers, publication previews
- **Use Case:** Document center, resource downloads
- **Stitch Priority:** LOW
- **Download Priority:** LOW
- **Quality Requirement:** Low (reference)
- **Estimated Quality:** medium
- **Examples:** PDF report cover, whitepaper thumbnail, publication preview
- **Selection Criteria:**
  - File extension .pdf or document-linked images
  - Document cover or preview format
  - Text-heavy preview images

### Archive Roles

#### Archive
- **Description:** Old institutional content (pre-2568), historical documentation
- **Use Case:** Historical archive reference only
- **Stitch Priority:** SKIP (exclude from public)
- **Download Priority:** SKIP
- **Quality Requirement:** N/A (historical preservation)
- **Estimated Quality:** low
- **Examples:** News photo from 2567, old lab photo, deprecated facility
- **Selection Criteria:**
  - Filename contains year 2564–2567
  - Explicitly marked as historical
  - Obsolete or deprecated content

#### Exclude
- **Description:** Decorative, low-value, broken, or non-narrative images
- **Use Case:** Not suitable for public-facing content
- **Stitch Priority:** EXCLUDE (skip)
- **Download Priority:** SKIP
- **Quality Requirement:** N/A
- **Estimated Quality:** low
- **Examples:** Generic placeholder, repeated navigation icon, broken link, screenshot-quality image
- **Selection Criteria:**
  - Decorative-only (no narrative value)
  - Very low resolution (<100px)
  - Repeated multiple times (navigation)
  - Broken or inaccessible

---

## Quality Assessment

**Estimated quality** is inferred from URL patterns, context, and filename indicators:

### Quality Levels

| Level | Definition | Characteristics | Suitable For |
|-------|-----------|-----------------|-------------|
| `high` | Professional, production-ready | High resolution, good composition, institutional quality | Hero, research, lab, community, building imagery |
| `medium` | Acceptable quality, minor issues | Adequate resolution, good clarity, usable but not showcase | Supporting, ecosystem, document imagery |
| `low` | Minimal quality, reference-only | Low resolution, poor composition, decorative only | Archive, reference, exclude |
| `unknown` | Unable to assess from metadata | New/unfamiliar patterns | Requires manual review |

### Quality Inference Rules

```
IF filename.includes(stock | placeholder | temp | screenshot | icon | button)
  THEN quality = low

ELSE IF filename.includes(hero | banner | feature | research | lab | field | community | facility)
  THEN quality = high

ELSE IF image.includes(partner | logo | accreditation)
  THEN quality = high (logos assume high DPI)

ELSE IF filename.includes(news | event | document)
  THEN quality = medium

ELSE IF extension NOT IN (jpg, jpeg, png, webp)
  THEN quality = medium (assume reasonable for format)

ELSE IF filename.length > 30 AND NOT keyword_match
  THEN quality = unknown (requires review)

ELSE
  THEN quality = low (default conservative)
```

---

## Asset Types

Categorizes media by **file type and primary use**:

| Asset Type | File Types | Storage | Extraction | Examples |
|-----------|-----------|---------|-----------|----------|
| `image` | .jpg, .jpeg, .png, .gif, .webp | CDN | &lt;img&gt; src | Photographs, diagrams, charts |
| `pdf` | .pdf | Document server | &lt;a href="*.pdf"&gt; | Reports, whitepapers, guides |
| `document` | .doc, .docx, .xls, .xlsx, .ppt | Document server | &lt;a href="*.doc*"&gt; | Office files, spreadsheets, presentations |
| `logo` | .png, .svg | CDN/assets | &lt;img&gt; class="logo" | Brand assets, badges |
| `banner` | .jpg, .png | CDN | &lt;picture&gt; or &lt;img&gt; | Featured images, carousels |
| `icon` | .png, .svg | CDN/assets | &lt;img&gt; inline, small | UI elements, bullets, markers |
| `unknown` | Other/unrecognized | N/A | Various | Unclassifiable media |

---

## Discovery Process

### Phase 1: Extraction

1. **Read crawled HTML files** recursively from `02_CRAWLED/raw-html/{category}/*.html`
2. **Extract from <img> tags:**
   - `src` attribute → asset URL
   - `alt` attribute → descriptive text
   - Class/ID attributes → visual role hints
3. **Extract from <picture> tags:** srcset media queries
4. **Extract document links:** href="*.pdf|*.doc*|*.xls*"
5. **Normalize URLs:**
   - Absolute URLs passed through
   - Relative paths converted to absolute
   - URL parameters cleaned

### Phase 2: Deduplication

1. **URL-based deduplication:** Remove exact URL duplicates
2. **Filename-based deduplication:** Detect CDN versioning tricks (same file, different params)
3. **Keep first occurrence** with source URL noting source page

### Phase 3: Classification

For each media item:
1. **Detect asset type** based on file extension
2. **Assess visual role** using filename + context rules (see Visual Roles above)
3. **Estimate quality** using quality rules
4. **Assess Stitch candidacy** (see section below)
5. **Assign download priority** (see section below)

### Phase 4: Export

Generate three output files:
- **wave1-media-discovery.csv** — Full inventory, all columns
- **wave1-media-discovery.json** — Full inventory with metadata
- **wave1-stitch-image-candidates.json** — Filtered to Stitch-suitable items only

---

## Stitch Candidacy

Flags media suitable for **Stitch multi-channel export** and Landing V2 redesign:

### Candidate Criteria

Media is a Stitch candidate if **ALL** conditions met:

1. **Visual role:** One of {hero, research, laboratory, community, building, partner-logo}
2. **Quality:** `high` or `medium` (NOT `low`)
3. **No quality issues:** Not marked exclude, not archive
4. **Source verification:** URL resolves and is RAE-affiliated (rae.mju.ac.th domain)
5. **Business suitability:** No sensitive/private content (no ID numbers, personal data)

### Stitch Role-to-Section Mapping

| Visual Role | Stitch Sections | Suggested Placement | Priority |
|------------|-----------------|-------------------|----------|
| hero | Landing hero, Master notebook | Top of landing page, notebook cover | 1 (CRITICAL) |
| research | Research notebook, Landing research section | Research achievement showcase | 2 (HIGH) |
| laboratory | Services notebook, Laboratory section | Capability demonstration | 2 (HIGH) |
| community | Impact notebook, Impact section | Real-world benefit showcase | 2 (HIGH) |
| building | Master, Organization notebook | Campus/facility overview | 3 (MEDIUM) |
| partner-logo | Master notebook, footer | Partnership/ecosystem display | 3 (MEDIUM) |
| document | Document center, reference | Publication index | 4 (LOW) |

### Exclusion Reasons

Media is excluded from Stitch if:
- Visual role = exclude, archive
- Estimated quality = low
- URL inaccessible or broken
- Sensitive content detected (student IDs, personal photos without consent)
- Copyrighted material (third-party without license)
- Low pixel density (<150 DPI estimated)

---

## Download Priority

Guidance for **binary download phase (K0.2C)**:

### Priority Levels

| Priority | Download If | File Size Limit | Optimization | Timeline |
|----------|-----------|-----------------|--------------|----------|
| `high` | Stitch candidate + hero/research/lab/community roles | <5 MB | Compress for web, preserve quality | K0.2C Wave 1 |
| `medium` | Stitch candidate + building/logo roles OR good quality + supporting | <2 MB | Balance quality/size | K0.2C Wave 2 |
| `low` | Document-type OR secondary supporting imagery | <1 MB | Aggressive compression OK | K0.2C Wave 3+ |
| `skip` | Not a Stitch candidate, archive, or exclude | — | Do not download | Skip |

### Download Rules

```
IF stitch_candidate = true AND visual_role IN (hero, research, laboratory, community)
  THEN priority = high

ELSE IF stitch_candidate = true AND visual_role IN (building, partner-logo)
  THEN priority = medium

ELSE IF asset_type = document OR stitch_candidate = true
  THEN priority = low

ELSE IF visual_role IN (archive, exclude) OR estimated_quality = low
  THEN priority = skip

ELSE
  THEN priority = skip (default conservative)
```

---

## Inventory Format

### CSV Columns

```
id | source_url | asset_url | file_name | extension | asset_type | 
alt_text | category | visual_role | estimated_quality | stitch_candidate |
download_priority | size_kb | reason | notes
```

### JSON Structure

```json
{
  "metadata": {
    "generated": "2026-06-29T...",
    "version": "v2",
    "total_items": 47,
    "stitch_candidates": 18,
    "visual_role_distribution": {
      "hero": 1,
      "research": 8,
      "laboratory": 5,
      "community": 4,
      "building": 2,
      "partner-logo": 3,
      "document": 8,
      "archive": 4,
      "exclude": 12
    },
    "quality_distribution": {
      "high": 15,
      "medium": 18,
      "low": 12,
      "unknown": 2
    },
    "priority_distribution": {
      "high": 12,
      "medium": 6,
      "low": 8,
      "skip": 21
    }
  },
  "items": [
    {
      "id": "MEDIA-001",
      "source_url": "https://rae.mju.ac.th/...",
      "asset_url": "https://rae.mju.ac.th/assets/images/hero-campus.jpg",
      "file_name": "hero-campus.jpg",
      "extension": "jpg",
      "asset_type": "image",
      "alt_text": "RAE main campus aerial view",
      "category": "landing",
      "visual_role": "hero",
      "estimated_quality": "high",
      "stitch_candidate": true,
      "download_priority": "high",
      "size_kb": null,
      "reason": "Hero image candidate for landing page",
      "notes": ""
    },
    ...
  ]
}
```

### Stitch Candidates Export

```json
{
  "metadata": {
    "generated": "2026-06-29T...",
    "total_candidates": 18,
    "by_role": [
      {"role": "hero", "count": 1},
      {"role": "research", "count": 8},
      ...
    ]
  },
  "candidates_by_role": {
    "hero": [
      {
        "id": "MEDIA-001",
        "file_name": "hero-campus.jpg",
        "asset_url": "https://...",
        "source_url": "https://...",
        "quality": "high",
        "alt_text": "..."
      }
    ],
    "research": [...],
    ...
  }
}
```

---

## Verification Checklist

### Extraction Completeness
- [ ] All source HTML files scanned (recursive walk)
- [ ] <img> tags extracted with src and alt
- [ ] <picture> tags processed for srcset
- [ ] Document links captured (.pdf, .doc*, .xls*)
- [ ] All URLs normalized (absolute paths)

### Deduplication
- [ ] No exact URL duplicates in output
- [ ] No CDN versioning duplicates (same file, different params)
- [ ] Each URL has exactly one source attribution
- [ ] URL count decreased by 10–20% from raw extraction

### Classification Quality
- [ ] All items have visual_role assigned
- [ ] Visual role distribution reflects landing needs
- [ ] Quality assessment reasonable for sample review
- [ ] Stitch candidates reviewed for suitability
- [ ] Download priority consistent with quality/role

### Format Integrity
- [ ] CSV exports without formatting errors
- [ ] JSON valid and parseable
- [ ] All items have required fields
- [ ] No null values in critical fields (except optional size_kb)
- [ ] ID numbers unique and sequential

### Readiness for Download Phase
- [ ] high-priority items reviewed for accessibility
- [ ] At least 3–5 hero-level candidates identified
- [ ] Research/lab imagery candidates collected (8+)
- [ ] Community imagery candidates present (4+)
- [ ] Download URLs tested (sample of 10)

---

## K0.2C Download Phase

When K0.2B complete, K0.2C will:

1. **Validate all download_priority = high URLs** (ensure still accessible)
2. **Download high-priority images** to `05_EXPORT/stitch/images/{category}/`
3. **Optimize for web:**
   - Hero images: WebP format, ~2400x1600, ~300KB
   - Research/community: ~1200x800, ~150KB
   - Supporting: ~600x400, ~75KB
4. **Generate image index** with dimensions, file sizes, checksums
5. **Update Stitch manifests** with local image paths

---

## References

- **Media Discovery Engine:** `scripts/inventory-media-v2.js`
- **Story Graph Policy:** `docs/STORY_GRAPH_POLICY.md` (uses media in story positions)
- **Content Classification Policy:** `docs/CONTENT_CLASSIFICATION_POLICY_v2.md`
- **Folder Structure Policy:** `docs/FOLDER_STRUCTURE_POLICY.md`

---

**Last Updated:** 2026-06-29  
**Version:** v2  
**Phase:** K0.2B  
**Status:** Active (URL inventory phase)  
**Next Phase:** K0.2C (Binary download)
