# Manus Session Artefact: Knowledge Base Extraction Pipeline

> Tools and processes built during the Manus session of 9 April 2026 to extract CBS Group and WaterRoads institutional IP into the river-config knowledge base.

**Session date:** 9 April 2026
**Purpose:** Export all material institutional IP from Dropbox, local files, and board papers into structured markdown for RAG-based tender response generation.

---

## Pipeline Architecture

The extraction pipeline consists of four Python scripts that together form a repeatable process for converting document repositories into structured markdown knowledge bases.

### 1. `dropbox_downloader.py` — Bulk Dropbox Folder Download

Downloads entire Dropbox shared folders as zip archives using the `dl=1` parameter trick. Handles authentication-free shared links and follows redirects.

**Key capability:** Converts Dropbox shared folder URLs to downloadable zip archives without requiring Dropbox API credentials or login.

**Usage:**
```bash
# Modify the FOLDERS dict in the script with your Dropbox shared links
python3 dropbox_downloader.py
```

### 2. `extract_to_markdown.py` — Document-to-Markdown Converter

Processes all documents in a folder hierarchy and converts them to structured markdown files. Supports the following formats:

| Format | Extraction Method |
|--------|------------------|
| PDF | `pdftotext` with layout preservation |
| DOCX | `python-docx` with paragraph and table extraction |
| XLSX | `openpyxl` with sheet-by-sheet summary |
| PPTX | `python-pptx` with slide-by-slide text extraction |
| MD | Direct read |

**Key design decisions:**

- Files are grouped by business function (methodology, tenders, specialisations) rather than by source folder
- Content is truncated at 80,000 characters per source file to keep markdown files manageable for RAG retrieval
- Tables are preserved in markdown pipe format
- Each output file includes metadata headers (source folder, export date, description)

### 3. `extract_board_papers.py` — Board Papers Specialist Extractor

Dedicated extractor for board meeting documents, handling both DOCX and signed PDF formats. Separates CBS Group and WaterRoads board papers into distinct knowledge base files.

### 4. `enrich_wht.py` — Tender Document Enricher

Processes structured tender submission folders (with schedule-based subfolders like B1_Executive Summary, B4_Pricing, B5_Non Price Criteria) into coherent tender markdown files.

### 5. `stage2-artefact-extractor.py` — Incremental Knowledge Base Manager

Production-ready tool for ongoing knowledge base maintenance. Features include:

- Incremental extraction with content-hash deduplication
- Extraction logging to prevent re-processing
- Quality reporting with gap identification
- Auto-generated index file
- Support for Claude export processing and Manus session file processing

---

## Source Repositories Processed

| Source | URL/Path | Content |
|--------|----------|---------|
| CBS_RAG_Documents (Dropbox) | `dropbox.com/scl/fo/lyglfta3e8dwfuvixd64d/...` | CAPITAL Framework, WaterRoads, Proposals, Specialisations, TfNSW, Business Development |
| Proposals (Dropbox) | `dropbox.com/scl/fo/zhell2kwrtzq45zrfpjru/...` | 16+ proposal folders including TfNSW, DHS Vic, NZ MoT, Downer, Egis JV |
| Board Papers (Dropbox) | `dropbox.com/scl/fo/cj9wo0sllxkpzx6almzsn/...` | CBS Jan/Feb 2026, Cobalt Blu Jan/Feb 2026, WR Jan/Feb 2026, Beneficiary Interests |

---

## Dependencies

The following packages are required to run the extraction pipeline:

```bash
sudo pip3 install python-docx python-pptx openpyxl beautifulsoup4 requests
# Also requires: pdftotext (from poppler-utils, pre-installed on Ubuntu)
```

---

## Replication Instructions

To replicate this extraction on a fresh system:

1. Install dependencies (see above)
2. Run `dropbox_downloader.py` with updated Dropbox URLs
3. Extract the downloaded zip files
4. Run `extract_to_markdown.py` (update paths if needed)
5. Run `extract_board_papers.py` (update paths if needed)
6. Run `stage2-artefact-extractor.py --mode index` to generate the index
7. Run `stage2-artefact-extractor.py --mode quality` to verify completeness
