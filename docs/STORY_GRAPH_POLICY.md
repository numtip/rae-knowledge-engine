# Story Graph Policy — K0.2B
**RAE Knowledge Engine**  
**Generated:** 2026-06-29  
**Phase:** K0.2B  
**Status:** Active

---

## Table of Contents
1. [Overview](#overview)
2. [Story Arc Model](#story-arc-model)
3. [Narrative Roles](#narrative-roles)
4. [Content Mapping](#content-mapping)
5. [Landing Page Sections](#landing-page-sections)
6. [Stitch Integration](#stitch-integration)
7. [Verification Checklist](#verification-checklist)

---

## Overview

The **Story Graph** transforms classified content into a coherent narrative structure for Stitch/NotebookLM consumption. Rather than presenting content as disconnected facts, the story graph organizes content into a 10-position narrative arc that flows from mission through impact to future vision.

**Purpose:**
- Guide landing page architecture and content placement
- Organize content for Stitch multi-channel export
- Create narrative coherence for NotebookLM notebook structure
- Enable content editors to understand content roles in broader story

**Output Files:**
- `04_KNOWLEDGE/graph/story-graph.json` — Story arc with node mappings
- `04_KNOWLEDGE/graph/story-sequence.md` — Narrative sequence with coverage assessment
- `05_EXPORT/stitch/STITCH_STORY_BRIEF_WAVE1.md` — Stitch briefing document
- `05_EXPORT/stitch/STITCH_CONTENT_STRUCTURE_WAVE1.json` — Content-to-section mapping

**Creator:** `scripts/build-story-graph.js` (v1)

---

## Story Arc Model

The RAE Knowledge Engine uses a **10-position narrative arc** that traces the flow from institutional mission through research, innovation, services, impact, and future vision:

### Arc Positions

| Position | Node ID | Title | Role | Purpose | Priority |
|----------|---------|-------|------|---------|----------|
| 1 | `mission` | Mission & Vision | Opening | Why RAE exists and where going | CRITICAL |
| 2 | `research` | Research Excellence | Credibility | Scientific expertise demonstrated | CRITICAL |
| 3 | `knowledge-creation` | Knowledge Creation | Capability | How we discover knowledge | HIGH |
| 4 | `innovation` | Innovation | Capability | What solutions we develop | HIGH |
| 5 | `academic-services` | Academic Services | Service | Training/consulting/lab services | HIGH |
| 6 | `technology-transfer` | Technology Transfer | Proof | How innovation reaches users | MEDIUM |
| 7 | `community-impact` | Community Impact | Impact | Real-world benefits shown | MEDIUM |
| 8 | `sustainable-agriculture` | Sustainable Agriculture | Ecosystem | Environmental responsibility | MEDIUM |
| 9 | `knowledge-ecosystem` | Knowledge Ecosystem | Ecosystem | Networks and partnerships | MEDIUM |
| 10 | `future` | Future Agriculture | Future | Vision for next generation | MEDIUM |

**Arc Flow:**
```
MISSION (Why?)
    ↓
RESEARCH (What?)
    ↓
KNOWLEDGE (How?)
    ↓
INNOVATION (What new?)
    ↓
SERVICES (How to access?)
    ↓
TRANSFER (How to scale?)
    ↓
IMPACT (What changes?)
    ↓
SUSTAINABILITY (Why matters?)
    ↓
ECOSYSTEM (How connects?)
    ↓
FUTURE (Where next?)
```

---

## Narrative Roles

Each content item in the story graph is assigned a **narrative role** that explains its function in the overall narrative:

| Role | Description | Example Use | Impact on Story |
|------|-------------|-------------|-----------------|
| `opening` | Establishes mission/context | Mission/vision statement | Sets stakes, establishes identity |
| `credibility` | Demonstrates expertise | Research achievements, track record | Builds trust, shows capability |
| `capability` | Shows what's possible | Technology, research methods, facilities | Explains what differentiates RAE |
| `service` | Offers tangible help | Training programs, consulting, lab services | Shows customer value |
| `proof` | Demonstrates results | Case studies, impact stories, adoption rates | Validates claims with evidence |
| `impact` | Shows real-world benefits | Farmer testimonials, community outcomes | Emotional connection, relevance |
| `ecosystem` | Reveals connections | Partnerships, networks, knowledge systems | Places RAE in larger context |
| `future` | Projects forward vision | Strategic roadmap, emerging technologies | Inspires, shows momentum |

**Assignment Rules:**
- Mission/Vision content → `opening`
- Research achievements → `credibility`
- Research methods, facilities, capabilities → `capability`
- Training, consulting, lab services → `service`
- Technology transfer, adoption stories → `proof`
- Community benefits, farmer testimonials → `impact`
- Partnerships, multi-institutional work → `ecosystem`
- Strategic goals, emerging directions → `future`

---

## Content Mapping

The story graph **maps classified content** to story positions using these rules:

### Automatic Mapping

| Content Category | Maps To | Mapping Rule |
|-----------------|---------|--------------|
| Landing page content | All positions (distributed) | Spread to avoid concentration |
| Research | research + knowledge-creation | Core content for demonstration |
| Services | academic-services + innovation + technology-transfer | Multiple angles showing value |
| Organization | knowledge-ecosystem | System/partnership focus |
| News (2568–2569) | community-impact + sustainable-agriculture | Current outcomes/benefits |
| News (pre-2568) | archive | Historical reference only |

### Confidence Scoring

Story nodes receive a **coverage confidence score** based on:
- **0.0–0.33:** Severely under-resourced (missing content)
- **0.34–0.66:** Moderately resourced (acceptable)
- **0.67–1.0:** Well-resourced (strong coverage)

**Confidence Formula:**
```
confidence = min(1.0, number_of_source_items / 3)
```
*Rationale: One source = 33%, two sources = 66%, three+ sources = 100%*

### Duplicate Detection

If multiple content items map to same story position:
1. Keep highest-importance item as primary
2. Use others as supporting evidence
3. Mark for potential merge in K0.3 normalization

---

## Landing Page Sections

The story arc maps to **landing page sections** for visual/UX organization:

| Section | Story Nodes | Purpose | Position | Content Style |
|---------|------------|---------|----------|---------------|
| Hero | mission, vision | "Why RAE" hook | Top, full-width | Large image + tagline |
| At-a-Glance | research | Quick credibility | Below hero | 3–4 stat blocks |
| Research | knowledge-creation | Deep dive | Mid-page | Detailed content, images |
| Services | academic-services, technology-transfer | "How to engage" | Mid-page section | Cards, contact CTA |
| Impact | community-impact, sustainable-agriculture | "Real benefits" | Mid-page section | Stories, testimonials |
| Ecosystem | knowledge-ecosystem | "Broader context" | Lower mid-page | Network diagram |
| Footer | future, contact | "Next steps" | Bottom | Links, closing message |

**Responsive Behavior:**
- Mobile: Stack sections vertically, truncate At-a-Glance to 2 stats
- Tablet: 2-column layout for Research and Services sections
- Desktop: Full layout with image placements optimized

---

## Stitch Integration

The story graph enables **Stitch multi-channel export** by organizing content for:

### Notebook Structure
Each NotebookLM notebook maps to story positions:

| Notebook | Story Positions | Focus |
|----------|-----------------|-------|
| **Master** | All 10 positions | Complete narrative |
| **Landing V2** | hero + at-a-glance + research + services + impact | Public-facing landing story |
| **Research** | research + knowledge-creation + innovation | Deep research focus |
| **Services** | academic-services + technology-transfer | Service/engagement focus |
| **Impact** | community-impact + sustainable-agriculture + ecosystem | Benefits and outcomes |

### Content Export Format
For each notebook:
1. Extract all content items for target story positions
2. Sort by source importance (5→1)
3. Group by story position (h1 for position title, h2 for source)
4. Include metadata (confidence, source URL) in footer

**Example (Impact Notebook):**
```
# Community Impact Section

## Story Position: Community Impact (78% coverage)
- [Source 1: Farmer Training Results](url) — High importance
- [Source 2: Cooperative Success](url) — Medium importance

## Story Position: Sustainable Agriculture (65% coverage)
- [Source 1: Environmental Research](url) — High importance

## Coverage Assessment
⚠️ Knowledge Ecosystem position needs strengthening
→ Recommended action: Add partnership content in K0.3
```

---

## Verification Checklist

Before finalizing story graph for Stitch export:

### Narrative Completeness
- [ ] Mission position populated (opening role established)
- [ ] Research position populated (credibility established)
- [ ] At least 3 positions have supporting content
- [ ] Future position defined (even if minimal)

### Coverage Assessment
- [ ] 0–2 positions at <0.33 coverage (under-resourced)
- [ ] At least 50% of positions at >0.50 confidence
- [ ] No position over-resourced (>5 items per position)

### Content Quality
- [ ] All mapped items have KEEP or REWRITE action
- [ ] No ARCHIVE/EXCLUDE items in story graph
- [ ] No content duplicates within story position
- [ ] Confidence scores calculated for all positions

### Stitch Readiness
- [ ] Story structure saved as JSON
- [ ] Section mapping documented in markdown
- [ ] Candidate items extracted for each section
- [ ] Media candidates flagged for integration
- [ ] Missing content gaps identified for K0.3

### Documentation
- [ ] Story sequence markdown generated
- [ ] Stitch story brief document created
- [ ] Content structure JSON for Stitch readable
- [ ] Coverage gaps documented with recommendations

---

## K0.3 Expansion Recommendations

Based on Wave 1 story graph, K0.3 should:

1. **Research Position:** Add specific project descriptions (lab details, team bios)
2. **Community Impact:** Collect farmer testimonials, quantified outcomes
3. **Services:** Expand training program descriptions, pricing, enrollment
4. **Technology Transfer:** Document spin-off companies, adoption cases
5. **Ecosystem:** Map partnerships with universities, research institutes
6. **Future:** Develop strategic roadmap content (1–5 year vision)

---

## References

- **Classification Policy:** `docs/CONTENT_CLASSIFICATION_POLICY.md` (v2)
- **Folder Structure Policy:** `docs/FOLDER_STRUCTURE_POLICY.md`
- **Story Graph Builder:** `scripts/build-story-graph.js`
- **Stitch Consumption Plan:** `docs/STITCH_CONSUMPTION_PLAN.md`

---

**Last Updated:** 2026-06-29  
**Next Review:** After K0.2C completion  
**Status:** Active (Wave 1)
