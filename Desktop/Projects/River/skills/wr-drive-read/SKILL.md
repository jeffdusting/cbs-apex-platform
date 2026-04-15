# Skill: wr-drive-read

## Purpose

Fetch the full content of a WaterRoads Shared Drive file given its `drive_file_id`. The WR knowledge base stores retrieved chunks with a pointer back to the source file; when an agent needs more context than the chunk contains — a full document review, a specific section that wasn't retrieved, a follow-up quote — this skill returns the full extracted text.

Use this skill AFTER retrieval via `supabase-query`. The Supabase `documents.drive_file_id` column returned with each result is the handle you pass in.

## Environment Variables

| Variable | Description |
|---|---|
| `WR_SERVICE_ACCOUNT_FILE` | Absolute path to the WR service account JSON key on the agent's filesystem. In Paperclip this resolves to `/runtime/secrets/wr-service-account.json` (mounted from `.secrets/wr-service-account.json`). |
| `WR_DRIVE_ID` | Shared Drive ID. Constant: `0AFIfqhhhv9HjUk9PVA`. |

The service account (`river-wr-agent@river-waterroads-kb.iam.gserviceaccount.com`) has read access to the WaterRoads KB Shared Drive. Never hardcode credentials.

## Authentication

The Drive API uses a Google Cloud service account with domain-wide Drive scope. No user interaction is required.

```python
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build


def get_drive_service():
    """Return an authenticated Drive v3 client."""
    sa_path = os.environ["WR_SERVICE_ACCOUNT_FILE"]
    creds = service_account.Credentials.from_service_account_file(
        sa_path,
        scopes=["https://www.googleapis.com/auth/drive.readonly"],
    )
    return build("drive", "v3", credentials=creds)
```

## Primary Function — `read_drive_file`

```python
import io
import os

from googleapiclient.http import MediaIoBaseDownload


# MIME types this skill can extract
INDEXABLE_MIMES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/vnd.ms-excel.sheet.macroenabled.12": "xlsx",
    "text/markdown": "text",
    "text/plain": "text",
    "text/csv": "csv",
    "application/vnd.google-apps.document": "gdoc",
    "application/vnd.google-apps.spreadsheet": "gsheet",
    "application/vnd.google-apps.presentation": "gslides",
}


def read_drive_file(drive_file_id: str, max_chars: int = 50_000) -> dict:
    """
    Fetch and extract the full text of a WR Shared Drive file.

    Args:
        drive_file_id: Google Drive file ID (the `drive_file_id` field from
            a Supabase `documents` row).
        max_chars: Truncate the extracted text to at most this many characters.
            Default 50,000 (roughly 12k tokens).

    Returns:
        dict with keys:
            - file_id: the input drive_file_id
            - name: file name
            - mime_type: original MIME type
            - web_view_link: shareable link for humans
            - size_bytes: file size (None for Google native)
            - modified_time: ISO timestamp of last edit
            - text: extracted text (possibly truncated)
            - truncated: True if text was cut to max_chars
            - error: populated only when extraction failed

    Raises:
        RuntimeError if the MIME type is not supported.
    """
    svc = get_drive_service()

    meta = svc.files().get(
        fileId=drive_file_id,
        supportsAllDrives=True,
        fields="id,name,mimeType,size,modifiedTime,webViewLink",
    ).execute()

    mime = meta.get("mimeType")
    kind = INDEXABLE_MIMES.get(mime)
    if kind is None:
        raise RuntimeError(f"Unsupported MIME type: {mime}")

    # Google native: export to a text-bearing format
    if kind == "gdoc":
        data = _export(svc, drive_file_id, "text/plain")
        text = data.decode("utf-8", errors="ignore")
    elif kind == "gsheet":
        data = _export(svc, drive_file_id, "text/csv")
        text = data.decode("utf-8", errors="ignore")
    elif kind == "gslides":
        data = _export(svc, drive_file_id, "text/plain")
        text = data.decode("utf-8", errors="ignore")
    else:
        # Binary download + extract
        data = _download(svc, drive_file_id)
        if kind == "pdf":
            text = _extract_pdf(data)
        elif kind == "docx":
            text = _extract_docx(data)
        elif kind == "xlsx":
            text = _extract_xlsx(data)
        elif kind == "pptx":
            text = _extract_pptx(data)
        else:  # text / csv / markdown
            text = data.decode("utf-8", errors="ignore")

    truncated = len(text) > max_chars
    if truncated:
        text = text[:max_chars]

    return {
        "file_id": drive_file_id,
        "name": meta.get("name"),
        "mime_type": mime,
        "web_view_link": meta.get("webViewLink"),
        "size_bytes": int(meta["size"]) if meta.get("size") else None,
        "modified_time": meta.get("modifiedTime"),
        "text": text,
        "truncated": truncated,
        "error": None,
    }
```

## Download and Export Helpers

