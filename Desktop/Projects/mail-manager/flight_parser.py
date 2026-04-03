"""Flight data extraction from booking emails using the Anthropic Claude API."""

import json
import logging
import re

import anthropic

from config import get_anthropic_api_key

logger = logging.getLogger(__name__)

EXTRACTION_PROMPT = """Extract all flight segments from this airline booking email.
Return ONLY valid JSON — no markdown, no preamble, no explanation.

Return a JSON array where each element has:
- "airline": string (e.g. "Qantas", "Virgin Australia")
- "flight_number": string (e.g. "QF1")
- "departure_airport": string IATA code (e.g. "SYD")
- "arrival_airport": string IATA code (e.g. "LHR")
- "departure_datetime": ISO 8601 with timezone (e.g. "2026-04-15T21:00:00+11:00")
- "arrival_datetime": ISO 8601 with timezone
- "departure_terminal": string or null
- "arrival_terminal": string or null
- "booking_reference": string (e.g. "ABC123")
- "cabin_class": string (e.g. "First", "Business", "Premium Economy", "Economy")
- "seat": string or null

If you cannot extract a field, set it to null.
If the email is not a flight booking, return an empty array [].

Subject: {subject}

Email body:
{body}"""


def parse_flight_email(email_subject: str, email_body_html: str, email_body_text: str) -> list[dict]:
    """Extract structured flight data from a booking email using Claude.

    Prefers HTML body (more structured data), falls back to plain text.
    Returns a list of flight segment dicts.
    """
    body = email_body_html if email_body_html else email_body_text
    if not body:
        logger.warning("Email has no body content, skipping")
        return []

    # Truncate very long emails to stay within reasonable token limits
    max_body_length = 50_000
    if len(body) > max_body_length:
        body = body[:max_body_length]
        logger.info(f"Truncated email body to {max_body_length} characters")

    client = anthropic.Anthropic(api_key=get_anthropic_api_key())

    logger.info(f"Parsing flight email: {email_subject}")
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{
            "role": "user",
            "content": EXTRACTION_PROMPT.format(subject=email_subject, body=body),
        }],
    )

    text = response.content[0].text.strip()

    # Strip any markdown code fences if Claude wraps the response
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    text = text.strip()

    try:
        flights = json.loads(text)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Claude response as JSON: {e}\nResponse: {text[:500]}")
        return []

    if not isinstance(flights, list):
        logger.error(f"Expected a JSON array, got: {type(flights)}")
        return []

    logger.info(f"Extracted {len(flights)} flight segment(s)")
    return flights
