# Skill: token-efficiency

## Purpose

Guide agents to match output verbosity to the audience and task type. Performance is the priority — never sacrifice quality, completeness, or evidence to save tokens. This skill reduces waste on outputs that don't need to be verbose, not on outputs that do.

## Core Principle

**Performance first, efficiency second.** If in doubt, produce the comprehensive output. A thorough tender section that costs 50¢ is worth more than a thin one that costs 10¢. This skill targets the 80% of agent output that is internal coordination, not the 20% that is the actual deliverable.

## Audience Awareness

Every output has a consumer. Know who it is before you write.

| Consumer | What They Need | Output Style |
|---|---|---|
| **Jeff Dusting** (human review) | Complete evidence, recommendations, clear actions required | Comprehensive. Full citations, structured sections, confidence signal. No length constraint. |
| **CBS Executive** (Tier 1 reviewing Tier 2 work) | Assessment summary, scorecard, recommendation, key risks | Structured but concise. Lead with recommendation. Include scorecard. Skip process detail. |
| **Tier 2 agent** (receiving delegation from Tier 1) | Task brief, context pointers, deadline, quality criteria | Brief. What to do, which KB categories to query, when it's due, what good looks like. Do NOT include the content — point them to it. |
| **Tier 3 agent** (receiving delegation from Tier 2) | Section brief, specific KB queries to run, evaluation criteria, deadline | Focused brief. Include the specific query terms, expected source files, and the evaluation criterion this section addresses. |
| **Status update** (progress comment on an issue) | What happened, what's next, any blockers | 2-3 sentences maximum. No preamble. |
| **Teams notification** | Type, issue ID, one-line summary, action required | 4 lines maximum. Plain text. UPPERCASE type prefix. |

## Output Length Targets

These are guidelines, not hard limits. Exceed them when the content requires it.

| Output Type | Target Length | When to Exceed |
|---|---|---|
| Delegation brief (agent → agent) | 100-200 words | Complex multi-part task requiring detailed context |
| Status comment | 20-50 words | Never — if it needs more, it's not a status comment |
| Teams notification | 4 lines | Never |
| Scorecard assessment | 300-500 words + JSON | Multi-sector opportunities requiring detailed dimension analysis |
| Tender section (Bronze) | 200-400 words per section | Never at Bronze — it's a skeleton |
| Tender section (Silver) | 800-2000 words per section | Long-form requirements or complex methodology descriptions |
| Tender section (Gold) | As required | Submission-ready — no length constraint |
| Board paper section | 400-800 words per section | Financial sections with data tables |
| Governance resolution | 100-200 words | Complex resolutions with multiple conditions |
| KB retrieval verification | Report raw results | Never truncate retrieval evidence |

## What NOT to Optimise

Do not reduce output on:

1. **Tender response content** (Silver and Gold phases) — this is the core product. Full evidence, full narrative, full compliance.
2. **KB retrieval results** — always report source_file names, similarity scores, document IDs. This is how we verify the agent is using the KB.
3. **Scorecard evidence fields** — each dimension needs specific evidence from KB.
4. **Compliance matrices** — every criterion must be fully mapped.
5. **Human-facing deliverables** — board papers, tender responses, research briefs for Jeff.
6. **Error reporting** — always fully describe what went wrong and why.

## What TO Optimise

Reduce output on:

1. **Delegation briefs** — don't repeat the full tender description when delegating. Say: "Assess tender CBSA-XX per your standard protocol. Key sectors: tunnelling, AM. Deadline: 15 April. Refer to parent issue for full brief."
2. **Configuration acknowledgements** — do NOT output "I am the CBS Executive Agent, my role is..." at the start of every heartbeat. Get straight to the work.
3. **Status updates** — "CBSA-25: Bronze subtasks created, 3 agents assigned. Next: await completion." Not a paragraph.
4. **Routine reports with no action items** — "Daily scan: 3 emails scanned, 0 new tenders above qualification threshold. No action required."
5. **Repeated context** — if the parent issue already has the tender brief, don't copy it into every subtask. Reference it: "See parent CBSA-XX for full brief."

## Implementation

Agents should apply this by checking the audience before writing:

```
Before producing output:
1. Who will read this? (Jeff / CBS Executive / Tier 2 agent / Tier 3 agent / status log)
2. What do they need from me? (decision / action brief / evidence / status)
3. What's the minimum output that gives them what they need?
4. Does this output need KB evidence? (If yes: include full citations regardless of length)
```

## Anti-Pattern Examples

### Bad: Verbose delegation

> "I am delegating this task to the Technical Writing Agent. The task involves producing a technical methodology section for the TfNSW Future Fleet Program tender response. The tender was published on AusTender with reference number 25.0000139402.1289. The scope includes systems integration services for the Future Fleet Program. CBS Group has extensive experience in systems engineering and has previously worked with TfNSW on multiple engagements including the Western Harbour Tunnel, Sydney Harbour Tunnel, and M6 projects. The evaluation criteria weight technical capability at 40%, and the deadline is 15 April 2026. The Technical Writing Agent should query the knowledge base for relevant CAPITAL framework content and past tender submissions..."

### Good: Focused delegation

> "Silver: Technical Narrative — TfNSW FFP Systems Integration (CBSA-XX). Methodology section, eval weight 40%. Query KB: category=tender, source_file like 'tfnsw%'. Reference CAPITAL framework for systems engineering assurance positioning. Due: 14 April. See parent issue for full brief and Bronze response plan."

### Bad: Status essay

> "During this heartbeat cycle, I reviewed my assigned issues and found three tasks in the todo queue. I processed CBSA-25 by creating three subtasks for the Bronze phase, assigning them to Technical Writing, Compliance, and Pricing agents respectively. Each subtask includes the relevant scorecard information and evaluation criteria. I also followed up on CBSA-22 which has been in progress for 18 hours. No blockers were identified. I will continue monitoring progress in the next heartbeat cycle."

### Good: Status update

> "CBSA-25: Bronze subtasks created (Tech Writing, Compliance, Pricing). CBSA-22: in progress 18h, no blockers. Next cycle: monitor Bronze completion."
