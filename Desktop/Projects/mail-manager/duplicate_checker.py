"""Deduplication logic using Google Cloud Storage for processed email tracking."""

import json
import logging

from google.cloud import storage
from google.cloud.exceptions import NotFound

from config import get_gcs_bucket, get_gcs_processed_file

logger = logging.getLogger(__name__)


def _get_blob():
    """Get the GCS blob for the processed emails file."""
    client = storage.Client()
    bucket = client.bucket(get_gcs_bucket())
    return bucket.blob(get_gcs_processed_file())


def get_processed_email_ids() -> set[str]:
    """Load the set of already-processed email IDs from GCS."""
    blob = _get_blob()

    try:
        data = blob.download_as_text()
        ids = json.loads(data)
        logger.info(f"Loaded {len(ids)} processed email IDs from GCS")
        return set(ids)
    except NotFound:
        logger.info("No processed emails file found in GCS, starting fresh")
        return set()
    except json.JSONDecodeError:
        logger.warning("Corrupted processed emails file in GCS, starting fresh")
        return set()


def mark_email_processed(email_id: str, processed_ids: set[str]) -> set[str]:
    """Add an email ID to the processed set and save to GCS.

    Returns the updated set.
    """
    processed_ids.add(email_id)
    blob = _get_blob()
    blob.upload_from_string(
        json.dumps(sorted(processed_ids)),
        content_type="application/json",
    )
    logger.info(f"Marked email {email_id} as processed (total: {len(processed_ids)})")
    return processed_ids


def is_email_processed(email_id: str, processed_ids: set[str]) -> bool:
    """Check if an email has already been processed."""
    return email_id in processed_ids
