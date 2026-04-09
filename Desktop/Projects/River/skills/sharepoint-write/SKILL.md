# Skill: sharepoint-write

## Purpose

Upload documents to SharePoint Online via the Microsoft Graph API. Used by governance and tender agents to deliver board papers, minutes, resolutions, and tender response documents to the appropriate entity folder structure.

## Environment Variables

| Variable | Description |
|---|---|
| `MICROSOFT_CLIENT_ID` | Azure AD application (client) ID |
| `MICROSOFT_CLIENT_SECRET` | Azure AD application client secret |
| `MICROSOFT_TENANT_ID` | Azure AD tenant ID |

These are injected via `adapterConfig.env` on the agent. Never hardcode credentials.

## Authentication — Client Credentials Flow

The Graph API uses the OAuth 2.0 client credentials grant. No user interaction is required.

```python
import os
import httpx

MICROSOFT_CLIENT_ID = os.environ["MICROSOFT_CLIENT_ID"]
MICROSOFT_CLIENT_SECRET = os.environ["MICROSOFT_CLIENT_SECRET"]
MICROSOFT_TENANT_ID = os.environ["MICROSOFT_TENANT_ID"]

GRAPH_BASE = "https://graph.microsoft.com/v1.0"
TOKEN_URL = f"https://login.microsoftonline.com/{MICROSOFT_TENANT_ID}/oauth2/v2.0/token"


def get_graph_token() -> str:
    """
    Acquire an access token using client credentials.
    Returns the access token string.
    """
    response = httpx.post(
        TOKEN_URL,
        data={
            "grant_type": "client_credentials",
            "client_id": MICROSOFT_CLIENT_ID,
            "client_secret": MICROSOFT_CLIENT_SECRET,
            "scope": "https://graph.microsoft.com/.default",
        },
    )
    response.raise_for_status()
    return response.json()["access_token"]
```

## Required Graph API Permissions

The Azure AD application registration must have the following **application** permissions (not delegated):

| Permission | Purpose |
|---|---|
| `Sites.ReadWrite.All` | Read and write files in SharePoint sites |
| `Files.ReadWrite.All` | Upload files to document libraries |

These permissions must be granted admin consent by the tenant administrator.

## SharePoint Folder Structure

Each entity has a dedicated SharePoint site with the following folder hierarchy in the default document library:

### CBS Group

```
CBS Group/
├── Board Papers/
│   └── YYYY-MM/
│       └── CBS-Board-Paper-YYYY-MM-DD.docx
├── Minutes/
│   └── YYYY-MM/
│       └── CBS-Minutes-YYYY-MM-DD.docx
├── Resolutions/
│   └── FY-YYYY/
│       └── CBS-RES-YYYY-NNN.docx
├── Tender Documents/
│   └── {tender-reference}/
│       ├── CBS-{tender-ref}-Response-vN.docx
│       ├── CBS-{tender-ref}-Pricing-vN.xlsx
│       └── CBS-{tender-ref}-Compliance-vN.docx
└── AGM/
    └── YYYY/
        ├── CBS-AGM-Notice-YYYY.docx
        └── CBS-AGM-Minutes-YYYY.docx
```

### WaterRoads

```
WaterRoads/
├── Board Papers/
│   └── YYYY-MM/
│       └── WR-Board-Paper-YYYY-MM-DD.docx
├── Minutes/
│   └── YYYY-MM/
│       └── WR-Minutes-YYYY-MM-DD.docx
├── Resolutions/
│   └── FY-YYYY/
│       └── WR-RES-YYYY-NNN.docx
└── PPP Documents/
    └── {document-category}/
        └── WR-{category}-YYYY-MM-DD.docx
```

## File Naming Conventions

| Document Type | Pattern | Example |
|---|---|---|
| Board paper | `{ENT}-Board-Paper-YYYY-MM-DD.docx` | `CBS-Board-Paper-2026-04-15.docx` |
| Minutes | `{ENT}-Minutes-YYYY-MM-DD.docx` | `CBS-Minutes-2026-04-15.docx` |
| Resolution | `{ENT}-RES-YYYY-NNN.docx` | `CBS-RES-2026-001.docx` |
| Tender response | `{ENT}-{tender-ref}-Response-vN.docx` | `CBS-AUSTENDER-2026-001-Response-v1.docx` |
| AGM notice | `{ENT}-AGM-Notice-YYYY.docx` | `CBS-AGM-Notice-2026.docx` |

Where `{ENT}` is `CBS` for CBS Group or `WR` for WaterRoads.

## File Upload — Small Files (up to 4 MB)

For files under 4 MB, use a simple PUT request:

