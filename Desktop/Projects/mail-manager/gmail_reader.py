"""Gmail API integration for reading flight booking emails."""

import base64
import logging
from dataclasses import dataclass
from email.utils import parsedate_to_datetime

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from config import get_gmail_token, get_gmail_user_email

logger = logging.getLogger(__name__)

# Gmail search query for flight booking emails
FLIGHT_EMAIL_QUERY = (
    "from:(qantas.com.au OR email.qantas.com.au OR virginaustralia.com OR email.virginaustralia.com) "
    "subject:(booking OR itinerary OR confirmation OR e-ticket) "
    "newer_than:7d"
)

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.modify"]


@dataclass
class FlightEmail:
    id: str
    subject: str
    sender: str
    date: str
    body_html: str
    body_text: str


def _get_gmail_service():
    """Build an authenticated Gmail API service."""
    token_data = get_gmail_token()
    creds = Credentials.from_authorized_user_info(token_data, SCOPES)

    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        logger.info("Gmail OAuth token refreshed")

    return build("gmail", "v1", credentials=creds)


def _extract_body(payload: dict) -> tuple[str, str]:
    """Extract HTML and plain text body from a Gmail message payload."""
    html_body = ""
    text_body = ""

    if "parts" in payload:
        for part in payload["parts"]:
            mime_type = part.get("mimeType", "")
            if mime_type == "text/html" and "data" in part.get("body", {}):
                html_body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="replace")
            elif mime_type == "text/plain" and "data" in part.get("body", {}):
                text_body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="replace")
            elif "parts" in part:
                # Recurse into multipart sub-parts
                sub_html, sub_text = _extract_body(part)
                if sub_html:
                    html_body = sub_html
                if sub_text:
                    text_body = sub_text
    elif "body" in payload and "data" in payload["body"]:
        data = base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", errors="replace")
        if payload.get("mimeType") == "text/html":
            html_body = data
        else:
            text_body = data

    return html_body, text_body


def _get_header(headers: list[dict], name: str) -> str:
    """Get a specific header value from Gmail message headers."""
    for header in headers:
        if header["name"].lower() == name.lower():
            return header["value"]
    return ""


def search_flight_emails() -> list[FlightEmail]:
    """Search Gmail for flight booking emails from the last 7 days."""
    service = _get_gmail_service()
    user_email = get_gmail_user_email()

    logger.info("Searching Gmail for flight booking emails")
    results = service.users().messages().list(
        userId=user_email,
        q=FLIGHT_EMAIL_QUERY,
        maxResults=20,
    ).execute()

    messages = results.get("messages", [])
    if not messages:
        logger.info("No flight booking emails found")
        return []

    logger.info(f"Found {len(messages)} potential flight emails")

    flight_emails = []
    for msg_ref in messages:
        msg = service.users().messages().get(
            userId=user_email,
            id=msg_ref["id"],
            format="full",
        ).execute()

        headers = msg["payload"].get("headers", [])
        subject = _get_header(headers, "Subject")
        sender = _get_header(headers, "From")
        date = _get_header(headers, "Date")

        html_body, text_body = _extract_body(msg["payload"])

        flight_emails.append(FlightEmail(
            id=msg_ref["id"],
            subject=subject,
            sender=sender,
            date=date,
            body_html=html_body,
            body_text=text_body,
        ))

    return flight_emails


def add_label(email_id: str, label_name: str = "Flight-Processed") -> None:
    """Add a label to a processed email. Creates the label if it doesn't exist."""
    service = _get_gmail_service()
    user_email = get_gmail_user_email()

    # Find or create the label
    labels_response = service.users().labels().list(userId=user_email).execute()
    label_id = None
    for label in labels_response.get("labels", []):
        if label["name"] == label_name:
            label_id = label["id"]
            break

    if not label_id:
        label_body = {
            "name": label_name,
            "labelListVisibility": "labelShow",
            "messageListVisibility": "show",
        }
        created = service.users().labels().create(userId=user_email, body=label_body).execute()
        label_id = created["id"]
        logger.info(f"Created Gmail label: {label_name}")

    service.users().messages().modify(
        userId=user_email,
        id=email_id,
        body={"addLabelIds": [label_id]},
    ).execute()
    logger.info(f"Labelled email {email_id} as '{label_name}'")
