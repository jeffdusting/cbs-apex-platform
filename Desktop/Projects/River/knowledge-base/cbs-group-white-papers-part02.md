---
entity: cbs-group
category: ip
title: "CBS Group White Papers - Tolling and Demand Management — CBS-TWP-005 - IRIS Bayesian Fusion Tolling.pdf"
---

> **Parent document:** CBS Group White Papers - Tolling and Demand Management
> **Entity:** CBS Group, a technical advisory firm specialising in infrastructure asset management, systems engineering, and tolling
> **Category:** intellectual property and capability documentation
> **Total sections in parent:** 10
>
> This is a sub-document extracted from the parent for retrieval optimisation.
> The parent document contains the complete collection; this section is independently
> retrievable for targeted queries.

## CBS-TWP-005 - IRIS Bayesian Fusion Tolling.pdf

*File: `CBS-TWP-005 - IRIS Bayesian Fusion Tolling.pdf`*

ADAPTIVE BAYESIAN FUSION FOR MULTI-SOURCE LICENCE PLATE
RECOGNITION IN TOLLING OPERATIONS
Mathematical derivation, unsupervised model estimation, and empirical validation of the IRIS framework
for probabilistic vehicle identification using existing ITS camera infrastructure

Document ID: CBS-TWP-005
Date: January 2025



Abstract
Background: Automated Number Plate Recognition (ANPR) systems are foundational to modern electronic toll
collection, yet real-world deployments consistently demonstrate accuracy ceilings of 95–98% for single-camera
configurations. This accuracy gap translates directly to revenue leakage: recent government audits in the United
States confirm toll revenue losses of 3–7% across major networks, representing billions of dollars annually. The
tolling industry has historically treated this leakage as an unavoidable cost of operations, investing in increasingly
expensive specialised hardware that yields diminishing returns.

Objective: This paper presents the mathematical foundations, implementation architecture, and empirical
validation of the Integrated Recognition and Identification System (IRIS) — an adaptive Bayesian fusion framework
that overcomes the single-source accuracy ceiling by treating each camera observation as independent
probabilistic evidence rather than seeking a single perfect image.
Method: The IRIS methodology applies Bayes' theorem to fuse observations from multiple cameras, conditioning
on syntax-aware prior probabilities and per-camera confusion matrices estimated via an unsupervised
Expectation-Maximisation (EM) algorithm derived from the Dawid-Skene framework. The mathematical
derivation, six model assumptions, candidate generation heuristic, and EM convergence properties are presented
in full. Empirical validation is drawn from a sustained deployment on a major Australian motorway processing
over 100,000 vehicles daily across a corridor generating approximately $200 million in annual revenue.
Results: The IRIS deployment achieved sustained recognition accuracy exceeding 99.4%, compared with a
baseline of 95.2–96.5% from single-camera ANPR. This accuracy improvement recovered $5.8 million in annual
revenue leakage and reduced manual exception processing from approximately 4,800 transactions per day to
approximately 200 — a 96% reduction. The system leveraged 31 of 47 existing ITS cameras, achieving these
outcomes for a total implementation cost of $6.2 million against an estimated $45 million for conventional
hardware replacement (86% capital cost reduction).
Conclusions: Bayesian fusion of multi-source ANPR data, with unsupervised model estimation, delivers
accuracy levels that are mathematically unattainable by single-camera systems regardless of hardware quality.
The methodology is OCR-engine agnostic, integrates with existing infrastructure without hardware modification,
and produces calibrated posterior probabilities that enable risk-based operational decision-making. The
framework is directly applicable to any tolling environment with multiple camera sources and represents a
fundamental shift from hardware-centric to intelligence-centric vehicle identification.

1. Introduction and Literature Review

1.1 The Revenue Leakage Problem in Electronic Toll Collection
Electronic toll collection (ETC) is a critical revenue mechanism for transport infrastructure worldwide. The global
ETC market was valued at approximately USD 8.18 billion in 2024 and is projected to reach USD 15–22 billion by
the early 2030s, driven by the accelerating transition to open-road and all-electronic tolling.¹ ² As transponder-
based collection gives way to image-based tolling — where Automatic Number Plate Recognition (ANPR) serves
as the primary or sole vehicle identification mechanism — the accuracy of licence plate recognition becomes
directly coupled to revenue integrity.

The accuracy gap between laboratory performance and real-world deployment is well documented. A
comprehensive survey by Mufti et al. (2021) established that single-camera ANPR systems achieve recognition

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                 1/23
accuracy in the range of 89–98% depending on environmental conditions, camera quality, and plate
characteristics.³ Commercial ANPR vendors typically specify accuracies of 95–98% under optimal conditions.⁴ ⁵
In operational tolling environments, however, factors including variable illumination, weather-induced image
degradation, partial plate obscuration, non-standard plate formats, and deliberate plate tampering consistently
push real-world accuracy toward the lower end of this range.
The financial consequences of this accuracy gap are substantial and empirically verified. A September 2025 audit
by the New York State Comptroller identified a 5% error rate over a three-week period at a single exit on the NYS
Thruway, resulting in over 44,000 inaccurately billed transactions and contributing to $276.3 million in
outstanding unpaid tolls.⁶ Data from the Pennsylvania Turnpike Commission and the International Bridge, Tunnel
and Turnpike Association (IBTTA) indicate national toll leakage rates of 6–7%, with over $150 million in uncollected
tolls on the Pennsylvania Turnpike alone.⁷ Deloitte's 2024 analysis of the US tolling sector estimated aggregate
annual revenue leakage at approximately $2.24 billion.⁸ Industry data further indicates that almost 40% of toll-by-
plate revenue remains uncollected nationally across the United States.⁷
These are not theoretical projections. They represent audited, documented revenue losses that the tolling
industry has historically absorbed as an unavoidable cost of operations.

1.2 The Single-Source Accuracy Ceiling
The fundamental limitation is architectural, not technological. Single-camera ANPR systems — regardless of the
sophistication of the underlying optical character recognition (OCR) engine — are subject to an accuracy ceiling
imposed by the irreducible uncertainty of a single observation. When a single camera captures a licence plate,
the resulting image is subject to a specific set of environmental and geometric conditions at that instant. If those
conditions are unfavourable (glare, shadow, partial obscuration, off-axis viewing angle, motion blur), the OCR
engine receives degraded input and the probability of misrecognition increases. No amount of algorithmic
improvement to the OCR engine can fully compensate for information that was not captured in the original image.

This ceiling has been well characterised in the literature. OpenALPR benchmarks (2017) demonstrated single-
camera accuracies of 95–98% under controlled conditions.⁴ Hikvision's commercial ANPR specifications claim
accuracy of 98% or higher.⁵ Even the most recent deep learning approaches — including YOLOv10-based
detection architectures paired with Tesseract OCR — achieve 99%+ accuracy only under near-ideal conditions
and cannot maintain this performance across the full range of operational variables encountered in highway
tolling.⁹
The industry's historical response to this ceiling has been capital-intensive: install more expensive, purpose-built
cameras with dedicated illumination and optimised viewing geometry at each tolling point. This approach yields
incremental accuracy gains at high cost ($2–5 million per tolling point) while remaining fundamentally vulnerable
to the same single-point-of-failure limitations — a dirty plate or a moment of sun glare can render the entire
investment ineffective for that transaction. Notably, international standards for electronic fee collection —
including ISO 14906:2022 and ISO 17573-1:2019 — define system architectures and data exchange interfaces for
tolling but do not prescribe methods for overcoming single-source ANPR accuracy limitations.¹⁹ ²⁰ Similarly, the
Austroads Guide to Traffic Management (Part 7: Activity Centre Transport Management) addresses ITS camera
infrastructure for traffic management purposes but does not contemplate the repurposing of traffic monitoring
cameras for tolling via multi-source fusion.²¹