```python
def _download(svc, file_id: str) -> bytes:
    req = svc.files().get_media(fileId=file_id, supportsAllDrives=True)
    buf = io.BytesIO()
    downloader = MediaIoBaseDownload(buf, req)
    done = False
    while not done:
        _, done = downloader.next_chunk()
    return buf.getvalue()


def _export(svc, file_id: str, export_mime: str) -> bytes:
    req = svc.files().export_media(fileId=file_id, mimeType=export_mime)
    buf = io.BytesIO()
    downloader = MediaIoBaseDownload(buf, req)
    done = False
    while not done:
        _, done = downloader.next_chunk()
    return buf.getvalue()
```

## Text Extraction

```python
def _extract_pdf(data: bytes) -> str:
    import pdfplumber
    out = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page in pdf.pages[:300]:  # cap at 300 pages
            try:
                out.append(page.extract_text() or "")
            except Exception:
                pass
    return "\n\n".join(out)


def _extract_docx(data: bytes) -> str:
    from docx import Document
    doc = Document(io.BytesIO(data))
    paras = [p.text for p in doc.paragraphs if p.text.strip()]
    for table in doc.tables:
        for row in table.rows:
            cells = [c.text.strip() for c in row.cells if c.text.strip()]
            if cells:
                paras.append(" | ".join(cells))
    return "\n".join(paras)


def _extract_xlsx(data: bytes) -> str:
    from openpyxl import load_workbook
    wb = load_workbook(io.BytesIO(data), data_only=True, read_only=True)
    out = []
    for sheet in wb.worksheets:
        out.append(f"## Sheet: {sheet.title}")
        for row in sheet.iter_rows(max_rows=2000, values_only=True):
            cells = [str(c) for c in row if c is not None]
            if cells:
                out.append(" | ".join(cells))
    return "\n".join(out)


def _extract_pptx(data: bytes) -> str:
    from pptx import Presentation
    prs = Presentation(io.BytesIO(data))
    out = []
    for i, slide in enumerate(prs.slides):
        out.append(f"## Slide {i+1}")
        for shape in slide.shapes:
            if shape.has_text_frame:
                for para in shape.text_frame.paragraphs:
                    txt = "".join(r.text for r in para.runs).strip()
                    if txt:
                        out.append(txt)
        if slide.has_notes_slide:
            notes = slide.notes_slide.notes_text_frame.text.strip()
            if notes:
                out.append(f"[notes] {notes}")
    return "\n".join(out)
```

## Supported Formats

| Extension | MIME | Extractor |
|---|---|---|
| `.pdf` | `application/pdf` | pdfplumber, first 300 pages |
| `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | python-docx (paragraphs + tables) |
| `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | openpyxl (cells + sheet names) |
| `.pptx` | `application/vnd.openxmlformats-officedocument.presentationml.presentation` | python-pptx (slides + speaker notes) |
| `.md` / `.txt` / `.csv` | `text/*` | direct UTF-8 decode |
| Google Doc | `application/vnd.google-apps.document` | export to text/plain |
| Google Sheet | `application/vnd.google-apps.spreadsheet` | export to text/csv |
| Google Slides | `application/vnd.google-apps.presentation` | export to text/plain |

Images, video, audio, and archives are **not supported** — they are skipped at KB indexing time and should never appear as a `drive_file_id` in retrieval results.

## Usage Pattern

```python
# Step 1: retrieve relevant chunks via supabase-query
chunks = semantic_search(
    "PPP financial model scenarios",
    entity="waterroads",
    match_threshold=0.3,
    match_count=5,
)

# Step 2: if a chunk looks promising but incomplete, fetch the full file
for chunk in chunks:
    if chunk["similarity"] > 0.55 and chunk.get("drive_file_id"):
        full = read_drive_file(chunk["drive_file_id"], max_chars=30_000)
        if full["truncated"]:
            print(f"[truncated] {full['name']}: first 30k chars of {full['size_bytes']} bytes")
        # pass full['text'] into downstream reasoning
        break
```

## Best Practices

1. **Retrieve first, read second.** Do not enumerate the Drive or read files without a `drive_file_id` from a prior retrieval. The `documents` table is the index; the Drive is the source of truth. Unprompted crawling is an entity-isolation concern and is slow.
2. **Cap `max_chars`.** Default 50,000 characters (~12k tokens) is enough for most follow-up reading. Large files (PPMs, financial models) can exceed 200k characters — cap before feeding to an LLM.
3. **Check `truncated`.** If truncated=True and the relevant content might be past the cap, slice the chunk range intelligently rather than raising the cap blindly.
4. **Quote verbatim.** When you use content from `read_drive_file` in an output, quote directly and cite `name` + `web_view_link` so a reader can verify.
5. **Rate limit.** Drive API allows 20,000 queries per 100 seconds per user. Reading more than 10 files per heartbeat indicates the retrieval query is not targeted enough — rewrite the query instead.
6. **Error handling.** If `read_drive_file` raises or returns `error` populated, proceed with only the chunk content from retrieval and flag limited source material in the output quality signal.
