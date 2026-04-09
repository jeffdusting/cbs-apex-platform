---
entity: cbs-group
category: ip
title: "CBS Group White Papers - Tolling and Demand Management — Tolling Industry Benchmark Model - CBS Group Rev B3.xlsx"
---

> **Parent document:** CBS Group White Papers - Tolling and Demand Management
> **Entity:** CBS Group, a technical advisory firm specialising in infrastructure asset management, systems engineering, and tolling
> **Category:** intellectual property and capability documentation
> **Total sections in parent:** 10
>
> This is a sub-document extracted from the parent for retrieval optimisation.
> The parent document contains the complete collection; this section is independently
> retrievable for targeted queries.

## Tolling Industry Benchmark Model - CBS Group Rev B3.xlsx

*File: `Tolling Industry Benchmark Model - CBS Group Rev B3.xlsx`*

### Sheet: 0_Model_Guide

TOLLING BENCHMARK MODEL - USER GUIDE |  | 
Version 2.0 | December 2024 | Prepared by CBS Group |  | 
PURPOSE |  | 
This Excel model provides comprehensive source data and calculations supporting the Tolling Industry Operational Efficiency Benchmarking Report. |  | 
All values in the report can be traced back to source data with full attribution and transparent calculations. |  | 
Operating cost ratios are CALCULATED from source revenue and cost data, not entered directly. |  | 
MODEL STRUCTURE |  | 
Sheet | Purpose | Key Content
0_Model_Guide | Navigation and instructions | This guide, colour coding, assumptions
1_Source_Operators | International operator financials | Revenue, costs, transactions → calculated ratios
2_Source_Technology | Technology cost components | RFID, Video, Next-Gen ANPR, Hybrid by component
3_Source_Channels | Customer service channels | Phone, email, web, app costs with multiples
4_Source_ValueChain | Value chain targets by tier | Passage, back office, retail, compliance metrics
5_Source_Adjacent | Adjacent industry benchmarks | Public transport, utilities, enforcement
6_Calc_TechComparison | Technology differentials | Cost gaps between technology types
7_Calc_Variance | Cost variance factors | Scale, labour, climate, regulatory impacts
8_Calc_MobileApp | Mobile app business case | Savings by component, investment, ROI
9_Calc_Financial | Financial impact model | Scenario analysis with sensitivity
10_Verification | Report claims verification | Traces claims to source with status
11_Bibliography | Source document list | Full citations for all data sources
COLOUR CODING |  | 
Light Blue cells | Input data (from source documents) | 
Light Green cells | Calculated values (formulas) | 
Grey cells | Source attribution | 
Yellow cells | Warnings or items requiring attention | 
Blue text | Hardcoded inputs | 
Black text | Formulas/calculations | 
Green text | Cross-sheet references | 
Red text | Discrepancies or errors | 
KEY ASSUMPTIONS |  | 
• All costs converted to AUD at December 2024 exchange rates (USD 1.00 = AUD 1.55) |  | 
• EUR converted at EUR 1.00 = AUD 1.67 (via USD) |  | 
• Data reflects FY23 or FY24 results where available |  | 
• Ranges reflect ±2pp estimation uncertainty on calculated ratios |  | 
• Mobile app analysis based on large operator scenario ($200M revenue) |  | 
• Variance factors are not fully additive due to interactions (apply 75% factor for cumulative) |  | 
KNOWN ISSUES / CORRECTIONS |  | 
• Channel cost differential: Report states 50-150x, actual calculation shows ~10-11x |  | 
• Transaction volumes: Verify against primary sources - some figures may be outdated |  | 

### Sheet: 1_Source_Operators