1.3 Multi-Source Fusion as a Theoretical Alternative
The theoretical basis for overcoming single-source limitations through multi-sensor data fusion is well
established in the broader literature. Koks and Challa (2005), in a foundational treatment published by the
Australian Defence Science and Technology Organisation (DSTO), demonstrated that Bayesian and Dempster-
Shafer fusion frameworks enable the combination of uncertain observations from multiple independent sensors
to produce estimates with substantially higher confidence than any individual sensor.¹⁰ The key mathematical
insight is that when observations are conditionally independent given the true state and priors are approximately
uniform, the posterior probability of the correct hypothesis increases exponentially with the number of confirming
observations — though the realised gain depends on the degree of independence achieved and the
informativeness of the priors.

In the specific domain of observer error-rate estimation without ground truth, the seminal work of Dawid and
Skene (1979) established that the Expectation-Maximisation (EM) algorithm can jointly estimate the true labels

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                               2/23
and the error-rate parameters of multiple fallible observers.¹¹ This framework, originally developed for medical
diagnosis applications, has been extensively validated in the crowdsourcing and machine learning literature.
Zhang et al. (2016) provided convergence rate guarantees for the Dawid-Skene estimator under spectral
initialisation.¹² Khetan et al. (2017) extended the theoretical analysis to the case of learning from noisy singly-
labelled data, demonstrating robust performance even with limited redundancy.¹³
The application of fusion techniques to ANPR has received limited attention relative to the maturity of the
underlying mathematical frameworks. Zibani et al. (2022) explored fusion-based approaches to licence plate
recognition using Dempster-Shafer evidence theory and majority voting — approaches that are substantially
simpler than Bayesian fusion with learned confusion matrices and syntax-conditioned priors.¹⁴ The intelligent
transport systems literature has addressed multi-sensor fusion for vehicle detection and classification, but has
not integrated Bayesian fusion, unsupervised Dawid-Skene model estimation, and syntax-conditioned priors into
a single coherent framework for tolling ANPR.

1.4 The Gap This Paper Addresses
No existing published work combines the following elements into a single integrated methodology validated at
production scale:

1. Bayesian posterior computation over candidate licence plate strings, conditioned on per-camera confusion
   matrices and syntax-aware character-position priors.
2. Unsupervised estimation of the complete statistical model (confusion matrices, syntax priors, character-
   position priors, insertion/deletion rates) via hard-max EM, seeded by majority voting, without requiring
   ground-truth labels.
3. A tractable candidate generation heuristic that reduces the computationally intractable exact posterior
   computation to a practical approximation with negligible error.
4. Empirical validation at production scale (100,000+ vehicles per day) on revenue-critical infrastructure.
This paper provides the full mathematical derivation, discusses the six model assumptions and their validity,
presents the EM estimation procedure, and validates the framework with empirical results from a sustained
deployment on a major Australian motorway.

1.5 Objective
The objective of this paper is to present the complete mathematical framework, implementation methodology,
and empirical validation of the IRIS adaptive Bayesian fusion methodology for multi-source licence plate
recognition in tolling operations. The paper demonstrates that this approach overcomes the single-source
accuracy ceiling, recovers substantial revenue leakage, and eliminates the requirement for capital-intensive
specialised tolling hardware — all while producing calibrated posterior probabilities that enable risk-based
operational decision-making.

2. Methodology

2.1 System Architecture Overview
The IRIS architecture operates as an intelligence layer between existing ANPR/OCR infrastructure and tolling
back-office systems. It does not replace or modify the underlying OCR engines; rather, it consumes their outputs
and applies probabilistic fusion to produce a single, high-confidence result for each vehicle passage. The
architecture comprises three principal processing stages:

1. Observation collection and normalisation. Raw OCR outputs from multiple cameras are collected,
   timestamp-aligned, and grouped into vehicle passage events. Each camera's output for a given passage is
   treated as an independent observation of the true licence plate number (LPN).
2. Bayesian fusion engine. The core probabilistic model computes the posterior probability of each candidate
   LPN given all observations, using per-camera confusion matrices, syntax-conditioned character-position
   priors, and insertion/deletion rate parameters. The statistical model is estimated without ground truth via the
   EM algorithm.

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                              3/23
3. Confidence-based routing. The posterior probability of the maximum a posteriori (MAP) estimate serves as
   a calibrated confidence score. Transactions exceeding a configurable confidence threshold proceed directly
   to billing. Transactions below the threshold are routed through secondary resolution mechanisms or flagged
   for manual review.
This architecture is deliberately OCR-engine agnostic. The fusion engine operates on character-level OCR outputs
regardless of the underlying recognition technology — whether commercial ANPR engines (Qfree, Transcore,
Hikvision, Axis), open-source alternatives, or deep learning pipelines. Improvements to underlying OCR accuracy
translate directly to improved fusion accuracy, making the IRIS layer complementary rather than competing with
advances in recognition technology.

                                                                          Figure 1: IRIS System Architecture



                     Camera 1                       Camera 2                    Camera 3                                 Camera m                            OCR Engines
                                                                                                           ···
 EXISTING




                                                                                                                                                     Any vendor — engine agnostic
                         O₁ᵢ                           O₂ᵢ                           O₃ᵢ                                       Oₘᵢ
                                                                                                                                                     Qfree · Transcore · Hikvision · DL




                                                                Character-level OCR outputs




                         1. Pre-processing                                             2. Bayesian Fusion                             3. Secondary Resolution
                                                                                           Candidate generation
                           Align · Group · Filter                                                                                      Cross-camera · Cross-passage
                                                                                        L₀ posterior computation
                      CLAHE · Perspective correction                                                                                     Cross-site · Re-evaluation
                                                                                   MAP estimate + confidence score
 IRIS




                                                                               EM Model Estimation (Unsupervised)
                                                                              M = (π, Θ, Γ, Λ, Δ) — no ground truth required




                                                      P > 95%                                            80–95%                            P < 80%




                                      Automated Billing                                         Enforcement                           Manual Review
 EXISTING




                                          Direct to invoice                                   Auto + optional review                 ~200/day (was 4,800)




FIGURE 1: IRIS SYSTEM ARCHITECTURE. THE THREE-LAYER ARCHITECTURE POSITIONS THE IRIS BAYESIAN FUSION ENGINE AS A SOFTWARE INTELLIGENCE LAYER
   BETWEEN EXISTING ITS CAMERA INFRASTRUCTURE (LAYER 1) AND THE TOLLING BACK-OFFICE SYSTEM (LAYER 3). THE EM MODEL ESTIMATION MODULE
 CONTINUOUSLY REFINES THE STATISTICAL MODEL M = (Π, Θ, Γ, Λ, Δ) WITHOUT GROUND TRUTH. CONFIDENCE-BASED ROUTING DIRECTS HIGH-CONFIDENCE
TRANSACTIONS (P > 95%) DIRECTLY TO AUTOMATED BILLING, RESERVING MANUAL REVIEW FOR THE GENUINELY AMBIGUOUS RESIDUAL (~200 TRANSACTIONS
                                                                   PER DAY).


2.2 Notation
The following notation, established in the CBS Group internal mathematical analysis peer reviewed by University
of Melbourne (2019),¹⁵ is used throughout this paper.

