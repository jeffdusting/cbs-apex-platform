# Project River — Token Consumption Analysis

**Date:** 10 April 2026
**Period:** 9–10 April 2026 (Sprint 1, Days 1–4)
**Data Source:** `GET /api/companies/{companyId}/costs/by-agent`

---

## CBS Group — Per-Agent Consumption

| Agent | Cost (¢) | Runs | ¢/Run | Budget (¢/mo) | Prod Interval | Proj. Runs/Mo | Proj. Cost (¢/mo) | Utilisation |
|-------|----------|------|-------|---------------|---------------|---------------|-------------------|-------------|
| CBS Executive 2 (duplicate) | 1,709 | 23 | 74.3 | 2,500 | 3600s (1h) | 720 | **53,496** | **2,140%** |
| CBS Executive | 1,200 | 14 | 85.7 | 2,500 | 21600s (6h) | 120 | 10,284 | **411%** |
| Research CBS | 164 | 7 | 23.4 | 1,000 | disabled | on-demand | ~200 | 20% |
| Tender Intelligence | 89 | 1 | 89.0 | 1,500 | 86400s (24h) | 30 | 2,670 | **178%** |
| Pricing and Commercial | 61 | 2 | 30.5 | 1,000 | disabled | on-demand | ~100 | 10% |
| Tender Coordination | 53 | 6 | 8.8 | 2,000 | 14400s (4h) | 180 | 1,584 | 79% |
| Governance CBS | 28 | 2 | 14.0 | 1,500 | disabled | routine-driven | ~100 | 7% |
| Technical Writing | 8 | 1 | 8.0 | 2,500 | disabled | on-demand | ~50 | 2% |
| Office Management CBS | 5 | 3 | 1.7 | 400 | 43200s (12h) | 60 | 102 | 26% |
| Compliance | 1 | 1 | 1.0 | 500 | disabled | on-demand | ~10 | 2% |

**Company Total:** 3,318¢ ($33.18) across ~60 runs in 2 days.

---

## Caveats

- Data includes Sprint 1 setup and testing runs (not representative of steady-state production).
- Cost per run is elevated because early heartbeats involved exploration, auth debugging, and unfamiliar tasks. Steady-state costs will be lower as agents cache context and task patterns stabilise.
- CBS Executive 2 is a **duplicate agent** (known issue from Day 2) consuming budget at 1-hour intervals. Recommend deletion or disable.
- On-demand agents (disabled heartbeat) are only costed when triggered by task assignment or routine.

---

## Recommendations

### Immediate Actions

1. **Delete or disable CBS Executive 2** — duplicate agent consuming ~$535/month at current rate. This agent has zero budget allocation in the org chart and should not exist.

2. **Increase CBS Executive budget to 12,500¢** — at $85.7/run × 120 runs/month = ~$102.84/month projected. Current budget of $25 is insufficient. However, cost per run should decrease as the agent encounters fewer novel tasks. Recommend setting budget to $125/month initially, review after 2 weeks.

3. **Increase Tender Intelligence budget to 5,000¢** — single run cost $0.89 but this agent does deep KB retrieval and web search. At 30 runs/month = ~$26.70. Budget of $15 is borderline. Set to $50 to allow headroom for complex tender assessments.

### Budget Adjustment Table

| Agent | Current Budget | Recommended Budget | Rationale |
|-------|---------------|-------------------|-----------|
| CBS Executive 2 | $25.00 | **$0 (disable)** | Duplicate — delete |
| CBS Executive | $25.00 | $125.00 | High per-run cost, critical path agent |
| Tender Intelligence | $15.00 | $50.00 | Deep retrieval, daily cadence |
| Tender Coordination | $20.00 | $20.00 | Within budget at current rate |
| Technical Writing | $25.00 | $25.00 | On-demand, low volume expected |
| Compliance | $5.00 | $5.00 | On-demand, minimal cost |
| Pricing and Commercial | $10.00 | $10.00 | On-demand, acceptable rate |
| Governance CBS | $15.00 | $15.00 | Routine-driven, ~2 runs/month |
| Office Management CBS | $4.00 | $4.00 | Haiku model, very low cost |
| Research CBS | $10.00 | $10.00 | On-demand, moderate cost |

### Model Optimisation Opportunities

| Agent | Current Model | Recommendation |
|-------|--------------|----------------|
| Office Management CBS | Haiku 4.5 | Keep — administrative tasks, very cost-effective |
| Compliance | Sonnet 4 | Consider Haiku — checklist-driven tasks may not need Sonnet |
| Tender Coordination | Sonnet 4 | Keep — orchestration requires reasoning capability |
| CBS Executive | Opus 4.6 | Keep — CEO-tier reasoning, delegation quality is critical |
| Technical Writing | Sonnet 4 | Keep — output quality matters for tender documents |

### Review Schedule

- **Week 2 (17 April):** First steady-state review after 7 days of production data
- **Week 4 (1 May):** Monthly budget review with full month data
- **Sprint 2 start:** Formal token optimisation analysis with 4 weeks of data