SOURCE DATA: INTERNATIONAL TOLL OPERATOR FINANCIALS |  |  |  |  |  |  |  |  |  |  |  |  | 
Operating cost ratios CALCULATED from revenue and cost data |  |  |  |  |  |  |  |  |  |  |  |  | 
Operator | Country | Revenue ($M USD) | Op Costs ($M USD) | Annual Txns (M) | Revenue/Txn ($) | Cost/Txn ($) | Op Cost Ratio | Ratio Low | Ratio High | Technology | Efficiency Tier | Source Document | Source Detail
E-ZPass Group | USA (Multi-state) | 2800 | 644 | 10000 | 280 | 64.4 | 0.23 | 0.21 | 0.25 | RFID (interagency) | Tier 1 (High) | IBTTA Annual Report 2023; E-ZPass IAG | Section 4.2, Tables 12-14
TollPlus/NHAI (FASTag) | India | 850 | 212.5 | 4000 | 212.5 | 53.125 | 0.25 | 0.23 | 0.27 | RFID (national) | Tier 1 (High) | NHAI Annual Report 2022-23 | Chapter 6, Annexure III
Queensland Motorways | Australia | 420 | 113.4 | 280 | 1500 | 405 | 0.27 | 0.25 | 0.29 | Hybrid RFID/Video | Tier 1 (High) | Transurban FY23 Annual Report | Page 45, QLD Segment
ASFINAG | Austria | 2100 | 609 | 300 | 7000 | 2030 | 0.29 | 0.27 | 0.31 | Electronic vignette | Tier 2 (Moderate) | ASFINAG Geschäftsbericht 2023 | Konzernlagebericht, S.28-32
Autostrade per l'Italia | Italy | 4200 | 1302 | 1400 | 3000 | 930 | 0.31 | 0.29 | 0.33 | Hybrid RFID/Video | Tier 2 (Moderate) | Atlantia Annual Report 2023 | Note 5.2, Operating Segments
APRR | France | 2800 | 896 | 750 | 3733.33333333333 | 1194.66666666667 | 0.32 | 0.3 | 0.34 | RFID (Télépéage) | Tier 2 (Moderate) | Eiffage Annual Report 2023 | Concessions Segment, p.67
407 ETR | Canada | 1450 | 478.5 | 200 | 7250 | 2392.5 | 0.33 | 0.31 | 0.35 | Video (ANPR) | Tier 2 (Moderate) | 407 ETR Annual Report 2023 | MD&A Section 4
Transurban | Australia | 3200 | 1200 | 800 | 4000 | 1500 | 0.375 | 0.355 | 0.395 | Hybrid RFID/Video | Tier 3 (Developing) | Transurban FY23 Annual Report | Page 12, Group Summary
NLEX Corporation | Philippines | 280 | 105 | 95 | 2947.36842105263 | 1105.26315789474 | 0.375 | 0.355 | 0.395 | Hybrid electronic | Tier 3 (Developing) | Metro Pacific Tollways 2023 | Segment Note 28
Cross Israel Highway | Israel | 180 | 72 | 45 | 4000 | 1600 | 0.4 | 0.38 | 0.42 | Video (ANPR) | Tier 3 (Developing) | Netivei Israel / Derech Eretz | Estimated from regulatory filings
Dartford River Crossing | UK | 700 | 56 | 60 | 11666.6666666667 | 933.333333333333 | 0.08 | 0.06 | 0.1 |  |  |  | 
NSW Harbour Crossings (SHT/SHB) | Australia | 143 | 38.5 | 38 | 3763.15789473684 | 1013.15789473684 | 0.269230769230769 | 0.249230769230769 | 0.289230769230769 |  |  |  | 
NOTES: |  |  |  |  |  |  |  |  |  |  |  |  | 
• Operating Cost Ratio = Total Operating Costs ÷ Total Toll Revenue |  |  |  |  |  |  |  |  |  |  |  |  | 
• Ratio range (±2pp) reflects estimation uncertainty from reporting variations |  |  |  |  |  |  |  |  |  |  |  |  | 
• Transaction volumes in millions; verify against latest annual reports |  |  |  |  |  |  |  |  |  |  |  |  | 
ADDITIONAL NOTES: |  |  |  |  |  |  |  |  |  |  |  |  | 
• Dartford River Crossing: Operating cost ratio (~8%) significantly below Tier 1. Scope verification required - contract may exclude certain cost elements. |  |  |  |  |  |  |  |  |  |  |  |  | 
• NSW Harbour Crossings: Demonstrates Tier 1 (27%) achievable in Australian market. Cost distribution anomalous (Pass 3%, OBO 57%) - may reflect different cost allocation. |  |  |  |  |  |  |  |  |  |  |  |  | 

### Sheet: 2_Source_Technology

SOURCE DATA: TECHNOLOGY COST COMPONENTS |  |  |  |  |  |  |  |  | 
Component costs with source attribution; totals calculated via SUM formulas |  |  |  |  |  |  |  |  | 
 |  |  |  |  |  | MIR Rate |  |  | 
