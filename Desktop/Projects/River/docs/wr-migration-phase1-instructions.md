# WR Migration Phase 1 — Infrastructure Setup

**Purpose:** Set up the Google Cloud + Supabase infrastructure for the WR KB migration. This is the foundation before bulk content transfer.

**Your time required:** ~30 minutes of hands-on work, spread across the steps below. You can do these in parallel or in sequence.

---

## Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Sign in with an admin account for the waterroads.com.au Workspace
3. Top dropdown (next to "Google Cloud") → **New Project**
4. Project name: `river-waterroads-kb`
5. Organisation: select **waterroads.com.au**
6. **Create**
7. Wait ~30 seconds for provisioning
8. Top dropdown → select the new project

## Step 2: Enable required APIs

In the new project:

1. Left menu → **APIs & Services** → **Library**
2. Search and enable each of these (click → Enable):
   - Google Drive API
   - Google Docs API
   - Google Sheets API
   - Gmail API (optional, for later)

Each takes ~10-30 seconds.

## Step 3: Create Service Account

1. Left menu → **IAM & Admin** → **Service Accounts**
2. **+ Create service account**
3. Name: `river-wr-agent`
4. Description: `River WaterRoads agent access to Drive, Docs, Sheets`
5. **Create and continue**
6. Skip the "Grant this service account access to project" step (we'll add role-specific access)
7. **Done**
8. Click on the newly created service account → **Keys** tab → **Add key** → **Create new key** → **JSON** → **Create**
9. Save the downloaded JSON file securely — you'll need it later. **Do not commit to git.**

Note the service account email (looks like `river-wr-agent@river-waterroads-kb.iam.gserviceaccount.com`).

## Step 4: Create Shared Drive

1. Go to https://drive.google.com
2. Left sidebar → **Shared drives** → **+ New**
3. Name: `WaterRoads KB`
4. **Create**
5. Click the new Shared Drive → **Manage members**
6. **Add members:**
   - Yourself (jeff@cbs.com.au if you have access, or your waterroads.com.au account) → **Content manager**
   - Sarah Taylor (sarah@cbs.com.au or similar) → **Content manager**
   - The service account email from Step 3 → **Content manager**
7. **Send**

Note the Shared Drive ID: in the URL when viewing the drive, it's the last path segment.

## Step 5: Create Folder Structure in Shared Drive

Inside the WaterRoads KB Shared Drive, create these folders:

```
WaterRoads KB/
├── Governance/
│   ├── Board Papers/
│   │   ├── Drafts/
│   │   └── Approved/
│   ├── Minutes/
│   ├── Resolutions/
│   └── Register/
├── PPP/
│   ├── Programme Documents/
│   ├── NSW Government Correspondence/
│   └── Milestone Tracker/
├── Investor Relations/
│   ├── Updates/
│   ├── Data Room/
│   └── Cap Table/
├── Financial/
│   ├── Business Case/
│   ├── Financial Model/
│   └── Monthly Reports/
├── Regulatory/
│   ├── AMSA/
│   ├── Environmental/
│   └── Maritime Safety/
├── Stakeholder Engagement/
│   ├── Council/
│   ├── Community/
│   └── TfNSW/
├── Operational/
│   └── (empty until Sprint 4)
├── Reference/
│   ├── Shipley/
│   └── Industry Standards/
├── Correspondence/
├── Archive/
├── Templates/
├── Imported from Dropbox/
│   └── (bulk migration target)
└── Imported from SharePoint/
    └── (bulk migration target)
```

You can create these manually or I can script it once the Shared Drive exists. To create manually: right-click inside the drive → **New folder** for each.

## Step 6: Create Supabase WR Project

1. Go to https://supabase.com/dashboard
2. Sign in with your account (or create if needed)
3. **+ New project**
4. Organisation: select existing (or create new called `waterroads`)
5. Name: `waterroads-kb`
6. Database password: generate a strong one, save to password manager
7. Region: **Southeast Asia (Singapore)** — same region as the existing CBS project
8. Pricing plan: **Free** to start (we can upgrade if we exceed limits)
9. **Create new project**
10. Wait ~2 minutes for provisioning

Once ready, note:
- **Project URL:** `https://{project-ref}.supabase.co`
- **Service role key:** Settings → API → `service_role` key (under Project API keys)

## Step 7: Report Back

Once Steps 1-6 are complete, tell me:

1. **Google Cloud project ID** (`river-waterroads-kb` or whatever you chose)
2. **Service account email** (from Step 3)
3. **Shared Drive ID** (from Step 4)
4. **Confirmation** that folder structure is created (Step 5)
5. **Supabase URL** and **service role key** (from Step 6) — paste these into a separate secure channel (don't email plain text)

I'll verify, then proceed with Phase 2 (set up Google Workspace Migrate for the 31GB bulk transfer) and Phase 3 (build the indexer).

---

## Troubleshooting

- **"You don't have permission to create a project"** — your Google Workspace admin needs to enable Cloud project creation for users, OR a Workspace admin needs to create the project on your behalf.
- **Shared Drive creation fails** — check your Workspace plan supports Shared Drives (Business Standard and above).
- **Service account key download blocked** — organisation policy may restrict key creation. Ask admin for exception or use Workload Identity Federation (more complex).
