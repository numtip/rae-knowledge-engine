# Taxonomy Policy

## Overview

The Taxonomy Engine organizes RAE knowledge into hierarchical categories and navigation structures.

The taxonomy supports:
- **Content Organization** — Logical grouping by topic
- **Navigation Architecture** — Website sitemap and menu structure
- **Search & Filtering** — Category-based content discovery
- **Publishing** — Route content to correct channels (Landing, Research Portal, etc.)
- **Analytics** — Track usage by category
- **API Integration** — Provide category endpoints for AI, chatbots, Stitch

---

## Top-Level Taxonomy

### Primary Categories

| Category | Purpose | Content Types | Priority |
|----------|---------|---------------|----------|
| **landing** | Public entry point | Mission, Vision, Core Services, Contact | P0 |
| **about** | Institutional info | Organization, History, Leadership | P0 |
| **research** | Research hub | Projects, Publications, Researchers, Labs | P1 |
| **academic-services** | Services catalog | Training, Consulting, Testing, Extension | P1 |
| **document-center** | Knowledge repository | Guides, Reports, Manuals, Forms | P1 |
| **news** | News & announcements | News items, Events, Announcements | P1 |
| **organization** | Structure & contacts | Departments, Units, Staff, Contacts | P1 |
| **contact** | Contact information | Phone, Email, Address, Hours | P0 |
| **partners** | Partner directory | Partner organizations, Links | P2 |
| **media** | Media assets | Photos, Videos, Logos | P2 |
| **archive** | Historical content | Old news, Archived pages, Legacy docs | P3 |

---

## Document Center Taxonomy

**Scope:** Knowledge repository and resource library

```
document-center/
├── administration/
│   ├── accounting                   (งานคลัง)
│   ├── supplies-management          (งานพัสดุ)
│   ├── personnel                    (งานบุคลากร)
│   └── policies-procedures          (นโยบาย)
│
├── research/
│   ├── research-guides              (คู่มือวิจัย)
│   ├── research-reports             (รายงานวิจัย)
│   ├── publications                 (ผลงานตีพิมพ์)
│   ├── datasets                     (ข้อมูลวิจัย)
│   └── research-portal              (Research Portal)
│
├── academic-services/
│   ├── training-programs            (โครงการอบรม)
│   ├── consulting-guides            (คู่มือให้บริการวิชาการ)
│   ├── lab-services                 (ห้องปฏิบัติการ)
│   ├── testing-services             (บริการทดสอบ)
│   ├── extension-guides             (คู่มือวิทยากร)
│   └── service-forms                (แบบฟอร์ม)
│
├── green-office/
│   ├── policies                     (นโยบาย)
│   ├── practices                    (แนวปฏิบัติ)
│   ├── reports                      (รายงาน)
│   └── certification                (หนังสือรับรอง)
│
├── quality-assurance/
│   ├── standards                    (มาตรฐาน)
│   ├── procedures                   (วิธีการ)
│   ├── audit-reports                (รายงานประเมิน)
│   └── certifications               (ใบรับรอง)
│
└── learning-center/
    ├── how-to-guides                (วิธีการใช้)
    ├── tutorials                    (บทเรียน)
    ├── faq                          (คำถามที่พบบ่อย)
    └── webinars                     (ห้องเรียนออนไลน์)
```

---

## Research Taxonomy

**Scope:** Research initiatives, projects, outputs

```
research/
├── research-areas/
│   ├── sustainable-agriculture     (การเกษตรยั่งยืน)
│   ├── biotechnology               (เทคโนโลยีชีววิทยา)
│   ├── food-safety                 (ความปลอดภัยอาหาร)
│   ├── environmental-science       (วิทยาศาสตร์สิ่งแวดล้อม)
│   └── technology-transfer         (ถ่ายทำเทคโนโลยี)
│
├── research-projects/
│   ├── active-projects             (โครงการปัจจุบัน)
│   ├── completed-projects          (โครงการเสร็จสิ้น)
│   ├── collaborative-projects      (โครงการร่วมมือ)
│   └── international-projects      (โครงการนานาชาติ)
│
├── researchers/
│   ├── faculty                     (อาจารย์)
│   ├── researchers                 (นักวิจัย)
│   ├── students                    (นักศึกษา)
│   └── alumni                      (ศิษย์เก่า)
│
├── publications/
│   ├── journals                    (วารสาร)
│   ├── proceedings                 (การประชุมวิชาการ)
│   ├── books                       (หนังสือ)
│   ├── technical-reports           (รายงานเทคนิค)
│   └── working-papers              (เอกสารการทำงาน)
│
├── research-facilities/
│   ├── laboratories                (ห้องปฏิบัติการ)
│   ├── equipment                   (อุปกรณ์)
│   ├── growing-facilities          (สถานที่ปลูก)
│   └── analytical-centers          (ศูนย์วิเคราะห์)
│
├── innovation/
│   ├── technology-developed        (เทคโนโลยีที่พัฒนา)
│   ├── patents                     (สิทธิบัตร)
│   ├── technology-adoption         (การนำเทคโนโลยี)
│   └── impact-stories              (เรื่องราวผลกระทบ)
│
└── research-services/
    ├── consulting                  (ให้คำปรึกษา)
    ├── training                    (การอบรม)
    ├── testing-analysis            (การทดสอบ/วิเคราะห์)
    └── collaboration               (ความร่วมมือวิจัย)
```