Technology | Component | Cost Low ($/txn) | Cost High ($/txn) | Midpoint | % of Total | Expected % requiring manual review | Source Document | Source Detail | Methodology Notes
Tag-Based (RFID/DSRC) | Passage Detection | 0.015 | 0.022 | 0.0185 | 0.153061224489796 | <1% | IBTTA Technical Report 2023 | Table 7: Per-Txn Costs | Greater than 99.5% accuracy; reader maintenance, data transmission
Tag-Based (RFID/DSRC) | Operational Back Office | 0.035 | 0.048 | 0.0415 | 0.357142857142857 | N/A | E-ZPass IAG Reports | Clearinghouse allocation | 200 bytes/txn; reconciliation, system admin
Tag-Based (RFID/DSRC) | Customer Back Office | 0.04 | 0.055 | 0.0475 | 0.408163265306122 | N/A | IBTTA Customer Service Study | Section 3.2 | $3-5 annual account cost amortised
Tag-Based (RFID/DSRC) | Compliance | 0.008 | 0.015 | 0.0115 | 0.0816326530612245 | N/A | IBTTA Enforcement Guide | Chapter 4 | <3% violation rate; known customer base
Tag-Based (RFID/DSRC) | TOTAL | 0.098 | 0.14 | 0.119 |  | <1% |  |  | Sum of components
Video-Legacy | Passage Detection | 0.035 | 0.045 | 0.04 |  | 10-15% | 407 ETR Technical Report | Section 2.1 | 95-98% accuracy; OCR processing, image storage
Video-Legacy | Operational Back Office | 0.055 | 0.075 | 0.065 |  | N/A | IBTTA Video Tolling Study | Data processing section | 2-5 MB/txn storage; complex reconciliation
Video-Legacy | Customer Back Office | 0.085 | 0.12 | 0.1025 |  | N/A | 407 ETR / Cross Israel benchmarks | Customer management | Invoice-based; $12-20 annual account cost
Video-Legacy | Compliance | 0.025 | 0.045 | 0.035 |  | N/A | IBTTA Enforcement Guide | Chapter 5 | 5-8% violation rate; owner lookup costs
Video-Legacy | TOTAL | 0.2 | 0.285 | 0.2425 |  | 10-15% |  |  | Sum of components
Next-Gen ANPR | Passage Detection | 0.012 | 0.018 | 0.015 |  | <2% | TfNSW WHT Contract 2024 | Schedule 14 | 99.8%+ automation; ML-enhanced OCR
Next-Gen ANPR | Operational Back Office | 0.028 | 0.038 | 0.033 |  | N/A | TfNSW WHT Contract 2024 | Schedule 14 | Compressed storage; automated exceptions
Next-Gen ANPR | Customer Back Office | 0.035 | 0.05 | 0.0425 |  | N/A | CBS Group analysis | WHT parameters | No tag costs; digital-first model
Next-Gen ANPR | Compliance | 0.01 | 0.018 | 0.014 |  | N/A | TfNSW WHT Contract 2024 | Schedule 14 | Zero leakage spec; admin penalties
Next-Gen ANPR | TOTAL | 0.085 | 0.124 | 0.1045 |  | <2% (spec) |  |  | Sum of components
Hybrid (70% RFID) | Passage Detection | 0.021 | 0.0289 | 0.02495 |  | 1.5-2.5% | Calculated | 80% RFID + 20% Video | 0.7 times RFID + 0.3 times Video
Hybrid (70% RFID) | Operational Back Office | 0.041 | 0.0561 | 0.04855 |  |  | Calculated | 80% RFID + 20% Video | 0.7 times RFID + 0.3 times Video
Hybrid (70% RFID) | Customer Back Office | 0.0535 | 0.0745 | 0.064 |  |  | Calculated | 80% RFID + 20% Video | 0.7 times RFID + 0.3 times Video
Hybrid (70% RFID) | Compliance | 0.0131 | 0.024 | 0.01855 |  |  | Calculated | 80% RFID + 20% Video | 0.7 times RFID + 0.3 times Video
Hybrid (70% RFID) | TOTAL | 0.1286 | 0.1835 | 0.15605 |  |  |  |  | Sum of components
TECHNOLOGY NOTES: |  |  |  |  |  |  |  |  | 
• Tag-Based includes both RFID (915 MHz, Americas/Australia) and DSRC (5.8 GHz, Europe) |  |  |  |  |  |  |  |  | 
• MIR Rate = Manual Image Review rate - % of transactions requiring human review |  |  |  |  |  |  |  |  | 
• Next-Gen ANPR figures are contractual specifications (WHT), not demonstrated performance |  |  |  |  |  |  |  |  | 
• Hybrid MIR calculation: 85% tag × 0% + 15% video × 10-15% = 1.5-2.25% |  |  |  |  |  |  |  |  | 

### Sheet: 3_Source_Channels

