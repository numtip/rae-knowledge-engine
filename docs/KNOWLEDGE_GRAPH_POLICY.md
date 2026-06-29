# Knowledge Graph Policy

## Overview

The Knowledge Graph Engine builds a structured network of concepts, entities, and relationships from extracted content.

The graph enables:
- **Concept Mapping** — Visualize RAE's knowledge domains
- **Impact Tracking** — Follow research → innovation → community impact
- **Cross-referencing** — Discover connections between content
- **AI Training** — Provide semantic structure for LLMs
- **Navigation** — Generate smart internal links
- **Recommendations** — Surface related content

---

## Node Types

### Institutional Nodes
- **mission** — Organizational mission statement
- **vision** — Strategic vision
- **organization** — Departments, units
- **contact** — Contact information, locations

### Content Nodes
- **service** — Academic/public services
- **research** — Research initiatives, projects
- **project** — Specific research projects
- **researcher** — Individual researchers
- **news** — News announcements
- **document** — Publications, reports, guides

### External Nodes
- **partner** — Partner organizations
- **community** — Community groups, stakeholders
- **impact** — Community outcomes, benefits

### Structural Nodes
- **category** — Content classification
- **topic** — Thematic grouping
- **keyword** — Subject tags

---

## Node Fields

### Identification
- **id** — Unique node identifier (RAE-NODE-type-####)
- **label** — Display name
- **type** — mission | vision | organization | service | research | project | researcher | news | document | partner | community | impact | contact

### Classification
- **category** — landing | research | services | organization | news | other
- **importance** — 1–5 (critical to optional)

### Source Tracking
- **source_ids** — Array of content IDs that contributed to this node
- **source_urls** — Original URLs

### Content
- **description** — Brief summary (1-2 sentences)
- **details** — Expanded description
- **keywords** — Array of topic keywords

---

## Relationship Types

### Structural Relationships
- **part_of** — Component of larger entity
  - Example: Department part_of Organization
- **belongs_to** — Membership/affiliation
  - Example: Researcher belongs_to Department

### Functional Relationships
- **provides** — Service/resource
  - Example: Service provides Support to Community
- **produces** — Output/creation
  - Example: Research produces Innovation
- **supports** — Enablement/assistance
  - Example: Academic Services supports Researchers

### Impact Relationships
- **benefits** — Positive outcome for
  - Example: Service benefits Farmers
- **impacts** — Creates change for
  - Example: Innovation impacts Community

### Informational Relationships
- **related_to** — Topically connected
  - Example: Research related_to Technology Transfer
- **references** — Cites or mentions
  - Example: Publication references Research Project
- **contact_for** — Point of contact
  - Example: Department contact_for Service

---

## Core Relationship Model

### Research Pipeline
```
Research →[produces]→ Knowledge Creation
Knowledge Creation →[supports]→ Innovation
Innovation →[produces]→ Technology Transfer
Technology Transfer →[benefits]→ Farmers
Technology Transfer →[impacts]→ Community Impact
Research →[supports]→ Academic Services
Academic Services →[provides]→ Public Services
Public Services →[benefits]→ Community
Community Impact →[part_of]→ Sustainable Development
```

### Service Ecosystem
```
Organization →[part_of]→ Ministry/Network
Department →[part_of]→ Organization
Service →[belongs_to]→ Department
Service →[provides]→ Support
Support →[benefits]→ Farmers/Public
Researcher →[belongs_to]→ Department
Researcher →[produces]→ Research
Research →[related_to]→ Service
```

### News & Communication
```
News →[references]→ Research
News →[references]→ Service
News →[impacts]→ Community
News →[related_to]→ Partner
```

### Knowledge Dissemination
```
Research →[produces]→ Publication
Publication →[references]→ Related Research
Publication →[supports]→ Learning
Learning →[benefits]→ Students/Professionals
```

---

## Knowledge Graph JSON Schema

```json
{
  "metadata": {
    "generated": "2026-06-29T10:00:00Z",
    "total_nodes": 350,
    "total_relationships": 500,
    "node_type_distribution": {
      "mission": 1,
      "vision": 1,
      "organization": 8,
      "service": 40,
      "research": 50,
      "project": 80,
      "researcher": 30,
      "news": 60,
      "document": 25,
      "partner": 20,
      "community": 15,
      "impact": 10,
      "contact": 10
    }
  },
  "nodes": [
    {
      "id": "RAE-NODE-MISSION-001",
      "label": "Advance Research and Education",
      "type": "mission",
      "category": "landing",
      "importance": 5,
      "description": "RAE's core mission to advance agricultural research and education.",
      "source_ids": ["RAE-LANDING-001"],
      "source_urls": ["https://rae.mju.ac.th/mission"],
      "keywords": ["mission", "research", "education", "agriculture"]
    },
    {
      "id": "RAE-NODE-RESEARCH-001",
      "label": "Thai Language NLP",
      "type": "research",
      "category": "research",
      "importance": 4,
      "description": "Research on natural language processing for Thai language.",
      "source_ids": ["RAE-RESEARCH-20260629-001"],
      "source_urls": ["https://rae.mju.ac.th/wtms_webpageDetail.aspx?wID=2064"],
      "keywords": ["nlp", "thai-language", "research"]
    }
  ],
  "relationships": [
    {
      "source_id": "RAE-NODE-RESEARCH-001",
      "target_id": "RAE-NODE-IMPACT-001",
      "relationship_type": "impacts",
      "confidence": 0.85,
      "evidence": ["mentioned in project description", "community feedback"],
      "weight": 0.85,
      "description": "This research directly impacts community NLP adoption"
    }
  ]
}
```

---

## Relationship CSV Format

```csv
source_id,source_label,target_id,target_label,relationship_type,confidence,evidence,weight
RAE-NODE-RESEARCH-001,Thai Language NLP,RAE-NODE-SERVICE-001,Academic Services,produces,0.90,"Research supports service offerings","0.90"
RAE-NODE-SERVICE-001,Academic Services,RAE-NODE-COMMUNITY-001,Farmers,benefits,0.85,"Service targets farmer training","0.85"
RAE-NODE-COMMUNITY-001,Farmers,RAE-NODE-IMPACT-001,Increased Productivity,impacts,0.80,"Farmer feedback indicates productivity gains","0.80"
...
```

---

## Graph Construction Workflow

### Step 1: Node Extraction
- Extract entity mentions from content
- Identify key concepts
- Create nodes for significant entities
- Assign node types based on content context

### Step 2: Relationship Discovery
- Identify entity mentions in same content → `related_to`
- Match content relationships → `produces`, `supports`, `benefits`
- Extract explicit connections → `part_of`, `belongs_to`
- Track citations → `references`, `contact_for`

### Step 3: Confidence Scoring
- Direct mention → confidence 0.9+
- Inferred from context → confidence 0.7–0.9
- Weak/uncertain → confidence 0.5–0.7
- Speculation → confidence <0.5 (exclude)

### Step 4: Graph Optimization
- Remove duplicate nodes (merge if appropriate)
- Consolidate weak connections (weight <0.6)
- Identify high-influence nodes (many relationships)
- Detect communities/clusters

### Step 5: Validation & Export
- Validate node–relationship consistency
- Check for cycles/orphans
- Generate statistics
- Export to JSON and CSV

---

## Dry-Run Workflow

```bash
rtk node scripts/build-knowledge-graph.js --dry-run
```

**Dry-run output:**
- Loads classified content
- Identifies nodes and relationships
- Reports: node count, relationship count, connected components
- Does NOT modify 04_KNOWLEDGE/graph/

**To build graph:**
```bash
rtk node scripts/build-knowledge-graph.js
```

**Graph Visualization (future):**
```bash
# Export for visualization in Neo4j, Cytoscape, or D3
rtk node scripts/export-graph-formats.js --format neo4j
rtk node scripts/export-graph-formats.js --format d3
```

---

## Use Cases

### Content Discovery
- **Find related research:** Query graph for nodes connected to a research item
- **Suggest reading order:** Follow paths from mission → research → technology transfer → community impact
- **Cross-link content:** Automatically suggest links between related knowledge items

### Knowledge Navigation
- **Explore departments:** Map organizational structure
- **Find services:** Query "what services support [topic]?"
- **Locate experts:** "Who researches [topic]?"

### AI & Language Models
- **Knowledge enrichment:** Provide semantic context for LLMs
- **Relationship extraction:** Train models to extract relationships from new content
- **Query answering:** Use graph to ground LLM responses in structured knowledge

### Analytics
- **Impact analysis:** Trace research → innovation → community benefits
- **Service analysis:** Which services have broadest reach?
- **Collaboration mapping:** Which researchers/departments collaborate?

---

## Quality Standards

### Node Quality
- ✅ Distinct, non-redundant entities
- ✅ Clear label and description
- ✅ Proper type classification
- ✅ Linked to source content
- ❌ Duplicate nodes (merge before export)
- ❌ Isolated nodes (no relationships)

### Relationship Quality
- ✅ Clear, meaningful connections
- ✅ Confidence score ≥ 0.5
- ✅ Supported by evidence
- ✅ Consistent direction
- ❌ Circular or contradictory
- ❌ Unsupported by source content

---

## Integration Points

### Downstream Use
- **Knowledge Schema:** Graph relationships → related_topics in JSON items
- **Notebooks:** Graph structure → chapter organization in NotebookLM packages
- **Search/Discovery:** Graph enables semantic search
- **AI Assistants:** Graph provides grounding for LLM responses

---

**Last Updated:** 2026-06-29
