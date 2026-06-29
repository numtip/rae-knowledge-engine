# Media Inventory Policy

## Overview

The Media Inventory Engine catalogs all media assets (images, PDFs, documents, logos, banners) discovered on the WTMS website.

**Important:** This phase inventories URLs and metadata only. No binary downloads.

The inventory supports:
- **Landing V2** — Hero images, research labs, community photos
- **Document Center** — PDFs, guides, forms
- **Research Portal** — Laboratory photos, project images
- **Partner Portal** — Partner logos, certificates
- **Archive** — Historical images and documents

## Media Asset Types

### Images
- **image/jpeg** — Photographs, diagrams
- **image/png** — Graphics, logos, icons
- **image/gif** — Animated GIFs (rare)
- **image/svg** — Vector graphics

### Documents
- **application/pdf** — PDF files
- **document** — Office documents (.doc, .docx, .xls, .xlsx)
- **archive** — Compressed files (.zip, .rar)

### Classification

| Asset Type | Use | Examples |
|-----------|-----|----------|
| **hero** | Landing page hero images | Building photos, research visuals |
| **research** | Research-related images | Laboratory, experiments, results |
| **laboratory** | Facility/equipment photos | Lab equipment, facilities |
| **community** | Community engagement photos | Group photos, events |
| **building** | Campus/facility photos | Main building, facilities |
| **partner-logo** | Partner organization logos | Government, university, NGO logos |
| **logo** | Institutional logos | RAE logo, department logos |
| **banner** | Web banners | Header images, promotional graphics |
| **icon** | UI/navigation icons | Small graphics, icons |
| **document** | Document cover images | Thumbnails, document scans |
| **archive** | Historical/low-quality images | Old photos, archived materials |
| **exclude** | Not suitable for website | Poor quality, irrelevant, redundant |

---

## Media Fields

### Identification
- **id** — Unique identifier (auto-assigned)
- **source_url** — Page containing the media link
- **asset_url** — Direct URL to the media file

### File Metadata
- **file_name** — Original filename (extracted from URL)
- **extension** — File extension (.jpg, .pdf, .png, etc.)
- **asset_type** — image | pdf | document | logo | banner | icon | unknown

### Content
- **alt_text** — Alt text or title (if available)
- **context** — Text surrounding the link (brief snippet)
- **width** — Image width (if available)
- **height** — Image height (if available)

### Classification
- **category** — landing | research | news | services | organization
- **usage_candidate** — Primary classification (hero, research, laboratory, etc.)
- **download_status** — not_downloaded | queued | downloaded | failed | excluded

### Metadata
- **size_kb** — File size (estimated from URL if available)
- **language** — th | en (detected from context)
- **notes** — Additional notes or flags

---

## Inventory Rules

### Priority Media for Landing V2

**Hero Images:**
- Institutional building
- Research facilities
- Community engagement
- Agricultural theme
- Modern/professional quality
- **Priority:** HIGH

**Research Images:**
- Laboratory equipment
- Research projects
- Innovation visuals
- Technology
- **Priority:** HIGH

**Community Images:**
- Farmers using technology
- Training/extension events
- Community partnership
- Local impact
- **Priority:** MEDIUM

**Building/Facility:**
- Campus photos
- Main research building
- Facilities
- **Priority:** MEDIUM

### Logos & Branding
- RAE institutional logo
- Partner logos (government, universities, NGOs)
- Department logos
- Quality badges
- **Exclude:** Duplicate, low-resolution, outdated logos

### Documents
- Research reports (PDF)
- Service guides
- Manuals
- Forms
- **Exclude:** Empty files, corrupted documents

### Banners & Promotions
- Useful for historical context: ARCHIVE
- Current/promotional: Include if on-brand
- Duplicate/low-quality: EXCLUDE

---

## Media Inventory CSV Format

```csv
source_url,asset_url,file_name,extension,asset_type,usage_candidate,alt_text,category,download_status,size_kb,notes
https://rae.mju.ac.th/about,https://rae.mju.ac.th/assets/images/building.jpg,building.jpg,jpg,image,hero,RAE Building,"landing","not_downloaded",250,"High-quality institutional building photo"
https://rae.mju.ac.th/research,https://rae.mju.ac.th/assets/lab/lab-1.jpg,lab-1.jpg,jpg,image,laboratory,Laboratory Photo,"research","not_downloaded",180,"Modern research laboratory"
https://rae.mju.ac.th/partners,https://rae.mju.ac.th/assets/logos/partner-1.png,partner-1.png,png,image,partner-logo,"Partner Logo","organization","not_downloaded",50,"Government ministry logo"
...
```