SOURCE DATA: CUSTOMER SERVICE CHANNEL COSTS |  |  |  |  |  |  |  | 
Channel costs with cost multiple calculations |  |  |  |  |  |  |  | 
Channel | Cost Low ($/contact) | Cost High ($/contact) | Midpoint | Resolution Time | Digital? | Multiple vs App | Source | Notes
In-person (service centre) | 15 | 25 | 20 | 15-25 min | No | 23.5294117647059 | Deloitte Contact Centre Benchmarking 2023 | Highest cost; declining volume
Phone (agent-assisted) | 6 | 12 | 9 | 4-8 min | No | 10.5882352941176 | IBTTA Customer Service Study 2023 | Primary contact channel for tolling
Email/web form | 2.5 | 5 | 3.75 | 24-48 hrs | Partial | 4.41176470588235 | Gartner Customer Service Analysis | Asynchronous; moderate cost
Web chat (human) | 2 | 4 | 3 | 6-12 min | Partial | 3.52941176470588 | Forrester Digital Service Report | Growing channel
Chatbot/AI assistant | 0.8 | 1.5 | 1.15 | 1-3 min | Yes | 1.35294117647059 | IBM/Salesforce benchmarks | Emerging; high deflection potential
Mobile app self-service | 0.5 | 1.2 | 0.85 | Immediate | Yes | 1 | McKinsey Digital Banking 2023 | Lowest cost; highest satisfaction
IVR self-service | 0.3 | 0.8 | 0.55 | 1-2 min | Yes | 0.647058823529412 | NICE CXone Report 2023 | Mature self-service channel
CHANNEL DIFFERENTIAL VERIFICATION |  |  |  |  |  |  |  | 
Report claim: | 50-150x differential between phone and digital |  |  |  |  |  |  | 
Phone (Agent) midpoint: | 9 |  |  |  |  |  |  | 
Mobile App midpoint: | 0.85 |  |  |  |  |  |  | 
ACTUAL CALCULATED MULTIPLE: | 10.5882352941176 | x | *** REPORT CLAIM OF 50-150x IS INCORRECT *** |  |  |  |  | 
Note: The ~10-11x multiple is consistent across multiple source studies. |  |  |  |  |  |  |  | 
The report claim of 50-150x appears to be an error and should be corrected. |  |  |  |  |  |  |  | 

### Sheet: 4_Source_ValueChain

SOURCE DATA: VALUE CHAIN TARGETS BY EFFICIENCY TIER |  |  |  |  |  | 
Performance benchmarks for each value chain component |  |  |  |  |  | 
VALUE CHAIN COST DISTRIBUTION (% of Total Operating Costs) |  |  |  |  |  | 
Component | Industry Range | Tier 1 (High-Eff) | Tier 2 (Mod-Eff) | Tier 3 (Dev-Eff) | Key Drivers | Source
Passage Detection | 15-25% | 15-18% | 18-22% | 22-26% | Technology, scale, climate, fleet characteristics | IBTTA component analysis
Operational Back Office | 25-35% | 24-28% | 28-32% | 32-38% | Automation, complexity | Operator benchmarks
Commercial Back Office | 30-40% | 28-32% | 32-38% | 38-45% | Digital adoption, labour | Customer service data
Compliance & Enforcement | 15-25% | 12-16% | 15-20% | 20-28% | Legal framework, tech, fleet characteristics | Enforcement analysis
PASSAGE DETECTION METRICS |  |  |  |  |  | 
Metric | Tier 1 Target | Tier 2 Target | Tier 3 Target | Unit | Source | 
Cost per transaction | $0.012-0.020 | $0.020-0.035 | $0.035-0.050 | $/txn | Technology cost analysis | 
Automation rate | >99.5% | 97-99.5% | 95-97% | % | System performance data | 
Leakage | <0.5% | 0.5-2% | 2-5% | % | Revenue assurance reports | 
System availability | >99.7% | 99-99.7% | 97-99% | % | Infrastructure monitoring | 
Annual cost per lane/gantry | $80k-120k | $120k-180k | $180k-250k | $/year | Maintenance cost data | 
CUSTOMER RETAIL METRICS |  |  |  |  |  | 
Metric | Tier 1 Target | Tier 2 Target | Tier 3 Target | Unit | Source | 
Cost per account (annual) | $3.00-5.00 | $5.00-8.00 | $8.00-15.00 | $/acct | Account management data | 
Cost per contact | $3.50-6.00 | $6.00-10.00 | $10.00-18.00 | $/contact | Customer service benchmarks | 
Digital adoption | >70% | 50-70% | 30-50% | % | Channel usage analysis | 
FTE per 100k accounts | 12-20 | 20-30 | 30-45 | FTE | Staffing benchmarks | 
Mobile app adoption | >60% | 30-60% | <30% | % | Digital channel data | 
COMPLIANCE & ENFORCEMENT METRICS |  |  |  |  |  | 
Metric | Tier 1 Target | Tier 2 Target | Tier 3 Target | Unit | Source | 
Cost per violation | $6.00-10.00 | $10.00-15.00 | $15.00-25.00 | $/violation | Enforcement cost analysis | 
Collection rate | >88% | 80-88% | 70-80% | % | Revenue recovery data | 
First notice payment | >50% | 35-50% | 25-35% | % | Payment behaviour analysis | 
Owner lookup cost | $0.50-1.50 | $1.50-4.00 | $4.00-8.00 | $/lookup | Registry access costs | 
Digital payment rate | >70% | 40-70% | <40% | % | Payment channel data | 

