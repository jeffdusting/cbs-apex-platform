# Stage 2: Claude and Manus Artefact Extraction Guide

> Practical instructions for progressively extracting IP artefacts from Claude projects and Manus sessions into the river-config knowledge base.

**Created:** 9 April 2026

---

## The Problem

Claude and Manus both produce valuable IP artefacts during conversations and sessions, but neither platform currently offers a one-click "export all artefacts" function. This guide provides the practical workarounds.

---

## Part A: Extracting from Claude Projects

Claude does not have a "Settings > Account > Export Data" path. The actual extraction methods are as follows:

### Method 1: Manual Artefact Copy (Immediate, No Tools Required)

This is the most reliable method for Claude project artefacts.

**Steps:**

1. Open each Claude project at [claude.ai](https://claude.ai)
2. Navigate to the project's conversations
3. For each conversation containing substantial artefacts, the following content should be extracted:
   - Click on any artefact (code, document, analysis) that Claude generated
   - Use the "Copy" button on the artefact to copy its content
   - Paste into a new markdown file in the knowledge base directory
4. Name the file following the convention: `claude-artefact-[descriptive-name].md`
5. Add a metadata header to each file:

```markdown
# [Artefact Title]

> Extracted from Claude project: [Project Name]
> Conversation: [Conversation Title/Date]

**Extraction date:** [Date]

---

[Paste artefact content here]
```

### Method 2: Conversation-Level Copy (For Long Conversations)

For conversations with multiple artefacts or extensive analysis:

1. Open the conversation in Claude
2. Scroll through and identify all substantive outputs
3. Use browser developer tools (F12 > Console) to extract the full conversation:

```javascript
// Run this in the browser console on a Claude conversation page
// It extracts all assistant messages as text
const messages = document.querySelectorAll('[data-testid="chat-message-content"]');
let output = '';
messages.forEach((msg, i) => {
    output += `\n\n--- Message ${i+1} ---\n\n` + msg.innerText;
});
copy(output);
console.log('Copied ' + messages.length + ' messages to clipboard');
```

4. Paste the output into a markdown file and edit to retain only the IP-relevant content.

### Method 3: Project Knowledge Files

Claude projects can have "Project Knowledge" files attached. These are often the most valuable IP:

1. Open the project settings
2. Look for "Project Knowledge" or "Custom Instructions"
3. Copy the content of each knowledge file
4. Save as `claude-project-knowledge-[project-name].md`

### Method 4: Ask Claude to Summarise (Within Each Project)

Start a new conversation in each Claude project and ask:

> "Please provide a comprehensive summary of all the key artefacts, frameworks, methodologies, and IP we have developed in this project. Include all specific details, numbers, and technical content — not just descriptions. Format as a structured markdown document."

Save the output as a knowledge base file.

---

## Part B: Extracting from Manus Sessions

Manus sessions run in isolated sandboxes. Files from previous sessions are not accessible from new sessions. The extraction approaches are:

### Method 1: Download During Session (Best Practice Going Forward)

At the end of each Manus session, before closing:

1. Ask Manus to zip all output files: "Please zip all files you've created and provide them for download"
2. Download the zip
3. In the next session (or manually), extract and convert to markdown using the `stage2-artefact-extractor.py` tool:

```bash
# Unzip the Manus session files
unzip manus-session-files.zip -d /path/to/manus-session/

# Run the extractor
python3 stage2-artefact-extractor.py \
    --mode manus \
    --source /path/to/manus-session/ \
    --session-name "session-description" \
    --output ~/Desktop/projects/river-config/knowledge-base/
```

### Method 2: Upload Previous Session Files to New Session

If you have files from previous Manus sessions saved locally:

1. Upload them to a new Manus session (drag and drop, or via Dropbox)
2. Ask Manus to process them into the knowledge base:

> "I've uploaded files from a previous Manus session. Please extract all substantive IP content and add it to the knowledge base at ~/Desktop/projects/river-config/knowledge-base/ as markdown files."

### Method 3: Manus Task History (If Available)

Check if Manus provides a task history or session archive:

1. Go to the Manus dashboard
2. Look for completed tasks/sessions
3. Download any available artefacts
4. Process using the `stage2-artefact-extractor.py` tool

---

## Part C: Running the Extraction Tool

The `stage2-artefact-extractor.py` tool in the knowledge base directory handles the conversion and deduplication.

### Prerequisites

```bash
pip3 install python-docx python-pptx openpyxl
# pdftotext (from poppler-utils) must also be installed
```

### Commands

```bash
# Process Claude exports
python3 stage2-artefact-extractor.py --mode claude --source /path/to/claude-exports/

# Process Manus session files
python3 stage2-artefact-extractor.py --mode manus --source /path/to/manus-files/ --session-name "my-session"

# Regenerate the knowledge base index
python3 stage2-artefact-extractor.py --mode index

# Run quality assessment
python3 stage2-artefact-extractor.py --mode quality
```

### What the Tool Does

The tool performs the following operations:

1. **Walks the source directory** and identifies all supported file types (.md, .py, .js, .ts, .html, .css, .json, .txt, .docx, .pdf, .xlsx, .pptx, .csv)
2. **Extracts text content** from each file using format-appropriate methods
3. **Computes a content hash** to detect duplicates
4. **Writes markdown files** to the knowledge base with metadata headers
5. **Logs all extractions** to `extraction-log.json` for incremental updates
6. **Generates an index** of all knowledge base files

---

## Part D: Priority Claude Projects to Extract

Based on the knowledge base content, the following Claude projects are likely to contain high-value IP that should be extracted:

| Priority | Project/Conversation | Expected Content |
|----------|---------------------|------------------|
| 1 | CBS Group CAPITAL Framework development | Framework refinements, application guidance, case study details |
| 2 | WaterRoads business case development | Financial modelling, investor materials, government engagement strategy |
| 3 | Tender response drafting sessions | Response narratives, evaluation criteria analysis, pricing strategies |
| 4 | CBS value-based pricing model | Pricing methodology, shared savings calculations, procurement parameters |
| 5 | TfNSW briefing and strategy | Infrastructure pipeline analysis, harbour crossings strategy |

---

## Part E: Ongoing Knowledge Base Maintenance

To keep the knowledge base current, the following process should be adopted:

1. **After each Claude session:** If substantial IP was developed, extract it using Method 1 or 4 above
2. **After each Manus session:** Download all output files before closing (Method 1 above)
3. **Monthly:** Run the quality assessment to identify gaps
4. **Before each tender:** Run the index generator to ensure the knowledge base is up to date

```bash
# Monthly quality check
python3 stage2-artefact-extractor.py --mode quality
python3 stage2-artefact-extractor.py --mode index
```