---

## Media Inventory JSON Schema

```json
{
  "metadata": {
    "generated": "2026-06-29T10:00:00Z",
    "total_items": 150,
    "usage_candidate_distribution": {
      "hero": 8,
      "research": 25,
      "laboratory": 12,
      "community": 15,
      "building": 6,
      "partner-logo": 30,
      "logo": 5,
      "banner": 10,
      "icon": 20,
      "document": 15,
      "archive": 20,
      "exclude": 0
    },
    "asset_type_distribution": {
      "image": 120,
      "pdf": 15,
      "document": 10,
      "other": 5
    },
    "download_status_distribution": {
      "not_downloaded": 150,
      "queued": 0,
      "downloaded": 0,
      "failed": 0
    }
  },
  "items": [
    {
      "id": "MEDIA-001",
      "source_url": "https://rae.mju.ac.th/about",
      "asset_url": "https://rae.mju.ac.th/assets/images/building.jpg",
      "file_name": "building.jpg",
      "extension": "jpg",
      "asset_type": "image",
      "usage_candidate": "hero",
      "alt_text": "RAE Building",
      "context": "The main research building...",
      "category": "landing",
      "width": 1200,
      "height": 800,
      "size_kb": 250,
      "download_status": "not_downloaded",
      "language": "th",
      "notes": "High-quality, suitable for homepage hero"
    }
  ]
}
```

---

## Image Map (Image-to-Usage Mapping)

```json
{
  "hero_candidates": [
    {
      "id": "MEDIA-001",
      "file_name": "building.jpg",
      "source_url": "https://rae.mju.ac.th/about",
      "confidence": 0.95,
      "recommendation": "Use as primary hero image"
    }
  ],
  "research_candidates": [
    {
      "id": "MEDIA-025",
      "file_name": "lab-1.jpg",
      "source_url": "https://rae.mju.ac.th/research/labs",
      "confidence": 0.90,
      "recommendation": "Use in research research cards"
    }
  ],
  "partner_logo_candidates": [
    {
      "id": "MEDIA-050",
      "file_name": "partner-1.png",
      "source_url": "https://rae.mju.ac.th/partners",
      "confidence": 0.85,
      "recommendation": "Add to partner carousel"
    }
  ]
}
```

---

## Inventory Workflow

### Step 1: Media Discovery
- Parse HTML for image tags (<img>, <picture>)
- Parse links to PDF and documents
- Extract URL, alt text, context

### Step 2: Duplicate Detection
- Identify duplicate URLs
- Detect similar images (visual similarity)
- Flag redundant assets

### Step 3: Classification
- Assign asset_type
- Assign usage_candidate
- Map to category
- Calculate confidence

### Step 4: Quality Assessment
- Check file existence (HTTP HEAD request)
- Estimate file size
- Identify low-quality (broken links, tiny images)

### Step 5: Output Generation
- Export CSV
- Export JSON
- Generate image-map
- Create report

---

## Dry-Run Workflow

```bash
rtk node scripts/inventory-media.js --dry-run
```

**Dry-run output:**
- Scans crawled HTML for media references
- Reports: total media items, distribution by type, usage candidates
- Does NOT download any files
- Does NOT modify 04_KNOWLEDGE/media/

**To commit inventory:**
```bash
rtk node scripts/inventory-media.js
```

**To download priority media (later phase):**
```bash
rtk node scripts/download-media.js --usage-candidate hero,research,laboratory
```

---

## Download Strategy (Future Phase)

**K0.1B:** Inventory only (no downloads)

**K0.2B:** Download strategy
- Download priority media (hero, research, laboratory)
- Validate image dimensions
- Optimize for web (convert to WebP, resize)
- Store in 02_CRAWLED/assets/images/
- Update inventory with local paths

**Constraints:**
- Skip images >5 MB
- Skip PDFs >10 MB
- Timeout: 30 seconds per request
- Retry: 3 times max
- Respect robots.txt

---

## Quality Criteria

### High-Quality Media
- ✅ Relevant to content
- ✅ Good resolution (>600px width for hero)
- ✅ Professional appearance
- ✅ Appropriate alt text
- ✅ Institutional branding

### Exclude
- ❌ Broken links (404)
- ❌ Tiny images (<100px)
- ❌ Low quality, blurry
- ❌ Duplicate content
- ❌ Promotional spam
- ❌ Copyrighted without license

---

**Last Updated:** 2026-06-29
