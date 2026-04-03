"""Microsoft Graph API integration for creating Outlook calendar events."""

import logging
from datetime import datetime

import msal
import requests

from config import get_ms_graph_client_id, get_ms_graph_client_secret, get_ms_graph_tenant_id, get_ms_target_email

logger = logging.getLogger(__name__)

GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0"

# Map IATA timezone offsets to IANA timezone names for common Australian airports
# This is a best-effort mapping; Claude should return proper timezone offsets
AIRPORT_TIMEZONES = {
    "SYD": "Australia/Sydney",
    "MEL": "Australia/Melbourne",
    "BNE": "Australia/Brisbane",
    "PER": "Australia/Perth",
    "ADL": "Australia/Adelaide",
    "CBR": "Australia/Sydney",
    "OOL": "Australia/Brisbane",
    "HBA": "Australia/Hobart",
    "DRW": "Australia/Darwin",
    "CNS": "Australia/Brisbane",
    "LHR": "Europe/London",
    "SIN": "Asia/Singapore",
    "HKG": "Asia/Hong_Kong",
    "NRT": "Asia/Tokyo",
    "HND": "Asia/Tokyo",
    "LAX": "America/Los_Angeles",
    "SFO": "America/Los_Angeles",
    "JFK": "America/New_York",
    "DXB": "Asia/Dubai",
    "AKL": "Pacific/Auckland",
    "WLG": "Pacific/Auckland",
    "CHC": "Pacific/Auckland",
    "FJI": "Pacific/Fiji",
    "NAN": "Pacific/Fiji",
}


def _get_access_token() -> str:
    """Get an access token for Microsoft Graph API using client credentials flow."""
    client_id = get_ms_graph_client_id()
    client_secret = get_ms_graph_client_secret()
    tenant_id = get_ms_graph_tenant_id()

    authority = f"https://login.microsoftonline.com/{tenant_id}"
    app = msal.ConfidentialClientApplication(
        client_id,
        authority=authority,
        client_credential=client_secret,
    )

    result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])

    if "access_token" not in result:
        error = result.get("error_description", result.get("error", "Unknown error"))
        raise RuntimeError(f"Failed to acquire Microsoft Graph token: {error}")

    return result["access_token"]


def _get_timezone_for_airport(iata_code: str) -> str:
    """Get IANA timezone name for an airport IATA code."""
    return AIRPORT_TIMEZONES.get(iata_code, "UTC")


def _parse_datetime_strip_offset(dt_str: str) -> str:
    """Parse an ISO 8601 datetime and return it without timezone offset.

    Microsoft Graph expects dateTime without offset when timeZone is specified separately.
    """
    if not dt_str:
        return ""
    dt = datetime.fromisoformat(dt_str)
    return dt.strftime("%Y-%m-%dT%H:%M:%S")


def _format_terminal(terminal: str | None) -> str:
    """Format terminal info for display."""
    if not terminal:
        return ""
    return f" (Terminal {terminal})" if not terminal.lower().startswith("terminal") else f" ({terminal})"


def check_event_exists(flight: dict) -> bool:
    """Check if a calendar event already exists for this flight.

    Queries the Outlook calendar for events on the departure date
    that contain the flight number in the subject.
    """
    token = _get_access_token()
    target_email = get_ms_target_email()

    dep_dt = flight.get("departure_datetime")
    flight_number = flight.get("flight_number", "")

    if not dep_dt or not flight_number:
        return False

    dt = datetime.fromisoformat(dep_dt)
    start_of_day = dt.strftime("%Y-%m-%dT00:00:00")
    end_of_day = dt.strftime("%Y-%m-%dT23:59:59")
    tz = _get_timezone_for_airport(flight.get("departure_airport", ""))

    headers = {
        "Authorization": f"Bearer {token}",
        "Prefer": f'outlook.timezone="{tz}"',
    }

    url = (
        f"{GRAPH_BASE_URL}/users/{target_email}/calendarview"
        f"?startdatetime={start_of_day}&enddatetime={end_of_day}"
        f"&$filter=contains(subject, '{flight_number}')"
        f"&$select=subject,start,end"
        f"&$top=5"
    )

    response = requests.get(url, headers=headers, timeout=30)

    if response.status_code != 200:
        logger.warning(f"Calendar check failed ({response.status_code}): {response.text[:300]}")
        # If we can't check, err on the side of not creating duplicates
        # But log it so we can investigate
        return False

    events = response.json().get("value", [])
    if events:
        logger.info(f"Found existing calendar event for {flight_number} on {dt.date()}")
        return True

    return False


