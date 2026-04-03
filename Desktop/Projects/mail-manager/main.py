"""Cloud Function entry point for flight calendar sync service.

Reads flight booking emails from Gmail, extracts flight data using Claude,
and creates calendar events in Outlook via Microsoft Graph API.
"""

import json
import logging

import functions_framework

from duplicate_checker import get_processed_email_ids, is_email_processed, mark_email_processed
from flight_parser import parse_flight_email
from gmail_reader import add_label, search_flight_emails
from outlook_calendar import check_event_exists, create_event

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


@functions_framework.http
def sync_flights(request):
    """HTTP Cloud Function entry point.

    Searches Gmail for flight booking emails, parses them with Claude,
    and creates Outlook calendar events for each flight segment.
    """
    logger.info("Starting flight calendar sync")

    try:
        # Load processed email IDs from GCS
        processed_ids = get_processed_email_ids()

        # Search Gmail for flight booking emails
        emails = search_flight_emails()
        logger.info(f"Found {len(emails)} flight emails in Gmail")

        # Filter out already-processed emails
        new_emails = [e for e in emails if not is_email_processed(e.id, processed_ids)]
        logger.info(f"{len(new_emails)} new emails to process")

        results = []
        errors = []

        for email in new_emails:
            try:
                # Parse flight data from email using Claude
                flights = parse_flight_email(email.subject, email.body_html, email.body_text)

                if not flights:
                    logger.info(f"No flight data extracted from email: {email.subject}")
                    results.append({
                        "email_id": email.id,
                        "subject": email.subject,
                        "action": "skipped",
                        "reason": "no flight data extracted",
                    })
                    # Still mark as processed to avoid re-parsing
                    processed_ids = mark_email_processed(email.id, processed_ids)
                    continue

                for flight in flights:
                    flight_number = flight.get("flight_number", "unknown")
                    dep = flight.get("departure_airport", "?")
                    arr = flight.get("arrival_airport", "?")
                    dep_dt = flight.get("departure_datetime", "?")

                    try:
                        # Check for duplicate calendar event
                        if check_event_exists(flight):
                            results.append({
                                "email_id": email.id,
                                "flight": flight_number,
                                "route": f"{dep}→{arr}",
                                "action": "skipped",
                                "reason": "duplicate calendar event exists",
                            })
                            logger.info(f"Skipped duplicate: {flight_number} {dep}→{arr}")
                            continue

                        # Create calendar event
                        created = create_event(flight)
                        results.append({
                            "email_id": email.id,
                            "flight": flight_number,
                            "route": f"{dep}→{arr}",
                            "departure": dep_dt,
                            "action": "created",
                            "event_id": created.get("id", ""),
                        })
                        logger.info(f"Created event: {flight_number} {dep}→{arr} on {dep_dt}")

                    except Exception as e:
                        logger.error(f"Failed to create event for {flight_number}: {e}")
                        errors.append({
                            "email_id": email.id,
                            "flight": flight_number,
                            "error": str(e),
                        })

                # Only mark as processed if no flight creation errors for this email
                email_errors = [e for e in errors if e.get("email_id") == email.id]
                if not email_errors:
                    processed_ids = mark_email_processed(email.id, processed_ids)
                    try:
                        add_label(email.id)
                    except Exception as e:
                        logger.warning(f"Failed to label email {email.id}: {e}")
                else:
                    logger.warning(f"Not marking email {email.id} as processed due to errors")

            except Exception as e:
                logger.error(f"Failed to process email {email.id} ({email.subject}): {e}")
                errors.append({
                    "email_id": email.id,
                    "subject": email.subject,
                    "error": str(e),
                })

        summary = {
            "total_emails_found": len(emails),
            "new_emails_processed": len(new_emails),
            "results": results,
            "errors": errors,
        }

        logger.info(f"Sync complete: {json.dumps(summary, indent=2)}")
        return (json.dumps(summary, indent=2), 200, {"Content-Type": "application/json"})

    except Exception as e:
        logger.error(f"Fatal error in sync_flights: {e}", exc_info=True)
        error_response = {"error": str(e)}
        return (json.dumps(error_response), 500, {"Content-Type": "application/json"})