The key sets and variables are defined as follows:
            •   K — the set of syntax classes (e.g., "@@@###", "#@@#@@", "@####", where @ denotes an alphabetic
                character and # denotes a numeric digit)

            •   H — the set of characters, and H* = H ∪ {*} the wildcard-extended set (where * represents a missing or
                inserted character)

            •   C = {1, ..., m} — the set of cameras

            •   O_ci ∈ H* — the observation (OCR output) from camera c at character position i

            •   T_i ∈ H* — the true value of the licence plate at position i

The statistical model, estimated via EM, comprises the following parameters:

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                                                                                                4/23
    •    π_k — the prior probability of syntax class k ∈ K (i.e., P(K = k))

    •    Θ^k_{h,i} — the prior probability of character h at position i given syntax class k (equalling zero when the
         character violates the syntax rule)

    •    Γ^c_{t,o} — the probability with which camera c reads true character t as observation o (i.e., P(O = o | T =
         t)), constituting the per-camera confusion matrix

    •    Δ^c_i — the rate at which camera c erroneously deletes exactly i ∈ {0, 1, ...} characters from the LPN read

    •    Λ^c_i — the rate at which camera c erroneously inserts exactly i ∈ {0, 1, ...} characters into the LPN read

2.3 Model Assumptions
The Bayesian fusion derivation requires six assumptions. These were formally established in the CBS Group
internal mathematical analysis peer reviewed by University of Melbourne (2019)¹⁵ and are stated here with a
discussion of their validity in operational tolling environments.

Assumption 1: Conditional character independence. Given the syntax class, the distributions of characters are
independent between positions.
This assumption holds generally, with one notable exception: when the leading character of a jurisdiction's plate
syntax transitions (e.g., Victorian plates transitioning from "1@@#@@" to "2@@#@@"), the prior probability of
the second character becomes dependent on the first. This edge case affects a small fraction of plates during
transition periods and does not materially impact aggregate fusion accuracy.
Assumption 2: Conditional camera independence. Given the true LPN, the character reads across cameras are
independent.
This is the most consequential assumption and merits careful discussion. The assumption may be violated when
physical obscuration (e.g., mud, damage, or a large vehicle blocking sightlines) causes correlated errors across
multiple cameras. However, the assumption is practically justified by two factors. First, cameras in a properly
configured array are positioned at different viewing angles, distances, and heights, ensuring that their failure
modes are substantially decorrelated — a patch of glare affecting one camera will not affect another viewing the
vehicle from a different perspective. Second, the assumption is necessary for tractability: estimating joint
confusion rates across all camera pairs would require exponentially more parameters than are estimable from
available data. The empirical validation presented in Section 5, across 100,000+ daily transactions, confirms that
the assumption holds sufficiently well in practice to deliver sustained accuracy exceeding 99.4%.
The broader multi-sensor fusion literature corroborates this analysis. Research published in MDPI Sensors (2017)
and ScienceDirect (2018) confirms that violating conditional independence leads to overconfident estimates and
underestimated covariance, but that physical diversity of sensors (angle, modality, distance) provides sufficient
decorrelation for practical applications.¹⁶ ¹⁷
Assumption 3: Positional independence. Given the true LPN, the camera character reads between different
positions are independent.
This assumption is reasonable: the OCR process for one character position does not systematically influence the
OCR process for another position on the same camera.
Assumption 4: Syntax independence of observations. Given the true LPN, the camera readings are independent
of syntax class.
This assumption is guaranteed by the model structure, since syntax is completely determined by the truth: K =
f(T₁, ..., T_n). Camera confusion rates depend on what character is present, not on the syntactic role of that
character's position.
Assumption 5: Independence of insertion/deletion rates. The number of erroneous insertions and deletions is
independent of the truth, character readings, and syntax.
This assumption is reasonable, although it has not been empirically verified whether certain syntaxes are more
prone to insertion/deletion errors. The practical impact is minimal, as insertion/deletion events are relatively rare
compared to character substitution errors.

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                5/23
Assumption 6: Candidate tractability. The number of plausible candidates given a set of observations — those
with P(T₁, ..., T_n | O...) ≥ ε ≈ 0.000001 — is relatively small compared to the total number of possible LPNs.
This assumption enables the computationally tractable approximation described in Section 2.5. Its validity rests
on the observation that the vast majority of theoretically possible LPN strings have negligible posterior probability
given a set of observations, because they do not match any observed characters. The contribution of excluded
candidates constitutes a fixed additive term in the denominator that does not change the relative probabilities of
the candidates considered, though it marginally reduces absolute probability estimates in cases of high
uncertainty. This would lead to an alternative confidence threshold selection without affecting the end result.¹⁵

2.4 Bayesian Fusion Derivation
The core derivation computes the posterior probability of each candidate truth-and-syntax combination given all
camera observations. Let O_ci, c ∈ C, i ∈ {1, ..., n}, be the set of observations from all cameras for a particular
vehicle passage with LPN length n, where string alignment has been performed such that some O_ci = "*" where
characters were erroneously deleted. Given the statistical model M = (π, Θ, Γ, Λ, Δ), the objective is to find:

arg max P(K = k, T₁ = t₁, ..., T_n = t_n | O₁₁ = o₁₁, ..., O_mn = o_mn)

over k ∈ K, t₁ ∈ H, ..., t_n ∈ H**

Applying Bayes' theorem and the six assumptions in sequence yields the following derivation, following the CBS
Group internal mathematical analysis peer reviewed by University of Melbourne (2019):¹⁵

Step 1 — Bayes' theorem:
P(K, T₁, ..., T_n | O₁₁, ..., O_mn) = P(O₁₁, ..., O_mn | K, T₁, ..., T_n) × P(K, T₁, ..., T_n) / P(O₁₁, ..., O_mn)
Step 2 — Conditional probability (expanding the joint prior):
= P(O₁₁, ..., O_mn | K, T₁, ..., T_n) × P(T₁, ..., T_n | K) × P(K) / P(O₁₁, ..., O_mn)
Step 3 — Assumption 4 (syntax independence of observations):
= P(O₁₁, ..., O_mn | T₁, ..., T_n) × P(T₁, ..., T_n | K) × P(K) / P(O₁₁, ..., O_mn)
Step 4 — Assumption 2 (conditional camera independence):
= [∏ᵢ₌₁ᵐ P(O_i1, ..., O_in | T₁, ..., T_n)] × P(T₁, ..., T_n | K) × P(K) / P(O₁₁, ..., O_mn)
Step 5 — Assumption 5 (insertion/deletion independence):
= [∏ᵢ₌₁ᵐ P(#λᵢ) × P(#δᵢ) × P(O_i1, ..., O_in | T₁, ..., T_n)] × P(T₁, ..., T_n | K) × P(K) / P(O₁₁, ..., O_mn)
where #λᵢ and #δᵢ denote the observed number of insertions and deletions for camera i.
Step 6 — Assumption 3 (positional independence):
= [∏ᵢ₌₁ᵐ P(#λᵢ) × P(#δᵢ)] × [∏ⱼ₌₁ⁿ ∏ᵢ₌₁ᵐ P(O_ij | T_j)] × P(T₁, ..., T_n | K) × P(K) / P(O₁₁, ..., O_mn)
Step 7 — Assumption 1 (conditional character independence):
= [∏ᵢ₌₁ᵐ P(#λᵢ) × P(#δᵢ)] × [∏ⱼ₌₁ⁿ ∏ᵢ₌₁ᵐ P(O_ij | T_j)] × [∏ⱼ₌₁ⁿ P(T_j | K)] × P(K) / P(O₁₁, ..., O_mn)
Step 8 — Substitution of statistical model parameters:
The numerator, expressed in terms of the estimated model parameters, becomes:
L₀ = [∏ᵢ₌₁ᵐ Λⁱ(#λᵢ) × Δⁱ(#δᵢ)] × [∏ⱼ₌₁ⁿ ∏ᵢ₌₁ᵐ Γⁱ{T_j, O_ij}] × [∏ⱼ₌₁ⁿ Θᴷ{T_j, j}] × πᴷ

Each term in this expression has a clear probabilistic interpretation:

    •    ∏ᵢ₌₁ᵐ Λⁱ(#λᵢ) × Δⁱ(#δᵢ) — the likelihood of observing this specific combination of character insertions and
         deletions across all cameras.

    •    ∏ⱼ₌₁ⁿ ∏ᵢ₌₁ᵐ Γⁱ_{T_j, O_ij} — the likelihood of obtaining the observed character readings from all cameras,
         given the hypothesised true LPN (the product of confusion matrix entries).


L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                           6/23
     •         ∏ⱼ₌₁ⁿ Θᴷ_{T_j, j} — the prior probability of the hypothesised true characters at each position, given the
               syntax class.

     •         πᴷ — the prior probability of the syntax class.

The denominator requires summation over all possible syntax-and-LPN combinations, which is computationally
intractable. However, Assumption 6 provides the approximation described in Section 2.5.

                           Figure 2a: Bayesian Fusion — From Multiple Imperfect Observations to High-Confidence Identification

      Camera Observations
           Individual OCR readings



         Cam 1                     ABD123
         Front · Colour
                                   Conf: 85%



         Cam 2                     ABC128                                                           Bayesian Fusion Engine
         Oblique · IR                                                                                                                                                            Fused Result
                                                                                                    Per-camera confusion matrices Γ
                                   Conf: 92%
                                                                                                     Syntax-conditioned priors Θ, π
                                                                                                       Insertion/deletion rates Λ, Δ
                                                                                                                                                                                   ABC123
         Cam 3                     ABC123                                                                                                                                     Confidence: 99.7%
         Rear · Mono
                                                                                                          P(T | O₁, O₂, O₃, O₄)
                                                                                                                                                                            → Direct to automated billing
                                   Conf: 94%
                                                                                                           = L₀ / Σ L₀ (plausible)
                                                                                                    Posterior normalised over candidates

         Cam 4                     A*C123
         Overhead
                                   Conf: 78%




                                                  Key Insight: No single camera achieves >95% confidence. Fusion of four imperfect observations yields 99.7%.
                                                          Camera 1 misreads position 3 (D→C). Camera 2 misreads position 6 (8→3). Camera 4 drops position 2.
                                                       The fusion engine correctly resolves all errors by combining probabilistic evidence across independent sources.




  FIGURE 2A: BAYESIAN FUSION — CONCEPTUAL EXAMPLE. FOUR CAMERAS EACH PRODUCE IMPERFECT READINGS OF THE SAME LICENCE PLATE. CAMERA 1
  MISREADS POSITION 3 (C→D), CAMERA 2 MISREADS POSITION 6 (3→8), CAMERA 3 READS CORRECTLY, AND CAMERA 4 DROPS POSITION 2 ENTIRELY. NO
     SINGLE CAMERA ACHIEVES CONFIDENCE ABOVE 94%. THE FUSION ENGINE RESOLVES ALL ERRORS BY COMBINING PROBABILISTIC EVIDENCE ACROSS
                                INDEPENDENT SOURCES, PRODUCING A CORRECT RESULT AT 99.7% CONFIDENCE.

                                               Figure 2b: Bayesian Fusion — Staged Posterior Probability Computation (L₄ → L₀ → P)


                Model Inputs                                                              Staged Posterior Computation                                                                Output

            Camera observations
                                                               L₄   = πₖ                                      Syntax class prior
                  O₁ᵢ, O₂ᵢ, ... Oₘᵢ                                                                                                                                                MAP Estimate
                                                                                                     × multiply down ▼                                                              arg max P(T|O)
                 Syntax priors
                    πₖ = P(K = k)                              L₃   = L₄ × ∏ⱼ Θᴷ(Tⱼ, j)              + Character-position priors

                                                                                                     × multiply down ▼                                                          Confidence Score
               Character priors                                                                                                                                                 Calibrated posterior P
               Θᵏₕ,ᵢ = P(Tᵢ=h | K=k)                           L₁   = L₃ × ∏ⱼ ∏ᶜ Γᶜ(Tⱼ, Oᶜⱼ)      + Confusion matrix likelihoods

                                                                                                     × multiply down ▼
             Confusion matrices                                                                                                                                                  Decision Routing
                Γᶜₜ,ₒ = P(O=o | T=t)
                                                               L₀   = L₁ × ∏ᶜ Λᶜ(#λᶜ) × Δᶜ(#δᶜ)        + Insertion/deletion rates
                                                                                                                                                                         P > 95% → Auto bill

                 Ins/Del rates                                                                         ÷ normalise ▼                                                     80–95% → Enforcement

                        Λᶜᵢ, Δᶜᵢ                                                                                                                                         P < 80% → Manual
                                                               P    = L₀ / Σ(plausible) L₀                Posterior probability




                                                                           Each stage multiplicatively incorporates additional evidence.
                                                              L₀ is the unnormalised posterior; P is the calibrated probability used for operational decisions.




FIGURE 2B: STAGED POSTERIOR PROBABILITY COMPUTATION. THE POSTERIOR PROBABILITY P IS COMPUTED BY MULTIPLICATIVELY INCORPORATING FOUR LAYERS
       OF EVIDENCE: SYNTAX CLASS PRIORS (L₄), CHARACTER-POSITION PRIORS (L₃), CONFUSION MATRIX LIKELIHOODS ACROSS ALL CAMERAS (L₁), AND
  INSERTION/DELETION RATES (L₀). THE UNNORMALISED POSTERIOR L₀ IS THEN NORMALISED OVER THE PLAUSIBLE CANDIDATE SET TO PRODUCE A CALIBRATED
                                              PROBABILITY P THAT ENABLES CONFIDENCE-BASED ROUTING.




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                                                                                                               7/23
2.5 Candidate Generation and Posterior Approximation
The exact posterior computation requires enumerating all possible LPN strings across all syntax classes — a
space that is computationally intractable. Assumption 6 establishes that only a small number of candidates carry
non-negligible posterior probability. The IRIS candidate generation algorithm exploits this property through a
structured heuristic.

Compatible syntax identification. First, the set of compatible syntaxes is identified based on the observed string
lengths across cameras, accounting for wildcards (missing characters). For example, if camera observations
include strings of length 5, 6, and 6 (with wildcards), syntaxes of lengths 5 and 6 are both considered. When a
syntax is shorter than the longest observed string, all possible inclusion/exclusion cases (which character
positions to omit) are exhaustively enumerated.
Candidate generation. For each compatible syntax and each inclusion/exclusion case, the algorithm proceeds
as follows:
1. Select the most likely character for each position (based on the current model) and add the resulting LPN as
   a candidate.
2. For each character position, swap the most likely character with the second most likely, and then with the
   third most likely, adding each resulting LPN as a candidate (single-position swaps).
3. For each pair of character positions, swap each character with the next most likely in both positions
   simultaneously (double-position swaps).
This procedure generates the most probable candidate, all single-swap variants, and all double-swap variants for
each syntax and inclusion/exclusion case. With typically fewer than 10 compatible syntaxes and fewer than 10
plausible candidates per syntax, the total candidate set remains under 100 — well within computational
tractability for real-time processing.

Posterior approximation. The posterior probability for each candidate is computed by normalising over the
plausible candidate set only:
P ≈ L₀ / Σ_{plausible} L₀

This approximation is valid because the contribution of excluded candidates to the denominator is negligible:
each individual excluded LPN has posterior probability below ε ≈ 10⁻⁶, and while their aggregate contribution may
be non-zero, it constitutes a fixed additive constant that does not change the relative ranking of plausible
candidates.¹⁵

2.6 Expectation-Maximisation for Unsupervised Model Estimation
The complete statistical model M = (π, Θ, Γ, Λ, Δ) must be estimated from operational data where ground-truth
LPN labels are not available. The IRIS framework achieves this through a hard-max variant of the Expectation-
Maximisation algorithm, following the foundational approach of Dawid and Skene (1979).¹¹

The EM algorithm treats each camera as an independent "annotator" whose error patterns (confusion matrices)
are unknown. By observing the agreement and disagreement patterns across cameras over a large corpus of
vehicle passages, the algorithm jointly estimates the most likely true LPN for each passage and the error-rate
parameters of each camera.
Algorithm: Hard-Max EM for IRIS Model Estimation
The procedure is as follows:
1. Initialisation (majority voting). For each vehicle passage, compute an initial estimate of the true LPN using
   a majority voting scheme across all camera observations. This provides the "seed" for the EM iterations and
   biases the algorithm toward a sensible region of the parameter space.
2. Iterate until convergence (or maximum iteration count reached):
    •   (a) M-Step — Estimate model given current truth estimates. Given the current assignment of truths
        and their corresponding syntaxes, all model parameters are estimated via maximum likelihood:
        ▬ Syntax priors π_k are estimated from the relative frequencies of each syntax class.

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                             8/23
        ▬ Character-position priors Θ^k_{h,i} are estimated from the observed character frequencies at each
          position for each syntax.
        ▬ Confusion matrices Γ^c_{t,o} are estimated from the observed character confusion rates for each
          camera.
        ▬ Insertion/deletion rates Λ^c_i and Δ^c_i are estimated from the observed insertion/deletion
          frequencies for each camera.
    •   (b) E-Step — Compute MAP truth given current model. For each vehicle passage, compute the
        maximum a posteriori (MAP) LPN — that is, the single most probable truth — using the current model
        parameters (via the posterior computation in Section 2.4 with the candidate generation in Section 2.5).
        Critically, hard-max EM selects only this MAP estimate and treats it as fixed for the subsequent M-step,
        rather than integrating over the full posterior distribution of possible truths (as soft-max EM would). This
        simplification is justified by the observation that in the vast majority of passages, the MAP candidate
        carries overwhelming posterior probability, and the influence of low-confidence passages on model
        estimation is small and tends to average out over large data volumes.¹⁵
3. Convergence. Convergence is declared when the hard truth assignments do not change between iterations.
   In practice, convergence typically occurs within 10–20 iterations.¹⁵
Laplace smoothing. It is essential that smoothing factors are applied to all rate parameter estimates to ensure
that no estimated probability is zero. A zero confusion rate would cause the model to assign zero posterior
probability to any candidate that implies that confusion, even if it is the true LPN. Laplace smoothing with a
configurable factor (e.g., α = 1) is applied to all parameter estimates.

Majority voting initialisation. The choice of initialisation is critical because the EM algorithm is guaranteed to
converge only to a local maximum of the likelihood function, not the global maximum. Majority voting provides a
high-quality initialisation that has been extensively validated in the Dawid-Skene literature.¹² ¹³ The large volume
of data available in tolling operations (100,000+ passages per day) provides robust convergence across a wide
range of initialisation strategies.
Relationship to Dawid-Skene. The original Dawid-Skene model estimates a single confusion matrix per observer
for a fixed classification task. The IRIS extension enriches this substantially by incorporating syntax-conditioned
character-position priors and explicit modelling of character insertion and deletion events. While the theoretical
optimality guarantees of the original paper have not been formally reworked for the extended model, all estimated
parameters remain essentially Bernoulli random variables estimated by computing the proportion of
corresponding cases in the assumed truth (with smoothing), and the approach is consistent with the intent and
spirit of the Dawid-Skene framework.¹⁵




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                               9/23
                                             Figure 3: Hard-Max EM Algorithm — Iterative Estimation Cycle


                                                                                      Initialisation
                                                                              Majority voting across cameras
                                                                       T̂⁰ = majority(O₁, O₂, ..., Oₘ) for each passage


                                                                                                       t=0



               ITERATE until convergence (typically 10–20 iterations)


                                   M-Step: Estimate Model                                                                  E-Step: Compute MAP Truth

                   Given current truth T̂⁽ᵗ⁾, estimate via MLE:                                                 For each passage, compute:

                     • Syntax priors π̂ₖ⁽ᵗ⁺¹⁾                                                                   T̂⁽ᵗ⁺¹⁾ = arg max P(T | O; M̂⁽ᵗ⁺¹⁾)
                                                                                             M̂⁽ᵗ⁺¹⁾                                                               Yes
                     • Character priors Θ̂ᵏₕ,ᵢ⁽ᵗ⁺¹⁾                                                                                                        Δ=0?
                                                                                                                Hard-max: select single MAP
                     • Confusion matrices Γ̂ᶜₜ,ₒ⁽ᵗ⁺¹⁾
                                                                                                                (not full posterior distribution)
                     • Ins/del rates Λ̂ᶜᵢ⁽ᵗ⁺¹⁾, Δ̂ᶜᵢ⁽ᵗ⁺¹⁾
                                                                                                                Uses Bayesian fusion (Section 2.4)
                   + Laplace smoothing (α = 1)
                                                                                                                + candidate generation (Section 2.5)              No


                                                                              T̂⁽ᵗ⁺¹⁾ → next iteration (t = t + 1)




                                                                  Converged Model M̂* + Truth Estimates T̂*
                                                                  Calibrated parameters for real-time fusion (Section 2.4)



 FIGURE 3: HARD-MAX EM ALGORITHM. THE ITERATIVE CYCLE BEGINS WITH MAJORITY VOTING INITIALISATION (STEP 1), THEN ALTERNATES BETWEEN THE M-
STEP (ESTIMATING ALL MODEL PARAMETERS VIA MAXIMUM LIKELIHOOD GIVEN CURRENT TRUTH ASSIGNMENTS) AND THE E-STEP (COMPUTING THE MAP TRUTH
     FOR EACH PASSAGE GIVEN THE CURRENT MODEL). HARD-MAX EM SELECTS ONLY THE SINGLE MOST PROBABLE TRUTH AT EACH E-STEP, RATHER THAN
     INTEGRATING OVER THE FULL POSTERIOR. CONVERGENCE IS DECLARED WHEN TRUTH ASSIGNMENTS STABILISE, TYPICALLY WITHIN 10–20 ITERATIONS.


2.7 Multi-Stage Processing Pipeline
The IRIS processing pipeline operates in three stages that execute sequentially for each vehicle passage.

Stage 1 — Pre-processing and normalisation. Raw OCR outputs from all cameras are collected and normalised.
This includes contrast-limited adaptive histogram equalisation (CLAHE) for image enhancement, perspective
correction for off-axis cameras, and plate syntax filtering to discard OCR outputs that do not match any expected
regional plate format. Multiple parallel OCR engines can be run on each camera's image to produce diverse
candidate readings.
Stage 2 — Primary Bayesian resolution. Timestamp-aligned observations are grouped into vehicle passage
events using temporal proximity and Levenshtein edit distance as grouping metrics. In multi-lane scenarios where
multiple vehicles may be within the field of view simultaneously, the grouping algorithm combines timestamp
correlation with spatial lane assignment (where available from camera metadata) and edit-distance thresholds
to isolate individual vehicle passages. The Bayesian fusion engine (Section 2.4) computes the posterior probability
for each candidate LPN. The MAP estimate and its associated posterior probability (the confidence score) are
output.
Stage 3 — Secondary resolution and routing. Passages whose fused confidence exceeds the operational
threshold proceed directly to billing. Passages below the threshold undergo secondary checks, which may
include cross-camera majority voting (a faster, simpler algorithm), cross-passage matching (comparing low-
confidence plates against recent high-confidence observations at the same location), and cross-site handoff
(using prior plate state from upstream tolling points). Passages that remain unresolved after secondary resolution
are routed to manual review.

2.8 Confidence Scoring and Risk-Based Decision-Making
A distinctive feature of the Bayesian fusion approach is that the posterior probability of the MAP estimate
constitutes a calibrated confidence score. Unlike binary pass/fail classification in traditional ANPR systems, the
IRIS confidence score enables graduated, risk-based operational decision-making.



L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                                                             10/23
The confidence score framework operates as follows:
    •     High confidence (>95%). Transactions proceed directly to automated billing without exception
          processing.
    •     Medium confidence (80–95%). Transactions are processed through automated enforcement with
          human review available as an option.
    •     Low confidence (<80%). Transactions are flagged for manual review or routed through alternative
          collection mechanisms.
Toll operators configure these thresholds to balance the trade-off between automation rate and revenue
assurance based on their specific operational requirements and risk appetite. The calibration of probability
estimates — whether passages assigned 80% confidence are correct approximately 80% of the time — is an
important validation requirement that should be assessed empirically with expected-versus-predicted analysis.¹⁵

                             Figure 4: IRIS Multi-Stage Processing Pipeline with Confidence-Based Routing

                                                                                                                  P > 95%
                                                                                                                                                Auto Bill
                                                                                                                                               ~95% of txns
                                                                             Stage 2: Bayesian Fusion
                              Stage 1: Pre-processing
                                                                        Candidate generation
                          CLAHE enhancement
        Raw OCR                                                         Posterior computation                                    Stage 3:
                                                                                                                      80–95%
                          Perspective correction                                                                               Secondary
        Outputs                                                         P = L₀ / Σ L₀                        P?
                          Timestamp alignment                                                                                    Cross-cam
        m cameras                                                       MAP estimation
                          Passage grouping                                                                                     Cross-passage
                                                                        Confidence scoring
                          Syntax filtering
                                                                        ~120ms per passage

                                                                                                                  P < 80%
                                                                                                                                                 Manual
                                                                                                                                                ~200/day




                                                                   Transaction Volume Reduction

                                                                       100,000+ passages/day (input)


                                                        ~95% → Automated billing (high confidence P > 95%)

                                                                                                                                               ~4%
                                                                                                                                                 ~200




  FIGURE 4: MULTI-STAGE PROCESSING PIPELINE. RAW OCR OUTPUTS ENTER STAGE 1 (PRE-PROCESSING AND NORMALISATION), FLOW THROUGH STAGE 2
 (BAYESIAN FUSION CORE, ~120MS PER PASSAGE), AND ARE THEN ROUTED BY CONFIDENCE SCORE: HIGH-CONFIDENCE TRANSACTIONS (P > 95%) PROCEED
DIRECTLY TO AUTOMATED BILLING (~95% OF ALL PASSAGES), MEDIUM-CONFIDENCE TRANSACTIONS (80–95%) ENTER STAGE 3 FOR SECONDARY RESOLUTION,
    AND LOW-CONFIDENCE TRANSACTIONS (P < 80%) ARE FLAGGED FOR MANUAL REVIEW (~200 PER DAY). THE TRANSACTION VOLUME REDUCTION BAR
                                                      ILLUSTRATES THE FUNNEL EFFECT.


3. Deployment Environment and Experimental Setup
This section describes the deployment environment, camera configuration, and integration architecture that
constitute the experimental context for the empirical validation presented in Section 4. In the IMRaD convention,
this material forms the applied component of the methodology — specifying the conditions under which the
framework described in Section 2 was validated.

3.1 Deployment Environment
The IRIS framework was deployed on a major Australian motorway corridor, selected for the following
characteristics:

    •     Traffic volume. Over 100,000 vehicle passages per day, providing a statistically robust sample for model
          estimation and performance evaluation.
    •     Revenue significance. The corridor generates approximately $200 million in annual tolling revenue,
          making accuracy improvements directly material to financial outcomes.
    •     Existing camera infrastructure. The motorway was equipped with 47 ITS cameras (a combination of
          traffic monitoring, incident detection, and CCTV cameras) distributed across the corridor, consistent with
          the camera density and placement guidance established in Austroads smart motorway design
          standards.²¹ Of these, 31 were identified as suitable for integration into the IRIS fusion engine based on

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                                                     11/23
        their positioning relative to traffic flow, image resolution, and coverage overlap. The remaining 16
        cameras were excluded due to insufficient licence plate resolution (wide-angle overview cameras),
        positioning that did not provide a viable plate viewing angle, or inadequate overlap with other cameras to
        contribute meaningfully to fusion (isolated cameras serving only incident detection functions).
    •   Baseline performance. The pre-existing tolling system, operating with single-camera ANPR, achieved
        recognition accuracy of 95.2–96.5%, resulting in estimated annual revenue leakage of approximately $7
        million.
    •   Conventional alternative cost. The estimated cost of a traditional hardware-centric upgrade —
        comprising full tolling gantry replacement, dedicated ANPR cameras with optimised viewing geometry,
        synchronised infrared and visible illumination arrays, edge processing units, and associated civil and
        electrical works — was $45 million.

3.2 Camera Array Configuration
The selected cameras provided diversity across multiple dimensions critical to satisfying the conditional
independence assumption (Assumption 2). The key diversity dimensions are as follows:

    •   Viewing geometry. Cameras were positioned at varying angles relative to the direction of vehicle travel
        (front-facing, rear-facing, and oblique views), different mounting heights, and different longitudinal
        positions along the corridor.
    •   Spectral modality. The array included colour, monochrome, and infrared-capable cameras, ensuring
        that different failure modes (e.g., colour cameras failing under infrared-only illumination, or monochrome
        cameras failing to distinguish certain character colours) were decorrelated.
    •   Focal characteristics. A mix of wide-angle and narrow-angle (macro and micro zoom) cameras provided
        complementary depth-of-field and resolution characteristics.
This physical diversity ensures that the conditions causing a misrecognition on one camera (e.g., glare from a
specific sun angle, or a truck obscuring a specific viewing lane) are unlikely to simultaneously affect all cameras
observing the same vehicle.

3.3 Integration Architecture
The IRIS system was deployed as a software middleware layer with the following integration characteristics:

    •   No hardware modification. No new cameras, illuminators, or roadside equipment were required. The
        system consumed video feeds from existing ITS cameras via the motorway's established network
        infrastructure.
    •   OCR engine agnostic. The fusion engine consumed character-level outputs from the existing ANPR
        engines without requiring modification to those engines.
    •   Back-office integration. Confidence-scored fusion results were passed to the existing tolling back-office
        system via standardised interfaces, requiring only configuration changes (not architectural changes) to
        the billing and exception handling workflows. The IRIS output data structure — comprising the fused plate
        string, posterior probability confidence score, syntax class, region of origin, and per-camera observation
        detail — is designed to align with the data exchange architecture specified in ISO 17573-1:2019 for
        electronic fee collection system interoperability.²⁰
    •   Parallel operation. During the calibration and validation phases, IRIS operated in parallel with the
        existing tolling system, allowing direct performance comparison without operational risk.




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                             12/23
4. Results

4.1 Deployment Timeline
The IRIS implementation followed a phased deployment over approximately 18 months. The key phases were as
follows:

4. Months 1–2: Site assessment, camera network audit, and feasibility analysis.
5. Months 2–6: Software deployment, algorithm calibration using historical and live-but-passive data feeds, and
   performance baselining.
6. Months 6–12: Parallel operation alongside the existing tolling system, with continuous refinement of fusion
   parameters.
7. Months 12–18: Full transition to IRIS-based processing, decommissioning of legacy single-camera
   workflows.
The phased approach, particularly the extended parallel operation in months 6–12, was designed to mitigate
transition risk. During parallel operation, the IRIS system produced fusion results for every vehicle passage while
the legacy system remained the system of record for billing. This allowed direct, transaction-level performance
comparison without operational risk and provided ultimate confidence in system reliability before cutover.
Operators considering IRIS deployment should also assess whether existing toll concession agreements or
regulatory frameworks require amendment to accept fusion-based identification as the primary billing source —
a contractual consideration that should be addressed during the feasibility phase.

4.2 Primary Performance Metrics
The following table presents the principal performance metrics comparing the pre-IRIS baseline with the
sustained post-deployment performance.

Table 1: IRIS Deployment — Primary Performance Metrics

 Metric                    Pre-IRIS Baseline                     Post-IRIS (Fusion)            Improvement
 Recognition Accuracy      95.2% – 96.5%                         >99.4%                        ~4 percentage
                                                                                               points
 Error Rate                ~3.5% – 4.8%                          <0.6%                         >83% reduction
 Annual Revenue            ~$7 million                           ~$1.2 million                 $5.8 million
 Leakage                                                                                       recovered
 Manual Exception          ~4,800 transactions/day               ~200 transactions/day         96% reduction
 Processing
 Capital Investment        $45 million (estimated for hardware   $6.2 million (total           86% cost saving
                           replacement)                          implementation)
 System Availability       98.2%                                 99.7%                         1.5 percentage
                                                                                               points




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                             13/23
                                Figure 5: IRIS Deployment — Performance Comparison (Pre- vs Post-Deployment)
                                                               Pre-IRIS Baseline                Post-IRIS (Fusion)



               Recognition Accuracy                                                Error Rate                                                 Annual Revenue Leakage
                              >99.4%                                                                                                             ~$7M
      100%                                                   5%
                                                                            ~4.2%                                               $7M

                 ~95.8%
      96%                                                    4%
                                                                                                                                $5M


      92%                                                    2%
                                                                                                                                $3M                        ~$1.2M
                                                                                          <0.6%

      88%                                                    0%                                                                 $0M

                      +3.6 pp                                                  83% reduction                                                      $5.8M recovered




                              Manual Exception Processing (txns/day)                                                 Capital Investment ($M)
                                                                                                                         $45M
                                         ~4,800
                    5,000                                                                         $45M


                    3,000                                                                         $30M



                    1,000                                                                         $15M
                                                                                                                                      $6.2M
                                                     ~200
                                                                                                   $0M
                          0

                                           96% reduction                                                                 86% cost saving




 FIGURE 5: PRE- VS POST-DEPLOYMENT PERFORMANCE. THE FIVE PANELS QUANTIFY THE IRIS DEPLOYMENT IMPACT ACROSS RECOGNITION ACCURACY (+3.6
   PERCENTAGE POINTS), ERROR RATE (−83%), ANNUAL REVENUE LEAKAGE ($5.8M RECOVERED), MANUAL EXCEPTION PROCESSING (−96%), AND CAPITAL
 INVESTMENT (−86%). THE MAGNITUDE OF THE MANUAL PROCESSING AND CAPITAL INVESTMENT REDUCTIONS — FROM 4,800 TO 200 TRANSACTIONS PER
              DAY, AND FROM $45M TO $6.2M RESPECTIVELY — ILLUSTRATES THE TRANSFORMATIVE OPERATIONAL AND FINANCIAL IMPACT.



4.3 Accuracy Analysis
The improvement from a baseline of 95.2–96.5% to sustained accuracy exceeding 99.4% represents a reduction
in the error rate by more than 83%. This improvement is consistent with the theoretical predictions of multi-source
Bayesian fusion: under strict conditional independence and with informative priors, multiple independent
observations at approximately 95% individual accuracy are expected to yield combined accuracy exceeding 99%
for three or more sources.¹⁰ The magnitude of the gain depends on the degree of independence between sources
and the informativeness of the syntax-conditioned priors; the IRIS deployment's physical camera diversity and
jurisdiction-specific syntax libraries satisfy both conditions.

The accuracy improvement was observed consistently across diverse operating conditions:
8. Vehicle class. Accuracy improvements were sustained across passenger vehicles, light commercial
   vehicles, and heavy vehicles, with the largest gains observed for heavy vehicles where partial plate
   obscuration is most common (due to multiple viewing angles overcoming single-camera occlusion).
9. Environmental conditions. Performance was maintained across daytime, nighttime, wet weather, and high-
   glare conditions. The fusion approach was particularly resilient under adverse conditions that would
   substantially degrade single-camera accuracy, because different cameras in the array were affected
   differently by the same environmental variable.
10. Traffic volume. Performance was sustained at traffic volumes ranging from off-peak (approximately 40,000
    vehicles per day) to peak (exceeding 100,000 vehicles per day), confirming that the computational
    architecture scales appropriately.

4.4 Processing Latency
Real-time tolling operations impose strict latency requirements. The IRIS fusion pipeline achieved an average end-
to-end processing latency of approximately 120 milliseconds per plate read event, well within the 250-millisecond
response time threshold required by modern electronic tolling service level agreements. This latency
encompasses OCR output collection, temporal grouping, Bayesian fusion computation (including candidate
generation and posterior evaluation), and confidence-scored output delivery. Key optimisations contributing to
this performance include parallel OCR processing across independent plate groups distributed across multiple
CPU cores, GPU-accelerated image pre-processing and matrix operations, and aggressive caching of recently
processed plates and confusion matrix data. Benchmarks were measured on dual Intel Xeon Silver 4114 CPUs

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                                                                             14/23
(2.2 GHz, 10 cores), 64 GB DDR4-2666 RAM, and dual NVIDIA Tesla T4 GPUs (16 GB VRAM). Actual performance
will vary depending on specific hardware and software environments; rigorous load testing and capacity planning
is advised before production deployment.

4.5 Operational Efficiency
The reduction in manual exception processing from approximately 4,800 to approximately 200 transactions per
day represents a 96% decrease in the volume of human-mediated resolution activity. This outcome has two
compounding effects. First, it eliminates the direct operational cost of manual review (estimated at over 5,000
labour hours annually for a large tolling facility). Second, it enables operational staff to be redirected to higher-
value activities including customer service, fraud detection, and systematic quality assurance.

The confidence-scoring framework enables this efficiency gain by routing only genuinely ambiguous transactions
to human review. Under the pre-IRIS regime, all transactions below the binary pass threshold required manual
intervention regardless of the degree of ambiguity. Under IRIS, the graduated confidence score allows the vast
majority of transactions to be resolved automatically at high confidence, reserving manual review for the small
residual set where the probabilistic evidence is genuinely insufficient.

4.6 Financial Outcomes
The economic case is summarised in three dimensions:

11. Revenue recovery. $5.8 million in annual revenue recovered from transactions that would previously have
    been unbillable due to recognition errors, representing an 83% reduction in revenue leakage.
12. Capital cost avoidance. The IRIS implementation cost of $6.2 million compares with an estimated $45
    million for a conventional hardware replacement of the tolling gantry infrastructure — an 86% reduction in
    capital expenditure. The system leveraged 31 of 47 existing ITS cameras, requiring no new roadside hardware.
13. Operational cost reduction. The 96% reduction in manual exception processing translates to substantial
    ongoing operational savings in labour costs, with recovered staff capacity available for redeployment to
    higher-value functions.
The ratio of implementation cost to annual revenue recovery ($6.2 million versus $5.8 million per annum)
indicates a payback period of approximately 13 months, with ongoing annual returns of $5.8 million against
minimal incremental operating costs.

                                                 Figure 6: Financial Impact — Three Dimensions of Value Creation


                   Capital Cost Avoidance                                 Annual Revenue Recovery                    Operational Eﬃciency



                           86%                                                  $5.8M                                      96%
                        capital cost reduction                                 recovered per annum                  reduction in manual review


                                    $45M                                                $7M leaked                                      4,800/day
         Conventional                                             Pre-IRIS annual leakage                  Pre-IRIS manual reviews


                $6.2M                                                  $1.2M                                 200/day
         IRIS                                                     Post-IRIS residual                       Post-IRIS manual reviews




                  Composition of $45M estimate:                               Revenue leakage sources:                   Operational impact:

         • Tolling gantry replacement                             • Misrecognised plates → wrong billing   • 5,000+ labour hours/yr recovered
         • Dedicated ANPR cameras                                 • Unreadable plates → unbillable         • Staﬀ redeployed to fraud detection
         • IR/visible illumination arrays                         • Manual review overflow → abandoned     • Customer service improvement
         • Edge processing units                                                                           • Systematic quality assurance
         • Civil and electrical works
                                                                            83% of leakage eliminated

                            $38.8M saved                                          13-month payback                     Ongoing annual savings




  FIGURE 6: THREE DIMENSIONS OF FINANCIAL VALUE. THE IRIS DEPLOYMENT CREATES VALUE ACROSS THREE COMPLEMENTARY DIMENSIONS: CAPITAL COST
   AVOIDANCE (86% REDUCTION, $38.8M SAVED VERSUS CONVENTIONAL HARDWARE REPLACEMENT), ANNUAL REVENUE RECOVERY ($5.8M PER ANNUM,
REPRESENTING 83% OF PRIOR LEAKAGE, WITH A 13-MONTH PAYBACK PERIOD), AND OPERATIONAL EFFICIENCY (96% REDUCTION IN MANUAL REVIEW VOLUME,
                         RECOVERING 5,000+ LABOUR HOURS ANNUALLY FOR REDEPLOYMENT TO HIGHER-VALUE FUNCTIONS).

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                                                          15/23
5. Discussion

5.1 Interpretation of Results
The empirical results validate the central thesis: Bayesian fusion of multi-source ANPR data achieves accuracy
levels that are mathematically unattainable by single-camera systems regardless of hardware quality. The 4-
percentage-point accuracy improvement (from ~95.5% to >99.4%) is consistent with the theoretical expectation
that combining conditionally independent observations at ~95% individual accuracy, with informative syntax-
conditioned priors, yields combined accuracy exceeding 99% for three or more diverse sources. The actual
magnitude of the gain is contingent on the degree of camera independence and prior informativeness — both of
which were substantively satisfied in this deployment.

The magnitude of the financial impact — $5.8 million in annual revenue recovery on a $200 million corridor —
underscores that even small percentage-point improvements in recognition accuracy translate to material
financial outcomes in high-volume tolling operations. Each 1% improvement in plate read accuracy yields
approximately a 0.8% increase in recognised revenue, compounding annually.

5.2 Comparison with Existing Approaches
The IRIS methodology differs from prior work in several important respects.

Versus traditional hardware-centric approaches. The conventional strategy of installing increasingly expensive
specialised cameras yields diminishing returns against the single-source accuracy ceiling. IRIS achieves superior
accuracy at 86% lower capital cost by shifting the value creation from hardware to intelligence.
Versus simple fusion methods. Zibani et al. (2022) applied Dempster-Shafer evidence theory and majority voting
to ALPR fusion.¹⁴ While these approaches can improve upon single-source accuracy, they lack the learned
confusion matrices and syntax-conditioned priors that enable IRIS to fully exploit the error-pattern diversity of
each camera. Majority voting, in particular, cannot weight cameras by their demonstrated reliability or account
for systematic character confusions.
Versus deep learning end-to-end approaches. Modern deep learning architectures (e.g., YOLOv10 + Tesseract)
can achieve high single-source accuracy under near-ideal conditions.⁹ However, IRIS is not a competitor to these
approaches — it operates at a layer above them. Any improvement in underlying OCR accuracy from deep learning
translates directly to improved fusion accuracy. The two approaches are complementary, not competing.

5.3 Practical Implications
The results carry several implications for tolling industry practice.

    •   First, the framework demonstrates that existing ITS camera infrastructure — already deployed for traffic
        monitoring, incident detection, and CCTV purposes — can be repurposed as a high-performance tolling
        network. This transforms cameras from a cost centre (maintained for regulatory and operational
        compliance) into a revenue-generating asset.
    •   Second, the confidence-scoring framework enables a shift from binary pass/fail ANPR to risk-based
        decision-making. Toll operators can calibrate automation thresholds to their specific risk appetite,
        balancing automation rate against revenue assurance. This operational flexibility is not available from
        traditional ANPR systems that produce a single classification without a calibrated probability.
    •   Third, the unsupervised model estimation via EM eliminates the requirement for ground-truth labelling —
        a significant practical advantage, since manual transcription of licence plate images at scale is
        prohibitively expensive and introduces its own error rate. The model adapts continuously to changing
        conditions (camera degradation, seasonal lighting changes, new plate formats) without requiring
        retraining on labelled data.

5.4 Limitations
The following limitations must be acknowledged.



L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                           16/23
    •   Total occlusion. If no camera in the array has any view of the licence plate (e.g., the plate is entirely
        obscured by another vehicle across all viewing angles), fusion cannot recover information that was never
        captured. The system's resilience depends on at least one camera capturing a partial or degraded image.
    •   Conditional independence violations. As discussed in Section 2.3, Assumption 2 may be violated when
        physical obscuration affects multiple cameras simultaneously. While camera diversity mitigates this in
        practice, systematic correlated failures (e.g., a convoy of vehicles blocking sightlines to an entire camera
        bank) can degrade fusion performance. The empirical results demonstrate that such events are
        sufficiently rare relative to the total transaction volume that aggregate performance remains above
        99.4%.
    •   EM convergence to local optima. The EM algorithm is guaranteed to converge to a local maximum of the
        likelihood function, not necessarily the global maximum.¹¹ ¹² The quality of the majority voting
        initialisation mitigates this risk in practice, and the large data volumes in tolling operations provide robust
        convergence. However, formal convergence guarantees under spectral initialisation (as established by
        Zhang et al., 2016) have not been explicitly validated for the extended syntax-conditioned model.¹²
    •   Probability calibration. While the posterior probabilities constitute theoretically calibrated confidence
        scores, the actual calibration has not been formally validated with expected-versus-predicted analysis
        across all confidence bands. It is possible that the model systematically over-ascribes or under-ascribes
        probability values in certain ranges.¹⁵ Empirical calibration analysis is recommended as an area for
        further work.
    •   Jurisdictional customisation. The syntax priors and character-position priors are jurisdiction-specific.
        Deploying IRIS in a new jurisdiction requires configuration of the plate syntax library for that region, though
        this is a configuration task rather than a model re-engineering effort.

5.5 Areas for Further Research
Several avenues for further investigation are identified. These include the following:

1. Formal calibration analysis. Empirical assessment of whether the posterior probability estimates are well-
   calibrated (i.e., among passages assigned 80% confidence, approximately 80% are correct) across all
   confidence bands.
2. Soft-max EM evaluation. The current implementation uses hard-max EM, where the MAP truth is selected as
   fixed for model estimation. The soft-max variant, which weights model estimation by the distribution of
   possible truths, may improve performance for the extended syntax-conditioned model, even though early
   evaluation on the simpler non-syntax model showed no improvement.¹⁵
3. Laplace smoothing optimisation. The smoothing factor applied during model estimation affects the
   generalisability of confusion matrix estimates. Cross-validation to identify optimal smoothing parameters
   may yield incremental accuracy improvements.
4. Online learning. The current EM implementation operates in batch mode. Exploring online learning methods
   to dynamically update confusion matrices in real time could accelerate adaptation to changing conditions
   (e.g., camera degradation, road surface changes).
5. Multi-modal fusion. Extending the framework to incorporate additional vehicle identification modalities —
   vehicle make/model recognition, colour classification, axle count, or connected vehicle data — could further
   reduce the residual error rate.




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                17/23
6. Conclusion
This paper has presented the complete mathematical framework, implementation methodology, and empirical
validation of the IRIS adaptive Bayesian fusion methodology for multi-source licence plate recognition in tolling
operations.

The core contribution is a rigorous probabilistic framework — grounded in Bayes' theorem, the Dawid-Skene EM
algorithm, and syntax-conditioned prior modelling — that overcomes the fundamental accuracy ceiling of single-
camera ANPR systems. By treating each camera observation as independent probabilistic evidence rather than
seeking a single perfect image, the methodology achieves recognition accuracy exceeding 99.4% in sustained
production operations, compared with a baseline of 95.2–96.5% from the pre-existing single-camera system.
The empirical validation on a major Australian motorway, processing over 100,000 vehicles daily across a $200
million revenue corridor, demonstrates that this accuracy improvement is not merely theoretical. It translates
directly to $5.8 million in annual revenue recovery, a 96% reduction in manual exception processing, and an 86%
reduction in capital expenditure compared with conventional hardware-centric approaches.
The methodology is OCR-engine agnostic, integrates with existing camera infrastructure without hardware
modification, estimates its own model parameters without ground-truth labels, and produces calibrated
posterior probabilities that enable risk-ba

[... content truncated at 80,000 characters ...]

---
