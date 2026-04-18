# ADR-001: Duplicate Paperclip Routine Accepted

**Status:** Accepted
**Date:** 16 April 2026
**Context:** The Daily Tender Scan routine is duplicated in Paperclip and cannot be deleted via API (500 error, likely FK constraint). Both instances fire on the same cron schedule.
**Decision:** Accept the duplicate. The tender scan agent processes idempotently — duplicate invocations produce no additional side effects because `tender_register` has a unique constraint on `(reference, source)`.
**Consequence:** Marginally higher token usage (~$0.50/month). No data integrity risk.
