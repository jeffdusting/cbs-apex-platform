# WR Migration Phase 2 — Bulk Content Transfer with rclone

**Purpose:** Move 31GB of WaterRoads content from Dropbox + SharePoint into the Google Drive Shared Drive.

**Tool:** `rclone` — open source, runs on your Mac, supports Dropbox, SharePoint, and Google Drive natively.

**Your time required:** ~30 minutes hands-on (configuration). Then ~1-3 days running in the background.

---

## Step 1: Install rclone

In Terminal:

```bash
brew install rclone
```

Verify:
```bash
rclone --version
```

Should show v1.65.0 or later.

## Step 2: Configure Dropbox remote

```bash
rclone config
```

Then in the interactive menu:
- Press `n` for new remote
- Name: `dropbox` (lowercase, no spaces)
- Storage type: `dropbox` (look for the number, then enter it)
- Client ID: leave blank (press Enter)
- Client secret: leave blank (press Enter)
- Edit advanced config: `n`
- Use auto config: `y` (this opens a browser)
- Sign in to Dropbox in the browser
- Authorise rclone
- Back in terminal, confirm: `y`

Test:
```bash
rclone lsd dropbox:
```

Should list your Dropbox top-level folders.

## Step 3: Configure SharePoint remote

```bash
rclone config
```

- `n` for new remote
- Name: `sharepoint`
- Storage type: `onedrive`
- Client ID: leave blank
- Client secret: leave blank
- Region: `1` (Microsoft Cloud Global)
- Edit advanced config: `n`
- Use auto config: `y` (browser opens)
- Sign in with your Microsoft account that has access to the SharePoint WR site
- Choose drive type: `s` (SharePoint site)
- Search query: type the WR SharePoint site name (e.g. "WaterRoads")
- Select the matching site from the list
- Confirm: `y`

Test:
```bash
rclone lsd sharepoint:
```

Should list document libraries in the WR SharePoint site.

## Step 4: Configure Google Drive remote (using service account)

This is the cleanest way — uses the existing service account, no separate OAuth needed.

```bash
rclone config
```

- `n` for new remote
- Name: `gdrive`
- Storage type: `drive`
- Client ID: leave blank
- Client secret: leave blank
- Scope: `1` (Full access)
- Service account credentials JSON file path: 
  ```
  /Users/jeffdusting/Desktop/Projects/River/.secrets/wr-service-account.json
  ```
- Edit advanced config: `y`
- Most options: press Enter (accept default)
- When asked "Shared with me": `n`
- When asked "Configure Shared Drive": `y`
- Shared Drive ID: `0AFIfqhhhv9HjUk9PVA`
- Confirm: `y`

Test:
```bash
rclone lsd gdrive:
```

Should list the WaterRoads KB folder structure I created.

## Step 5: Identify exact source paths

Before running the big migration, identify what to copy:

**Dropbox WR folder:**
```bash
rclone lsd dropbox: | grep -i water
```

Note the exact folder name (e.g. `WaterRoads`).

**SharePoint WR document library:**
```bash
rclone lsd sharepoint:
```

Note the document library name (e.g. `Documents` or `Shared Documents`).

## Step 6: Test with a small subfolder first

Pick a small subfolder in Dropbox WR to verify the transfer works:

```bash
rclone copy "dropbox:WaterRoads/Templates" "gdrive:Imported from Dropbox/Templates" \
    --progress \
    --transfers 4 \
    --checkers 8
```

If this succeeds (no errors, files appear in Drive), proceed to Step 7.

## Step 7: Full Dropbox migration

```bash
rclone copy "dropbox:WaterRoads" "gdrive:Imported from Dropbox" \
    --progress \
    --transfers 8 \
    --checkers 16 \
    --drive-server-side-across-configs \
    --tpslimit 10 \
    --log-file=/tmp/rclone-dropbox-wr.log \
    --log-level INFO
```

This will take several hours to a day for 26GB. You can:
- Leave it running in the foreground with progress display
- Or run with `nohup` in background: prefix with `nohup`, suffix with `&`

To resume if interrupted, just re-run the same command — rclone skips files that are already transferred.

## Step 8: Full SharePoint migration

```bash
rclone copy "sharepoint:Shared Documents" "gdrive:Imported from SharePoint" \
    --progress \
    --transfers 4 \
    --checkers 8 \
    --tpslimit 5 \
    --log-file=/tmp/rclone-sharepoint-wr.log \
    --log-level INFO
```

(Adjust source path if your SharePoint library has a different name.) ~5GB will take a few hours.

## Step 9: Verify

After both transfers complete:

```bash
# Compare counts
echo "Dropbox source:"
rclone size "dropbox:WaterRoads"

echo "Drive destination:"
rclone size "gdrive:Imported from Dropbox"

echo "SharePoint source:"
rclone size "sharepoint:Shared Documents"

echo "Drive SharePoint destination:"
rclone size "gdrive:Imported from SharePoint"
```

Sizes should match within a small margin (a few KB difference is normal due to rclone metadata).

For deeper verification:
```bash
rclone check "dropbox:WaterRoads" "gdrive:Imported from Dropbox" \
    --one-way \
    --log-file=/tmp/rclone-verify-dropbox.log
```

`--one-way` means it checks that all source files exist at destination (doesn't flag extras at destination as errors).

## Step 10: Report Back

Once complete, tell me:
- "Phase 2 complete"
- Any errors from the rclone logs
- Approximate file count in each destination folder

I'll then move into Phase 3 — the selective indexer that classifies and embeds the high-signal content into the WR Supabase project.

---

## Tips

- **Run overnight:** start the Dropbox transfer before bed, by morning it's mostly done
- **Mac sleep:** disable sleep with `caffeinate` while running: `caffeinate -i rclone copy ...`
- **Bandwidth limit:** add `--bwlimit 50M` if you need to throttle (limits to 50MB/s)
- **Skip duplicates:** rclone is automatically incremental — re-running picks up where it left off
- **Failures:** if rclone fails on specific files, the log shows which ones. Most are solvable by re-running

---

## Troubleshooting

- **"403 Forbidden"** on SharePoint: check your Microsoft account has read access to the WR SharePoint library
- **"404 Not Found"** on Dropbox: verify exact folder name with `rclone lsd dropbox:`
- **"Storage quota exceeded"** on Drive: check your Workspace plan supports the storage. Business Standard gives 5TB per user, well above 31GB
- **Slow transfers:** Dropbox has aggressive rate limits. The `--tpslimit 10` flag keeps you under them. Don't increase this
- **Service account permission errors on Drive:** verify the service account is a Content Manager on the Shared Drive (Phase 1 step 4)
