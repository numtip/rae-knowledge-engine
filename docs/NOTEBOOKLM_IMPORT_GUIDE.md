# NotebookLM Import Guide

## Overview

This guide explains how to prepare and import the extracted knowledge packages into Google NotebookLM.

## Prerequisites

- Google account with NotebookLM access
- Generated Markdown packages from Phase K0.4
- Organized notebook structure in `03_NOTEBOOKLM/`

---

## Notebook Structure

The extraction pipeline creates 6 NotebookLM-ready notebooks:

### Notebook00: Master Knowledge
**Purpose:** Complete RAE knowledge reference

**Contents:**
- README.md — Overview & usage guide
- Mission.md — Organizational mission
- Vision.md — Strategic vision
- Organization.md — Structure & contacts
- Research.md — Research initiatives
- Academic-Service.md — Student services
- FAQ.md — Frequently asked questions

**Size:** ~500-1000 KB
**Estimated Tokens:** ~150K-200K

---

### Notebook01: Landing
**Purpose:** Public-facing landing page knowledge

**Contents:**
- README.md — Navigation guide
- Landing.md — Main landing page
- Hero.md — Hero section & key messaging
- Core-Service.md — Core services overview
- Contact.md — Contact information

**Size:** ~100-200 KB
**Estimated Tokens:** ~30K-50K

---

### Notebook02: Research
**Purpose:** Research initiative catalog

**Contents:**
- README.md — Research overview
- Research.md — Main research description
- Projects.md — Active projects
- Innovation.md — Innovation areas
- Researchers.md — Key researchers (if available)

**Size:** ~200-400 KB
**Estimated Tokens:** ~50K-100K

---

### Notebook03: News (B.E. 2568)
**Purpose:** News from Buddhist Year 2568

**Contents:**
- README.md — News archive notes
- news-items.md — All 2568 news entries

**Size:** ~50-150 KB
**Estimated Tokens:** ~15K-40K

---

### Notebook04: News (B.E. 2569)
**Purpose:** News from Buddhist Year 2569

**Contents:**
- README.md — News archive notes
- news-items.md — All 2569 news entries

**Size:** ~100-300 KB
**Estimated Tokens:** ~30K-80K

---

### Notebook05: Organization
**Purpose:** Organizational details & services

**Contents:**
- README.md — Organization guide
- Structure.md — Organizational structure
- Services.md — Detailed service descriptions
- Departments.md — Department information

**Size:** ~150-300 KB
**Estimated Tokens:** ~40K-80K

---

## Import Process

### Step 1: Prepare Markdown Files

Ensure each notebook directory has:
- ✅ Markdown files (.md)
- ✅ Proper heading structure (H1 → H2 → H3)
- ✅ Clean, readable text
- ✅ No HTML or CSS
- ✅ No binary files

```bash
# Verify structure
ls -la 03_NOTEBOOKLM/Notebook00-Master/
# Output should show: README.md, Mission.md, Vision.md, etc.
```

### Step 2: Create NotebookLM Instance