def create_event(flight: dict) -> dict:
    """Create an Outlook calendar event for a flight segment.

    Returns the created event data from the Graph API.
    """
    token = _get_access_token()
    target_email = get_ms_target_email()

    airline = flight.get("airline", "")
    flight_number = flight.get("flight_number", "")
    dep_airport = flight.get("departure_airport", "")
    arr_airport = flight.get("arrival_airport", "")
    dep_dt = flight.get("departure_datetime", "")
    arr_dt = flight.get("arrival_datetime", "")
    dep_terminal = flight.get("departure_terminal")
    arr_terminal = flight.get("arrival_terminal")
    booking_ref = flight.get("booking_reference", "")
    cabin_class = flight.get("cabin_class", "")
    seat = flight.get("seat")

    dep_tz = _get_timezone_for_airport(dep_airport)
    arr_tz = _get_timezone_for_airport(arr_airport)

    # Build event subject
    subject_parts = [f"✈ {flight_number}"]
    if dep_airport and arr_airport:
        subject_parts.append(f"{dep_airport} → {arr_airport}")
    if cabin_class:
        subject_parts.append(f"({cabin_class})")
    if booking_ref:
        subject_parts.append(f"[{booking_ref}]")
    subject = " ".join(subject_parts)

    # Build event body
    body_lines = []
    if airline:
        body_lines.append(f"Airline: {airline}")
    if flight_number:
        body_lines.append(f"Flight: {flight_number}")
    if dep_airport and arr_airport:
        body_lines.append(f"Route: {dep_airport} → {arr_airport}")
    if dep_dt:
        dep_display = datetime.fromisoformat(dep_dt).strftime("%d %b %Y %H:%M")
        body_lines.append(f"Departure: {dep_display}{_format_terminal(dep_terminal)}")
    if arr_dt:
        arr_display = datetime.fromisoformat(arr_dt).strftime("%d %b %Y %H:%M")
        body_lines.append(f"Arrival: {arr_display}{_format_terminal(arr_terminal)}")
    if booking_ref:
        body_lines.append(f"Booking Ref: {booking_ref}")
    if cabin_class:
        body_lines.append(f"Class: {cabin_class}")
    if seat:
        body_lines.append(f"Seat: {seat}")

    # Build location
    location_parts = []
    if dep_airport:
        location_parts.append(f"{dep_airport} Airport")
    if dep_terminal:
        terminal_str = dep_terminal if dep_terminal.lower().startswith("terminal") else f"Terminal {dep_terminal}"
        location_parts.append(terminal_str)
    location = " ".join(location_parts)

    event_body = {
        "subject": subject,
        "start": {
            "dateTime": _parse_datetime_strip_offset(dep_dt),
            "timeZone": dep_tz,
        },
        "end": {
            "dateTime": _parse_datetime_strip_offset(arr_dt),
            "timeZone": arr_tz,
        },
        "location": {
            "displayName": location,
        },
        "body": {
            "contentType": "text",
            "content": "\n".join(body_lines),
        },
        "categories": ["Flight"],
        "reminderMinutesBeforeStart": 180,
        "isReminderOn": True,
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    url = f"{GRAPH_BASE_URL}/users/{target_email}/events"
    response = requests.post(url, headers=headers, json=event_body, timeout=30)

    if response.status_code not in (200, 201):
        logger.error(f"Failed to create calendar event ({response.status_code}): {response.text[:500]}")
        raise RuntimeError(f"Calendar event creation failed: {response.status_code}")

    created = response.json()
    logger.info(f"Created calendar event: {subject} (ID: {created.get('id', 'unknown')})")
    return created
