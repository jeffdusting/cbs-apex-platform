# Skill: competitor-analysis

## Purpose

Structured framework for assessing competitors in tender pursuit contexts. Used by Research CBS and Tender Intelligence agents to produce competitor assessments that inform win theme development and pricing strategy.

## When to Use

- During Bronze phase: produce competitor assessment for each Go tender
- During Tender Intelligence qualification: score the Competitive Position dimension
- On request from CBS Executive for strategic competitor intelligence

## Competitor Assessment Framework

### Step 1: Identify Competitors

For each tender opportunity, identify likely competitors by:

1. Query the knowledge base for competitor profiles: `category: competitor`
2. Check the tender register for past tenders from the same client — who else bid?
3. Consider the sector and geography — which firms operate in this space?
4. Check if the tender names an incumbent or preferred panel

### Step 2: Profile Each Competitor

For each identified competitor, produce a structured assessment:

```json
{
  "competitor": "Company Name",
  "likely_to_bid": "yes/no/unknown",
  "confidence": "high/medium/low",
  "reasoning": "Why we think they will/won't bid",

  "strengths": [
    "Specific strength relevant to THIS tender"
  ],
  "weaknesses": [
    "Specific weakness relevant to THIS tender"
  ],

  "incumbent_advantage": "yes/no — are they the current provider?",
  "relationship_with_client": "strong/moderate/weak/unknown",

  "likely_approach": "How they would position their response",
  "likely_price_position": "lower/similar/higher than CBS",

  "cbs_win_themes_against": [
    "What differentiates CBS from this competitor for this specific opportunity"
  ],

  "ghost_team": {
    "engagement_lead": "Their likely lead (if known)",
    "technical_approach": "Their probable methodology"
  }
}
```

### Step 3: Develop Win Themes

Win themes are the 3-5 key messages that differentiate CBS Group's offer. They must be:

- **Specific** to the client and opportunity (not generic capability statements)
- **Evidence-based** — supported by KB content (past performance, CAPITAL outcomes, personnel)
- **Competitor-aware** — each win theme should counter a specific competitor's position
- **Measurable** where possible ("$180M validated savings" not "significant cost reduction")

#### Win Theme Structure

```
WIN THEME: [One sentence]
EVIDENCE: [KB source_file and specific content]
COUNTERS: [Which competitor weakness this exploits]
WHERE TO USE: [Which tender sections should feature this theme]
```

#### Standard CBS Win Themes (adapt per tender)

| Theme | Core Evidence | Best Against |
|---|---|---|
| CAPITAL framework delivers quantified outcomes | $180M WHT savings, $1.049B portfolio optimisation | Competitors offering methodology without outcome evidence |
| Named personnel with direct project experience | Personnel CVs in KB with specific project references | Large firms staffing with generic resources |
| Existing client relationship and performance history | Past tender submissions, contract extensions, client references | New entrants to the client relationship |
| Value-based pricing aligned to client outcomes | Fee structure methodology in KB | Competitors offering only time-and-materials pricing |
| Systems engineering + commercial integration | Unique combination of technical and commercial advisory | Pure technical or pure commercial competitors |

### Step 4: Produce Assessment Output

The final competitor assessment for a tender pursuit should contain:

1. **Competitive landscape summary** — table of likely bidders with bid probability
2. **Individual competitor profiles** — structured JSON per competitor
3. **Win themes** — 3-5 themes with evidence and counter-positioning
4. **Ghost team** — our best estimate of competitor team composition
5. **Price positioning** — where CBS should position relative to competitors
6. **Risks** — competitive risks and mitigations

## Competitor Profiles in Knowledge Base

Competitor profiles are stored in `knowledge-base/competitors/` with:
- `entity: cbs-group`
- `category: competitor`
- YAML front-matter with `competitor_name`, `sectors`, `last_updated`

Query these during assessment:
```python
# Search for competitor profiles
results = semantic_search(
    query_text=f"{competitor_name} capabilities strengths weaknesses",
    entity="cbs-group",
    category="competitor",
    match_count=5,
)
```

## Key Competitors (Australian Infrastructure Advisory)

| Competitor | Primary Sectors | Key Differentiator | CBS Advantage |
|---|---|---|---|
| AECOM | Infrastructure AM, transport | Scale, global reach, incumbent on major panels | CAPITAL framework outcomes, specialist focus, agility |
| GHD | Engineering advisory, water, transport | VIC state government relationships, broad engineering | Commercial + technical integration, value-based pricing |
| WSP | Transport planning, systems engineering | Scale, rail expertise | Named personnel with specific project outcomes |
| Jacobs | Tunnelling, transport, AM | WestConnex incumbency, large tunnel projects | CAPITAL whole-of-life approach vs Jacobs' technical focus |
| Mott MacDonald | Rail, tunnels, international | Inland Rail, international experience | Australian market depth, client relationships, CAPITAL |
| Arup | Advisory, feasibility, PPP | PPP structuring, financial advisory | Hands-on AM delivery vs advisory-only positioning |
| Aurecon | Transport, infrastructure advisory | Digital capability, Aurecon Evolve | Proven outcome delivery, not just digital aspiration |

## Best Practices

1. Always query the KB for competitor profiles before producing an assessment — do not rely on training data for competitor intelligence.
2. Win themes must be specific to the tender, not recycled generic statements.
3. Ghost team analysis is speculative — flag confidence level clearly.
4. Price positioning should reference CBS fee structure methodology from KB, not guess at competitor pricing.
5. Update competitor profiles in the KB when new information emerges from tender outcomes or market intelligence.