### Sheet: 5_Source_Adjacent

SOURCE DATA: ADJACENT INDUSTRY BENCHMARKS |  |  |  |  |  | 
Comparative data from public transport, utilities, and enforcement agencies |  |  |  |  |  | 
PUBLIC TRANSPORT TICKETING SYSTEMS |  |  |  |  |  | 
System | Location | Cost/Tap Low | Cost/Tap High | Annual Txns | Technology | Source
Opal | Sydney | 0.015 | 0.025 | 600M+ | NFC/Contactless | TfNSW Annual Report
myki | Melbourne | 0.018 | 0.028 | 500M+ | RFID/NFC | PTV Annual Report
Oyster/Contactless | London | 0.012 | 0.02 | 2.5B+ | RFID/NFC | TfL Annual Report 2023
Octopus | Hong Kong | 0.008 | 0.015 | 15M+ daily | RFID | Octopus Holdings Report
Suica/PASMO | Tokyo | 0.01 | 0.018 | 30M+ daily | RFID/NFC | JR East Annual Report
AUSTRALIAN UTILITY CUSTOMER SERVICE |  |  |  |  |  | 
Utility | Type | Cost/Cust/Month Low | Cost/Cust/Month High | Digital Adoption | Customers (M) | Source
Sydney Water | Water | 2.5 | 3.5 | 85-90% | 1.9 | IPART determination
Ausgrid | Electricity | 3 | 4 | 85-90% | 1.7 | AER annual report
AGL Energy | Energy retail | 2.8 | 3.8 | 88-92% | 4.2 | AGL Annual Report 2023
Origin Energy | Energy retail | 3 | 4 | 85-90% | 4 | Origin Annual Report
Jemena Gas | Gas | 2.2 | 3.2 | 80-85% | 1.4 | Jemena regulatory submission
COMPLIANCE & ENFORCEMENT AGENCIES |  |  |  |  |  | 
Agency | Type | Cost/Case Low | Cost/Case High | Collection Rate | Annual Cases | Source
Revenue NSW | Fines admin | 8 | 12 | 85-90% | 5M+ | Revenue NSW Annual Report
Service NSW | Counter/online | 12 | 18 | N/A | 20M+ | Service NSW Annual Report
TfL Enforcement | Fare evasion | 15 | 25 | 75-80% | 300k | TfL enforcement data
Victoria Police | Traffic fines | 10 | 18 | 88-92% | 2M+ | VicPol Annual Report
RELEVANCE TO TOLLING: |  |  |  |  |  | 
• Public transport ticketing validates achievable per-transaction costs for similar technology |  |  |  |  |  | 
• Utility customer service costs benchmark account management in similar labour markets |  |  |  |  |  | 
• Enforcement agencies demonstrate achievable compliance costs and collection rates |  |  |  |  |  | 

### Sheet: 6_Calc_TechComparison

CALCULATED: TECHNOLOGY COST DIFFERENTIALS |  |  |  |  |  |  |  |  | 
All values calculated from 2_Source_Technology |  |  |  |  |  |  |  |  | 
Comparison | Tech A Low | Tech A High | Tech B Low | Tech B High | Diff Low | Diff High | Diff Mid | % Difference | Interpretation
Legacy Video vs RFID | 0.2 | 0.285 | 0.098 | 0.14 | 0.102 | 0.145 | 0.1235 | 1.03781512605042 | Video costs 50-100% more than RFID
Legacy Video vs Next-Gen ANPR | 0.2 | 0.285 | 0.085 | 0.124 | 0.115 | 0.161 | 0.138 | 1.32057416267943 | Video costs 80-140% more than Next-Gen
RFID vs Next-Gen ANPR | 0.098 | 0.14 | 0.085 | 0.124 | 0.013 | 0.016 | 0.0145 | 0.138755980861244 | RFID costs 10-15% more than Next-Gen

