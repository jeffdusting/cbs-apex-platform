#!/usr/bin/env python3
"""
Stage 2: Automated Manus & Claude Artefact Extraction Tool
============================================================

This tool progressively extracts artefacts from Manus and Claude projects
and converts them into markdown files for the river-config knowledge base.

Architecture:
  1. Claude API extraction - uses the Claude API to list and download project artefacts
  2. Manus session extraction - uses Manus API/export to retrieve session artefacts
  3. Content normalisation - converts all formats to structured markdown
  4. Deduplication - identifies and merges overlapping content
  5. Knowledge base integration - writes to the knowledge-base directory

Usage:
  python3 stage2-artefact-extractor.py --mode [claude|manus|both] --output /path/to/knowledge-base/

Prerequisites:
  pip3 install anthropic requests python-docx openpyxl

Configuration:
  Set environment variables:
    ANTHROPIC_API_KEY - for Claude project access
    MANUS_API_KEY - for Manus session access (when available)
    
  Or create a config.json file in the same directory.
"""

import os
import sys
import json
import hashlib
import argparse
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

# Configuration
DEFAULT_KB_DIR = os.path.expanduser("~/Desktop/projects/river-config/knowledge-base")
CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "extractor-config.json")
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "extraction-log.json")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ExtractionLog:
    """Track what has been extracted to enable incremental updates."""
    
    def __init__(self, log_path=LOG_FILE):
        self.log_path = log_path
        self.entries = self._load()
    
    def _load(self):
        if os.path.exists(self.log_path):
            with open(self.log_path, 'r') as f:
                return json.load(f)
        return {"extractions": [], "last_run": None, "content_hashes": {}}
    
    def save(self):
        self.entries["last_run"] = datetime.now().isoformat()
        with open(self.log_path, 'w') as f:
            json.dump(self.entries, f, indent=2)
    
    def is_already_extracted(self, content_hash: str) -> bool:
        return content_hash in self.entries.get("content_hashes", {})
    
    def record_extraction(self, source: str, artefact_id: str, content_hash: str, output_file: str):
        self.entries["content_hashes"][content_hash] = {
            "source": source,
            "artefact_id": artefact_id,
            "output_file": output_file,
            "extracted_at": datetime.now().isoformat()
        }
        self.entries["extractions"].append({
            "source": source,
            "artefact_id": artefact_id,
            "output_file": output_file,
            "timestamp": datetime.now().isoformat()
        })