---

## Academic Services Taxonomy

**Scope:** Training, consulting, public services

```
academic-services/
├── training/
│   ├── professional-training       (อบรมวิชาชีพ)
│   ├── workshops                   (สัมมนา)
│   ├── courses                     (หลักสูตร)
│   ├── online-training             (อบรมออนไลน์)
│   └── certification-programs      (โปรแกรมรับรอง)
│
├── consulting/
│   ├── agricultural-consulting     (ให้คำปรึกษา การเกษตร)
│   ├── business-consulting         (ให้คำปรึกษา ธุรกิจ)
│   ├── technology-consulting       (ให้คำปรึกษา เทคโนโลยี)
│   └── management-consulting       (ให้คำปรึกษา จัดการ)
│
├── laboratory-services/
│   ├── soil-testing                (วิเคราะห์ดิน)
│   ├── water-testing               (วิเคราะห์น้ำ)
│   ├── plant-testing               (วิเคราะห์พืช)
│   ├── food-analysis               (วิเคราะห์อาหาร)
│   └── microbiology                (ไมโครไบโอโลยี)
│
├── extension-services/
│   ├── farmer-support              (สนับสนุนเกษตรกร)
│   ├── community-programs          (โครงการชุมชน)
│   ├── technology-transfer         (ถ่ายทำเทคโนโลยี)
│   ├── extension-agents            (วิทยากรวิทยาศาสตร์)
│   └── demonstration-sites         (สถานที่สาธารณะ)
│
├── certification/
│   ├── quality-certification       (รับรองคุณภาพ)
│   ├── food-safety                 (รับรองความปลอดภัยอาหาร)
│   ├── organic-certification       (รับรองเกษตรอินทรีย์)
│   └── standards                   (มาตรฐาน)
│
├── public-engagement/
│   ├── outreach                    (การเข้าถึงสาธารณะ)
│   ├── exhibitions                 (นิทรรศการ)
│   ├── field-days                  (วันสาธารณะในแปลง)
│   └── open-days                   (วันเปิดอำนวยการ)
│
└── forms-and-procedures/
    ├── service-request-forms       (แบบขอรับบริการ)
    ├── application-forms           (แบบสมัคร)
    ├── reporting-forms             (แบบรายงาน)
    └── guidelines                  (แนวทาง)
```

---

## News Taxonomy

**Scope:** News and announcements (B.E. 2568–2569)

```
news/
├── research-news/                  (ข่าววิจัย)
│   ├── research-updates            (อัปเดตวิจัย)
│   ├── research-highlights         (ไฮไลท์วิจัย)
│   └── research-achievements       (สำเร็จการวิจัย)
│
├── academic-service-news/          (ข่าวบริการวิชาการ)
│   ├── new-services                (บริการใหม่)
│   ├── service-updates             (อัปเดตบริการ)
│   └── service-achievements        (ความสำเร็จบริการ)
│
├── training-news/                  (ข่าวการอบรม)
│   ├── upcoming-trainings          (อบรมที่จะมา)
│   ├── training-results            (ผลการอบรม)
│   └── training-success            (เรื่องสำเร็จการอบรม)
│
├── community-news/                 (ข่าวชุมชน)
│   ├── farmer-success              (เรื่องสำเร็จเกษตรกร)
│   ├── community-engagement        (ความเข้าไขว่วกับชุมชน)
│   └── social-impact               (ผลกระทบสังคม)
│
├── award-news/                     (ข่าวรางวัล)
│   ├── prizes-won                  (รางวัลที่ได้รับ)
│   ├── recognition                 (การเสรรมสรรค์)
│   └── certifications              (ใบรับรอง)
│
├── cooperation-news/               (ข่าวความร่วมมือ)
│   ├── partnerships                (ความเป็นหุ้นส่วน)
│   ├── collaborations              (ความร่วมมือ)
│   └── mou-agreements              (บันทึกข้อตกลง)
│
├── innovation-news/                (ข่าวนวัตกรรม)
│   ├── innovation-launches         (เปิดตัวนวัตกรรม)
│   ├── technology-adoption         (นำเทคโนโลยีใช้)
│   └── impact-stories              (เรื่องราวผลกระทบ)
│
├── events/                         (ข่าวกิจกรรม)
│   ├── upcoming-events             (กิจกรรมที่จะมา)
│   ├── event-reports               (รายงานกิจกรรม)
│   ├── conferences                 (การประชุมวิชาการ)
│   └── open-days                   (วันเปิดอำนวยการ)
│
└── announcements/                  (ประกาศ)
    ├── important-updates           (อัปเดตสำคัญ)
    ├── policy-changes              (การเปลี่ยนนโยบาย)
    ├── service-changes             (การเปลี่ยนบริการ)
    └── admin-notices               (ประกาศบริหาร)
```