### Sheet: 7_Calc_Variance

CALCULATED: COST VARIANCE FACTORS |  |  |  |  |  | 
Structural and temporary factors affecting operating cost ratios |  |  |  |  |  | 
Factor | Impact Low (pp) | Impact High (pp) | Midpoint | Category | Source | Notes
Scale (single vs network) | 8 | 12 | 10 | Structural | E-ZPass vs single operator analysis | E-ZPass 23% vs single ops 35%
Labour costs (high vs low wage) | 5 | 8 | 6.5 | Structural | ILO wage statistics | Australia/EU vs India/Philippines
Climate (harsh vs temperate) | 3 | 5 | 4 | Structural | Operator maintenance data | Winter/tropical premium
Infrastructure age | 3 | 5 | 4 | Manageable | Asset lifecycle studies | New vs legacy maintenance
Regulatory environment | 2 | 4 | 3 | Structural | EU vs Australasian comparison | Compliance burden
Technology transition | 5 | 10 | 7.5 | Temporary | Operator transition cases | 3-5 year dual system
CUMULATIVE IMPACT ANALYSIS |  |  |  |  |  | 
Linear Sum (All factors): | 26 | 44 | 35 |  |  | 
Linear Sum (Structural only, excl. transition): | 21 | 34 | 27.5 |  |  | 
INTERACTION ADJUSTMENT |  |  |  |  |  | 
Factors are not fully additive due to interactions. |  |  |  |  |  | 
Apply 75% factor to linear sum for realistic estimate: |  |  |  |  |  | 
Adjusted Structural Range: | 15.75 | 25.5 | 20.625 | pp |  | 
Report claim: 12-19 pp structural variance |  |  |  |  |  | 
Model calculation (adjusted): | 15.75 | to | 25.5 | pp |  | 
FLEET CHARACTERISTICS |  |  |  |  |  | 
Factor | Impact (pp) | Notes |  |  |  | 
Plate standardisation | 1-2 | EU standardised (+0), US varied (+2), AU moderate (+1) |  |  |  | 
International vehicle mix | 0-2 | High foreign traffic (UK crossings) +2, Low (AU urban) +0 |  |  |  | 
Vehicle class complexity | 0-1 | Motorcycle/bus mix adds complexity |  |  |  | 
Total Fleet Factor | 2-4 | Combined fleet characteristics impact |  |  |  | 

### Sheet: 8_Calc_MobileApp

CALCULATED: MOBILE APP CROSS-CUTTING IMPACT |  |  |  |  |  |  |  | 
Savings by value chain component with ROI analysis |  |  |  |  |  |  |  | 
SCENARIO ASSUMPTIONS |  |  |  |  |  |  |  | 
Annual toll revenue ($M): | 200 | Illustrative large operator |  |  |  |  |  | 
Current operating cost ratio: | 0.38 | Tier 3 (Developing) operator |  |  |  |  |  | 
Total operating costs ($M): | 76 |  |  |  |  |  |  | 
SAVINGS BY VALUE CHAIN COMPONENT |  |  |  |  |  |  |  | 
Component | Cost Share | Current Cost ($M) | Savings % Low | Savings % High | Savings Low ($M) | Savings High ($M) | Mechanism | Source
Passage Detection | 0.12 | 9.12 | 0.12 | 0.24 | 1.0944 | 2.1888 | Real-time confirmations reduce disputes | McKinsey Digital Tolling 2023
Operational Back Office | 0.16 | 12.16 | 0.15 | 0.25 | 1.824 | 3.04 | Self-service inquiry deflection | Gartner Self-Service Study
Customer Retail | 0.39 | 29.64 | 0.4 | 0.55 | 11.856 | 16.302 | Full account self-service | McKinsey Digital Banking 2023
Compliance | 0.13 | 9.88 | 0.4 | 0.55 | 3.952 | 5.434 | In-app violation payment | IBTTA Enforcement Study
TOTAL | 0.8 | 60.8 |  |  | 18.7264 | 26.9648 |  | 
INVESTMENT REQUIREMENTS |  |  |  |  |  |  |  | 
Phase | Timeline | Investment ($M) | Notes | Source |  |  |  | 
MVP Development | Months 0-6 | 4 | iOS, Android, backend | Mobile dev benchmarks |  |  |  | 
Enhanced Features | Months 6-12 | 5 | Full integration, analytics | Integration cost data |  |  |  | 
Advanced Features | Months 12-18 | 4 | AI, personalisation | Digital transformation studies |  |  |  | 
TOTAL INVESTMENT |  | 13 |  |  |  |  |  | 
RETURN ON INVESTMENT |  |  |  |  |  |  |  | 
Payback period (Low scenario): | 8.33048530416951 | months |  |  |  |  |  | 
Payback period (High scenario): | 5.7853201210467 | months |  |  |  |  |  | 
VERIFICATION vs REPORT |  |  |  |  |  |  |  | 
Report claim: $25-46M annual savings |  |  |  |  |  |  |  | 
Model calculation: | 18.7264 | to | 26.9648 | $M |  |  |  | 
Report claim: $10-16M investment |  |  |  |  |  |  |  | 
Model calculation: | 13 | $M |  |  |  |  |  | 

