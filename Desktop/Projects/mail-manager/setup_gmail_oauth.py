"""One-time local script to generate Gmail OAuth refresh token.

Run this locally (not in Cloud Functions) to complete the OAuth consent flow
and generate a token.json that can be stored in Google Cloud Secret Manager.

Prerequisites:
1. Create a project in Google Cloud Console
2. Enable the Gmail API
3. Create OAuth 2.0 credentials (Desktop application type)
4. Download the credentials file as 'credentials.json' in this directory

Usage:
    python setup_gmail_oauth.py

After running, the script will:
1. Open a browser for Google OAuth consent
2. Save the token to token.json
3. Print the token JSON for storing in Secret Manager
"""

import json
import os

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
]

TOKEN_FILE = "token.json"
CREDENTIALS_FILE = "credentials.json"


def main():
    creds = None

    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_FILE):
                print(f"ERROR: {CREDENTIALS_FILE} not found.")
                print("Download it from Google Cloud Console → APIs & Services → Credentials")
                return

            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)

        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())

    print("\nOAuth token saved to token.json")
    print("\nTo store in Google Cloud Secret Manager, run:")
    print(f'  gcloud secrets create gmail-oauth-token --data-file={TOKEN_FILE}')
    print("\nToken JSON (for reference):")
    print(json.dumps(json.loads(creds.to_json()), indent=2))


if __name__ == "__main__":
    main()