1. Go to [notebooklm.google.com](https://notebooklm.google.com)
2. Click "Create new notebook"
3. Name it: `RAE-Notebook00-Master`
4. Add description: "RAE Knowledge Engine - Master Reference"

### Step 3: Upload Markdown Files

**Option A: Direct Upload (Recommended)**
1. Click "Upload files"
2. Select all .md files from `03_NOTEBOOKLM/Notebook00-Master/`
3. NotebookLM processes files automatically

**Option B: Copy-Paste Content**
1. Open README.md in text editor
2. Copy entire content
3. Paste into NotebookLM
4. Repeat for each file

**Option C: Web Import**
If hosted on web:
1. Upload Markdown files to web server
2. Provide URL to NotebookLM
3. NotebookLM fetches and processes

### Step 4: Verify Import

- ✅ All files recognized
- ✅ Content properly parsed
- ✅ Headings structured correctly
- ✅ Links functional
- ✅ No encoding errors

### Step 5: Create Guide Notes

Generate guide notes via NotebookLM:

1. Click "Study guide"
2. Let NotebookLM analyze the content
3. Review generated summary
4. Adjust as needed

---

## Import Checklist

### Pre-Import
- [ ] All Markdown files ready in `03_NOTEBOOKLM/Notebook**/`
- [ ] No binary files included
- [ ] Heading hierarchy verified (no H1 gaps)
- [ ] No dangling references
- [ ] All internal links resolved
- [ ] File sizes reasonable (<10 MB per notebook)

### Import
- [ ] Created NotebookLM notebooks
- [ ] Files uploaded successfully
- [ ] No parsing errors in NotebookLM
- [ ] Content fully indexed

### Post-Import
- [ ] Generated study guides for each notebook
- [ ] Verified FAQ generation
- [ ] Tested search functionality
- [ ] Created custom collections (if needed)

---

## Best Practices

### File Organization
- One topic per file (or closely related topics)
- Clear README.md in each notebook
- Consistent file naming (kebab-case)
- Logical section ordering

### Content Format
- Start each file with H1 heading (title)
- Use H2 for major sections
- Use H3 for subsections
- Max nesting depth: H4

### Example Structure

```
# Mission Statement  (H1)

## Overview  (H2)
Content here...

### History  (H3)
Content here...

### Current Focus  (H3)
Content here...

## Future Direction  (H2)
Content here...
```

### Linking
- **Internal Links:** `[Link text](filename.md)` or `[Link text](#section-heading)`
- **External Links:** `[Link text](https://example.com)` (NotebookLM handles these)
- **Avoid:** Broken links, circular references

### Markdown Tips
- Use `**bold**` for emphasis
- Use `*italic*` sparingly
- Use `- bullet points` for lists
- Use `1. numbered lists` for sequences
- Use `> blockquotes` for important info
- Use ` `code` ` for technical terms
- Use ` ```code blocks``` ` for examples

---

## Troubleshooting

### Issue: Files not uploading
**Solution:**
- Check file size (<50 MB per file)
- Verify Markdown syntax
- Try one file at a time
- Check browser console for errors

### Issue: Content parsing errors
**Solution:**
- Verify UTF-8 encoding
- Check for broken HTML entities
- Remove non-standard characters
- Simplify Markdown formatting

### Issue: Heading hierarchy issues
**Solution:**
- Ensure first heading is H1
- No H1 → H3 jumps (must be sequential)
- Use single H1 per file
- Use H2 for major sections

### Issue: Large file performance
**Solution:**
- Split into multiple files if >5 MB
- Reduce inline images (if any)
- Break into smaller sections
- Create index/TOC files

---

## Notebook Usage

Once imported, NotebookLM can:

### Generate Study Guides
- Auto-generate summaries
- Create key concepts list
- Generate questions for review

### Create Flashcards
- Study key terminology
- Practice recall

### Generate FAQ
- Auto-extract common questions
- Answer based on source material

### Search & Navigate
- Full-text search
- Jump to sections
- Cross-reference content

---

## Export & Distribution

### Share with Team
- NotebookLM provides share links
- Can set read-only or editable
- Version tracking available

### Export Formats
- **PDF:** Study guides, summaries
- **Text:** Raw content export
- **Citations:** Automatic source attribution

### Integration with AI Tools
- Copy content into ChatGPT
- Paste into Cursor AI
- Import into Google Stitch

---

## Maintenance

### Update Procedures
When source content changes:

1. Update Markdown files in `03_NOTEBOOKLM/`
2. Re-upload to NotebookLM (replaces old files)
3. NotebookLM re-indexes
4. Study guides regenerated

### Version Control
- Track Markdown files in git (separately)
- Document NotebookLM version dates
- Maintain changelog for updates

---

## Performance Expectations

| Notebook | Size | Upload Time | Index Time | Search Time |
|----------|------|-------------|-----------|------------|
| Master | ~1 MB | <1 min | ~2 min | <1 sec |
| Landing | ~200 KB | <30 sec | ~30 sec | <1 sec |
| Research | ~300 KB | <1 min | ~1 min | <1 sec |
| News 2568 | ~100 KB | <30 sec | ~30 sec | <1 sec |
| News 2569 | ~200 KB | <1 min | ~1 min | <1 sec |
| Organization | ~200 KB | <1 min | ~1 min | <1 sec |

---

## Support

- NotebookLM Help: https://support.google.com/notebooklm
- Markdown Guide: https://www.markdownguide.org/
- RAE Knowledge Pipeline: See [KNOWLEDGE_PIPELINE.md](KNOWLEDGE_PIPELINE.md)

---

**Last Updated:** 2026-06-29