### Sheet: 9_Calc_Financial

CALCULATED: FINANCIAL IMPACT MODEL |  |  |  | 
Scenario analysis with sensitivity |  |  |  | 
INPUTS (Modifiable) |  |  |  | 
Annual toll revenue ($M) | 200 | Illustrative scenario |  | 
Current operating cost ratio | 0.38 | Tier 3 starting point |  | 
Target operating cost ratio | 0.3 | Tier 2 target |  | 
Investment as multiple of savings | 0.4 | Industry benchmark: 0.3-0.5x |  | 
CALCULATIONS |  |  |  | 
Current operating costs ($M) | 76 |  |  | 
Target operating costs ($M) | 60 |  |  | 
Annual savings potential ($M) | 16 |  |  | 
Investment required ($M) | 6.4 |  |  | 
Payback period (months) | 4.8 |  |  | 
Improvement (percentage points) | 0.08 |  |  | 
SENSITIVITY ANALYSIS: Revenue Impact |  |  |  | 
Revenue ($M) | Current Costs | Target Costs | Annual Savings | Payback (mo)
100 | 38 | 30 | 8 | 4.8
150 | 57 | 45 | 12 | 4.8
200 | 76 | 60 | 16 | 4.8
250 | 95 | 75 | 20 | 4.8
300 | 114 | 90 | 24 | 4.8
400 | 152 | 120 | 32 | 4.8
500 | 190 | 150 | 40 | 4.8

### Sheet: 10_Verification

REPORT CLAIMS VERIFICATION |  |  |  |  |  |  | 
Tracing report claims to source data with status |  |  |  |  |  |  | 
Report Section | Claim | Stated Value | Source Sheet | Source Cell | Calculated Value | Status | Notes
Exec Summary | Operating cost range | 22-42% | 1_Source_Operators | H5:H14 | 0.21-0.42 |  | Range across operators
Exec Summary | RFID total cost/txn | $0.098-0.140 | 2_Source_Technology | C9, D9 | 0.098 |  | Sum of RFID components
Exec Summary | Video total cost/txn | $0.200-0.285 | 2_Source_Technology | C14, D14 | 0.2 |  | Sum of Video components
Exec Summary | Next-Gen ANPR cost/txn | $0.085-0.124 | 2_Source_Technology | C19, D19 | 0.085 |  | Sum of Next-Gen components
Exec Summary | Channel differential | 50-150x | 3_Source_Channels | B17 | 10.5882352941176 | ISSUE | *** ACTUAL: ~10-11x ***
Exec Summary | Mobile app savings | $25-46M | 8_Calc_MobileApp | F15, G15 | 18.7264 |  | Sum of component savings
Exec Summary | Mobile app investment | $10-16M | 8_Calc_MobileApp | C22 | 13 |  | Sum of phases
Finding 3 | Structural variance | 12-19 pp | 7_Calc_Variance | B20, C20 | 15.75 |  | Adjusted for interactions
Section 3.2 | Hybrid cost/txn | $0.147-0.215 | 2_Source_Technology | C24, D24 | 0.1286 |  | Weighted average calculation
STATUS KEY: |  |  |  |  |  |  | 
OK = Calculated value matches report claim |  |  |  |  |  |  | 
CHECK = Minor discrepancy requiring review |  |  |  |  |  |  | 
ISSUE = Significant discrepancy - report needs correction |  |  |  |  |  |  | 

### Sheet: 11_Bibliography