class ClaudeExtractor:
    """
    Extract artefacts from Claude projects via the Anthropic API.
    
    Claude projects contain:
    - Conversation artefacts (code, documents, analysis)
    - Project knowledge files
    - Custom instructions
    
    API approach:
    - Uses the Anthropic API's project endpoints (when available)
    - Falls back to conversation export if project API is not accessible
    
    Manual fallback:
    - User can export conversations from claude.ai as JSON
    - This tool processes those exports into the knowledge base
    """
    
    def __init__(self, api_key: Optional[str] = None, kb_dir: str = DEFAULT_KB_DIR):
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        self.kb_dir = kb_dir
        self.log = ExtractionLog()
    
    def extract_from_export(self, export_dir: str):
        """
        Process Claude conversation exports (JSON files).
        
        To export from Claude:
        1. Go to claude.ai > Settings > Account > Export Data
        2. Download the export zip
        3. Extract to a directory
        4. Run this method with that directory path
        """
        logger.info(f"Processing Claude exports from: {export_dir}")
        
        json_files = list(Path(export_dir).glob("**/*.json"))
        logger.info(f"Found {len(json_files)} JSON files")
        
        for json_file in json_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Handle different Claude export formats
                if isinstance(data, list):
                    # Array of conversations
                    for conv in data:
                        self._process_conversation(conv)
                elif isinstance(data, dict):
                    if "conversations" in data:
                        for conv in data["conversations"]:
                            self._process_conversation(conv)
                    elif "messages" in data:
                        self._process_conversation(data)
                    elif "content" in data:
                        # Single artefact
                        self._process_artefact(data)
                        
            except json.JSONDecodeError:
                logger.warning(f"Could not parse JSON: {json_file}")
            except Exception as e:
                logger.error(f"Error processing {json_file}: {e}")
        
        self.log.save()
        logger.info("Claude extraction complete")
    
    def _process_conversation(self, conv: dict):
        """Extract artefacts from a single conversation."""
        conv_name = conv.get("name", conv.get("title", "untitled"))
        messages = conv.get("messages", conv.get("chat_messages", []))
        
        artefacts = []
        for msg in messages:
            content = msg.get("content", "")
            if isinstance(content, list):
                for block in content:
                    if isinstance(block, dict) and block.get("type") == "tool_use":
                        # This might be an artefact creation
                        artefacts.append(block)
            
            # Look for code blocks and structured content in assistant messages
            if msg.get("role") == "assistant" and isinstance(content, str):
                if len(content) > 500:  # Substantial content
                    artefacts.append({
                        "type": "text",
                        "content": content,
                        "name": conv_name
                    })
        
        if artefacts:
            self._write_artefacts(conv_name, artefacts)
    
    def _process_artefact(self, artefact: dict):
        """Process a single artefact."""
        name = artefact.get("name", artefact.get("title", "unnamed"))
        content = artefact.get("content", "")
        
        content_hash = hashlib.md5(content.encode()).hexdigest()
        if self.log.is_already_extracted(content_hash):
            logger.info(f"Skipping duplicate: {name}")
            return
        
        safe_name = "".join(c if c.isalnum() or c in '-_' else '-' for c in name.lower())
        output_file = os.path.join(self.kb_dir, f"claude-artefact-{safe_name}.md")
        
        with open(output_file, 'w') as f:
            f.write(f"# {name}\n\n")
            f.write(f"> Extracted from Claude project artefact\n\n")
            f.write(f"**Extraction date:** {datetime.now().strftime('%B %Y')}\n\n")
            f.write("---\n\n")
            f.write(content)
        
        self.log.record_extraction("claude", name, content_hash, output_file)
        logger.info(f"Extracted: {output_file}")
    
    def _write_artefacts(self, conv_name: str, artefacts: list):
        """Write extracted artefacts to markdown."""
        safe_name = "".join(c if c.isalnum() or c in '-_' else '-' for c in conv_name.lower())[:60]
        output_file = os.path.join(self.kb_dir, f"claude-conv-{safe_name}.md")
        
        combined = "\n\n---\n\n".join(
            a.get("content", str(a)) for a in artefacts if a.get("content")
        )
        
        content_hash = hashlib.md5(combined.encode()).hexdigest()
        if self.log.is_already_extracted(content_hash):
            return
        
        with open(output_file, 'w') as f:
            f.write(f"# Claude Conversation: {conv_name}\n\n")
            f.write(f"> Extracted from Claude conversation export\n\n")
            f.write(f"**Extraction date:** {datetime.now().strftime('%B %Y')}\n\n")
            f.write("---\n\n")
            f.write(combined)
        
        self.log.record_extraction("claude", conv_name, content_hash, output_file)