```python
def upload_file(
    access_token: str,
    site_id: str,
    folder_path: str,
    file_name: str,
    content: bytes,
    content_type: str = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
) -> dict:
    """
    Upload a file to SharePoint via Graph API (simple upload, <= 4 MB).

    Args:
        access_token: Valid Graph API access token.
        site_id: SharePoint site ID.
        folder_path: Folder path within the document library (e.g. "Board Papers/2026-04").
        file_name: Name of the file to upload.
        content: File content as bytes.
        content_type: MIME type of the file.

    Returns:
        Graph API DriveItem response.
    """
    # URL-encode the folder path segments
    encoded_path = "/".join(
        segment.replace(" ", "%20") for segment in folder_path.split("/")
    )

    url = (
        f"{GRAPH_BASE}/sites/{site_id}/drive/root:/"
        f"{encoded_path}/{file_name}:/content"
    )

    response = httpx.put(
        url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": content_type,
        },
        content=content,
    )
    response.raise_for_status()
    return response.json()
```

## File Upload — Large Files (over 4 MB)

For files over 4 MB, use the resumable upload session:

```python
def upload_large_file(
    access_token: str,
    site_id: str,
    folder_path: str,
    file_name: str,
    file_path: str,
) -> dict:
    """
    Upload a large file using a Graph API upload session.

    Args:
        access_token: Valid Graph API access token.
        site_id: SharePoint site ID.
        folder_path: Folder path within the document library.
        file_name: Name of the file to upload.
        file_path: Local path to the file to upload.

    Returns:
        Graph API DriveItem response.
    """
    import os as _os

    encoded_path = "/".join(
        segment.replace(" ", "%20") for segment in folder_path.split("/")
    )

    # Step 1: Create upload session
    session_url = (
        f"{GRAPH_BASE}/sites/{site_id}/drive/root:/"
        f"{encoded_path}/{file_name}:/createUploadSession"
    )
    session_response = httpx.post(
        session_url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        json={"item": {"@microsoft.graph.conflictBehavior": "replace"}},
    )
    session_response.raise_for_status()
    upload_url = session_response.json()["uploadUrl"]

    # Step 2: Upload in 10 MB chunks
    file_size = _os.path.getsize(file_path)
    chunk_size = 10 * 1024 * 1024  # 10 MB

    with open(file_path, "rb") as f:
        offset = 0
        while offset < file_size:
            chunk = f.read(chunk_size)
            end = offset + len(chunk) - 1

            chunk_response = httpx.put(
                upload_url,
                headers={
                    "Content-Length": str(len(chunk)),
                    "Content-Range": f"bytes {offset}-{end}/{file_size}",
                },
                content=chunk,
            )
            chunk_response.raise_for_status()
            offset += len(chunk)

    return chunk_response.json()
```

## Creating Folders

If a folder does not exist, create it before uploading:

```python
def create_folder(
    access_token: str,
    site_id: str,
    parent_path: str,
    folder_name: str,
) -> dict:
    """
    Create a folder in SharePoint.

    Args:
        access_token: Valid Graph API access token.
        site_id: SharePoint site ID.
        parent_path: Parent folder path (e.g. "Board Papers").
        folder_name: New folder name (e.g. "2026-04").

    Returns:
        Graph API DriveItem response for the created folder.
    """
    encoded_parent = "/".join(
        segment.replace(" ", "%20") for segment in parent_path.split("/")
    )

    url = f"{GRAPH_BASE}/sites/{site_id}/drive/root:/{encoded_parent}:/children"

    response = httpx.post(
        url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        json={
            "name": folder_name,
            "folder": {},
            "@microsoft.graph.conflictBehavior": "fail",
        },
    )
    if response.status_code == 409:
        # Folder already exists — this is fine
        return {"status": "already_exists", "folder": folder_name}
    response.raise_for_status()
    return response.json()
```

## Error Handling

| HTTP Status | Meaning | Action |
|---|---|---|
| 401 | Token expired | Re-authenticate with `get_graph_token()` and retry |
| 403 | Insufficient permissions | Check application permissions and admin consent |
| 404 | Site or folder not found | Verify site ID and folder path. Create folder if needed. |
| 409 | Conflict (folder exists) | Safe to ignore for folder creation |
| 429 | Throttled | Respect the `Retry-After` header and wait before retrying |
| 507 | Insufficient storage | Flag for operator — SharePoint storage quota may be full |

## Best Practices

1. Always create the target folder before uploading. Use the conflict behaviour `fail` for folder creation so existing folders are not overwritten.
2. Follow the file naming conventions strictly. Non-conforming file names make governance audit trails harder to follow.
3. After a successful upload, log the SharePoint URL from the response (`webUrl` field) in the task comment for traceability.
4. Do not upload files larger than 250 MB. SharePoint Online has a 250 MB per-file limit.
5. For tender documents, create the tender reference folder first, then upload all component files into it.