SOURCE DOCUMENT BIBLIOGRAPHY |  |  |  |  |  | 
Full citations for all data sources |  |  |  |  |  | 
Source ID | Document Title | Publisher | Date | Access Method | Specific Reference | Data Used
SRC-001 | E-ZPass IAG Annual Report 2023 | E-ZPass Interagency Group | 2023 | Direct from organisation | Section 4.2, Tables 12-14 | E-ZPass operational metrics
SRC-002 | IBTTA Technical Committee Report 2023 | IBTTA | Dec 2023 | Member access | Table 7-8 | Per-transaction cost allocations
SRC-003 | IBTTA Customer Service Benchmarking Study | IBTTA | Oct 2023 | Member access | Section 3.2 | Customer service channel costs
SRC-004 | IBTTA Enforcement Best Practices Guide | IBTTA | Aug 2023 | Member access | Chapters 4-5 | Compliance cost benchmarks
SRC-005 | NHAI Annual Report 2022-23 | National Highways Authority of India | Aug 2023 | Public document | Chapter 6, Annexure III | FASTag operational data
SRC-006 | Transurban FY23 Annual Report | Transurban Group | Aug 2023 | ASX filing | Pages 12, 45 | Australian operator financials
SRC-007 | 407 ETR Annual Report 2023 | 407 International Inc. | Mar 2024 | Public document | MD&A Section 4 | 407 ETR operational data
SRC-008 | Atlantia Annual Report 2023 | Atlantia SpA | Apr 2024 | Public filing | Note 5.2 | Autostrade operational data
SRC-009 | ASFINAG Geschäftsbericht 2023 | ASFINAG | Apr 2024 | Public document | S. 28-32 | Austrian toll operator data
SRC-010 | TfNSW Western Harbour Tunnel Contract | Transport for NSW | 2024 | Contract document | Schedule 14 | Next-gen ANPR specifications
SRC-011 | McKinsey Digital Banking Economics | McKinsey & Company | Nov 2023 | Published report | Self-Service Section | Digital channel benchmarks
SRC-012 | Deloitte Contact Centre Benchmarking | Deloitte | Sep 2023 | Published report | Appendix B | Contact centre costs
SRC-013 | Gartner Customer Service Analysis | Gartner | Oct 2023 | Subscription access | Digital Economics | Channel cost analysis
SRC-014 | IPART Utility Determinations | IPART NSW | 2023-24 | Public documents | Various | Australian utility benchmarks
SRC-015 | TfL Annual Report 2023 | Transport for London | Jul 2023 | Public document | Enforcement Section | Public transport benchmarks
CURRENCY CONVERSION RATES (December 2024) |  |  |  |  |  | 
USD 1.00 = AUD 1.55 |  |  |  |  |  | 
EUR 1.00 = AUD 1.67 |  |  |  |  |  | 
GBP 1.00 = AUD 1.97 |  |  |  |  |  | 
INR 82.5 = USD 1.00 |  |  |  |  |  | 
CAD 1.35 = USD 1.00 |  |  |  |  |  | 
ADDITIONAL SOURCES (Rev C): |  |  |  |  |  | 
Dartford River Crossing Contract (Conduent/Emovis) - 10.5 year term |  |  |  |  |  | 
NSW Harbour Crossings operational data - TfNSW FY24 |  |  |  |  |  | 
Western Harbour Tunnel Contract Schedule 14 - Performance specifications |  |  |  |  |  | 
IBTTA Manual Image Review Best Practices 2023 |  |  |  |  |  | 

### Sheet: 12_NSW_Harbour_Crossings

NSW HARBOUR CROSSINGS (SHT/SHB) - COST BREAKDOWN |  |  |  | 
Source: TfNSW operational data |  |  |  | 
Category | Cost ($M) | % of Total | Benchmark Range | Status
Passage Detection | 1 | 0.025974025974026 | 15-25% | Below benchmark (verify capitalisation)
Operational Back Office | 22 | 0.571428571428571 | 25-35% | Above benchmark
Commercial Back Office | 11 | 0.285714285714286 | 30-40% | Within benchmark
Compliance | 4.5 | 0.116883116883117 | 15-25% | Below benchmark
Total Operating Costs | 38.5 | 1 |  | 
REVENUE BREAKDOWN |  |  |  | 
Toll Revenue | 111 |  |  | 
Roaming Revenue | 22 |  |  | 
Fees | 10 |  |  | 
Total Revenue | 143 |  |  | 
OPERATING COST RATIO |  |  |  | 
Opex / Revenue | 0.269230769230769 | Tier 1 range: 22-28% |  | 
NOTES: |  |  |  | 
• Passage Detection at 3% appears exceptionally low - verify if infrastructure costs capitalised elsewhere |  |  |  | 
• OBO at 57% significantly above benchmark - may include elements typically classified elsewhere |  |  |  | 
• Overall 27% demonstrates Tier 1 achievable in Australian labour market |  |  |  | 
• Roaming revenue ($22M) and Fees ($10M) treatment in ratio calculation should be verified |  |  |  | 

---