class ManusExtractor:
    """
    Extract artefacts from Manus project sessions.
    
    Manus sessions produce:
    - Generated files (documents, code, presentations)
    - Research outputs
    - Analysis results
    - Downloaded/processed files
    
    Extraction approaches:
    1. API-based (when Manus provides session export API)
    2. File-system based (for current session sandbox files)
    3. Manual export processing (user downloads session files)
    
    Current implementation:
    - Processes files from Manus session Downloads/output directories
    - Converts supported formats to markdown
    - Tracks extraction state for incremental updates
    """
    
    def __init__(self, kb_dir: str = DEFAULT_KB_DIR):
        self.kb_dir = kb_dir
        self.log = ExtractionLog()
    
    def extract_from_directory(self, source_dir: str, session_name: str = "manus-session"):
        """
        Process files from a Manus session output directory.
        
        Supports: .md, .py, .js, .ts, .html, .css, .json, .txt, .docx, .pdf, .xlsx
        """
        logger.info(f"Processing Manus session files from: {source_dir}")
        
        supported_extensions = {
            '.md', '.py', '.js', '.ts', '.html', '.css', '.json', '.txt',
            '.docx', '.pdf', '.xlsx', '.pptx', '.csv'
        }
        
        files_processed = 0
        for root, dirs, files in os.walk(source_dir):
            for fn in sorted(files):
                ext = Path(fn).suffix.lower()
                if ext not in supported_extensions:
                    continue
                
                filepath = os.path.join(root, fn)
                rel_path = os.path.relpath(filepath, source_dir)
                
                try:
                    content = self._extract_content(filepath, ext)
                    if not content or len(content) < 100:
                        continue
                    
                    content_hash = hashlib.md5(content.encode()).hexdigest()
                    if self.log.is_already_extracted(content_hash):
                        continue
                    
                    safe_name = "".join(
                        c if c.isalnum() or c in '-_' else '-' 
                        for c in Path(fn).stem.lower()
                    )[:60]
                    output_file = os.path.join(
                        self.kb_dir, 
                        f"manus-{session_name}-{safe_name}.md"
                    )
                    
                    with open(output_file, 'w') as f:
                        f.write(f"# Manus Artefact: {fn}\n\n")
                        f.write(f"> Extracted from Manus session: {session_name}\n\n")
                        f.write(f"**Source path:** `{rel_path}`\n")
                        f.write(f"**Extraction date:** {datetime.now().strftime('%B %Y')}\n\n")
                        f.write("---\n\n")
                        if ext in ('.py', '.js', '.ts', '.html', '.css'):
                            f.write(f"```{ext.lstrip('.')}\n{content}\n```\n")
                        else:
                            f.write(content)
                    
                    self.log.record_extraction(
                        "manus", f"{session_name}/{rel_path}", 
                        content_hash, output_file
                    )
                    files_processed += 1
                    
                except Exception as e:
                    logger.error(f"Error processing {filepath}: {e}")
        
        self.log.save()
        logger.info(f"Manus extraction complete: {files_processed} files processed")
    
    def _extract_content(self, filepath: str, ext: str) -> str:
        """Extract text content from a file based on its extension."""
        if ext in ('.md', '.txt', '.py', '.js', '.ts', '.html', '.css', '.json', '.csv'):
            with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                return f.read()
        
        elif ext == '.docx':
            try:
                from docx import Document
                doc = Document(filepath)
                return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
            except Exception:
                return ""
        
        elif ext == '.pdf':
            try:
                import subprocess
                result = subprocess.run(
                    ["pdftotext", "-layout", filepath, "-"],
                    capture_output=True, text=True, timeout=30
                )
                return result.stdout.strip()
            except Exception:
                return ""
        
        elif ext == '.xlsx':
            try:
                import openpyxl
                wb = openpyxl.load_workbook(filepath, data_only=True)
                parts = []
                for ws in wb.worksheets:
                    parts.append(f"### Sheet: {ws.title}")
                    for row in ws.iter_rows(max_row=50, values_only=True):
                        cells = [str(c) if c else "" for c in row]
                        if any(cells):
                            parts.append(" | ".join(cells))
                return "\n\n".join(parts)
            except Exception:
                return ""
        
        return ""