---

## Category Map

Maps content items to primary category:

```json
{
  "category_map": {
    "landing": {
      "path": "/",
      "label": "Landing",
      "priority": 0,
      "icon": "home",
      "items_count": 5
    },
    "research": {
      "path": "/research",
      "label": "Research",
      "priority": 1,
      "icon": "microscope",
      "subcategories": ["research-areas", "projects", "publications"],
      "items_count": 150
    },
    "academic-services": {
      "path": "/services",
      "label": "Academic Services",
      "priority": 1,
      "icon": "briefcase",
      "subcategories": ["training", "consulting", "lab-services"],
      "items_count": 80
    },
    "news": {
      "path": "/news",
      "label": "News",
      "priority": 1,
      "icon": "newspaper",
      "subcategories": ["research-news", "service-news", "announcements"],
      "items_count": 60
    }
  }
}
```

---

## Navigation Map

Defines website navigation structure and menu hierarchy:

```json
{
  "main_navigation": [
    {
      "label": "Home",
      "path": "/",
      "icon": "home"
    },
    {
      "label": "About",
      "path": "/about",
      "icon": "info",
      "submenu": [
        { "label": "Mission & Vision", "path": "/about/mission" },
        { "label": "Organization", "path": "/about/organization" },
        { "label": "Contact", "path": "/about/contact" }
      ]
    },
    {
      "label": "Research",
      "path": "/research",
      "icon": "microscope",
      "submenu": [
        { "label": "Research Areas", "path": "/research/areas" },
        { "label": "Active Projects", "path": "/research/projects" },
        { "label": "Publications", "path": "/research/publications" },
        { "label": "Researchers", "path": "/research/researchers" }
      ]
    },
    {
      "label": "Services",
      "path": "/services",
      "icon": "briefcase",
      "submenu": [
        { "label": "Training", "path": "/services/training" },
        { "label": "Consulting", "path": "/services/consulting" },
        { "label": "Lab Services", "path": "/services/lab-services" },
        { "label": "Extension", "path": "/services/extension" }
      ]
    },
    {
      "label": "Documents",
      "path": "/documents",
      "icon": "file",
      "submenu": [
        { "label": "Research Guides", "path": "/documents/research" },
        { "label": "Service Guides", "path": "/documents/services" },
        { "label": "Forms", "path": "/documents/forms" }
      ]
    },
    {
      "label": "News",
      "path": "/news",
      "icon": "newspaper",
      "submenu": [
        { "label": "Latest News", "path": "/news/latest" },
        { "label": "2569", "path": "/news/2569" },
        { "label": "2568", "path": "/news/2568" }
      ]
    }
  ]
}
```

---

## Taxonomy Workflow

### Step 1: Content Assessment
- Review classified content
- Map to primary category
- Identify subcategories
- Flag cross-cutting items

### Step 2: Hierarchy Construction
- Build category tree
- Define parent-child relationships
- Assign priority levels
- Create navigation paths

### Step 3: Validation
- Check coverage (all content assigned)
- Detect orphans (no category)
- Verify hierarchy (no cycles)
- Validate paths (no duplicates)

### Step 4: Export & Distribution
- Generate category-map.json
- Generate navigation-map.json
- Update taxonomy.json
- Create documentation

---

## Dry-Run Workflow

```bash
rtk node scripts/build-taxonomy.js --dry-run
```

**Dry-run output:**
- Loads classified content
- Constructs category tree
- Reports: category distribution, hierarchy depth, coverage
- Does NOT modify 04_KNOWLEDGE/taxonomy/

**To build taxonomy:**
```bash
rtk node scripts/build-taxonomy.js
```

---

## Use Cases

### Content Publishing
- Route content to correct channel (Landing, Research Portal, etc.)
- Organize by category in navigation
- Generate breadcrumb trails

### Search & Discovery
- Category-based filtering
- Browse by topic
- Related item suggestions

### API Endpoints
```
GET /api/categories                    # List all categories
GET /api/categories/{category}         # Get category details
GET /api/categories/{category}/items   # Get items in category
GET /api/navigation                    # Get navigation structure
```

### Analytics
- Track usage by category
- Measure content reach
- Identify popular topics

---

**Last Updated:** 2026-06-29