class KnowledgeBaseIntegrator:
    """
    Manage the knowledge base directory and provide utilities for
    deduplication, indexing, and quality assessment.
    """
    
    def __init__(self, kb_dir: str = DEFAULT_KB_DIR):
        self.kb_dir = kb_dir
    
    def generate_index(self):
        """Generate an index.md file listing all knowledge base entries."""
        files = sorted(Path(self.kb_dir).glob("*.md"))
        
        index_parts = [
            "# River Config Knowledge Base Index",
            "",
            f"> Auto-generated index of {len(files)} knowledge base files.",
            f"> Last updated: {datetime.now().strftime('%d %B %Y %H:%M')}",
            "",
            "---",
            "",
            "## Core IP and Methodology",
            ""
        ]
        
        categories = {
            "Core IP and Methodology": [],
            "Tender Submissions": [],
            "WaterRoads": [],
            "Specialisations and White Papers": [],
            "Claude/Manus Artefacts": [],
            "Other": []
        }
        
        for f in files:
            if f.name == "index.md":
                continue
            size_kb = f.stat().st_size / 1024
            entry = f"- [{f.stem}]({f.name}) ({size_kb:.0f} KB)"
            
            if "capital" in f.name or "fee-structure" in f.name or "board-papers" in f.name:
                categories["Core IP and Methodology"].append(entry)
            elif "tender" in f.name or "post-tender" in f.name:
                categories["Tender Submissions"].append(entry)
            elif "waterroads" in f.name or "wr-" in f.name:
                categories["WaterRoads"].append(entry)
            elif "specialisation" in f.name or "white-paper" in f.name or "benchmark" in f.name or "tfnsw" in f.name:
                categories["Specialisations and White Papers"].append(entry)
            elif "claude" in f.name or "manus" in f.name:
                categories["Claude/Manus Artefacts"].append(entry)
            else:
                categories["Other"].append(entry)
        
        for cat_name, entries in categories.items():
            if entries:
                index_parts.append(f"\n## {cat_name}\n")
                index_parts.extend(entries)
        
        with open(os.path.join(self.kb_dir, "index.md"), 'w') as f:
            f.write("\n".join(index_parts) + "\n")
        
        logger.info(f"Index generated: {len(files)} files catalogued")
    
    def quality_report(self):
        """Generate a quality assessment of the knowledge base."""
        files = list(Path(self.kb_dir).glob("*.md"))
        
        report = {
            "total_files": len(files),
            "total_size_mb": sum(f.stat().st_size for f in files) / (1024 * 1024),
            "files_by_size": {},
            "quality_flags": []
        }
        
        required_files = [
            "cbs-group-capital-methodology.md",
            "cbs-group-fee-structure.md",
            "cbs-group-board-papers.md",
            "waterroads-business-case.md",
            "waterroads-ppp-structure.md",
            "waterroads-financial-model.md"
        ]
        
        for req in required_files:
            path = os.path.join(self.kb_dir, req)
            if not os.path.exists(path):
                report["quality_flags"].append(f"MISSING: {req}")
            elif os.path.getsize(path) < 1000:
                report["quality_flags"].append(f"THIN: {req} (< 1KB)")
        
        # Check for tender files
        tender_files = [f for f in files if "tender" in f.name]
        if len(tender_files) < 5:
            report["quality_flags"].append(
                f"INSUFFICIENT TENDERS: Only {len(tender_files)} tender files (need 5+)"
            )
        
        for f in files:
            report["files_by_size"][f.name] = f.stat().st_size
        
        return report


def main():
    parser = argparse.ArgumentParser(
        description="Stage 2: Extract Manus & Claude artefacts into knowledge base"
    )
    parser.add_argument(
        "--mode", choices=["claude", "manus", "both", "index", "quality"],
        default="both", help="Extraction mode"
    )
    parser.add_argument(
        "--source", type=str, help="Source directory for extraction"
    )
    parser.add_argument(
        "--output", type=str, default=DEFAULT_KB_DIR,
        help="Knowledge base output directory"
    )
    parser.add_argument(
        "--session-name", type=str, default="session",
        help="Name for the Manus session being extracted"
    )
    
    args = parser.parse_args()
    os.makedirs(args.output, exist_ok=True)
    
    if args.mode in ("claude", "both"):
        if args.source:
            extractor = ClaudeExtractor(kb_dir=args.output)
            extractor.extract_from_export(args.source)
        else:
            logger.info(
                "Claude extraction requires --source pointing to a Claude data export directory.\n"
                "To export: claude.ai > Settings > Account > Export Data"
            )
    
    if args.mode in ("manus", "both"):
        if args.source:
            extractor = ManusExtractor(kb_dir=args.output)
            extractor.extract_from_directory(args.source, args.session_name)
        else:
            logger.info(
                "Manus extraction requires --source pointing to a Manus session output directory.\n"
                "Files are typically in ~/Desktop/projects/ or ~/Downloads/"
            )
    
    if args.mode == "index" or args.mode in ("claude", "manus", "both"):
        integrator = KnowledgeBaseIntegrator(kb_dir=args.output)
        integrator.generate_index()
    
    if args.mode == "quality":
        integrator = KnowledgeBaseIntegrator(kb_dir=args.output)
        report = integrator.quality_report()
        print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
