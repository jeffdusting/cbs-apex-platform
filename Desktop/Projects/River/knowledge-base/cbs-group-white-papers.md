# CBS Group White Papers - Tolling and Demand Management

> CBS Group thought leadership on tolling technology, demand management, and industry benchmarking.

**Source folder:** `/home/ubuntu/Downloads/dropbox_raw/CBS_RAG_extracted/Proposals/General/White Papers`

**Export date:** April 2026

---


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


## CBS-WP-001_When_Tolling_Becomes_Safety.docx

*File: `CBS-WP-001_When_Tolling_Becomes_Safety.docx`*

The System That Already Knows Who's Inside: 

How Video-Based Tolling Enables a Step-Change in Tunnel Emergency Management

CBS-WP-001 | February 2026

One statistic should stop every tunnel operator in their tracks: in a controlled evacuation trial at the Eastern Distributor tunnel, 68% of participants rated the clarity of PA announcements as poor or very poor — yet PA systems remain the primary emergency communication channel in every road tunnel in Australia.¹ Meanwhile, a parallel innovation is emerging from an unexpected source. Video-based tolling — designed to collect revenue — generates a real-time register of every vehicle in a tunnel, linked to account holder contact details. This by-product of the commercial function enables targeted emergency flash messages to reach people inside vehicles, two-way communication workflows between operators and tunnel occupants, and actionable intelligence about the population at risk for emergency services. Trial data confirms that SMS messaging was rated effective by 81% of recipients, and crowd behaviour research demonstrates that reaching even 8–16% of a population with quality information creates "informed leaders" who guide the remaining majority to safety.² The Western Harbour Tunnel — Australia's first video-only toll road — will require 100% licence plate-to-account mapping, dramatically expanding this capability. The implication is clear: correctly architected video-based tolling reduces physical toll and ITS infrastructure while simultaneously enabling a step-change in tunnel safety. Specifying these functions independently wastes capital and delivers inferior outcomes.

1. Executive Summary

Australia operates a growing network of road tunnels critical to urban mobility. These tunnels depend on Intelligent Transport Systems — CCTV, public address, radio rebroadcast, variable message signs, and incident detection — to manage traffic and protect the travelling public. Tolling systems operate alongside but independently of these safety systems, typically specified, procured, and maintained under separate contracts and by separate teams.

The foundational assumptions underpinning tunnel emergency communications are failing. PA systems — the primary channel for reaching tunnel occupants in an emergency — perform poorly in the acoustic environment of a road tunnel. Radio rebroadcast depends on drivers having their car radios tuned to a free-to-air station, yet streaming services have overtaken radio listening in Australia for the first time.³ These broadcast systems share a structural limitation: they cannot target individual vehicles, confirm message receipt, enable two-way communication, or provide emergency services with information about who is in the tunnel. At the same time, advances in video analytics and the emergence of video-only tolling are creating capabilities that directly address these limitations — but because tolling and safety are specified as separate systems, the opportunity is being missed.

What if the tolling system — the commercial function deployed to collect revenue — could simultaneously serve as the foundation for a fundamentally more effective emergency management capability? And if it can, is there any justification for continuing to specify these functions independently?

This paper presents evidence that correctly architected video-based tolling reduces physical toll infrastructure and ITS infrastructure while enabling a transformation in tunnel safety. Video-based tolling generates a continuously updated register of every vehicle in the tunnel, linked through account data to mobile contact details. This enables targeted emergency flash messages that reach people inside sealed vehicles — bypassing the acoustic limitations of PA systems entirely. It enables two-way communication between operators and tunnel occupants. And it provides emergency services with real-time intelligence about the vehicles and associated account holders in the danger zone. Trial data from the Eastern Distributor and peer-reviewed crowd behaviour research confirm that this targeted approach — reaching a minority of informed individuals who then guide others — delivers superior evacuation outcomes to broadcast systems that reach everyone poorly. The Western Harbour Tunnel, opening in late 2028 as Australia's first video-only toll road, represents the first full implementation of this converged architecture. Decision-makers responsible for specifying tunnel systems should treat this convergence as the new baseline.

2. The Problem: Legacy Communication Systems Are Failing

2.1 The Acoustic Reality Inside a Road Tunnel

Road tunnels are among the most challenging acoustic environments for voice communication. High ambient noise from traffic flow, jet fans operating at full thrust during ventilation events, and the long reverberation times inherent in concrete tube structures combine to degrade speech intelligibility severely.⁴ PA systems must overcome not only these environmental factors but also the physical barrier of the vehicle itself — windows up, engine running, audio system competing for the occupant's attention.

The scale of the problem is not theoretical. In March 2018, Transurban conducted Exercise Dual Door — a full-scale evacuation exercise in the Eastern Distributor tunnel in Sydney. Macquarie University's Centre for Elite Performance, Expertise, and Training conducted an independent human factors assessment of 96 participants. The findings were stark.¹

PA announcement clarity was rated poor or very poor by 68% of all participants. Only 26% of drivers recalled hearing the PA announcement to stay in their vehicle. Bus passengers fared worse — only 60% heard the PA evacuation announcement, and many reported the message as "inaudible," "garbled," and "muffled." One participant captured the experience directly: "The message was inaudible. I only evacuated because another person said so."

The Crisis: 68% of tunnel evacuation exercise participants rated PA announcement clarity as poor or very poor — yet PA systems remain the primary emergency communication channel in Australian road tunnels.

2.2 Radio Rebroadcast: A Channel in Structural Decline

Radio rebroadcast (RRB) — the second pillar of tunnel emergency communications — operates by overriding the FM frequencies received inside the tunnel, allowing operators to broadcast emergency messages through vehicle audio systems. The mechanism depends on a critical assumption: that drivers are listening to free-to-air radio.

That assumption is eroding. The Australian Communications and Media Authority reported in 2024 that music streaming had overtaken radio listening for the first time.³ While commercial radio still reaches 81% of Australians weekly,⁵ the listening context has shifted. In-car, drivers increasingly connect to Spotify, Apple Music, YouTube Music, or podcasts via Bluetooth or CarPlay — none of which receive RRB overrides. The Infinite Dial 2024 Australia report found that only 56% of Australians listened to FM radio, down from 60% the previous year, with under-25s overwhelmingly preferring streaming platforms.⁶

In the Eastern Distributor trial, RRB was the least favourably received communication channel. Only 16% of drivers heard the car radio message to stay in their vehicle. Participants reported the radio message as repetitive, low-volume, and slow to escalate to evacuation instruction. Several noted that the volume was lower than their regular radio programming, causing them to turn it down — potentially missing the critical instruction to evacuate.¹

2.3 The Fundamental Limitation: Broadcast Cannot Target

PA and RRB share a structural limitation that no amount of hardware improvement can resolve: they are broadcast systems. They transmit the same message to everyone, with no ability to target specific vehicles, confirm whether the message was received, enable the recipient to communicate back, or provide emergency services with information about who is actually in the tunnel.

In a tunnel fire — where seconds matter and smoke reduces visibility to zero within minutes — the operator has no way of knowing whether the 200 vehicles trapped between the incident and the portal have received the instruction to evacuate. The emergency services arriving on scene have no information about how many vehicles are in the affected zone, whether they contain vulnerable occupants, or whether occupants have begun to self-evacuate. The communication is one-way, untargeted, and unverifiable.

PIARC — the World Road Association — identified this gap in its 2016 report Improving Safety in Road Tunnels through Real-time Communication with Users, noting that the behavioural response to emergency communications depends on the clarity, specificity, and perceived credibility of the message received.⁴ Broadcast messages, by their nature, cannot be specific to the individual.

3. Current Approaches and Their Limitations

3.1 How Tunnel Systems Are Currently Specified

In Australian road tunnel projects, tolling, traffic management, and emergency management are typically specified as separate functional domains. Tolling is a commercial function — often procured through a separate concession or service contract, with its own technology stack, performance requirements, and commercial incentives. ITS — comprising CCTV, AID, VMS, PA, RRB, SCADA, and associated communications — is specified as the safety and operations layer, governed by safety regulations, design standards, and the tunnel safety management plan.

This separation has historical logic. Tolling was a revenue function with its own regulatory framework. Safety was governed by a different set of standards and stakeholders. The technologies were distinct — DSRC tag readers for tolling, analogue CCTV for surveillance, separate sensor arrays for incident detection.

3.2 Why Separation Persists

The separated specification model persists for several reasons. Institutional boundaries within transport agencies typically place tolling under commercial divisions and safety under engineering or operations divisions. Procurement frameworks are structured around these boundaries. Standards and guidelines — including PIARC's own tunnel operations manual — discuss tolling and safety systems in separate chapters with no cross-reference.⁷ Consultants and system integrators organise their teams along the same lines.

The result is that the same tunnel may have overlapping CCTV systems — one set specified for tolling (high-resolution, lane-specific, optimised for licence plate capture) and another for traffic surveillance and incident detection (wider field of view, optimised for movement detection). The data generated by the tolling system — a real-time register of identified vehicles — is confined to the tolling back-office and never made available to the safety systems that could use it.

3.3 The Cost of Separation

The following table compares the traditional separated approach with an integrated architecture:

Table 1: Comparison of Traditional Separated and Integrated Video-Based Tunnel Architectures

4. The Convergence: When the Commercial Function Enables Safety

4.1 How Video-Based Tolling Works

Video-based tolling replaces the traditional tag-reader model with automatic number plate recognition (ANPR) applied to existing or purpose-installed CCTV. As a vehicle passes through the tolling zone, high-resolution cameras capture images of the licence plate. ANPR software extracts the plate number and matches it against a toll account database. The toll is charged to the linked account — no physical tag required, no tag reader infrastructure, no tag/video conflict resolution.

The Western Harbour Tunnel — a 6.5-kilometre crossing beneath Sydney Harbour connecting the Warringah Freeway to the Rozelle Interchange — will be Australia's first video-only toll road when it opens in late 2028.⁸ Following a competitive tender that attracted ten expressions of interest and shortlisted three, Transport for NSW awarded the tolling contract to US-based TransCore, whose technology is proven across more than 800 projects in over 150 cities globally. The NSW Government has stated that this technology is likely to be adopted on other toll roads across the network.⁸

The cost implications of the shift to video-only tolling are significant, though asset-specific. Hardware savings from eliminating tag readers and dedicated tolling gantries are real but modest. The more substantial savings are in software complexity reduction. Tag-based systems that also capture video require sophisticated exception handling and conflict resolution — reconciling cases where the tag read and the plate read produce different results, managing multi-tag detections, and processing the backlog of video-only transactions for untagged vehicles. Removing the tag transaction entirely eliminates this conflict resolution layer, simplifying the back-office architecture and reducing ongoing software maintenance costs. The precise quantum of savings depends on tunnel length, traffic volume, and the complexity of the existing tolling infrastructure, but the direction is clear: video-only is structurally simpler and cheaper to operate than dual-mode systems.

4.2 The By-Product That Changes Everything

The critical insight is not that video-based tolling is cheaper or simpler than tag-based tolling — though it is both. The critical insight is what the tolling function produces as a by-product.

To charge a toll, the system must identify every vehicle in the tunnel. To process the transaction, it must link each identified vehicle to an account. That account contains the vehicle owner's contact details — including, in many cases, a mobile phone number.

This means that a correctly architected video-based tolling system generates a register of every vehicle that has entered the tunnel, linked to account holder contact details. The ANPR capture occurs at tolling points — typically at tunnel entry and exit — providing a manifest of vehicles currently between those points. This is not continuous mid-tunnel tracking; it is a by-product of the entry and exit identification required for billing. But for emergency management purposes, the result is the same: the operator knows which vehicles are inside the tunnel, and can reach the associated account holders. This is not a surveillance system bolted on for safety purposes — it is the natural, unavoidable output of the tolling function itself.

Key Insight: The act of identifying a vehicle for billing simultaneously creates the real-time occupant register that makes personalised emergency communication possible. Tolling and safety are not separate functions sharing infrastructure — the commercial function directly produces the data that enables the safety function.

4.3 Three Capabilities That Broadcast Systems Cannot Deliver

This convergence enables three capabilities that fundamentally change tunnel emergency management:

Targeted emergency flash messages. Using the vehicle-to-account linkage, operators can send SMS or push notifications to the mobile devices associated with vehicles currently inside the tunnel. Unlike PA or RRB, these messages reach people inside sealed vehicles regardless of ambient noise, window position, or audio source. The Eastern Distributor trial confirmed that SMS content was rated good or very good by 81% of recipients — compared with PA content rated good or very good by only 39%.¹ Messages can be tailored by zone — vehicles upstream of an incident receive different instructions from those downstream.

Two-way communication workflows. SMS enables recipients to respond — confirming their location, reporting injuries, or providing situational intelligence back to the control room. This transforms emergency management from a broadcast model (operator speaks, occupants may or may not hear) to an interactive model (operator and occupants exchange information in real time). Emergency services can send follow-up instructions to specific vehicles as the situation evolves.

Actionable intelligence for emergency services. When fire crews arrive at a tunnel portal, the question they need answered is: how many vehicles are in the affected zone, and what do we know about the people inside them? A video-based tolling system provides a real-time vehicle manifest — plate numbers, vehicle types, associated account holder details. This is not a complete picture of every occupant, but it is immeasurably more than the zero information that current systems provide.

5. Evidence: Why Targeted Messaging Works

5.1 The "Informed Leader" Effect

A natural objection to targeted mobile messaging is that it cannot reach everyone. Not every vehicle has an account with a registered mobile number. Not every occupant will read the message. Not every recipient will act on it.

Peer-reviewed crowd behaviour research provides a decisive response: you do not need to reach everyone. You need to reach enough people to create "informed leaders" who guide the rest.

Dyer et al. (2008), published in the Royal Society Interface, experimentally demonstrated that a small informed minority can guide a group of naïve individuals to a target without verbal communication or obvious signalling.⁹ The study found that both the time to target and deviation from target decreased with the presence of informed individuals, and that consensus decision-making in conflict situations was "highly efficient."

Dong et al. (2016) applied this principle to emergency evacuation through simulation of Beijing South Station, finding that designated evacuation leaders "effectively reduce the evacuation time and casualties in an emergency situation."¹⁰ Fang et al. (2016) developed a leader-follower agent-based simulation model for social collective behaviour during egress, confirming the mechanism at scale.¹¹

5.2 Trial Validation: The Eastern Distributor Exercise

The Eastern Distributor Exercise Dual Door provided real-world validation of the informed leader mechanism in a road tunnel context.

The exercise included 96 participants across 31 cars and two buses. When asked what triggered their decision to evacuate, the responses revealed a clear pattern. The following data illustrate the relative influence of formal and informal evacuation triggers:

Table 2: Influence of Formal and Informal Evacuation Triggers by Participant Category (Exercise Dual Door 2018)

Car drivers — who had greatest access to formal messaging — overwhelmingly responded to official instructions. Bus passengers — who had least access (PA was harder to hear inside the bus, many had no radio) — were predominantly led by bus drivers and fellow passengers who had received the message. One participant captured the mechanism precisely: "I was the only member in my immediate vicinity who heard the PA announcement — I then told everyone to leave."¹

The exercise also demonstrated that SMS recipients who read the message before evacuating reported it as the single most influential piece of emergency information. Several participants noted that the SMS was "the decisive factor" in their evacuation decision. Car passengers — who were more likely than drivers to read their phones during the event — showed the highest influence from SMS messaging.¹

5.3 What Coverage Is Required?

The Eastern Distributor trial, conducted in 2018 on a tag-based tolling system, found that approximately 16% of vehicles had mobile numbers registered in the tolling database. Research by Dong et al. and confirmed by the trial data suggests that 8–16% of an evacuating population being informed is sufficient to generate the leader-follower effect.

Under the Western Harbour Tunnel's video-only model, 100% of trips must be matched to an account for the toll to be collected. This dramatically expands the potential reach of emergency flash messaging compared with legacy systems where video matching was a fallback for untagged vehicles. The precise mobile number coverage will depend on account registration requirements and data quality, but the structural shift from partial to comprehensive vehicle identification is transformative.

6. Implementation: Building the Integrated Architecture

6.1 Phased Roadmap

The transition from separated to integrated tunnel systems can be achieved through a phased approach, applicable to both new-build tunnels and retrofits of existing assets.

Phase 1: Architecture and Specification (1–3 Months). The first phase establishes the integrated specification. Key activities include conducting a functional analysis that maps tolling, traffic management, and emergency management requirements against a shared video infrastructure; defining data exchange interfaces between the tolling back-office and the emergency management system; specifying CCTV requirements that satisfy both tolling (high-resolution ANPR) and safety (wide-angle surveillance, AID) functions from a rationalised camera network; and engaging the tunnel safety committee and relevant regulators on the use of tolling data for emergency communications. Critically, this phase must also address the institutional barriers that currently impede integration: updating tunnel safety management plans to recognise targeted messaging as a primary communication channel; establishing formal data sharing agreements between the tolling entity and the tunnel operator or safety manager; engaging the Independent Certifier (where applicable) on the modified safety case; and reviewing the applicable standards framework — in NSW, the Motorways Standards — to ensure the integrated architecture is recognised and supported. Without addressing these institutional prerequisites, technical integration will stall at the procurement boundary.

Phase 2: Data Integration and Messaging Platform (3–6 Months). The second phase builds the technical integration. Key activities include implementing the data pipeline from tolling back-office to emergency management system — specifically the real-time vehicle register and account-to-mobile linkage; deploying the emergency flash messaging platform (e.g., Whispir or equivalent) with integration to the tunnel SCADA and incident management system; defining message templates, escalation protocols, and two-way response workflows; and conducting tabletop exercises with control room operators to validate the workflow.

Phase 3: Validation and Transition (6–12 Months). The third phase proves the system in operation. Key activities include running full-scale evacuation exercises with targeted messaging active alongside legacy PA and RRB; measuring message delivery rates, read rates, and influence on evacuation behaviour; progressively reclassifying PA and RRB from primary to supplementary communication channels as targeted messaging proves effective; and establishing the ongoing data governance framework for use of tolling data in safety contexts.

6.2 For Existing Tunnels

Existing tunnels on tag-based tolling systems can begin the transition immediately by integrating their existing video matching data — already used for untagged vehicle enforcement — into the emergency management system. The coverage will be partial (limited to accounts with registered mobiles) but any targeted messaging capability is superior to none. As these tunnels transition to video-only tolling — a trajectory the NSW Government has signalled — coverage will expand to match the WHT model.

7. Addressing Common Concerns

7.1 "This raises privacy and data governance issues."

It does, and they are important. Using tolling account data for emergency communications involves repurposing data collected for a commercial function. This requires clear legal authority, transparent consent mechanisms, and robust data governance frameworks. These issues are real, but they are design challenges — not objections to the concept. The privacy framework must be established as part of the integrated specification, not treated as a reason to maintain the status quo. A comprehensive treatment of the privacy and data governance framework for this convergence warrants a dedicated paper.

7.2 "You can't reach everyone — some vehicles won't have accounts with mobile numbers."

This objection assumes that emergency communication must reach 100% of the population to be effective. The evidence says otherwise. Dyer et al. demonstrated that an informed minority guides the uninformed majority through visual observation of behaviour — no verbal communication required.⁹ The Eastern Distributor trial confirmed this in a tunnel context: bus passengers with no access to formal messaging evacuated by following others who had received it.¹ A system that reaches 30%, 50%, or 80% of vehicles with a targeted, readable, actionable message is categorically superior to a broadcast system that reaches everyone with a message that 68% of people cannot understand.

7.3 "Relying on shared infrastructure creates a single point of failure."

Tunnel CCTV already operates under stringent availability requirements mandated by safety standards. Adding the tolling function to the same infrastructure does not reduce resilience — it increases the commercial incentive to maintain uptime, because every minute of camera downtime is now a minute of lost toll revenue in addition to a safety degradation. Under commercial models such as the CAPITAL framework — which establishes 30-year fixed-fee structures with lane rental penalties for unavailability — the asset manager is financially incentivised to treat infrastructure availability as a first-order priority.¹² Furthermore, the integrated architecture does not eliminate PA and RRB. These remain as supplementary channels, providing defence-in-depth. The change is in primacy — targeted messaging becomes the primary channel, with broadcast systems as the fallback.

8. Conclusion

The evidence presented in this paper leads to a single, unavoidable conclusion: the historical separation of tolling and safety in road tunnels is a legacy of institutional boundaries, not engineering logic.

Video-based tolling — designed and deployed to collect revenue — produces, as a direct by-product of the commercial function, the real-time vehicle identification data that enables a fundamentally more effective emergency management capability. Trial data from the Eastern Distributor demonstrates that legacy broadcast systems fail the people they are designed to protect: PA messages rated unintelligible by the majority of recipients, radio rebroadcast declining in reach with every year that passes, and no ability to target, confirm, interact, or inform. Targeted mobile messaging — enabled by the tolling data — was rated effective by 81% of recipients, creates the "informed leaders" that peer-reviewed research confirms are sufficient to guide an evacuating population, and provides emergency services with intelligence that current systems cannot deliver.

The Western Harbour Tunnel — opening in late 2028 as Australia's first video-only toll road — represents the first implementation of a fully converged architecture where the tolling function and the safety function share infrastructure and data by design. This is not an incremental improvement. It is a structural shift in how tunnel operations should be conceived, specified, and procured.

Leaders responsible for tunnel specification, procurement, and operation must now ask a direct question: knowing that the tolling system can enable targeted, two-way, verifiable emergency communications at no additional infrastructure cost — is there any justification for continuing to specify these functions as though they are unrelated? The answer, on the evidence, is no.

9. Key Takeaways

✓ Legacy broadcast systems are failing. PA announcement clarity was rated poor or very poor by 68% of participants in a controlled tunnel evacuation exercise, and radio rebroadcast reach is declining as streaming displaces free-to-air radio listening.

✓ Targeted messaging dramatically outperforms broadcast. SMS content was rated effective by 81% of recipients in the same trial — and unlike PA, it reaches people inside sealed vehicles regardless of ambient noise or audio source.

✓ You don't need to reach everyone. Peer-reviewed crowd behaviour research confirms that an informed minority of 8–16% creates "informed leaders" who guide the uninformed majority through observed behaviour — a mechanism validated in real tunnel evacuation trials.

✓ Video-based tolling produces the data that makes this possible. The act of identifying a vehicle for billing simultaneously creates the real-time vehicle register and account linkage that enables targeted emergency flash messages, two-way communication, and actionable intelligence for emergency services.

✓ Separation is no longer defensible. No existing publication or standard framework explicitly connects the tolling function to emergency communications capability. This paper demonstrates that the connection is direct, evidence-based, and transformative — and that specifying these functions independently wastes capital and delivers inferior safety outcomes.

✓ The Western Harbour Tunnel sets the new baseline. As Australia's first video-only toll road, it represents the first full implementation of the converged architecture. Decision-makers should treat this as the benchmark for all future tunnel specifications.

10. References

Taylor, M. (2018). Eastern Distributor Tunnel — Exercise Dual Door 2018: Human Factors Assessment — Interim Report. Centre for Elite Performance, Expertise, and Training, Macquarie University. December 2018.

Dusting, J. (2019). Improving Tunnel Evacuation Outcomes Through Targeted Personalised Messages. ITS World Congress, Singapore. Paper AP-TP1817.

Australian Communications and Media Authority (2024). Trends and Developments in Viewing and Listening 2023–24. ACMA, Canberra.

PIARC — World Road Association (2016). Improving Safety in Road Tunnels through Real-time Communication with Users. Report 2016R06EN.

Commercial Radio & Audio / Edison Research (2024). The Infinite Dial 2024 Australia. CRA, Sydney.

ACMA (2024). Communications and Media in Australia: How We Watch and Listen to Content. December 2024.

PIARC — World Road Association (2023). Road Tunnels Manual — Communication Systems. Available at: tunnelsmanual.piarc.org.

NSW Government (2025). Western Harbour Tunnel to be Nation's First 'Tagless' Toll Road. Ministerial media release, 1 December 2025.

Dyer, J.R.G., Johansson, A., Helbing, D., Couzin, I.D. and Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B, 364(1518), pp. 781–789.

Dong, H., Gao, X., Gao, T., Sun, X. and Wang, Q. (2016). Crowd Evacuation Optimization by Leader-follower Model. IFAC-PapersOnLine, 49(3), pp. 162–167.

Fang, J., El-Tawil, S. and Aguirre, B. (2016). Leader-follower model for agent based simulation of social collective behavior during egress. Safety Science, 83, pp. 40–47.

Swan, F. (2019). Actionable Incident Detection Alarming. ITS World Congress, Singapore. Paper AP-TP1723.

Further Reading

The following resources provide additional depth on the topics addressed in this paper:

PIARC (2008). Human Factors and Road Tunnel Safety Regarding Users. Technical Report 2008R17.

Ronchi, E. and Nilsson, D. (2016). Assessing the Verification and Validation of Building Fire Evacuation Models. Fire Technology, 52(1), pp. 197–219.

Dyer, J.R.G. et al. (2008). Consensus decision making in human crowds. Current Biology, 19(1), pp. R1-R2.

European Parliament (2014). Technology Options for the European Electronic Toll Service. Directorate-General for Internal Policies.

ITS Australia (2024). Smart Transport Infrastructure Award Submission — Video-Based Tolling, Western Harbour Tunnel. CBS Group / Transport for NSW.

About CBS Group

CBS Group is an Australian infrastructure advisory firm established in 2002, partnering with government agencies, infrastructure operators, and major contractors to transform infrastructure performance through systems thinking, senior expertise, and proprietary technology. The firm operates with a core team of  specialists supported by a broader network of experts, with consultants averaging over 20 years of infrastructure experience. CBS Group operates nationally from offices in Sydney and Melbourne.

The firm's technical advisory practice delivers specialist capability across systems engineering, systems safety, rail and intelligent transport systems (ITS), transport technical advisory, and independent technical verification — drawing on formal systems engineering disciplines (aligned with INCOSE and ISO 15288) to provide structured analysis and transparent decision support for complex infrastructure projects. CBS Group's safety and risk consultants bring deep expertise in process safety and risk management, working with both industry and regulators. The firm also designs, builds, and manages operational technology systems for critical infrastructure, including intelligent transport systems that improve traffic flow, enhance safety, and optimise the management of road and tunnel networks.

CBS Group's advisory services are grounded in a systems thinking methodology — a holistic approach that considers how components interrelate and how systems evolve over time, solving root causes rather than symptoms. The firm embeds consultants as true partners within client organisations, aligning success through value-based engagement models. This approach has earned the trust of organisations including Transport for NSW, NSW Treasury, Sydney Metro, CPB Contractors, John Holland, Lendlease, BHP, Rio Tinto, Siemens, and Alstom.

CBS Group developed the CAPITAL (Commercial Asset Performance, Infrastructure Tailoring And Lifecycle) framework — an innovative long-term asset management and commercial model initially implemented on the Western Harbour Tunnel, Sydney Harbour Tunnel, and M6 Stage 1 Tunnel projects. In close collaboration with Transport for NSW's Asset Management teams, the firm has contributed to over $1 billion in validated savings across the TfNSW road tunnel portfolio.

CBS Group maintains specialist tolling and intelligent transport systems capability, providing strategic planning for road user charging that balances revenue objectives, customer experience, and compliance. The firm delivers technology-agnostic assessment of ANPR systems and platforms - helping clients evaluate options based on performance, integration complexity, and whole-of-life value. 

CBS Group's proprietary IRIS (Intelligent Recognition and Identification System) framework deploys Bayesian fusion methodology to achieve significant improvements in ANPR accuracy from existing camera infrastructure, delivering substantial annual revenue uplift and cost reduction without the need for additional infrastructure.

The firm's tolling advisory extends to distance-based charging models, compliance design, and the convergence of tolling infrastructure with traffic management and safety systems — the subject of this paper.

About the Author

Jeff Dusting 
FIEAust CPEng NER, CFAM

Jeff Dusting is the founder, Director and Chief Operating Officer of CBS Group and a strategic advisor to government transport and infrastructure agencies. A transformational infrastructure leader who integrates technical mastery with proven capability in architecting strategic frameworks across complex organisations, Jeff has spent the past four years leading asset management contracts for Transport for NSW's road tunnel portfolio, including assets in operation and those currently in design or construction. 

Jeff's expertise spans the intersection of engineering, asset management, and commercial strategy. He is a practitioner of the CAPITAL framework, applying its principles to drive measurable improvements in asset performance and operational efficiency across the NSW road tunnel network. His practical experience with the Western Harbour Tunnel contract specifications — which establish new industry benchmarks for ANPR performance and video-only tolling — directly informs this paper's analysis of the convergence between tolling and safety systems.

Jeff holds a Bachelor of Aerospace Engineering (Honours) from RMIT University, a Master of Test and Evaluation from the University of Southern California, and an MBA (Distinction) from Deakin University, complemented by executive programs at Harvard Business School, MIT, and INSEAD, and a 2025 Certificate in Harnessing AI for Breakthrough Innovation and Strategic Impact from Stanford University Graduate School of Business. His early career as a flight test engineer — recognised with the DJ Knight Award for Excellence in Flight Test Engineering — established a rigorous, systems-oriented approach to complex engineering problems that he has since applied across infrastructure, transport, and asset management domains. 

Jeff's infrastructure career spans senior leadership roles including Board Director of an ASX 20 management and technology consulting firm, Head of Engineering, Strategy and Innovation at a major toll road operator, and Principal Consultant across rail safety, ITS, and asset management programs. 

Jeff brings a culture of innovation to infrastructure challenges, consistently questioning traditional approaches to deliver better outcomes. His team specialises in complex problems requiring integrated solutions across technical, commercial, and operational domains.


| --- | --- | --- |

| Feature | Traditional Separated Approach | Integrated Video-Based Architecture |

| Tolling infrastructure | Tag readers (DSRC), dedicated tolling gantries, tolling CCTV, complex back-office reconciling tag and video transactions | Shared CCTV with ANPR, simplified back-office (video-only, no tag/video conflict resolution) |

| ITS camera infrastructure | Separate camera systems for surveillance, AID, and tolling | Single camera network serving tolling, AID, traffic monitoring, and vehicle identification for emergency comms |

| Emergency communication | PA (broadcast, one-way, poor intelligibility), RRB (broadcast, one-way, declining reach) | Targeted SMS/flash messages to identified account holders, two-way, verifiable, supplemented by PA and RRB |

| Operator situational awareness | Count of vehicles (induction loops), CCTV visual confirmation | Real-time vehicle register with associated account data — operators know which vehicles are in each zone |

| Emergency services intelligence | Estimated vehicle count, no occupant information | Vehicle register linked to account holder details, enabling targeted welfare checks and informed resource deployment |

| Software complexity | High — exception handling for tag/video mismatches, multi-source transaction reconciliation | Reduced — single video-based identification pipeline, no tag conflict resolution |

| System resilience | Tolling failure does not affect safety systems (and vice versa) | Shared infrastructure requires engineered redundancy — but commercially incentivised uptime |

| Long-term cost trajectory | Increasing pressure — ageing tag infrastructure requires replacement cycles, declining tag adoption increases video exception processing | Structurally simpler — software-driven improvements, no physical tag infrastructure to maintain. Precise savings are asset-specific |


| --- | --- | --- | --- |

| Evacuation trigger | Car drivers | Car pax | Bus pax |

| Evacuated after formal instructions (SMS, radio, PA) | 73% | 92% | 57% |

| Evacuated after informal instructions (others' behaviour) | 27% | 8% | 43% |

---


## CBS-WP-001_When_Tolling_Becomes_Safety.pdf

*File: `CBS-WP-001_When_Tolling_Becomes_Safety.pdf`*

THE SYSTEM THAT ALREADY KNOWS WHO'S INSIDE:

HOW VIDEO-BASED TOLLING ENABLES A STEP-CHANGE IN TUNNEL
EMERGENCY MANAGEMENT

CBS-WP-001 | February 2026




 One statistic should stop every tunnel operator in their tracks: in a controlled evacuation trial at the Eastern
   Distributor tunnel, 68% of participants rated the clarity of PA announcements as poor or very poor — yet PA
systems remain the primary emergency communication channel in every road tunnel in Australia.¹ Meanwhile, a
 parallel innovation is emerging from an unexpected source. Video-based tolling — designed to collect revenue
  — generates a real-time register of every vehicle in a tunnel, linked to account holder contact details. This by-
     product of the commercial function enables targeted emergency flash messages to reach people inside
     vehicles, two-way communication workflows between operators and tunnel occupants, and actionable
  intelligence about the population at risk for emergency services. Trial data confirms that SMS messaging was
rated effective by 81% of recipients, and crowd behaviour research demonstrates that reaching even 8–16% of a
 population with quality information creates "informed leaders" who guide the remaining majority to safety.² The
  Western Harbour Tunnel — Australia's first video-only toll road — will require 100% licence plate-to-account
   mapping, dramatically expanding this capability. The implication is clear: correctly architected video-based
tolling reduces physical toll and ITS infrastructure while simultaneously enabling a step-change in tunnel safety.
             Specifying these functions independently wastes capital and delivers inferior outcomes.




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                              1/11
1. Executive Summary
Australia operates a growing network of road tunnels critical to urban mobility. These tunnels depend on
Intelligent Transport Systems — CCTV, public address, radio rebroadcast, variable message signs, and incident
detection — to manage traffic and protect the travelling public. Tolling systems operate alongside but
independently of these safety systems, typically specified, procured, and maintained under separate contracts
and by separate teams.

The foundational assumptions underpinning tunnel emergency communications are failing. PA systems — the
primary channel for reaching tunnel occupants in an emergency — perform poorly in the acoustic environment of
a road tunnel. Radio rebroadcast depends on drivers having their car radios tuned to a free-to-air station, yet
streaming services have overtaken radio listening in Australia for the first time.³ These broadcast systems share a
structural limitation: they cannot target individual vehicles, confirm message receipt, enable two-way
communication, or provide emergency services with information about who is in the tunnel. At the same time,
advances in video analytics and the emergence of video-only tolling are creating capabilities that directly address
these limitations — but because tolling and safety are specified as separate systems, the opportunity is being
missed.
What if the tolling system — the commercial function deployed to collect revenue — could simultaneously serve
as the foundation for a fundamentally more effective emergency management capability? And if it can, is there
any justification for continuing to specify these functions independently?
This paper presents evidence that correctly architected video-based tolling reduces physical toll infrastructure
and ITS infrastructure while enabling a transformation in tunnel safety. Video-based tolling generates a
continuously updated register of every vehicle in the tunnel, linked through account data to mobile contact
details. This enables targeted emergency flash messages that reach people inside sealed vehicles — bypassing
the acoustic limitations of PA systems entirely. It enables two-way communication between operators and tunnel
occupants. And it provides emergency services with real-time intelligence about the vehicles and associated
account holders in the danger zone. Trial data from the Eastern Distributor and peer-reviewed crowd behaviour
research confirm that this targeted approach — reaching a minority of informed individuals who then guide others
— delivers superior evacuation outcomes to broadcast systems that reach everyone poorly. The Western Harbour
Tunnel, opening in late 2028 as Australia's first video-only toll road, represents the first full implementation of this
converged architecture. Decision-makers responsible for specifying tunnel systems should treat this
convergence as the new baseline.
                                                                assessment of 96 participants. The findings were
2. The Problem: Legacy Communication                            stark.¹
Systems Are Failing
                                                                PA announcement clarity was rated poor or very poor
                                                                by 68% of all participants. Only 26% of drivers
2.1 The Acoustic Reality Inside a Road Tunnel                   recalled hearing the PA announcement to stay in
Road tunnels are among the most challenging                     their vehicle. Bus passengers fared worse — only
acoustic environments for voice communication.                  60% heard the PA evacuation announcement, and
High ambient noise from traffic flow, jet fans                  many reported the message as "inaudible,"
operating at full thrust during ventilation events, and         "garbled," and "muffled." One participant captured
the long reverberation times inherent in concrete               the experience directly: "The message was
tube structures combine to degrade speech                       inaudible. I only evacuated because another person
intelligibility severely.⁴ PA systems must overcome             said so."
not only these environmental factors but also the               The Crisis: 68% of tunnel evacuation exercise
physical barrier of the vehicle itself — windows up,            participants rated PA announcement clarity as
engine running, audio system competing for the                  poor or very poor — yet PA systems remain the
occupant's attention.                                           primary emergency communication channel in
The scale of the problem is not theoretical. In March           Australian road tunnels.
2018, Transurban conducted Exercise Dual Door —
a full-scale evacuation exercise in the Eastern                 2.2 Radio Rebroadcast: A Channel in
Distributor tunnel in Sydney. Macquarie University's            Structural Decline
Centre for Elite Performance, Expertise, and Training
                                                                Radio rebroadcast (RRB) — the second pillar of
conducted an independent human factors
                                                                tunnel emergency communications — operates by

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                  2/11
overriding the FM frequencies received inside the       Users, noting that the behavioural response to
tunnel, allowing operators to broadcast emergency       emergency communications depends on the clarity,
messages through vehicle audio systems. The             specificity, and perceived credibility of the message
mechanism depends on a critical assumption: that        received.⁴ Broadcast messages, by their nature,
drivers are listening to free-to-air radio.             cannot be specific to the individual.

That assumption is eroding. The Australian              3. Current Approaches and Their
Communications and Media Authority reported in
2024 that music streaming had overtaken radio
                                                        Limitations
listening for the first time.³ While commercial radio
still reaches 81% of Australians weekly,⁵ the           3.1 How Tunnel Systems Are Currently
listening context has shifted. In-car, drivers          Specified
increasingly connect to Spotify, Apple Music,
                                                        In Australian road tunnel projects, tolling, traffic
YouTube Music, or podcasts via Bluetooth or
                                                        management, and emergency management are
CarPlay — none of which receive RRB overrides. The
                                                        typically specified as separate functional domains.
Infinite Dial 2024 Australia report found that only
                                                        Tolling is a commercial function — often procured
56% of Australians listened to FM radio, down from
                                                        through a separate concession or service contract,
60% the previous year, with under-25s
                                                        with its own technology stack, performance
overwhelmingly preferring streaming platforms.⁶
                                                        requirements, and commercial incentives. ITS —
In the Eastern Distributor trial, RRB was the least     comprising CCTV, AID, VMS, PA, RRB, SCADA, and
favourably received communication channel. Only         associated communications — is specified as the
16% of drivers heard the car radio message to stay in   safety and operations layer, governed by safety
their vehicle. Participants reported the radio          regulations, design standards, and the tunnel safety
message as repetitive, low-volume, and slow to          management plan.
escalate to evacuation instruction. Several noted
that the volume was lower than their regular radio      This separation has historical logic. Tolling was a
programming, causing them to turn it down —             revenue function with its own regulatory framework.
potentially missing the critical instruction to         Safety was governed by a different set of standards
evacuate.¹                                              and stakeholders. The technologies were distinct —
                                                        DSRC tag readers for tolling, analogue CCTV for
                                                        surveillance, separate sensor arrays for incident
2.3 The Fundamental Limitation: Broadcast
                                                        detection.
Cannot Target
PA and RRB share a structural limitation that no        3.2 Why Separation Persists
amount of hardware improvement can resolve: they
                                                        The separated specification model persists for
are broadcast systems. They transmit the same
                                                        several reasons. Institutional boundaries within
message to everyone, with no ability to target
                                                        transport agencies typically place tolling under
specific vehicles, confirm whether the message was
                                                        commercial divisions and safety under engineering
received, enable the recipient to communicate
                                                        or operations divisions. Procurement frameworks
back, or provide emergency services with
                                                        are structured around these boundaries. Standards
information about who is actually in the tunnel.
                                                        and guidelines — including PIARC's own tunnel
In a tunnel fire — where seconds matter and smoke       operations manual — discuss tolling and safety
reduces visibility to zero within minutes — the         systems in separate chapters with no cross-
operator has no way of knowing whether the 200          reference.⁷ Consultants and system integrators
vehicles trapped between the incident and the portal    organise their teams along the same lines.
have received the instruction to evacuate. The
                                                        The result is that the same tunnel may have
emergency services arriving on scene have no
                                                        overlapping CCTV systems — one set specified for
information about how many vehicles are in the
                                                        tolling (high-resolution, lane-specific, optimised for
affected zone, whether they contain vulnerable
                                                        licence plate capture) and another for traffic
occupants, or whether occupants have begun to
                                                        surveillance and incident detection (wider field of
self-evacuate. The communication is one-way,
                                                        view, optimised for movement detection). The data
untargeted, and unverifiable.
                                                        generated by the tolling system — a real-time
PIARC — the World Road Association — identified         register of identified vehicles — is confined to the
this gap in its 2016 report Improving Safety in Road    tolling back-office and never made available to the
Tunnels through Real-time Communication with            safety systems that could use it.


L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                         3/11
3.3 The Cost of Separation
The following table compares the traditional separated approach with an integrated architecture:

Table 1: Comparison of Traditional Separated and Integrated Video-Based Tunnel Architectures

 Feature                 Traditional Separated Approach                    Integrated Video-Based Architecture
 Tolling                 Tag readers (DSRC), dedicated tolling             Shared CCTV with ANPR, simplified back-
 infrastructure          gantries, tolling CCTV, complex back-office       office (video-only, no tag/video conflict
                         reconciling tag and video transactions            resolution)
 ITS camera              Separate camera systems for surveillance,         Single camera network serving tolling, AID,
 infrastructure          AID, and tolling                                  traffic monitoring, and vehicle identification
                                                                           for emergency comms
 Emergency               PA (broadcast, one-way, poor intelligibility),    Targeted SMS/flash messages to identified
 communication           RRB (broadcast, one-way, declining reach)         account holders, two-way, verifiable,
                                                                           supplemented by PA and RRB
 Operator situational    Count of vehicles (induction loops), CCTV         Real-time vehicle register with associated
 awareness               visual confirmation                               account data — operators know which
                                                                           vehicles are in each zone
 Emergency               Estimated vehicle count, no occupant              Vehicle register linked to account holder
 services                information                                       details, enabling targeted welfare checks
 intelligence                                                              and informed resource deployment
 Software                High — exception handling for tag/video           Reduced — single video-based identification
 complexity              mismatches, multi-source transaction              pipeline, no tag conflict resolution
                         reconciliation
 System resilience       Tolling failure does not affect safety systems    Shared infrastructure requires engineered
                         (and vice versa)                                  redundancy — but commercially incentivised
                                                                           uptime
 Long-term cost          Increasing pressure — ageing tag                  Structurally simpler — software-driven
 trajectory              infrastructure requires replacement cycles,       improvements, no physical tag infrastructure
                         declining tag adoption increases video            to maintain. Precise savings are asset-
                         exception processing                              specific




                                                                  in late 2028.⁸ Following a competitive tender that
4. The Convergence: When the                                      attracted ten expressions of interest and shortlisted
Commercial Function Enables Safety                                three, Transport for NSW awarded the tolling
                                                                  contract to US-based TransCore, whose technology
4.1 How Video-Based Tolling Works                                 is proven across more than 800 projects in over 150
                                                                  cities globally. The NSW Government has stated that
Video-based tolling replaces the traditional tag-
                                                                  this technology is likely to be adopted on other toll
reader model with automatic number plate
                                                                  roads across the network.⁸
recognition (ANPR) applied to existing or purpose-
installed CCTV. As a vehicle passes through the                   The cost implications of the shift to video-only tolling
tolling zone, high-resolution cameras capture                     are significant, though asset-specific. Hardware
images of the licence plate. ANPR software extracts               savings from eliminating tag readers and dedicated
the plate number and matches it against a toll                    tolling gantries are real but modest. The more
account database. The toll is charged to the linked               substantial savings are in software complexity
account — no physical tag required, no tag reader                 reduction. Tag-based systems that also capture
infrastructure, no tag/video conflict resolution.                 video require sophisticated exception handling and
                                                                  conflict resolution — reconciling cases where the
The Western Harbour Tunnel — a 6.5-kilometre                      tag read and the plate read produce different results,
crossing beneath Sydney Harbour connecting the                    managing multi-tag detections, and processing the
Warringah Freeway to the Rozelle Interchange — will               backlog of video-only transactions for untagged
be Australia's first video-only toll road when it opens           vehicles. Removing the tag transaction entirely

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                      4/11
eliminates this conflict resolution layer, simplifying          messages reach people inside sealed vehicles
the back-office architecture and reducing ongoing               regardless of ambient noise, window position,
software maintenance costs. The precise quantum                 or audio source. The Eastern Distributor trial
of savings depends on tunnel length, traffic volume,            confirmed that SMS content was rated good or
and the complexity of the existing tolling                      very good by 81% of recipients — compared with
infrastructure, but the direction is clear: video-only          PA content rated good or very good by only 39%.¹
is structurally simpler and cheaper to operate than             Messages can be tailored by zone — vehicles
dual-mode systems.                                              upstream of an incident receive different
                                                                instructions from those downstream.
4.2 The By-Product That Changes Everything
                                                            2. Two-way communication workflows. SMS
The critical insight is not that video-based tolling is        enables recipients to respond — confirming
cheaper or simpler than tag-based tolling — though             their location, reporting injuries, or providing
it is both. The critical insight is what the tolling           situational intelligence back to the control
function produces as a by-product.                             room. This transforms emergency management
                                                               from a broadcast model (operator speaks,
To charge a toll, the system must identify every               occupants may or may not hear) to an
vehicle in the tunnel. To process the transaction, it          interactive model (operator and occupants
must link each identified vehicle to an account. That          exchange information in real time). Emergency
account contains the vehicle owner's contact                   services can send follow-up instructions to
details — including, in many cases, a mobile phone             specific vehicles as the situation evolves.
number.
This means that a correctly architected video-based         3. Actionable intelligence for emergency
tolling system generates a register of every vehicle           services. When fire crews arrive at a tunnel
that has entered the tunnel, linked to account holder          portal, the question they need answered is: how
contact details. The ANPR capture occurs at tolling            many vehicles are in the affected zone, and what
points — typically at tunnel entry and exit —                  do we know about the people inside them? A
providing a manifest of vehicles currently between             video-based tolling system provides a real-time
those points. This is not continuous mid-tunnel                vehicle manifest — plate numbers, vehicle
tracking; it is a by-product of the entry and exit             types, associated account holder details. This is
identification required for billing. But for emergency         not a complete picture of every occupant, but it
management purposes, the result is the same: the               is immeasurably more than the zero information
operator knows which vehicles are inside the tunnel,           that current systems provide.
and can reach the associated account holders. This
is not a surveillance system bolted on for safety
purposes — it is the natural, unavoidable output of
the tolling function itself.                                5. Evidence: Why Targeted Messaging
                                                            Works
Key Insight: The act of identifying a vehicle for billing
simultaneously creates the real-time occupant
register that makes personalised emergency
                                                            5.1 The "Informed Leader" Effect
communication possible. Tolling and safety are not          A natural objection to targeted mobile messaging is
separate functions sharing infrastructure — the             that it cannot reach everyone. Not every vehicle has
commercial function directly produces the data that         an account with a registered mobile number. Not
enables the safety function.                                every occupant will read the message. Not every
                                                            recipient will act on it.
4.3 Three Capabilities That Broadcast Systems
                                                            Peer-reviewed crowd behaviour research provides a
Cannot Deliver
                                                            decisive response: you do not need to reach
This convergence enables three capabilities that            everyone. You need to reach enough people to
fundamentally   change     tunnel   emergency               create "informed leaders" who guide the rest.
management:
                                                            Dyer et al. (2008), published in the Royal Society
1. Targeted emergency flash messages. Using                 Interface, experimentally demonstrated that a small
   the vehicle-to-account linkage, operators can            informed minority can guide a group of naïve
   send SMS or push notifications to the mobile             individuals to a target without verbal communication
   devices associated with vehicles currently               or obvious signalling.⁹ The study found that both the
   inside the tunnel. Unlike PA or RRB, these               time to target and deviation from target decreased

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                            5/11
with the presence of informed individuals, and that     5.3 What Coverage Is Required?
consensus decision-making in conflict situations
was "highly efficient."                                 The Eastern Distributor trial, conducted in 2018 on a
                                                        tag-based tolling system, found that approximately
Dong et al. (2016) applied this principle to            16% of vehicles had mobile numbers registered in
emergency evacuation through simulation of Beijing      the tolling database. Research by Dong et al. and
South Station, finding that designated evacuation       confirmed by the trial data suggests that 8–16% of an
leaders "effectively reduce the evacuation time and     evacuating population being informed is sufficient to
casualties in an emergency situation."¹⁰ Fang et al.    generate the leader-follower effect.
(2016) developed a leader-follower agent-based
simulation model for social collective behaviour        Under the Western Harbour Tunnel's video-only
during egress, confirming the mechanism at scale.¹¹     model, 100% of trips must be matched to an
                                                        account for the toll to be collected. This dramatically
5.2 Trial Validation: The Eastern Distributor           expands the potential reach of emergency flash
Exercise                                                messaging compared with legacy systems where
                                                        video matching was a fallback for untagged vehicles.
The Eastern Distributor Exercise Dual Door provided     The precise mobile number coverage will depend on
real-world validation of the informed leader            account registration requirements and data quality,
mechanism in a road tunnel context.                     but the structural shift from partial to
                                                        comprehensive         vehicle      identification    is
The exercise included 96 participants across 31 cars    transformative.
and two buses. When asked what triggered their
decision to evacuate, the responses revealed a clear
                                                        6. Implementation: Building the
pattern. The following data illustrate the relative
influence of formal and informal evacuation triggers:   Integrated Architecture
Table 2: Influence of Formal and Informal Evacuation    6.1 Phased Roadmap
Triggers by Participant Category (Exercise Dual Door
2018)                                                   The transition from separated to integrated tunnel
                                                        systems can be achieved through a phased
 Evacuation trigger      Car        Car     Bus         approach, applicable to both new-build tunnels and
                         drivers    pax     pax         retrofits of existing assets.
 Evacuated after         73%        92%     57%
 formal instructions                                    Phase 1: Architecture and Specification (1–3
 (SMS, radio, PA)                                       Months). The first phase establishes the integrated
                                                        specification. Key activities include conducting a
 Evacuated after         27%        8%      43%
                                                        functional analysis that maps tolling, traffic
 informal instructions
                                                        management, and emergency management
 (others' behaviour)
                                                        requirements against a shared video infrastructure;
Car drivers — who had greatest access to formal
                                                        defining data exchange interfaces between the
messaging — overwhelmingly responded to official        tolling back-office and the emergency management
instructions. Bus passengers — who had least            system; specifying CCTV requirements that satisfy
access (PA was harder to hear inside the bus, many      both tolling (high-resolution ANPR) and safety (wide-
had no radio) — were predominantly led by bus           angle surveillance, AID) functions from a
drivers and fellow passengers who had received the      rationalised camera network; and engaging the
message. One participant captured the mechanism         tunnel safety committee and relevant regulators on
precisely: "I was the only member in my immediate
                                                        the use of tolling data for emergency
vicinity who heard the PA announcement — I then         communications. Critically, this phase must also
told everyone to leave."¹                               address the institutional barriers that currently
The exercise also demonstrated that SMS recipients      impede integration: updating tunnel safety
who read the message before evacuating reported it      management plans to recognise targeted messaging
as the single most influential piece of emergency       as a primary communication channel; establishing
information. Several participants noted that the SMS    formal data sharing agreements between the tolling
was "the decisive factor" in their evacuation           entity and the tunnel operator or safety manager;
decision. Car passengers — who were more likely         engaging the Independent Certifier (where
than drivers to read their phones during the event —    applicable) on the modified safety case; and
showed the highest influence from SMS messaging.¹       reviewing the applicable standards framework — in
                                                        NSW, the Motorways Standards — to ensure the
                                                        integrated architecture is recognised and

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                          6/11
supported. Without addressing these institutional        specification, not treated as a reason to maintain the
prerequisites, technical integration will stall at the   status quo. A comprehensive treatment of the
procurement boundary.                                    privacy and data governance framework for this
                                                         convergence warrants a dedicated paper.
Phase 2: Data Integration and Messaging Platform
(3–6 Months). The second phase builds the
technical integration. Key activities include            7.2 "You can't reach everyone — some
implementing the data pipeline from tolling back-        vehicles won't have accounts with mobile
office to emergency management system —                  numbers."
specifically the real-time vehicle register and
                                                         This    objection     assumes     that   emergency
account-to-mobile       linkage;    deploying     the
                                                         communication must reach 100% of the population
emergency flash messaging platform (e.g., Whispir
                                                         to be effective. The evidence says otherwise. Dyer et
or equivalent) with integration to the tunnel SCADA
and incident management system; defining                 al. demonstrated that an informed minority guides
message templates, escalation protocols, and two-        the uninformed majority through visual observation
                                                         of behaviour — no verbal communication required.⁹
way response workflows; and conducting tabletop
                                                         The Eastern Distributor trial confirmed this in a
exercises with control room operators to validate the
                                                         tunnel context: bus passengers with no access to
workflow.
                                                         formal messaging evacuated by following others
Phase 3: Validation and Transition (6–12 Months).        who had received it.¹ A system that reaches 30%,
The third phase proves the system in operation. Key      50%, or 80% of vehicles with a targeted, readable,
activities include running full-scale evacuation         actionable message is categorically superior to a
exercises with targeted messaging active alongside       broadcast system that reaches everyone with a
legacy PA and RRB; measuring message delivery            message that 68% of people cannot understand.
rates, read rates, and influence on evacuation
behaviour; progressively reclassifying PA and RRB        7.3 "Relying on shared infrastructure creates a
from primary to supplementary communication
                                                         single point of failure."
channels as targeted messaging proves effective;
and establishing the ongoing data governance             Tunnel CCTV already operates under stringent
framework for use of tolling data in safety contexts.    availability requirements mandated by safety
                                                         standards. Adding the tolling function to the same
6.2 For Existing Tunnels                                 infrastructure does not reduce resilience — it
                                                         increases the commercial incentive to maintain
Existing tunnels on tag-based tolling systems can        uptime, because every minute of camera downtime
begin the transition immediately by integrating their    is now a minute of lost toll revenue in addition to a
existing video matching data — already used for          safety degradation. Under commercial models such
untagged vehicle enforcement — into the                  as the CAPITAL framework — which establishes 30-
emergency management system. The coverage will           year fixed-fee structures with lane rental penalties
be partial (limited to accounts with registered          for unavailability — the asset manager is financially
mobiles) but any targeted messaging capability is        incentivised to treat infrastructure availability as a
superior to none. As these tunnels transition to         first-order priority.¹² Furthermore, the integrated
video-only tolling — a trajectory the NSW                architecture does not eliminate PA and RRB. These
Government has signalled — coverage will expand to       remain as supplementary channels, providing
match the WHT model.                                     defence-in-depth. The change is in primacy —
                                                         targeted messaging becomes the primary channel,
7. Addressing Common Concerns                            with broadcast systems as the fallback.

7.1 "This raises privacy and data governance
issues."
It does, and they are important. Using tolling
account data for emergency communications
involves repurposing data collected for a
commercial function. This requires clear legal
authority, transparent consent mechanisms, and
robust data governance frameworks. These issues
are real, but they are design challenges — not
objections to the concept. The privacy framework
must be established as part of the integrated
L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                          7/11
8. Conclusion
The evidence presented in this paper leads to a single, unavoidable conclusion: the historical separation of tolling
and safety in road tunnels is a legacy of institutional boundaries, not engineering logic.

Video-based tolling — designed and deployed to collect revenue — produces, as a direct by-product of the
commercial function, the real-time vehicle identification data that enables a fundamentally more effective
emergency management capability. Trial data from the Eastern Distributor demonstrates that legacy broadcast
systems fail the people they are designed to protect: PA messages rated unintelligible by the majority of
recipients, radio rebroadcast declining in reach with every year that passes, and no ability to target, confirm,
interact, or inform. Targeted mobile messaging — enabled by the tolling data — was rated effective by 81% of
recipients, creates the "informed leaders" that peer-reviewed research confirms are sufficient to guide an
evacuating population, and provides emergency services with intelligence that current systems cannot deliver.
The Western Harbour Tunnel — opening in late 2028 as Australia's first video-only toll road — represents the first
implementation of a fully converged architecture where the tolling function and the safety function share
infrastructure and data by design. This is not an incremental improvement. It is a structural shift in how tunnel
operations should be conceived, specified, and procured.
Leaders responsible for tunnel specification, procurement, and operation must now ask a direct question:
knowing that the tolling system can enable targeted, two-way, verifiable emergency communications at no
additional infrastructure cost — is there any justification for continuing to specify these functions as though they
are unrelated? The answer, on the evidence, is no.

9. Key Takeaways
✓ Legacy broadcast systems are failing. PA announcement clarity was rated poor or very poor by 68% of
participants in a controlled tunnel evacuation exercise, and radio rebroadcast reach is declining as streaming
displaces free-to-air radio listening.

✓ Targeted messaging dramatically outperforms broadcast. SMS content was rated effective by 81% of
recipients in the same trial — and unlike PA, it reaches people inside sealed vehicles regardless of ambient noise
or audio source.
✓ You don't need to reach everyone. Peer-reviewed crowd behaviour research confirms that an informed
minority of 8–16% creates "informed leaders" who guide the uninformed majority through observed behaviour —
a mechanism validated in real tunnel evacuation trials.
✓ Video-based tolling produces the data that makes this possible. The act of identifying a vehicle for billing
simultaneously creates the real-time vehicle register and account linkage that enables targeted emergency flash
messages, two-way communication, and actionable intelligence for emergency services.
✓ Separation is no longer defensible. No existing publication or standard framework explicitly connects the
tolling function to emergency communications capability. This paper demonstrates that the connection is direct,
evidence-based, and transformative — and that specifying these functions independently wastes capital and
delivers inferior safety outcomes.
✓ The Western Harbour Tunnel sets the new baseline. As Australia's first video-only toll road, it represents the
first full implementation of the converged architecture. Decision-makers should treat this as the benchmark for
all future tunnel specifications.




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                               8/11
10. References
1. Taylor, M. (2018). Eastern Distributor Tunnel — Exercise Dual Door 2018: Human Factors Assessment —
   Interim Report. Centre for Elite Performance, Expertise, and Training, Macquarie University. December 2018.

2. Dusting, J. (2019). Improving Tunnel Evacuation Outcomes Through Targeted Personalised Messages. ITS
   World Congress, Singapore. Paper AP-TP1817.

3. Australian Communications and Media Authority (2024). Trends and Developments in Viewing and Listening
   2023–24. ACMA, Canberra.

4. PIARC — World Road Association (2016). Improving Safety in Road Tunnels through Real-time
   Communication with Users. Report 2016R06EN.

5. Commercial Radio & Audio / Edison Research (2024). The Infinite Dial 2024 Australia. CRA, Sydney.

6. ACMA (2024). Communications and Media in Australia: How We Watch and Listen to Content. December
   2024.

7. PIARC — World Road Association (2023). Road Tunnels Manual — Communication Systems. Available at:
   tunnelsmanual.piarc.org.

8. NSW Government (2025). Western Harbour Tunnel to be Nation's First 'Tagless' Toll Road. Ministerial media
   release, 1 December 2025.

9. Dyer, J.R.G., Johansson, A., Helbing, D., Couzin, I.D. and Krause, J. (2009). Leadership, consensus decision
   making and collective behaviour in humans. Philosophical Transactions of the Royal Society B, 364(1518), pp.
   781–789.

10. Dong, H., Gao, X., Gao, T., Sun, X. and Wang, Q. (2016). Crowd Evacuation Optimization by Leader-follower
    Model. IFAC-PapersOnLine, 49(3), pp. 162–167.

11. Fang, J., El-Tawil, S. and Aguirre, B. (2016). Leader-follower model for agent based simulation of social
    collective behavior during egress. Safety Science, 83, pp. 40–47.

12. Swan, F. (2019). Actionable Incident Detection Alarming. ITS World Congress, Singapore. Paper AP-TP1723.

Further Reading
The following resources provide additional depth on the topics addressed in this paper:

1. PIARC (2008). Human Factors and Road Tunnel Safety Regarding Users. Technical Report 2008R17.

2. Ronchi, E. and Nilsson, D. (2016). Assessing the Verification and Validation of Building Fire Evacuation
   Models. Fire Technology, 52(1), pp. 197–219.

3. Dyer, J.R.G. et al. (2008). Consensus decision making in human crowds. Current Biology, 19(1), pp. R1-R2.

4. European Parliament (2014). Technology Options for the European Electronic Toll Service. Directorate-
   General for Internal Policies.

5. ITS Australia (2024). Smart Transport Infrastructure Award Submission — Video-Based Tolling, Western
   Harbour Tunnel. CBS Group / Transport for NSW.




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                          9/11
About CBS Group
CBS Group is an Australian infrastructure advisory firm established in 2002, partnering with government agencies,
infrastructure operators, and major contractors to transform infrastructure performance through systems
thinking, senior expertise, and proprietary technology. The firm operates with a core team of specialists supported
by a broader network of experts, with consultants averaging over 20 years of infrastructure experience. CBS Group
operates nationally from offices in Sydney and Melbourne.

The firm's technical advisory practice delivers specialist capability across systems engineering, systems safety,
rail and intelligent transport systems (ITS), transport technical advisory, and independent technical verification —
drawing on formal systems engineering disciplines (aligned with INCOSE and ISO 15288) to provide structured
analysis and transparent decision support for complex infrastructure projects. CBS Group's safety and risk
consultants bring deep expertise in process safety and risk management, working with both industry and
regulators. The firm also designs, builds, and manages operational technology systems for critical infrastructure,
including intelligent transport systems that improve traffic flow, enhance safety, and optimise the management
of road and tunnel networks.

CBS Group's advisory services are grounded in a systems thinking methodology — a holistic approach that
considers how components interrelate and how systems evolve over time, solving root causes rather than
symptoms. The firm embeds consultants as true partners within client organisations, aligning success through
value-based engagement models. This approach has earned the trust of organisations including Transport for
NSW, NSW Treasury, Sydney Metro, CPB Contractors, John Holland, Lendlease, BHP, Rio Tinto, Siemens, and
Alstom.

CBS Group developed the CAPITAL (Commercial Asset Performance, Infrastructure Tailoring And Lifecycle)
framework — an innovative long-term asset management and commercial model initially implemented on the
Western Harbour Tunnel, Sydney Harbour Tunnel, and M6 Stage 1 Tunnel projects. In close collaboration with
Transport for NSW's Asset Management teams, the firm has contributed to over $1 billion in validated savings
across the TfNSW road tunnel portfolio.

CBS Group maintains specialist tolling and intelligent transport systems capability, providing strategic planning
for road user charging that balances revenue objectives, customer experience, and compliance. The firm delivers
technology-agnostic assessment of ANPR systems and platforms - helping clients evaluate options based on
performance, integration complexity, and whole-of-life value.

CBS Group's proprietary IRIS (Intelligent Recognition and Identification System) framework deploys Bayesian
fusion methodology to achieve significant improvements in ANPR accuracy from existing camera infrastructure,
delivering substantial annual revenue uplift and cost reduction without the need for additional infrastructure.

The firm's tolling advisory extends to distance-based charging models, compliance design, and the convergence
of tolling infrastructure with traffic management and safety systems — the subject of this paper.




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                              10/11
About the Author
Jeff Dusting
FIEAust CPEng NER, CFAM

Jeff Dusting is the founder, Director and Chief Operating Officer of CBS Group and a strategic advisor to
government transport and infrastructure agencies. A transformational infrastructure leader who integrates
technical mastery with proven capability in architecting strategic frameworks across complex organisations, Jeff
has spent the past four years leading asset management contracts for Transport for NSW's road tunnel portfolio,
including assets in operation and those currently in design or construction.
Jeff's expertise spans the intersection of engineering, asset management, and commercial strategy. He is a
practitioner of the CAPITAL framework, applying its principles to drive measurable improvements in asset
performance and operational efficiency across the NSW road tunnel network. His practical experience with the
Western Harbour Tunnel contract specifications — which establish new industry benchmarks for ANPR
performance and video-only tolling — directly informs this paper's analysis of the convergence between tolling
and safety systems.
Jeff holds a Bachelor of Aerospace Engineering (Honours) from RMIT University, a Master of Test and Evaluation
from the University of Southern California, and an MBA (Distinction) from Deakin University, complemented by
executive programs at Harvard Business School, MIT, and INSEAD, and a 2025 Certificate in Harnessing AI for
Breakthrough Innovation and Strategic Impact from Stanford University Graduate School of Business. His early
career as a flight test engineer — recognised with the DJ Knight Award for Excellence in Flight Test Engineering —
established a rigorous, systems-oriented approach to complex engineering problems that he has since applied
across infrastructure, transport, and asset management domains.
Jeff's infrastructure career spans senior leadership roles including Board Director of an ASX 20 management and
technology consulting firm, Head of Engineering, Strategy and Innovation at a major toll road operator, and
Principal Consultant across rail safety, ITS, and asset management programs.
Jeff brings a culture of innovation to infrastructure challenges, consistently questioning traditional approaches to
deliver better outcomes. His team specialises in complex problems requiring integrated solutions across
technical, commercial, and operational domains.




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                              11/11

---


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


## Tolling Industry Benchmark Report - CBS Group Rev B3.docx

*File: `Tolling Industry Benchmark Report - CBS Group Rev B3.docx`*

Tolling Industry Operational Efficiency Benchmarking Report

Prepared by: CBS Group
Date: December 2024
Classification: Industry Publication

Executive Summary

Situation

Toll road operators globally face increasing pressure to optimise operational efficiency whilst maintaining service quality and regulatory compliance. Operating costs as a proportion of toll revenue vary significantly across international operators, ranging from 22% to 42%. This variation reflects differences in collection technology, scale, regulatory requirements, climate conditions, and operational maturity.

The global toll road industry has undergone significant transformation over the past two decades, with a shift from manual collection to electronic tolling systems. Within electronic tolling, two dominant technologies have emerged: RFID tag-based systems and video-based (automatic number plate recognition) systems. While both enable free-flow tolling, their operational cost profiles differ substantially, with implications for long-term financial performance.

Operational costs can be decomposed into four primary value chain components: passage detection (15-25% of costs), operational back office (25-35%), customer retail/management (30-40%), and compliance/enforcement (15-25%). Understanding performance at this granular level enables targeted improvement initiatives rather than broad cost reduction mandates.

This report provides comprehensive benchmarking data for toll operators, asset owners, concessionaires, and government transport agencies seeking to assess performance, identify improvement opportunities, and establish realistic cost targets.

Complication

Several factors complicate direct international comparisons and make it challenging to establish clear operational efficiency targets:

Accounting and reporting variations: Different operators use varying definitions of operating costs, with some capitalising maintenance expenditure whilst others expense it immediately. Revenue recognition methods also differ, particularly regarding whether non-toll ancillary revenue is included in the denominator.

Technology transition costs: Many operators are mid-transition between collection technologies, creating temporary cost inflation. The shift from RFID to video-based systems, or from mixed to pure electronic tolling, generates significant one-off implementation costs that distort year-on-year comparisons. These transition periods can last 3-5 years.

Technology mix: Hybrid RFID/video systems typically achieve 28-35% operating costs versus 22-24% for pure RFID networks (E-ZPass) or 32-40% for legacy video-only systems (407 ETR, Cross Israel Highway). However, next-generation ANPR technology fundamentally changes this equation.

Emerging technology advantage: Recent contracts for next-generation video-only detection (such as the Western Harbour Tunnel in Sydney) specify 99.8% automation rates and near zero leakage, eliminating the structural disadvantages of legacy video systems. This positions advanced ANPR as potentially more cost-effective than RFID for new deployments.

Labour environment: Labour costs vary dramatically across markets—Australian and European operators face costs 3-4 times higher than Asian operators and 1.5-2 times higher than North American operators, creating structural cost premiums of 5-8 percentage points.

Management

This benchmarking analysis establishes performance targets across each value chain component using three reference frameworks:

International toll operators: Ten operators representing diverse geographic, technological, and regulatory contexts, with operating cost ratios ranging from 22% (E-ZPass) to 42% (Cross Israel Highway).

Adjacent industries: Ticketing systems (Opal, myki, Oyster), utilities (Sydney Water, Ausgrid, AGL), and public transport compliance (Revenue NSW, Transport for London) provide alternative benchmarks where toll-specific data is limited.

Technology evolution: Analysis of next-generation ANPR deployments that challenge conventional assumptions about RFID cost superiority.

The analysis establishes three distinct operational efficiency tiers that operators can use for self-assessment and target-setting based on their specific operating context.

Action

For operators seeking to benchmark performance:

Identify the appropriate efficiency tier based on scale, geographic context, and operational maturity. Single-concession operators should target 32-35%, whilst integrated network operators should target 26-30%.

Decompose total operating costs across the four value chain components to identify specific improvement opportunities using the detailed metrics provided in this report.

Assess collection technology strategy against long-term cost implications, recognising that next-generation ANPR may offer superior economics for new deployments.

For operators seeking cost reduction:

Prioritise mobile application platform as the foundational investment—analysis demonstrates cross-cutting benefits across all four value chain components ($25-46M annual savings potential for large operators).

Implement digital channel migration targeting 70%+ self-service rates within 12-18 months (channel cost analysis demonstrates 50-150x cost differential between phone and digital).

Optimise compliance and enforcement processes targeting cost per violation of $7.00-10.00 with collection rates exceeding 88%.

For asset owners and government agencies:

Establish next-generation ANPR (99.8%+ automation, near zero leakage) as the benchmark specification for new deployments—evidence suggests this can achieve 22-28% operating costs, comparable to or better than RFID.

Develop performance frameworks using value chain benchmarks to establish cost reduction targets in concessionaire agreements.

Evaluate shared services opportunities to capture scale economies (E-ZPass model demonstrates 30-40% cost reduction potential).

Key Findings

Finding 1: Next-generation ANPR challenges conventional technology assumptions

International benchmarks reflect legacy technology deployments where RFID achieves 30-45% lower operating costs than video-based systems. Next-generation ANPR has the potential to fundamentally change this equation. Note that the characteristics below for Next-Gen ANPR reflect contractual specifications and anticipated performance rather than demonstrated operational results:

This positions operators deploying next-generation ANPR at the forefront of tolling technology. However, these figures should be interpreted with appropriate caution as they represent contractual targets rather than proven operational performance across diverse conditions.

Finding 2: Customer retail represents the largest improvement opportunity

Customer retail typically consumes 30-40% of operating costs. Digital migration can reduce these costs by 40-50% whilst improving customer satisfaction, offering the single greatest improvement lever for most operators.

Finding 3: Structural factors explain significant but not unlimited variance

Six key cost variance factors (scale, labour, climate, infrastructure age, regulation, technology transition) create legitimate efficiency gaps of 12-19 percentage points between best-practice and structurally-disadvantaged operators. Operators should benchmark against peers with similar structural characteristics rather than against global best practice without adjustment.

Finding 4: Mobile application is a cross-cutting enabler, not just a customer channel

A comprehensive mobile app delivers cost reductions across all four value chain components simultaneously:

Passage detection: Real-time trip confirmations reduce "I wasn't there" disputes by 5-10%

Back office: Self-service transaction queries reduce inquiry volume by 15-25%

Customer retail: Full account self-service reduces costs by 40-50%

Compliance: In-app violation payment reduces compliance costs by 25-35%

Digital banking achieves 95-98% app adoption with 60-70% cost reduction versus traditional channels—toll operators should target similar outcomes.

Finding 5: Digital adoption is the primary improvement lever

The 50-150x cost differential between phone ($6-12 per contact) and digital channels ($0.50-1.50 per transaction) means shifting from 50% to 70% digital adoption could reduce customer service costs by 40-50%.

Finding 6: Adjacent industries validate achievable targets

Public transport ticketing, utilities, and government services in comparable labour markets achieve unit costs consistent with international toll benchmarks, confirming these targets are realistic regardless of operating jurisdiction.

Part 1: Methodology and Scope

Value Chain Framework

Toll road operational costs are decomposed into four primary components, each representing distinct operational activities with different cost drivers and improvement levers.

Glossary of Key Terms

AVI (Automatic Vehicle Identification): The detection technology used to identify vehicles at toll points, encompassing both tag-based systems (RFID/DSRC) and video-based systems (ANPR). 

Tag-based systems: Electronic toll collection using vehicle-mounted transponders, including RFID (Radio-Frequency Identification, typically 915 MHz passive tags in Americas/Australia) and DSRC (Dedicated Short-Range Communications, typically 5.8 GHz active transponders in Europe). Both require roadside reader infrastructure. 

MIR (Manual Image Review): The process of human operators reviewing vehicle images that cannot be automatically processed by OCR systems. MIR rate is a key efficiency metric—lower MIR rates indicate higher automation and lower operating costs. 

Trip reconstruction: The back-office process of linking vehicle entry and exit detection events into complete toll journeys, particularly relevant for distance-based or point-to-point tolling systems.

Data Sources

This analysis draws on three categories of data:

Primary sources (toll industry):

IBTTA (International Bridge, Tunnel and Turnpike Association) technical reports

Operator annual reports and ASX/PSE filings (Transurban, 407 ETR, Atlantia)

State Department of Transportation reports (E-ZPass agencies)

NHAI (National Highways Authority of India) operational data

Secondary sources (adjacent industries):

IPART determinations (Australian utilities)

TfL (Transport for London) annual reports

Various government service agency performance reports

Benchmarking Limitations

The following limitations apply to international comparisons:

Accounting variations: Operators use different definitions of operating costs, with some capitalising maintenance expenditure. Revenue recognition methods also differ regarding non-toll ancillary revenue.

Scale effects: Operators managing 500+ million transactions annually achieve costs unrealistic for operators at 50-100 million transactions. Operators should benchmark against peers with comparable transaction volumes.

Regulatory context: EU operators face more stringent safety and environmental requirements than Asian or Australasian operators. Israeli operators face unique security requirements.

Currency and timing: All costs converted to AUD at December 2024 rates. Operator data reflects FY23 or FY24 results where available.

Scope definition variations: Operators define cost boundaries differently. Some contracts bundle passage detection, back office, and commercial functions into single service fees (e.g., Dartford), while others separate infrastructure maintenance from tolling operations. Direct comparison of operating cost ratios requires understanding what costs are included in each operator's reported figures. 

Insourced vs outsourced services: Some operators outsource customer service, compliance, or IT functions while others maintain in-house capabilities. Outsourced functions may be reported differently (as service fees vs operating costs) affecting ratio comparability. Staffing metrics (FTE per transaction) should specify whether outsourced labour is included. 

Toll purpose and pricing structure: Tolling systems serve different purposes—infrastructure cost recovery, demand management, or congestion pricing—which influence operating models. Demand management systems (e.g., congestion charges) typically have different transaction patterns and customer behaviours than fixed-rate infrastructure tolls, affecting cost profiles.

Part 2: Self-Assessment Framework

Determining Your Efficiency Tier

Operators should first establish which efficiency tier is realistic given their structural characteristics. Three tiers emerge from international benchmarking:

Value Chain Cost Decomposition

Operators should decompose their total operating costs across the four value chain components to enable targeted benchmarking. Industry-typical distributions are:

Self-assessment questions:

Can you allocate costs to each of the four components?

Does your distribution match the pattern for your efficiency tier?

Which components show the largest deviation from benchmarks?

Common Cost Structure Anomalies

Certain cost items may distort comparisons with international benchmarks:

Items typically included in toll operator costs:

Detection infrastructure maintenance

Transaction processing and reconciliation

Customer service and account management

Compliance and enforcement

Items that may be separately contracted or excluded:

Major road maintenance (may be separate concession)

Security services (especially for bridges/tunnels)

Emergency response and incident management

Toll collection on behalf of third parties

Recommendation: When benchmarking, operators should identify and separately analyse any significant cost items that are not typical of pure toll operations. For example, bridge/tunnel security costs of 20-30% of roadside expenses would materially distort comparison with open-road tolling operators.

Part 3: International Toll Road Benchmarks

Operator Rankings by Operating Cost Ratio

Note (1): Scope verification required—contract may exclude certain cost elements typically included in operating cost calculations.Technology-Based Cost Profiles

Note (2): Transurban operating cost figures typically include both tolling operations and motorway operations (traffic management, incident response, maintenance coordination). Figures may include outsourced service provider costs as operating expenses. Direct comparison with pure-tolling-only operators requires adjustment for scope differences.

Tag-Based Systems (RFID/DSRC)

Tag-based systems include both RFID (915 MHz passive tags, predominant in Americas and Australia) and DSRC (5.8 GHz active transponders, predominant in Europe). Both require vehicle-mounted transponders and roadside reader infrastructure. Note that tag-based systems typically still require video backup infrastructure for non-equipped vehicles, making them effectively hybrid systems in practice.

Video-Primary Systems

Hybrid Systems (70-85% RFID)

Customer Cost Implications of Technology Choice 

Technology selection has direct implications for customer costs and equity considerations that extend beyond operator economics: 

Video surcharges: Operators using hybrid tag/video systems typically impose surcharges on video-tolled (non-tagged) transactions to recover higher processing costs and incentivise tag adoption. These surcharges range from modest cost-recovery fees ($0.50-2.00 per transaction) to substantial revenue-generating charges ($3.00-10.00 per transaction). The latter approach, while commercially attractive, raises equity concerns as it disproportionately affects occasional users, visitors, and lower-income motorists who may not maintain toll accounts. 

Tag costs: Tag-based systems impose direct costs on customers including tag purchase/deposit ($10-25), account establishment fees, and minimum balance requirements. While regular users amortise these costs over many trips, they create barriers for occasional users. 

Equity considerations: Next-generation ANPR potentially offers more equitable pricing by eliminating the tag/video pricing differential and treating all motorists consistently. However, this benefit only materialises if operators choose not to impose account-based discounts that replicate the tag/video pricing gap. Asset owners and regulators should consider customer cost implications alongside operating efficiency when specifying technology requirements.

Emerging Technology: Next-Generation ANPR

Critical finding: The international benchmarks presented above reflect legacy and first-generation technology deployments. Recent contract specifications for next-generation ANPR demonstrate that the technology fundamentally changes the cost equation, potentially positioning video-only systems as more cost-effective than RFID.

Case Study: Western Harbour Tunnel (Sydney, Australia)

The Western Harbour Tunnel contract, executed in 2024, specifies next-generation video-only detection with ambitious performance requirements. These represent contractual targets that, if achieved, would demonstrate:

Technology: Video-only (100% ANPR, no RFID infrastructure)

Automation rate: expected to exceed 99.5%

Leakage: Zero (eliminating the 2-5% error rate attributed to legacy video systems)

Equipment: Lead-installed, purpose-built infrastructure (not retrofit)

This will represent one of the first major deployments targeting next-generation ANPR performance at this specification level in a high-volume urban environment. Actual operational performance will need to be validated once the asset enters service.

Cost advantages of next-generation ANPR over RFID:

Environmental and sustainability advantages:

Next-generation ANPR eliminates the environmental footprint of tag management:

No plastic tag hardware manufacturing and disposal (millions of tags over concession life)

No battery replacement and disposal for active tags

No tag distribution logistics (vehicle movements, packaging, postage)

Reduced customer touchpoints (no tag pickup, no tag replacement visits)

Implications for the industry:

The traditional narrative that "RFID achieves 30-45% lower operating costs than video" is based on legacy systems with:

95-98% accuracy requiring significant manual review

2-5% leakage rates driving compliance costs

Complex customer identification for unregistered vehicles

Next-generation ANPR addresses these structural disadvantages:

99.8% automation eliminates manual review overhead

Zero leakage eliminates revenue loss and dispute costs

Universal detection (all vehicles captured) simplifies customer identification

Revised technology cost profiles:

Strategic implications for operators and asset owners:

New deployments: Next-generation ANPR should be the default technology consideration for greenfield toll facilities. The evidence suggests video-only systems can achieve equal or better operating costs than RFID whilst eliminating tag management complexity.

Existing RFID networks: Operators with mature RFID networks should continue leveraging this investment, but should not assume RFID superiority when evaluating expansions or replacements.

Hybrid operators: Operators currently running hybrid RFID/video systems should evaluate shifting transaction mix toward video as next-generation ANPR becomes available, potentially retiring RFID infrastructure over time.

Procurement specifications: Asset owners and government agencies should update technology specifications to mandate next-generation ANPR performance standards (99.8%+ automation, near zero leakage) rather than defaulting to RFID requirements.

Component-Level Benchmarks

Passage Detection Benchmarks

Best-in-class targets:

RFID systems: $0.010-0.015 per transaction

Video systems: $0.025-0.032 per transaction

Hybrid systems: $0.018-0.025 per transaction

System availability: >99.7% uptime

Detection accuracy: >99.5% (RFID), >97.5% (video)

Operational Back Office Benchmarks

Best-in-class targets:

Transaction processing cost: $0.025-0.040 per transaction

Staffing efficiency: 0.8-1.5 FTE per million transactions

Automated processing rate: >95%

Exception handling time: <24 hours for 95% of cases

Reconciliation accuracy: >99.9%

Commercial Back Office Benchmarks

Channel cost comparison:

Best-in-class targets:

Annual cost per account: $3.00-5.00

Cost per contact: $3.50-6.00 (blended)

Digital self-service rate: >70%

First-contact resolution: >85%

Staffing efficiency: 12-20 FTE per 100,000 accounts

Compliance and Enforcement Benchmarks

Legal framework impact:

Best-in-class targets:

Cost per violation processed: $6.00-10.00

Overall collection rate: >88%

Voluntary payment rate (first notice): >50%

Processing time: <48 hours from detection to first notice

Owner lookup cost: $0.50-1.50 (integrated database)

Part 4: Adjacent Industry Benchmarks

Passage Detection — Ticketing and Access Control

Adjacent industries utilising similar RFID/NFC transaction capture technology provide relevant benchmarks for passage detection operations.

Public Transport Ticketing Systems

Key insights from public transport comparison:

Scale economies: Large-scale transit systems (Oyster, Suica) achieve costs 30-50% below toll road systems despite more complex fare structures, driven by massive transaction volumes.

Technology consistency: RFID/NFC-based systems consistently achieve $0.010-0.025 per transaction regardless of industry, validating toll road benchmarks.

Infrastructure costs: Transit systems operate 24/7 with higher utilisation than toll gantries, suggesting toll operators could achieve similar per-transaction costs with infrastructure consolidation.

Automated Parking Systems

Key insights from parking comparison:

Video costs inherent: ANPR parking systems incur costs comparable to video toll systems ($0.030-0.050), validating that video costs are technology-inherent, not toll-specific.

Simpler environment: Parking operates in controlled environments without weather exposure, yet costs remain comparable to toll operations, suggesting limited further optimisation potential for video systems.

Stadium and Event Access

Key insight: Event venues achieve higher costs than toll systems due to peak load concentration (90% of throughput in 2-hour window), while toll systems benefit from distributed traffic patterns.

Passage Detection Benchmark Summary

TfNSW implication: Passage detection costs should target $0.020-0.030 per transaction for hybrid RFID/video operations, aligned with Queensland Motorways benchmarks.

Operational Back Office — Utilities

Utility companies process high volumes of metered transactions with similar reconciliation and exception handling requirements to toll operations.

Australian Utility Benchmarks

Key insights from utility comparison:

Lower unit costs: Utilities achieve $2.50-4.00 per customer monthly for complete meter-to-cash operations, including billing, payment processing, and reconciliation. Toll back office operations should achieve comparable costs per active account.

Higher automation: Leading utilities achieve 85-92% automated processing despite complex tariff structures (time-of-use, demand charges). Toll operations with simpler tariffs should achieve >95% automation.

Regulatory efficiency: IPART-regulated utilities demonstrate efficient operations under price control, providing evidence that regulated environments can drive efficiency.

Back Office Function Comparison

Financial Services Comparison

Key insight: The 20-50x cost differential between automated and manual processing is consistent across banking, insurance, and utilities. Toll operators should target >95% automation to capture these efficiencies.

Operational Back Office Benchmark Summary

Commercial Back Office — Utilities and Government Services

Customer service operations in utilities and government services provide relevant benchmarks for toll customer management.

4.3.1 Australian Utility Customer Service

Key insights from utility customer service:

Higher per-account costs: Utilities incur $22-50 per customer annually for customer service, higher than toll operators ($3-10). However, utilities handle more complex interactions (service connections, technical issues, hardship programs).

Digital adoption: Utilities achieve 45-65% digital adoption, below leading toll operators (70-80%). This reflects older customer demographics and more complex service requirements.

Contact intensity: Utilities receive 0.8-1.5 contacts per customer annually vs 0.2-1.0 for toll operators, explaining the higher per-account costs.

Government Services Comparison

Key insights from government services:

Channel cost differentials: Government services show 8-15x cost differential between counter and online channels, consistent with toll industry benchmarks.

Service NSW efficiency: Service NSW achieves $1.50-3.00 per online transaction, demonstrating achievable costs for government-delivered digital services in NSW.

Shared services potential: Service NSW handles diverse transactions (licensing, registrations, fines) suggesting potential for toll customer service integration.

Digital-First Comparison

Key insight: Digital-first organisations achieve 3-5x lower customer service costs than traditional operators. Toll operators with strong digital adoption (FASTag at $1.80-2.60) approach subscription service efficiency levels.

Commercial Back Office Benchmark Summary

TfNSW implication: Customer retail costs should target $5.00-7.00 per active account with 70%+ digital adoption, aligned with leading Australian toll operator benchmarks.

Compliance and Enforcement — Public Transport and Revenue Collection

Public transport fare evasion management and government revenue collection provide relevant benchmarks for toll compliance operations.

Public Transport Fare Compliance

Key insights from public transport compliance:

Lower collection rates: Public transport systems achieve 70-88% collection vs 82-94% for toll operators, reflecting different enforcement levers (toll operators can block vehicle registration).

Administrative efficiency: Systems with administrative penalty frameworks (Singapore, partial UK) achieve 85-95% collection at $5-10 per infringement vs 70-80% at $10-18 for court-based systems.

Integration with government: Sydney's SDRO (State Debt Recovery Office) integration provides efficient escalation path, demonstrating value of government revenue collection partnerships.

Revenue NSW Comparison

Key insights from Revenue NSW:

Integrated lookup: Revenue NSW achieves $0.50-1.20 per owner lookup through integrated government database access. Toll operators with manual DMV requests incur $3.50-6.00.

Enforcement powers: Revenue NSW can suspend licences and registrations for unpaid fines, achieving 85-92% collection rates. Toll operators with similar powers (407 ETR can block registration renewal) achieve comparable rates.

Cost efficiency: Revenue NSW processes millions of fines annually at $6-10 each, demonstrating achievable unit costs for high-volume enforcement operations.

Parking and Traffic Camera Enforcement

Key insight: Government-operated enforcement (cameras, tolls via SDRO) consistently achieves higher collection rates at lower costs than private operators, supporting integration with Revenue NSW for toll compliance.

Compliance Benchmark Summary

TfNSW implication: Compliance costs should target $8.00-12.00 per violation with 88%+ collection rate. Enhanced integration with Revenue NSW and administrative penalty frameworks could achieve these targets.

Part 5: Cost Variance Factor Analysis

Six Key Cost Variance Factors

Six primary factors explain the variation in operating costs across international toll operators. Understanding these factors enables realistic, context-adjusted efficiency targets.

Scale Economics

Scale drives significant cost variation through infrastructure cost amortisation and operational efficiency gains.

TfNSW position: Combined TfNSW tolling operations likely process 150-250 million transactions annually (SHB + SHT + E-Toll), placing TfNSW in the "multi-asset operator" range where 28-34% operating costs are achievable.

Implication: TfNSW's current 74% combined cost ratio cannot be explained by scale alone. Other factors or structural inefficiencies must account for the 40+ percentage point gap.

Labour Cost Impact

Australian labour costs create structural cost premiums across all value chain components.

Australian labour costs ($80-120k per FTE) are 3-4x higher than Asian operators and 1.5-2x higher than North American operators. This creates a structural 5-8 percentage point premium.

Mitigation: High-wage operators typically offset labour costs through automation (85-95% automated processing) and digital adoption (60-75% self-service). TfNSW should target >95% automation and >70% digital adoption to partially offset labour cost disadvantage.

Climate and Geography

Climate and terrain impact maintenance costs, particularly for passage detection infrastructure.

Sydney operates in a temperate climate with no significant winter, tropical, or alpine challenges. This represents a favourable structural factor that should contribute to lower-than-average maintenance costs.

Implication: TfNSW should achieve maintenance costs at or below industry averages given favourable climate conditions.

Regulatory Environment

Regulatory requirements impact costs through enhanced monitoring, reporting, and compliance activities.

NSW operates under moderate regulatory requirements (Work Health and Safety, environmental requirements, IPART oversight for some assets). This represents a +1-2 pp structural factor.

Administrative penalties: NSW's administrative penalty framework (enforced through SDRO/Revenue NSW) is more efficient than court-based systems, representing a favourable regulatory factor for compliance operations.

Cross-Cutting Enabler: Mobile Application Platform

Critical finding: A comprehensive mobile application is not merely a customer service channel—it is a foundational platform that delivers cost reductions across all four value chain components simultaneously. This cross-cutting impact makes mobile app investment the highest-leverage initiative available to TfNSW.

Value Chain Impact Analysis

Quantified Benefits

Per-component savings from mobile app platform:

Note: These savings overlap with other initiatives but demonstrate mobile app as the foundational enabler for most efficiency improvements.

Industry Evidence

Adjacent industry mobile app adoption rates and cost impacts:

Key success factors for high-adoption mobile apps:

Complete functionality: All account actions available in-app (not "call us for complex requests")

Proactive value: Push notifications, trip summaries, spending insights—not just reactive queries

Frictionless payments: One-tap top-up, saved payment methods, automatic replenishment

Fast onboarding: Account creation in <3 minutes, no branch visit required

Offline capability: Core functions available without connectivity

Implementation Considerations

Phased rollout approach:

Critical dependency: Mobile app investment must precede or parallel other digital transformation initiatives. AI chatbot, proactive notifications, digital compliance, and self-service account management all require a robust mobile platform as the delivery channel.

Fleet Characteristics

Vehicle fleet characteristics impact ANPR accuracy and associated manual review costs: 

Plate design standardisation: European plates follow standardised designs with consistent fonts, sizes, and contrast ratios, enabling higher OCR accuracy (typically 99%+). US plates vary significantly by state with diverse designs, colours, and fonts, reducing OCR accuracy (typically 96-98%). Australian plates fall between these extremes with state-based variation but generally consistent sizing. 

International vehicle mix: Jurisdictions with high proportions of foreign-registered vehicles face increased owner-lookup complexity and costs. UK crossings (Dartford, Mersey) manage significant European vehicle volumes; Australian urban toll roads have minimal international vehicles. This factor can add 1-2 percentage points to compliance costs for high international-traffic locations. 

Vehicle class complexity: Mixed fleet compositions (cars, trucks, motorcycles, buses) require more sophisticated classification systems. Motorcycle detection remains challenging for video-based systems due to rear-mounted plates and variable positioning. 

Impact range: 2-4 percentage points depending on fleet composition and plate standardisation.

Cumulative Impact Analysis

Applying variance factors enables operators to establish realistic efficiency targets based on their specific operating context:

Example: High-wage, moderate-scale operator in temperate climate

Example: Low-wage, large-scale operator in harsh climate

Key insight: Operators should benchmark against peers with similar structural characteristics rather than against global best practice without adjustment. An Australian single-concession operator targeting E-ZPass efficiency (22-24%) without accounting for structural factors will set unrealistic expectations and undermine improvement programs.

Part 6: Gap Analysis Framework

This section provides a framework for operators to assess their performance gaps against industry benchmarks. The metrics and targets presented are derived from international best practice and should be adapted to each operator's structural context.

Value Chain Gap Assessment Template

Operators should assess their performance against the following benchmarks:

Improvement opportunity sizing:

For a hypothetical operator with $100M annual operating expenses:

Component-Level Benchmarking Metrics

Passage Detection Metrics

Key improvement levers:

Adopt next-generation ANPR for new deployments (eliminates tag costs, achieves best-in-class automation)

Predictive maintenance implementation (reduce emergency repairs 50-60%)

Infrastructure consolidation (eliminate redundant detection points)

Modern equipment refresh (20-25% maintenance cost reduction)

Operational Back Office Metrics

Key improvement levers:

Increase automated reconciliation to >95%

Implement real-time exception alerting

Consolidate legacy systems to unified platform

Reduce manual review through machine learning

Mobile app self-service (reduces transaction queries by 15-25%)

Commercial Back Office Metrics

Key improvement levers:

Deploy comprehensive mobile app as foundational platform (cross-cutting enabler)

Integrate AI chatbot within mobile app (handle 40-60% of routine inquiries)

Enable proactive push notifications (reduce inbound contacts 20-30%)

Deliver in-app payments and auto-replenishment (reduce payment processing costs 80%)

Rationalise physical service centres (redirect to digital self-service)

Mobile app functional requirements:

Full account management (profile, vehicles, payment methods)

Real-time balance and transaction history

One-tap payments and automatic top-up

Push notifications (low balance, trip confirmations, payment receipts)

In-app dispute submission with photo upload

AI chatbot for routine inquiries

Service centre appointment booking (for complex issues only)

Compliance Metrics

Key improvement levers:

Automated owner lookup integration with vehicle registration databases

In-app violation notification and payment (push notification with one-tap payment)

Early payment discounts delivered via app notification (increase voluntary compliance 10-15 pp)

Payment plan self-service via mobile app (reduce agent handling)

Administrative penalty framework advocacy (where court-based enforcement applies)

Mobile app functional requirements for compliance:

Push notification of violations (within 48 hours of detection)

Violation details with supporting imagery

One-tap payment with saved payment method

Early payment discount prominently displayed

Payment plan setup and management

Dispute submission with supporting documentation

Priority Matrix

The following priority matrix applies to operators seeking to improve from developing-efficiency (35-42%) toward moderate or high efficiency targets:

Critical sequencing note: Mobile app platform is not simply a customer service initiative—it is the foundational enabler for:

AI chatbot deployment (requires app as delivery channel)

Proactive notifications (requires push notification capability)

In-app compliance payment (requires payment infrastructure)

Self-service account management (requires secure account access)

Digital adoption targets (70%+ requires compelling app experience)

Attempting other digital initiatives without mobile app investment will result in fragmented channels and suboptimal adoption.

Mobile app investment profile (indicative for large operator):

Financial Impact Framework

Operators can estimate their improvement opportunity using the following framework:

Step 1: Determine current efficiency tier

Step 2: Calculate improvement opportunity

Step 3: Allocate savings by component

Based on typical improvement distributions:

Key insight: Customer retail consistently represents the largest improvement opportunity (35-45% of total savings potential) due to the extreme cost differential between phone and digital channels (50-150× difference).

Part 7: Recommendations

For Operators Seeking to Benchmark Performance

7.1.1 Detailed Cost Decomposition

Operators should undertake detailed cost allocation across the four value chain components to enable precise benchmarking and targeted improvement initiatives.

Deliverables:

Activity-based cost model for roadside operations

Cost allocation methodology for shared services

Component-level KPIs aligned with international benchmarks

Regular reporting against efficiency tier targets

7.1.2 Self-Assessment Against Efficiency Tiers

Using the framework in Section 2, operators should:

Calculate current operating cost ratio (operating expenses ÷ toll revenue)

Identify appropriate efficiency tier based on structural factors

Establish realistic improvement target (typically one tier improvement over 24-36 months)

Decompose gap by value chain component to prioritise initiatives

For Operators Seeking Cost Reduction

7.2.1 Mobile Application Platform (Foundational Investment)

Deploy comprehensive mobile application as the foundational platform for digital transformation, recognising its cross-cutting impact across all four value chain components.

Strategic rationale: Mobile app is not merely a customer service channel—it is the delivery platform for efficiency improvements across passage detection (trip confirmation, dispute reduction), back office (inquiry deflection, digital delivery), customer retail (self-service, payment efficiency), and compliance (digital notices, in-app payment). Investment in mobile app must precede or parallel other digital initiatives.

Deliverables:

Phase 1 (Months 0-6): MVP with balance check, payment, trip history, basic notifications (target 20-30% adoption)

Phase 2 (Months 6-12): AI chatbot integration, violation payment, early payment discounts, push notifications (target 40-50% adoption)

Phase 3 (Months 12-18): Trip planning, spending insights, payment plans, full dispute submission (target 60-70% adoption)

Phase 4 (Months 18-24): Predictive alerts, personalised engagement, connected vehicle preparation (target 70-80% adoption)

Cross-component benefits:

Success metrics (adjust for operator scale):

App downloads: Target 80%+ of account holders within 12 months

Active monthly users: 60%+ of account holders

Digital transaction rate: 70%+ within 18 months

Call centre volume reduction: 40-50% within 24 months

7.2.2 Compliance Process Optimisation

Implement automated owner lookup and leverage mobile app for payment channel enhancement.

Deliverables:

API integration with vehicle registration database for owner lookup ($0.50-1.50 vs typical $3-6)

Early payment discount scheme (25-40% discount for 14-day payment)—delivered via app push notification

In-app violation payment (one-tap payment from notification, target 70%+ of payments)

Payment plan self-service via app (reduce agent handling)

Administrative penalty advocacy where court-based enforcement applies

7.2.3 Back Office Automation

Increase automated processing from typical 85% to >95%.

Deliverables:

Machine learning for transaction classification edge cases

Automated exception handling for common scenarios

Real-time exception alerting system

Performance dashboard with component-level metrics

For Asset Owners and Government Agencies

7.3.1 Concessionaire Performance Framework

Develop enhanced performance requirements using value chain benchmarks.

Deliverables:

Component-level KPIs for concessionaire agreements

Benchmarking methodology for annual performance reviews

Incentive/penalty framework aligned with efficiency targets

Best practice sharing mechanisms across portfolio

7.3.2 Shared Services Evaluation

Assess opportunities for shared services across tolling assets and with other government service channels.

Deliverables:

Business case for customer service consolidation

Government service centre integration feasibility

Shared back office operations assessment

Implementation roadmap

7.3.3 Technology Procurement Standards

Establish next-generation video-only (ANPR) as the preferred detection technology for all new assets based on emerging evidence.

Deliverables:

Technology specification standard requiring 99.8%+ automation and near-near zero leakage

Business case framework for RFID infrastructure retirement on legacy assets

Updated procurement specifications mandating next-gen ANPR standards

Environmental benefit quantification (tag elimination)

Customer journey simplification requirements (no tag pickup, no tag replacement)

Long-Term Strategic Initiatives (36+ Months)

7.4.1 Connected Vehicle Integration

Pilot vehicle-based tolling to further reduce infrastructure costs.

Deliverables:

OEM partnership framework

Pilot program design and implementation

API standards for interoperability

Incentive structure for adoption

7.4.2 Interoperability and Standardisation

Explore opportunities for interagency networks or shared infrastructure.

Deliverables:

Reciprocity agreement framework

Technical standards alignment

Shared infrastructure opportunities

National tolling interoperability assessment

Performance Target Framework

Operators can establish performance targets based on their starting position and structural factors:

From Developing Efficiency (35-42%) → Moderate Efficiency (28-35%):

From Moderate Efficiency (28-35%) → High Efficiency (22-28%):

Appendices

Appendix A: International Operator Profiles

Detailed profiles for each of the ten international operators referenced in this report are available in the source project files.

Appendix B: Technology Comparison Detail

Detailed RFID vs video cost structures are available in the source project files (Appendix B of each).

Appendix C: Adjacent Industry Data Sources

Appendix D: Glossary


| --- | --- | --- | --- |

| Characteristic | Legacy Video | Next-Gen ANPR | RFID |

| Automation rate | 95-98% | 99.8% | >99.5% |

| Leakage | 2-5% | Near Zero | <0.5% |

| Tag hardware | None | None | Required |

| Tag logistics | None | None | Significant |

| Exception handling | High | Minimal | Low |

| Total cost per txn | $0.200-0.285 | $0.084-0.127 | $0.094-0.148 |

| Operating cost ratio | 32-40% | 22-28% | 25-32% |


| --- | --- | --- | --- |

| Component | Definition | Typical Cost Share | Primary Cost Drivers |

| Passage Detection | Technology infrastructure for capturing and recording vehicle passages, including Automatic Vehicle Identification (AVI), hardware maintenance, software systems, data transmission, and initial transaction processing. AVI encompasses both tag-based detection (RFID/DSRC readers) and video-based detection (ANPR cameras and OCR processing). | 15-25% | Technology choice, scale, climate, infrastructure age, fleet characteristics |

| Operational Back Office | Financial processing, transaction reconciliation, trip reconstruction, data management, systems administration, and technical support functions. Trip reconstruction (linking entry and exit events into complete journeys) sits within this component. | 25-35% | Automation level, data complexity, system integration, MIR rate |

| Commercial Back Office | Account management, customer service operations, billing and invoicing, payment processing, dispute resolution. Note: Some industry participants refer to this as "Customer Retail" or "CBO". | 30-40% | Digital adoption, account complexity, labour costs, channel mix |

| Compliance & Enforcement | Violation processing, owner identification, notice generation, debt collection, legal proceedings | 15-25% | Legal framework, technology choice, owner lookup efficiency, fleet characteristics |


| --- | --- | --- |

| Tier | Characteristics | Examples |

| Tier 1: High-Efficiency Operators 
(22-28% of revenue) | Transaction volume >200 million annually; 
Part of interagency network or national system; 
RFID-primary or next-generation ANPR technology; 
Mature operations (10+ years); Temperate climate; 
Administrative penalty enforcement framework | E-ZPass, FASTag/NHAI, Queensland Motorways |

| Tier 2: Moderate-Efficiency Operators (28-35% of revenue) | Transaction volume 50-200 million annually; 
Multi-asset operator or large single concession; 
Hybrid RFID/video technology; Established operations (5-10 years); 
Moderate climate challenges; 
Mixed enforcement framework | ASFINAG, Autostrade, APRR, 407 ETR |

| Tier 3: Developing-Efficiency Operators (35-42% of revenue) | Transaction volume <50 million annually; 
Single-concession operator; Video-primary or mixed technology (legacy); 
Newer operations or mid-transition; 
Harsh climate (extreme winter/tropical); 
Court-based enforcement framework; 
High security requirements | Transurban (complex multi-asset), NLEX (transition), Cross Israel Highway (security) |


| --- | --- | --- | --- | --- |

| Component | Industry Range | High-Efficiency | Moderate-Efficiency | Developing-Efficiency |

| Passage Detection | 15-25% | 15-18% | 18-22% | 22-26% |

| Operational Back Office | 25-35% | 24-28% | 28-32% | 32-38% |

| Commercial Back Office | 30-40% | 28-32% | 32-38% | 38-45% |

| Compliance | 15-25% | 12-16% | 15-20% | 20-28% |


| --- | --- | --- | --- | --- | --- |

| Rank | Operator | Country/Region | Operating Cost Ratio | Primary Collection | Key Cost Drivers |

| 1 | E-ZPass Group | USA (Multi-state) | 22-24% | RFID (interagency) | Massive scale economies, standardised operations |

| 2 | TollPlus/NHAI (FASTag) | India | 24-26% | RFID (national) | Lower labour costs, national standardisation |

| 3 | Queensland Motorways | Australia | 26-28% | Hybrid tag/Video | High tag penetration, modern infrastructure, requires video backup |

| 4 | NSW Motorways | Australia | 27% | Hybrid Tag / Video | Government-operated, mature assets, demonstrates Tier 1 efficiency achievable in Australian market |

| 5 | Dartford River Crossing | UK | 7-9% | Video (ANPR) | Massive scale (55-66M txns/year), outsourced operations model. (1) |

| 4 | ASFINAG | Austria | 28-30% | Electronic vignette | Centralised operations, alpine maintenance |

| 5 | Autostrade per l'Italia | Italy | 30-32% | Hybrid RFID/Video | Scale economies, complex infrastructure |

| 6 | APRR | France | 31-33% | RFID (Télépéage) | High automation, high labour costs |

| 7 | 407 ETR | Canada | 32-34% | Video (ANPR) | Winter operations, sophisticated back office |

| 8 | Transurban | Australia | 35-40% | Hybrid RFID/Video | High back office costs, multi-asset complexity (2) |

| 9 | NLEX Corporation | Philippines | 35-40% | Hybrid electronic | Tropical climate, transition costs |

| 10 | Cross Israel Highway | Israel | 38-42% | Video (ANPR) | High security costs, complex enforcement |


| --- | --- | --- |

| Cost Component | Cost per Transaction | Notes |

| Passage Detection | $0.015-0.022 | Simple processing, high accuracy (>99.5%) |

| Operational Back Office | $0.035-0.048 | Low data requirements (200 bytes/transaction) |

| Commercial Back Office | $0.040-0.055 | Account-based, $3-5 annual account cost |

| Compliance | $0.008-0.015 | Low violation rates, known customers |

| Total | $0.098-0.140 | Typical operating cost 25-32% of revenue |


| --- | --- | --- |

| Cost Component | Cost per Transaction | Notes |

| Passage Detection | $0.035-0.045 | Complex OCR, higher error rates (95-98%) |

| Operational Back Office | $0.055-0.075 | High data storage (2-5 MB/transaction) |

| Commercial Back Office | $0.085-0.120 | Invoice-based, $12-20 annual account cost |

| Compliance | $0.025-0.045 | High violation rates, owner lookups |

| Total | $0.200-0.285 | Typical operating cost 32-40% of revenue |


| --- | --- | --- |

| Cost Component | Cost per Transaction | Notes |

| Passage Detection | $0.025-0.035 | Weighted average based on mix |

| Operational Back Office | $0.045-0.062 | Moderate data complexity |

| Commercial Back Office | $0.062-0.088 | Mixed account/invoice customers |

| Compliance | $0.015-0.030 | Moderate violation rates |

| Total | $0.147-0.215 | Typical operating cost 28-35% of revenue |


| --- | --- | --- | --- |

| Cost Category | RFID System | Next-Gen ANPR | Advantage |

| Passage Detection |  |  |  |

| Reader/camera infrastructure | $0.010-0.015 | $0.012-0.018 | Comparable |

| Tag hardware (per tag, amortised) | $0.003-0.005 | $0.000 | ANPR |

| Tag distribution logistics | $0.002-0.004 | $0.000 | ANPR |

| Tag replacement/maintenance | $0.001-0.002 | $0.000 | ANPR |

| Subtotal Detection | $0.016-0.026 | $0.012-0.018 | ANPR 25-35% lower |

| Commercial Back Office |  |  |  |

| Account setup (tag issuance) | $0.005-0.008 | $0.002-0.004 | ANPR |

| Tag-related customer service | $0.004-0.008 | $0.000 | ANPR |

| Account management (ongoing) | $0.030-0.042 | $0.028-0.040 | Comparable |

| Subtotal Customer | $0.039-0.058 | $0.030-0.044 | ANPR 20-30% lower |

| Operational Back Office |  |  |  |

| Transaction processing | $0.020-0.030 | $0.022-0.032 | Comparable |

| Exception handling (at 99.8%) | $0.008-0.012 | $0.004-0.008 | ANPR |

| Data storage | $0.005-0.008 | $0.010-0.015 | RFID |

| Subtotal Back Office | $0.033-0.050 | $0.036-0.055 | Comparable |

| Compliance |  |  |  |

| Violation processing | $0.006-0.012 | $0.006-0.010 | Comparable |

| Leakage/revenue loss | $0.000-0.002 | $0.000 | ANPR |

| Subtotal Compliance | $0.006-0.014 | $0.006-0.010 | ANPR marginally lower |

| TOTAL | $0.094-0.148 | $0.084-0.127 | ANPR 10-20% lower |


| --- | --- | --- | --- |

| System Type | Legacy Cost Range | Next-Gen Cost Range | Typical Operating Cost |

| RFID-primary | $0.098-0.140 | $0.094-0.148 | 25-32% of revenue |

| Video (legacy) | $0.200-0.285 | - | 32-40% of revenue |

| Video (next-gen ANPR) | - | $0.084-0.127 | 22-28% of revenue |

| Hybrid | $0.147-0.215 | $0.120-0.180 | 28-35% of revenue |


| --- | --- | --- | --- | --- |

| Operator | Cost per Transaction | Annual Cost per Lane/Gantry | Technology | Scale (M txns/year) |

| E-ZPass (USA) | $0.015-0.020 | $85,000-$110,000 | RFID primary | 60,000+ |

| FASTag (India) | $0.008-0.012 | $45,000-$65,000 | RFID national | 500+ |

| Queensland Motorways | $0.020-0.028 | $100,000-$140,000 | Hybrid | 200-300 |

| ASFINAG (Austria) | $0.022-0.030 | $120,000-$155,000 | Vignette | 300+ |

| Autostrade (Italy) | $0.025-0.035 | $140,000-$180,000 | Hybrid | 400+ |

| 407 ETR (Canada) | $0.035-0.045 | $180,000-$220,000 | Video | 200 |

| Transurban (Australia) | $0.028-0.038 | $150,000-$190,000 | Hybrid | 300+ |


| --- | --- | --- | --- |

| Operator | Cost per Transaction | Staff per Million Transactions | Automation Rate |

| E-ZPass | $0.035-0.045 | 0.8-1.2 FTE | >95% |

| FASTag/NHAI | $0.025-0.035 | 0.5-0.8 FTE | >95% |

| Queensland Motorways | $0.048-0.062 | 1.5-2.0 FTE | 90-95% |

| ASFINAG | $0.042-0.055 | 1.3-1.8 FTE | 90-95% |

| 407 ETR | $0.055-0.070 | 1.8-2.4 FTE | 85-90% |

| Transurban | $0.065-0.085 | 2.2-2.8 FTE | 85-90% |


| --- | --- | --- | --- | --- |

| Operator | Cost per Account (Annual) | Cost per Contact | Digital Adoption | FTE per 100k Accounts |

| E-ZPass | $3.50-4.80 | $4.50-6.50 | 65-75% | 12-18 |

| FASTag | $1.80-2.60 | $2.50-4.00 | 70-80% | 6-9 |

| Queensland Motorways | $5.80-7.50 | $7.50-10.00 | 55-65% | 18-24 |

| ASFINAG | $4.20-5.80 | $6.00-8.50 | 60-70% | 14-20 |

| 407 ETR | $6.20-8.40 | $8.50-12.00 | 50-60% | 22-28 |

| Transurban | $7.50-10.20 | $11.00-15.00 | 50-60% | 28-35 |


| --- | --- | --- | --- |

| Channel | Cost per Contact | Resolution Time | Improvement Potential |

| In-person (service centre) | $15.00-25.00 | 15-25 minutes | Very low |

| Phone (agent-assisted) | $6.00-12.00 | 4-8 minutes | Moderate (30-50% to digital) |

| Email/web form | $2.50-5.00 | 24-48 hours | Moderate (20-40% to self-service) |

| Web chat (human) | $2.00-4.00 | 6-12 minutes | High (50-70% to chatbot) |

| Chatbot/AI assistant | $0.80-1.50 | 1-3 minutes | Very high |

| Mobile app self-service | $0.50-1.20 | Immediate | Ultimate channel |

| IVR self-service | $0.30-0.80 | 1-2 minutes | High |


| --- | --- | --- | --- |

| Operator | Cost per Violation | Collection Rate | Legal Framework |

| E-ZPass (various) | $6.50-9.50 | 90-94% | Administrative penalty |

| ASFINAG | $7.00-10.00 | 86-91% | Administrative penalty |

| 407 ETR | $8.50-12.00 | 88-92% | Administrative + registration hold |

| San Francisco Bay Bridges | $10.00-14.00 | 85-89% | Administrative penalty |

| Transurban | $15.00-22.00 | 82-87% | Mixed admin/court |

| Cross Israel Highway | $12.00-18.00 | 75-82% | Complex enforcement |


| --- | --- | --- | --- |

| Framework | Collection Rate | Cost per Violation | Processing Time |

| Administrative penalties | 85-92% | $7.00-11.00 | 30-90 days |

| Court-based (summary) | 78-85% | $12.00-20.00 | 90-180 days |

| Court-based (full) | 75-82% | $18.00-35.00 | 180-365 days |


| --- | --- | --- | --- | --- |

| System | Location | Cost per Tap/Transaction | Technology | Annual Transactions |

| Opal | Sydney | $0.015-0.025 | NFC/Contactless | 600+ million |

| myki | Melbourne | $0.018-0.028 | RFID/NFC | 500+ million |

| Oyster/Contactless | London | $0.012-0.020 | RFID/NFC/Contactless | 2.5+ billion |

| Octopus | Hong Kong | $0.008-0.015 | RFID | 15+ million daily |

| Suica/PASMO | Tokyo | $0.010-0.018 | RFID/NFC | 30+ million daily |


| --- | --- | --- | --- |

| Application | Cost per Transaction | Technology | Notes |

| RFID-based parking | $0.012-0.018 | RFID | Tag-based access |

| ANPR-based parking | $0.030-0.050 | Video | Number plate recognition |

| Contactless payment | $0.020-0.035 | NFC | Bank card payment |

| Mobile app payment | $0.025-0.040 | Digital | App-based payment |


| --- | --- | --- | --- |

| Venue Type | Cost per Entry | Technology | Notes |

| Major stadium (50,000+) | $0.08-0.15 | RFID/barcode | Peak load management |

| Concert/festival | $0.10-0.20 | RFID wristband | Multi-day events |

| Theme park | $0.05-0.10 | RFID/biometric | High daily throughput |


| --- | --- | --- | --- |

| Industry | Cost Range | TfNSW Implied Cost | Gap |

| Toll roads (RFID) | $0.010-0.020 | - | Target |

| Toll roads (video) | $0.030-0.045 | - | Target |

| Toll roads (hybrid) | $0.018-0.030 | $0.15-0.25 | -$0.12-0.22 |

| Public transport | $0.010-0.025 | - | Comparable |

| Automated parking (RFID) | $0.012-0.018 | - | Comparable |

| Automated parking (ANPR) | $0.030-0.050 | - | Comparable |


| --- | --- | --- | --- | --- |

| Utility | Customers | Cost per Customer (Monthly) | Cost per Bill | Automation |

| Sydney Water | 1.9M | $2.50-3.50 | $3.00-4.00 | 85-90% |

| Ausgrid | 1.7M | $3.00-4.00 | $3.50-4.50 | 85-90% |

| AGL Energy | 4.2M | $2.80-3.80 | $3.20-4.20 | 88-92% |

| Origin Energy | 4.0M | $3.00-4.00 | $3.50-4.50 | 85-90% |

| Jemena Gas | 1.4M | $2.20-3.20 | $2.60-3.60 | 80-85% |


| --- | --- | --- | --- |

| Function | Utility Cost | Toll Industry Cost | Variance |

| Meter/transaction processing | $0.08-0.15/bill | $0.035-0.085/txn | Comparable |

| Reconciliation | $0.05-0.10/bill | $0.020-0.040/txn | Comparable |

| Exception handling | $2.50-5.00/exception | $2.00-4.00/exception | Comparable |

| Reporting and compliance | $0.30-0.50/customer/month | $0.25-0.45/account/month | Comparable |


| --- | --- | --- | --- |

| Industry | Cost per Transaction | Automation | Notes |

| Credit card processing | $0.08-0.15 | >95% | More complex fraud detection |

| Banking (straight-through) | $0.05-0.12 | >98% | Comparable complexity |

| Banking (manual) | $2.50-5.00 | <50% | 20-50x automated cost |

| Insurance claims (auto) | $8-15/claim | >85% | More complex than tolls |

| Insurance claims (manual) | $45-85/claim | <40% | 5-6x automated cost |


| --- | --- | --- | --- |

| Industry | Cost Range | TfNSW Implied Cost | Gap |

| Toll roads (high efficiency) | $0.025-0.045/txn | - | Target |

| Toll roads (average) | $0.045-0.070/txn | $0.08-0.12/txn | -$0.03-0.05 |

| Utilities | $2.50-4.00/customer/month | - | Comparable |

| Banking (STP) | $0.05-0.12/txn | - | Comparable |


| --- | --- | --- | --- | --- |

| Provider | Cost per Customer (Annual) | Cost per Contact | Digital Adoption | FTE per 100k Customers |

| Sydney Water | $22-32 | $8-14 | 55-65% | 15-22 |

| Ausgrid | $28-38 | $10-16 | 50-60% | 18-26 |

| AGL Energy | $35-50 | $12-18 | 45-55% | 22-30 |

| Origin Energy | $32-45 | $11-16 | 50-60% | 20-28 |

| Telstra | $55-75 | $14-22 | 55-65% | 25-35 |


| --- | --- | --- | --- |

| Service | Cost per Transaction | Digital Adoption | Processing Time |

| Service NSW (counter) | $12-18 | - | 10-15 minutes |

| Service NSW (online) | $1.50-3.00 | 65-75% | <5 minutes |

| Service NSW (call) | $8-14 | - | 6-10 minutes |

| Medicare (counter) | $15-22 | - | 12-18 minutes |

| Medicare (online) | $0.80-1.50 | 70-80% | <3 minutes |

| Centrelink (counter) | $18-28 | - | 15-25 minutes |

| Centrelink (online) | $2.00-4.00 | 60-70% | <10 minutes |


| --- | --- | --- | --- |

| Provider Type | Cost per Account (Annual) | Digital Adoption | Notes |

| Traditional bank | $45-85 | 45-65% | Branch-heavy model |

| Digital bank (neo-bank) | $8-18 | 85-95% | Digital-only model |

| Traditional insurer | $25-45 | 30-50% | Agent-heavy model |

| Digital insurer | $10-20 | 80-90% | Digital-only model |

| Subscription services | $2.50-6.00 | 90-98% | Fully digital |

| Leading toll operator | $3.00-5.00 | 70-80% | High digital adoption |


| --- | --- | --- | --- |

| Industry | Cost per Account/Customer | TfNSW Implied Cost | Gap |

| Toll roads (high efficiency) | $3.00-5.00 | - | Target |

| Toll roads (Australian) | $6.00-10.00 | $8-12 | -$2-4 |

| Utilities (Australian) | $22-45 | - | Higher (more complex) |

| Digital banks | $8-18 | - | Comparable |

| Subscription services | $2.50-6.00 | - | Aspirational |

| Service NSW (online) | $1.50-3.00/txn | - | Comparable |


| --- | --- | --- | --- |

| System | Cost per Infringement | Collection Rate | Legal Framework |

| Sydney Trains/Buses (Opal) | $8-14 | 75-85% | SDRO enforcement |

| Melbourne (myki) | $10-16 | 70-80% | Infringement court |

| Transport for London | £6-10 ($12-18) | 80-88% | Administrative + court |

| Singapore MRT | S$5-8 ($5-10) | 90-95% | Administrative penalty |


| --- | --- | --- | --- |

| Function | Revenue NSW Cost | Toll Industry Equivalent | Notes |

| Fine processing | $6-10/fine | $6-12/violation | Comparable |

| Owner lookup | $0.50-1.20/lookup | $0.50-6.00/lookup | Varies by integration |

| Notice generation | $2.50-4.00/notice | $2.50-5.00/notice | Comparable |

| Collections referral | $8-15/referral | $8-18/referral | Comparable |

| Court proceedings | $85-150/case | $85-200/case | Comparable |


| --- | --- | --- | --- |

| Enforcement Type | Cost per Notice | Collection Rate | Notes |

| Parking violations (council) | $8.50-15.00 | 75-85% | Administrative penalty |

| Parking violations (private) | $12-20 | 60-75% | Limited enforcement powers |

| Red light cameras | $12-20 | 80-88% | Government enforcement |

| Speed cameras | $10-18 | 82-90% | Government enforcement |

| Mobile phone detection | $15-25 | 78-85% | New program, higher costs |


| --- | --- | --- | --- |

| Industry | Cost per Violation | Collection Rate | TfNSW Gap |

| Toll roads (high efficiency) | $6.00-10.00 | 88-94% | Target |

| Toll roads (Australian) | $12.00-22.00 | 82-87% | -$6-12, -5-7pp |

| Revenue NSW | $6-10/fine | 85-92% | Comparable |

| Public transport (Sydney) | $8-14 | 75-85% | Slightly higher |

| Parking (council) | $8.50-15.00 | 75-85% | Comparable |

| Red light/speed cameras | $10-20 | 80-90% | Comparable |


| --- | --- | --- | --- |

| Factor | Impact Range | TfNSW Position | Structural/Manageable |

| Scale and Network Effects | 10-15 pp | Moderate scale (~200M txns) | Partially manageable |

| Labour Cost Environment | 5-8 pp | High labour costs (3-4x Asia) | Structural |

| Climate and Geography | 3-5 pp | Temperate (favourable) | Structural |

| Infrastructure Age | 3-6 pp | Mixed (SHB old, new assets) | Manageable |

| Regulatory Environment | 2-4 pp | Moderate complexity | Partially structural |

| Technology Transition | 5-10 pp (temp) | Stable (no major transition) | Manageable |

| Fleet Characteristics | 2-4 pp | Plate standardisation, international vehicle mix, vehicle class complexity | Partially structural |


| --- | --- | --- | --- |

| Transaction Volume | Typical Cost Ratio | Per-Transaction Cost | Examples |

| <10M annually | 38-45% | $0.200-0.350 | Single small asset |

| 10-50M annually | 32-38% | $0.150-0.220 | Single major asset |

| 50-200M annually | 28-34% | $0.120-0.180 | Multi-asset operator |

| 200-500M annually | 24-30% | $0.100-0.150 | Large network |

| >500M annually | 22-26% | $0.080-0.120 | National/interagency |


| --- | --- | --- |

| Component | Labour Intensity | Labour Cost Impact |

| Passage Detection | Low (0.2-0.5 FTE/M txns) | 1-2 pp |

| Operational Back Office | Medium (0.8-2.8 FTE/M txns) | 2-3 pp |

| Commercial Back Office | High (12-35 FTE/100k accounts) | 3-5 pp |

| Compliance | Medium (12-35 FTE/100k violations) | 2-3 pp |

| Total | - | 5-8 pp |


| --- | --- | --- | --- |

| Condition | Maintenance Impact | Cost Premium | Examples |

| Harsh winter | +15-25% | 3-5 pp | Canada, Austria, northern USA |

| Tropical | +15-20% | 3-4 pp | Philippines, Malaysia, Singapore |

| Alpine/mountain | +40-60% (tunnel sections) | 2-4 pp | Austria, Italy, Switzerland |

| Temperate | Baseline | 0 pp | Australia, California, UK |

| Arid | -5-10% | -1-2 pp | Middle East, southwestern USA |


| --- | --- | --- |

| Regulatory Environment | Cost Impact | Examples |

| Light regulation | Baseline | India, Philippines |

| Moderate regulation | +1-2 pp | Australia, USA |

| Heavy regulation (EU) | +2-4 pp | Austria, France, Italy |

| High security | +3-4 pp | Israel |


| --- | --- | --- | --- |

| Value Chain Component | Mobile App Function | Cost Impact | Mechanism |

| Passage Detection | Real-time trip notifications | 5-10% reduction in dispute costs | Customers receive immediate confirmation of trip detection, reducing "I wasn't there" disputes |

|  | GPS-based trip verification | Reduces exception handling | Provides secondary verification for edge cases |

|  | Proactive toll zone alerts | Reduces unintentional violations | Notifies customers approaching toll points |

| Operational Back Office | Self-service transaction history | 15-25% reduction in inquiry volume | Customers resolve questions without agent contact |

|  | Automated reconciliation queries | Reduces manual investigation | Real-time access reduces "where's my payment" inquiries |

|  | Push notification delivery | Reduces postage and processing | Digital delivery vs physical mail |

| Commercial Back Office | Account management self-service | 40-50% cost reduction | Balance checks, payments, profile updates without agent |

|  | In-app payments and top-ups | Reduces payment processing costs | $0.15-0.35 vs $2.50-4.00 for invoiced payments |

|  | AI chatbot integration | 40-60% inquiry deflection | Routine questions resolved in-app |

|  | Proactive notifications | 20-30% reduction in inbound contacts | Low balance alerts, payment confirmations, trip summaries |

| Compliance | Violation push notifications | 10-15pp increase in first-notice payment | Immediate awareness, frictionless payment |

|  | In-app violation payment | Reduces processing cost by 60-70% | No invoice printing, postage, manual reconciliation |

|  | Early payment discount uptake | Higher discount participation | Easy access to discount payment option |

|  | Payment plan self-service | Reduces agent handling | Customers establish arrangements without call |


| --- | --- | --- | --- | --- |

| Component | Current Cost | App-Enabled Savings | Savings % | Annual Value |

| Passage Detection | $20-30M | $1-3M | 5-10% | Dispute/exception reduction |

| Operational Back Office | $25-35M | $4-8M | 15-25% | Inquiry deflection, digital delivery |

| Commercial Back Office | $40-55M | $16-27M | 40-50% | Self-service, payment efficiency |

| Compliance | $15-25M | $4-8M | 25-35% | Digital notice, in-app payment |

| Total | $100-145M | $25-46M | 25-35% | Cross-component impact |


| --- | --- | --- | --- |

| Industry | App Adoption | Cost Reduction Achieved | Key Success Factors |

| Digital banking (neobanks) | 95-98% | 60-70% vs traditional | Mobile-first design, full functionality |

| Utilities (leading) | 45-55% | 25-35% | Bill payment, usage tracking |

| Public transport (Opal) | 40-50% | 20-30% | Trip planning, balance management |

| Subscription services | 80-90% | 50-60% vs traditional | Account management, billing |

| Insurance | 35-45% | 15-25% | Claims, policy management |


| --- | --- | --- | --- |

| Phase | Timeline | Features | Target Adoption |

| MVP | Months 0-6 | Balance check, payment, trip history, basic notifications | 20-30% |

| Enhanced | Months 6-12 | AI chatbot, violation payment, early payment discounts, push notifications | 40-50% |

| Advanced | Months 12-18 | Trip planning, spending insights, payment plans, full dispute submission | 60-70% |

| Mature | Months 18-24 | Predictive alerts, personalised offers, connected vehicle prep | 70-80% |


| --- | --- | --- | --- |

| Factor | Global Best Practice | Adjustment | Adjusted Target |

| Baseline | 22% | - | 22% |

| Scale (moderate: 50-200M txns) | - | +4-6 pp | 26-28% |

| Labour (high-wage: Australia/Europe) | - | +5-8 pp | 31-36% |

| Climate (temperate) | - | 0 pp | 31-36% |

| Infrastructure (mixed age) | - | +2-3 pp | 33-39% |

| Regulation (moderate) | - | +1-2 pp | 34-41% |

| Transition (stable) | - | 0 pp | 34-41% |

| Realistic Target | 22% | +12-19 pp | 34-41% |


| --- | --- | --- | --- |

| Factor | Global Best Practice | Adjustment | Adjusted Target |

| Baseline | 22% | - | 22% |

| Scale (large: >200M txns) | - | +0-2 pp | 22-24% |

| Labour (low-wage: Asia) | - | +0-2 pp | 22-26% |

| Climate (harsh: tropical/winter) | - | +3-5 pp | 25-31% |

| Infrastructure (modern) | - | +0-1 pp | 25-32% |

| Regulation (light) | - | +0-1 pp | 25-33% |

| Transition (mid-transition) | - | +5-8 pp | 30-41% |

| Realistic Target | 22% | +3-19 pp | 25-41% |


| --- | --- | --- | --- |

| Component | High-Efficiency Target | Moderate-Efficiency Target | Developing-Efficiency Target |

| Passage Detection | 15-18% of opex | 18-22% of opex | 22-26% of opex |

| Operational Back Office | 24-28% of opex | 28-32% of opex | 32-38% of opex |

| Commercial Back Office | 28-32% of opex | 32-38% of opex | 38-45% of opex |

| Compliance | 12-16% of opex | 15-20% of opex | 20-28% of opex |


| --- | --- | --- |

| Gap Size | Savings Potential | Typical Causes |

| 5-10 pp above target | $5-10M annually | Process inefficiencies, low automation |

| 10-20 pp above target | $10-20M annually | Technology gaps, poor digital adoption |

| 20+ pp above target | $20M+ annually | Fundamental structural issues, legacy systems |


| --- | --- | --- | --- |

| Metric | High-Efficiency | Moderate-Efficiency | Developing-Efficiency |

| Cost per transaction | $0.012-0.020 | $0.020-0.035 | $0.035-0.050 |

| Automation rate | >99.5% | 97-99.5% | 95-97% |

| Leakage | <0.5% | 0.5-2% | 2-5% |

| System availability | >99.7% | 99-99.7% | 97-99% |

| Annual cost per lane/gantry | $80,000-120,000 | $120,000-180,000 | $180,000-250,000 |


| --- | --- | --- | --- |

| Metric | High-Efficiency | Moderate-Efficiency | Developing-Efficiency |

| Cost per transaction | $0.025-0.045 | $0.045-0.070 | $0.070-0.100 |

| FTE per million txns | 0.8-1.5 | 1.5-2.5 | 2.5-4.0 |

| Automation rate | >95% | 85-95% | 70-85% |

| Exception resolution | <24 hours | 24-48 hours | 48+ hours |


| --- | --- | --- | --- |

| Metric | High-Efficiency | Moderate-Efficiency | Developing-Efficiency |

| Cost per account (annual) | $3.00-5.00 | $5.00-8.00 | $8.00-15.00 |

| Cost per contact | $3.50-6.00 | $6.00-10.00 | $10.00-18.00 |

| Digital adoption | >70% | 50-70% | 30-50% |

| FTE per 100k accounts | 12-20 | 20-30 | 30-45 |

| Mobile app adoption | >60% | 30-60% | <30% |


| --- | --- | --- | --- |

| Metric | High-Efficiency | Moderate-Efficiency | Developing-Efficiency |

| Cost per violation | $6.00-10.00 | $10.00-15.00 | $15.00-25.00 |

| Collection rate | >88% | 80-88% | 70-80% |

| First notice payment | >50% | 35-50% | 25-35% |

| Owner lookup cost | $0.50-1.50 | $1.50-4.00 | $4.00-8.00 |

| Digital payment rate | >70% | 40-70% | <40% |


| --- | --- | --- | --- | --- | --- |

| Initiative | Impact Potential | Effort | Timeline | Priority | Dependencies |

| Mobile app platform | 25-35% of opex | High | 0-18 months | 1 (Foundational) | None—enables all other digital initiatives |

| Back office automation | 8-12% of opex | Medium | 6-12 months | 2 | Partial mobile app dependency |

| Compliance optimisation | 6-10% of opex | Medium | 6-18 months | 3 | Requires mobile app for in-app payment |

| Detection optimisation | 6-10% of opex | Medium | 12-24 months | 4 | Mobile app for trip confirmations |

| Platform consolidation | 8-12% of opex | High | 24-36 months | 5 | Mobile app as front-end |


| --- | --- | --- | --- |

| Phase | Investment | Cumulative Savings | Payback |

| MVP (Months 0-6) | $3-5M | 5-10% of target | 9-15 months |

| Enhanced (Months 6-12) | $4-6M | 25-35% of target | Achieved |

| Advanced (Months 12-18) | $3-5M | 55-70% of target | Achieved |

| Total | $10-16M | 25-35% opex reduction | <12 months |


| --- | --- | --- |

| Current Operating Cost Ratio | Efficiency Tier | Realistic Target |

| 35-42% | Developing | 28-35% (moderate) |

| 28-35% | Moderate | 24-28% (high) |

| 24-28% | High | 22-24% (best practice) |


| --- | --- | --- |

| Metric | Formula | Example (Developing → Moderate) |

| Current opex | Revenue × current ratio | $200M × 38% = $76M |

| Target opex | Revenue × target ratio | $200M × 30% = $60M |

| Annual savings | Current - Target | $76M - $60M = $16M |

| Investment (typical) | 0.3-0.5× annual savings | $5-8M |

| Payback | Investment ÷ savings | 4-6 months |


| --- | --- | --- |

| Component | Share of Savings | Example ($16M total) |

| Commercial Back Office | 35-45% | $5.6-7.2M |

| Back Office | 20-25% | $3.2-4.0M |

| Compliance | 15-20% | $2.4-3.2M |

| Passage Detection | 15-20% | $2.4-3.2M |


| --- | --- | --- |

| Component | Mobile App Benefit | Target Impact |

| Passage Detection | Real-time trip confirmations reduce disputes | 5-10% dispute cost reduction |

| Back Office | Self-service transaction queries | 15-25% inquiry volume reduction |

| Commercial Back Office | Full account self-service | 40-50% cost reduction |

| Compliance | In-app violation payment | 25-35% compliance cost reduction |


| --- | --- | --- |

| Timeframe | Target Improvement | Key Milestones |

| Year 1 | 5-8 pp reduction | Mobile app launch, digital migration |

| Year 2 | 3-5 pp reduction | Compliance optimisation, automation |

| Year 3 | 2-3 pp reduction | Platform consolidation |

| Total | 10-16 pp reduction | From 38% to 22-28% |


| --- | --- | --- |

| Timeframe | Target Improvement | Key Milestones |

| Year 1 | 3-5 pp reduction | Process optimisation, digital adoption |

| Year 2 | 2-3 pp reduction | Advanced analytics, predictive service |

| Year 3 | 1-2 pp reduction | Connected vehicle, interoperability |

| Total | 6-10 pp reduction | From 30% to 20-24% |


| --- | --- | --- | --- |

| Industry | Source | Data Type | Currency |

| Opal/TfNSW | Annual reports | Operational metrics | Public |

| Sydney Water | IPART determinations | Operating costs, KPIs | Public |

| Ausgrid | AER determinations | Operating costs, KPIs | Public |

| Service NSW | Annual reports | Transaction costs | Public |

| Revenue NSW | Annual reports | Fines processing costs | Public |

| Transport for London | Annual reports | Ticketing, compliance | Public |

| E-ZPass Group | IBTTA reports | Interagency benchmarks | Public |

| NHAI (India) | Public reports | FASTag metrics | Public |


| --- | --- |

| Term | Definition |

| ANPR | Automatic Number Plate Recognition |

| FTE | Full-Time Equivalent |

| IBTTA | International Bridge, Tunnel and Turnpike Association |

| IPART | Independent Pricing and Regulatory Tribunal |

| KPI | Key Performance Indicator |

| NHAI | National Highways Authority of India |

| OCR | Optical Character Recognition |

| pp | Percentage points |

| RFID | Radio-Frequency Identification |

| WHT | Western Harbour Tunnel (case study reference) |

---


## CBS-Tolling becomes Demand Management v0.1 DRAFT.docx

*File: `Archive/CBS-Tolling becomes Demand Management v0.1 DRAFT.docx`*

What If NSW Tolls Became Demand Management?

NSW road users pay some of the highest tolls in the world and still sit in congestion. What if the system was redesigned not to collect revenue, but to actually move people?

This thought experiment asks a deceptively simple question: what would change if every toll in NSW was redesigned around demand management — pricing access to manage network flow, rather than to service debt and honour concession contracts?

The answer is more tractable than it might seem. Existing concession obligations don't have to be an obstacle. With the right pricing architecture, toll roads can still generate contracted revenues while the broader network is used as a genuine management instrument. For the first time, road users would have a real choice: travel at peak and pay today's toll, or shift to off-peak and pay less.

Demand management doesn't mean paying more. It means, for the first time, you can pay less.

This isn't a theoretical idea. London, Stockholm, and Singapore have all demonstrated that pricing roads to manage demand produces better outcomes in less congestion, more reliable journey times, and a more equitable distribution of cost. Express lanes in the US show that charges and tolls can be complementary. The question is not whether it works. The question is whether NSW is making the architecture decisions today that would allow it to happen.

The transformation doesn't require an overnight leap to GPS-based road user charging. It can begin with corridor-level congestion pricing that builds directly on existing tolling systems — expanding incrementally until the economics of broader coverage make zero-infrastructure solutions the natural next step.

FULL ANALYSIS

What if NSW scrapped tolls and introduced demand management?

A thought experiment on network pricing, concession obligations, and the road not yet taken.

The provocation

NSW operates one of the most extensive urban toll networks in the world. It also carries some of its most expensive tolls, a compliance problem that costs the network hundreds of millions of dollars annually, and road users who consistently report that the system feels deeply unfair. The Independent Toll Review led by Professor Allan Fels documented this frustration in detail: people pay high tolls, have little ability to avoid them, and see no clear relationship between what they pay and the quality of service they receive.

Yet the core purpose of pricing – to influence behaviour and allocate scarce capacity – is almost entirely absent from NSW tolling today. Prices are set to meet revenue obligations. They escalate by contract regardless of network performance. They bear little relationship to actual congestion levels. They do not reward flexibility, and they do not respond to demand.

This thought experiment asks a different question: what if they did? What would NSW's road network look like if tolling was redesigned as a demand management instrument, and what would it take to get there?

What demand management actually looks like

The international evidence on demand-managed road pricing is now substantial. Three examples are particularly instructive for NSW.

LONDON CONGESTION CHARGE  |  United Kingdom  |  Est. 2003

London's Congestion Charge Zone introduced a flat daily charge for driving in central London during peak hours. Within a year, traffic in the zone fell by around 30 per cent, journey times improved markedly, and revenue was hypothecated to public transport investment. The scheme demonstrated that demand responds to pricing, that a defined geographic zone is a practical unit of management, and that the revenue generated can be reinvested in the alternatives that make the charge politically sustainable. London later introduced the Ultra Low Emission Zone (ULEZ), showing that a charge structure can be layered to achieve multiple policy objectives simultaneously.

STOCKHOLM CONGESTION TAX  |  Sweden  |  Est. 2007

Stockholm went further than London by making the charge dynamic: prices vary by time of day, rising at peak periods and falling during off-peak hours. The scheme reduced traffic in the inner city by around 20 per cent, with the most significant reductions during peak hours — exactly the behaviour change a demand management system is designed to achieve. Crucially, a trial period preceded permanent implementation, and public support increased once residents experienced the benefit of reduced congestion firsthand. 

SINGAPORE ERP  |  Singapore  |  Est. 1998, ERP 2.0 from 2025

Singapore operates the world's most sophisticated urban demand management tolling system. The Electronic Road Pricing system uses dynamic pricing that adjusts in real time based on measured traffic speeds: if a monitored road segment falls below a target speed, the price increases at the next rate adjustment. The recently introduced ERP 2.0 replaces the original roadside gantry infrastructure entirely with GNSS-based on-board units, eliminating physical infrastructure from the equation. Singapore's technology evolution path (from gantries to zero-infrastructure) is relevant to the staged approach NSW could take.

NEW YORK CONGESTION PRICING  |  USA  |  Est. 2025

New York's Central Business District Tolling Program began charging in 2025. Its introduction was contentious and subject to significant political opposition, including a temporary suspension attempt, a useful reminder that the equity and political economy of demand management must be designed for from the outset, not treated as afterthoughts. New York also illustrates that the debate is no longer about whether demand management works, but about who bears the cost and who captures the benefit.

Taken together, these examples establish that demand management is not a theoretical idea. It reduces congestion, it changes behaviour, and when designed well, it generates revenue that can be reinvested in the network and its users. The question for NSW is not whether it works, it is whether the existing structure of the NSW network makes it possible, and what it would take to get there.

The Thought Experiment: NSW tolls redesigned for behaviour change

Imagine a version of tolling designed around a single question: how do we get the network flowing as efficiently as possible, and price access accordingly?

In this system, pricing is dynamic. It responds in real time to congestion levels, incidents, and network stress. The road network, toll and non-toll, is treated as a unified system rather than a collection of independent revenue assets. Revenue is an output of the model, not its primary input. And for the first time, road users have a genuine choice.

If you have to travel at peak, you pay the same toll as today. If you can shift to off-peak, you pay less. That is it.

This is the essential value proposition. Demand management does not mean loading additional cost onto road users who are already paying too much. It means creating a mechanism by which those users can actually reduce their cost by changing behaviour. Those with flexibility benefit. Those without it are no worse off than today, albeit with less congestion on their route.

For Western Sydney residents, who the Fels Review identified as bearing the most disproportionate toll burden, this matters. The current system offers no relief, no optionality, and no relationship between the price paid and the quality of the journey. Demand management at least creates the conditions in which off-peak travel is rewarded, and over time, as the system matures, more targeted relief for high-dependency corridors becomes structurally possible.

Concession Contracts: A feature, not a barrier

The immediate objection is obvious: existing concession contracts lock in revenue expectations. If prices fall off-peak and traffic redistributes, how do concessionaires receive their contracted revenue?

The answer is that demand management, properly designed, need not reduce aggregate revenue. Two complementary mechanisms make this work:

Optimised network pricing:  Dynamic pricing calibrated across the network can hold or increase peak prices while reducing off-peak rates, with the net effect being revenue-neutral or positive for concessionaires. Toll roads within a demand-managed network command a premium: they offer faster, more reliable, less congested journeys. Users who value that reliability will pay for it. The toll road becomes the premium lane within a broader managed system, not simply a debt-recovery mechanism.

Shadow tolls:  Where demand management deliberately diverts trips away from toll roads: onto alternative routes, into different time slots, or toward other modes, government can compensate concessionaires through shadow toll payments. This reframes the shadow toll not as a subsidy to private operators, but as a payment for a public good: the government is purchasing congestion reduction, emissions abatement, and productivity gain. The cost of that payment is likely to be substantially offset by reduced infrastructure wear, lower health externalities, and avoided capital expenditure on capacity expansion that congestion would otherwise demand.

TRANSURBAN EXPRESS LANES  |  Virginia & Maryland, USA

Transurban’s Express Lanes network in Virginia and Maryland — including the I-495, I-95, and I-66 corridors — is perhaps the most directly relevant international precedent for NSW. Unlike London, Stockholm, or Singapore, these are privately operated managed lanes operating within a concession framework, which is structurally much closer to the NSW context. Tolls adjust dynamically in real time to maintain target travel speeds in the managed lanes, with prices rising sharply at peak periods and falling during off-peak hours. High-occupancy vehicles (three or more occupants) travel free of charge, embedding an explicit equity and mode-shift incentive directly into the pricing model. General purpose lanes remain free and available alongside the Express Lanes, meaning road users retain genuine choice: pay for reliability, or use the free alternative and accept variable conditions. The concessionaire’s revenue interests are served — not undermined — by the dynamic pricing mechanism, because the product being sold is a reliable journey time, and pricing is the tool that delivers it. Transurban’s Express Lanes demonstrate that dynamic demand management pricing and private concession operation are not in conflict. They can be designed to reinforce each other.

The key insight is that the concession contract and demand management are not mutually exclusive. They require compatible architecture such as a pricing engine that can reconcile dynamic charges with fixed revenue obligations, and a back-office that can account for both. That is a design challenge, not a structural impossibility.

The staged path: From corridor charge to network intelligence

The transformation described in this paper does not require a single leap to full network pricing. It can be built incrementally, with each stage delivering genuine demand management outcomes while laying the foundation for the next. What matters is that the pricing logic is right from the outset. Technology follows that logic, rather than defining it.

Stage 1 – Corridor Demand Management: Demand management begins at a defined corridor level: a specific crossing, an orbital segment, or a zone. Within that corridor, pricing becomes dynamic across all roads, including the toll road. The toll road is not exempt from demand management; it is the premium tier within it. Off-peak pricing falls below today's toll. Peak pricing holds at or above it. Road users on the toll road benefit from the same incentive as everyone else: shift to off-peak and pay less. The corridor charge covers alternative routes within the same zone but crucially, road users do not pay both: if they are on the toll road, that trip satisfies the corridor demand charge. Concession revenue is maintained through the pricing calibration and, where needed, shadow toll payments for diverted trips. This stage is achievable within existing tolling infrastructure; no new technology is required at the outset.

Stage 2 – Network Expansion: As the managed network grows beyond individual corridors, the demand management pricing logic extends with it. More roads, more route choices, more behavioural levers. The toll road remains the premium reliable option within a progressively larger managed system. At this stage, the economics of extending fixed roadside infrastructure to non-toll roads comes under pressure. Each new gantry on a free road carries capital and maintenance cost with diminishing marginal return. This creates a natural inflection point.

Stage 3 – Seamless Network Pricing: As network coverage expands, the case for zero-infrastructure location-based pricing becomes compelling, not as a policy objective in itself, but as the most efficient way to deliver what the earlier stages have already established: a single demand-managed network where every road is priced, every road user has genuine choice, and the toll road premium is one parameter within a unified system. Singapore's transition from gantry-based ERP to GNSS-based ERP 2.0 illustrates this endpoint. The technology changes; the pricing logic does not.

The logical elegance of this progression is that each stage builds the business case and public acceptance for the next. Decision-makers are not being asked to commit to location-based RUC today. They are being asked to ensure that the architecture choices made at Stage 1 do not negatively impact Stage 3.

The infrastructure of change

The staged path described above is technically achievable. But it requires deliberate choices in several areas that are currently being decided:

Back-office architecture:  A demand-managed network requires a pricing engine that can operate across toll and non-toll roads, reconcile dynamic pricing with fixed concession obligations, and account for shadow toll payments. The case for back-office consolidation (moving away from fragmented operator systems toward a shared or interoperable infrastructure) becomes compelling at Stage 1 and essential by Stage 3.

Technology procurement:  Equipment and systems procured today for roadside tolling infrastructure should be evaluated not just on current function but on interoperability with a future location-based network. Decisions that lock in proprietary infrastructure create technical debt that will constrain Stage 2 and Stage 3.

Governance of the pricing algorithm:  Dynamic pricing raises immediate questions of accountability: who controls the algorithm, how is it audited, and how are concession revenue guarantees monitored? These are solvable governance problems, but they must be designed for. Stockholm's model of parliamentary oversight of the congestion tax parameters offers one template.

Facilitating compliance to a charge, rather than enforcing a toll: Shifting from a toll to a charge will need a new approach to compliance and enforcement. Introducing behaviour change, as well as revenue, means it is even more important to invest in compliance (seamless account and payment interaction) rather than enforcement (ensuring every last dollar is recovered).

What society gains

The case for demand management is not only that it can honour existing concession obligations. It is that it converts the road network from a passive revenue asset into an active economic lever that government currently does not have.

Congestion imposes a measurable cost on the NSW economy every year in lost productivity, delayed freight, increased emissions, and degraded liveability. The current tolling system does nothing to address this: it collects revenue whether the network is flowing freely or gridlocked. Demand management changes that equation.

Productivity gains.  More reliable journey times reduce freight costs and supply chain uncertainty. Businesses can make rational location decisions if travel time is predictable. The productivity benefits of reduced peak congestion are well documented in the international literature and have been observed empirically in both London and Stockholm.

Emissions and health.  Reduced peak congestion means lower stop-start emissions and fewer accidents. Pricing that incentivises mode shift reduces vehicle kilometres travelled over time. These benefits carry real fiscal value in avoided health costs and reduced infrastructure wear.

A new policy toolkit for government.  Beyond the day-to-day network benefits, demand management gives government something it currently lacks entirely: genuine agency over network outcomes. The ability to respond to congestion events, protect essential freight corridors, incentivise off-peak travel, and target relief at high-dependency cohorts are all capabilities that the current locked-in concession pricing model makes impossible.

Long-run capital efficiency.  Real-time demand data from a managed network provides a far more reliable basis for infrastructure investment decisions than modelled forecasts. Demand management may defer or avoid entirely some capacity expansion that congestion would otherwise appear to demand.

The question we should be asking

Express Lanes show that demand management can sit alongside road tolls. London and Stockholm proved that pricing can change behaviour at scale. Singapore proved that the technology can evolve to eliminate infrastructure entirely. New York proved that the politics are hard but not insurmountable, and that how you design for equity from the outset determines whether the politics become manageable.

NSW has all the conditions that make this transition worth attempting: an extensive toll network, a documented fairness problem, a government with stated reform intent, and a national RUC transition on the horizon that will require exactly the kind of architecture thinking this analysis describes.

The question is not whether NSW could build a demand-managed network. It is whether the decisions being made today, in technology procurement, in contract design, in back-office architecture, are being made with that future in mind, or whether they are inadvertently foreclosing it.

The concession model and demand management are not mutually exclusive. Making them compatible requires deliberate choices — and those choices are being made right now.

That is the real provocation of this thought experiment. Not that NSW should immediately transform its tolling system, but that the window to preserve the option is narrowing. Every procurement decision that locks in proprietary infrastructure, every contract variation that extends concession terms without pricing flexibility provisions, every back-office system built for revenue collection rather than network management, makes the transition harder and more expensive.

The time to design for optionality is before it is needed.

---


## CBS-Tolling becomes Demand Management v0.2.docx

*File: `Archive/CBS-Tolling becomes Demand Management v0.2.docx`*

What If NSW Tolls Became Demand Management?

NSW road users pay some of the highest tolls in the world and still sit in congestion. What if the system was redesigned not to collect revenue, but to actually move people?

This thought experiment asks a deceptively simple question: what would change if every toll in NSW was redesigned around demand management, pricing access to manage network flow, rather than to service debt and honour concession contracts?

The answer is more tractable than it might seem, but more complex than advocates for reform sometimes acknowledge. Existing concession obligations are not an insurmountable barrier, but navigating them requires deliberate design. Extending charges beyond the current toll network will face political resistance. And dynamic pricing can hurt the people it is meant to help if equity safeguards are not built in from the start.

None of that makes the case against change. It makes the case for doing it carefully.

Demand management doesn't mean paying more. It means, for the first time, you can pay less — if the system is designed well.

The international evidence is encouraging. London, Stockholm, Singapore and New York have each demonstrated that pricing roads to manage demand produces better outcomes: less congestion, more reliable journey times, and a more equitable distribution of cost. Transurban's Express Lanes in the United States show that dynamic demand management can operate within a private concession framework, structurally much closer to the NSW context than government-run schemes. 

Critically, this transformation does not require an overnight leap to GPS-based road user charging. It can begin at corridor level, building directly on existing tolling systems, with the toll road repriced as the premium tier within a broader demand-managed zone, not sitting outside it. Each stage builds the case for the next, until the economics of full network coverage make zero-infrastructure solutions the natural conclusion.

The real provocation is not whether demand management would produce better outcomes. The evidence suggests it would. The provocation is whether the decisions being made in NSW right now, in technology procurement, contract design, and back-office architecture, are preserving the option to get there, or quietly preventing it.

That question deserves a serious answer. This white paper sets out what that answer might look like and how optionality can be preserved.

FULL ANALYSIS

What if NSW scrapped tolls and introduced demand management?

A thought experiment on network pricing, concession obligations, and the road not yet taken.

The provocation

NSW operates one of the most extensive urban toll networks in the world. It also carries some of its most expensive tolls, a compliance problem that costs the network hundreds of millions of dollars annually, and road users who consistently report that the system feels deeply unfair. The Independent Toll Review led by Professor Allan Fels documented this frustration in detail: people pay high tolls, have little ability to avoid them, and see no clear relationship between what they pay and the quality of service they receive.

Yet the core purpose of pricing – to influence behaviour and allocate scarce capacity – is almost entirely absent from NSW tolling today. The model today is project oriented on the basis of guaranteeing a return on the capital investment in the asset. There is no real connection to public good / service / community or transport outcomes. Prices are set to meet revenue obligations. They escalate by contract regardless of network performance. They bear little relationship to actual congestion levels. They do not reward flexibility, and they do not respond to demand.

This thought experiment asks a different question: what if they did? What would NSW's road network look like if tolling was redesigned as a demand management instrument, and what would it take to get there?

What demand management actually looks like

The international evidence on demand-managed road pricing is now substantial. Three examples are particularly instructive for NSW.

LONDON CONGESTION CHARGE  |  United Kingdom  |  Est. 2003

London's Congestion Charge Zone introduced a flat daily charge for driving in central London during peak hours. Within a year, traffic in the zone fell by around 30 per cent, journey times improved markedly, and revenue was hypothecated to public transport investment. The scheme demonstrated that demand responds to pricing, that a defined geographic zone is a practical unit of management, and that the revenue generated can be reinvested in the alternatives that make the charge politically sustainable. London later introduced the Ultra Low Emission Zone (ULEZ), showing that a charge structure can be layered to achieve multiple policy objectives simultaneously.

STOCKHOLM CONGESTION TAX  |  Sweden  |  Est. 2007

Stockholm went further than London by making the charge dynamic: prices vary by time of day, rising at peak periods and falling during off-peak hours. The scheme reduced traffic in the inner city by around 20 per cent, with the most significant reductions during peak hours — exactly the behaviour change a demand management system is designed to achieve. Crucially, a trial period preceded permanent implementation, and public support increased once residents experienced the benefit of reduced congestion firsthand. 

SINGAPORE ERP  |  Singapore  |  Est. 1998, ERP 2.0 from 2025

Singapore operates the world's most sophisticated urban demand management tolling system. The Electronic Road Pricing system uses dynamic pricing that adjusts in real time based on measured traffic speeds: if a monitored road segment falls below a target speed, the price increases at the next rate adjustment. The recently introduced ERP 2.0 replaces the original roadside gantry infrastructure entirely with GNSS-based on-board units, eliminating physical infrastructure from the equation. Singapore's technology evolution path (from gantries to zero-infrastructure) is relevant to the staged approach NSW could take.

NEW YORK CONGESTION PRICING  |  USA  |  Est. 2025

New York's Central Business District Tolling Program began charging in 2025. Its introduction was contentious and subject to significant political opposition, including a temporary suspension attempt, a useful reminder that the equity and political economy of demand management must be designed for from the outset, not treated as afterthoughts. New York also illustrates that the debate is no longer about whether demand management works, but about who bears the cost and who captures the benefit.

Taken together, these examples establish that demand management is not a theoretical idea. It reduces congestion, it changes behaviour, and when designed well, it generates revenue that can be reinvested in the network and its users. The question for NSW is not whether it works, it is whether the existing structure of the NSW network makes it possible, and what it would take to get there.

The Thought Experiment: NSW tolls redesigned for behaviour change

Imagine a version of tolling designed around a single question: how do we get the network flowing as efficiently as possible, and price access accordingly?

In this system, pricing is dynamic. It responds in real time to congestion levels, incidents, and network stress. The road network, toll and non-toll, is treated as a unified system rather than a collection of independent revenue assets. Revenue is an output of the model, not its primary input. And for the first time, road users have a genuine choice.

If you have to travel at peak, you pay the same toll as today. If you can shift to off-peak, you pay less. That is it.

This is the essential value proposition. Demand management does not mean loading additional cost onto road users who are already paying too much. It means creating a mechanism by which those users can actually reduce their cost by changing behaviour. Those with flexibility benefit. Those without it are no worse off than today, albeit with less congestion on their route.

For Western Sydney residents, who the Fels Review identified as bearing the most disproportionate toll burden, this matters. The current system offers no relief, no optionality, and no relationship between the price paid and the quality of the journey. Demand management at least creates the conditions in which off-peak travel is rewarded, and over time, as the system matures, more targeted relief for high-dependency corridors becomes structurally possible.

Concession Contracts: A feature, not a barrier

The immediate objection is obvious: existing concession contracts lock in revenue expectations. If prices fall off-peak and traffic redistributes, how do concessionaires receive their contracted revenue?

The answer is that demand management, properly designed, need not reduce aggregate revenue. Two complementary mechanisms make this work:

Optimised network pricing:  Dynamic pricing calibrated across the network can hold or increase peak prices while reducing off-peak rates, with the net effect being revenue-neutral or positive for concessionaires. Toll roads within a demand-managed network command a premium: they offer faster, more reliable, less congested journeys. Users who value that reliability will pay for it. The toll road becomes the premium lane within a broader managed system, not simply a debt-recovery mechanism.

Shadow tolls:  Where demand management deliberately diverts trips away from toll roads: onto alternative routes, into different time slots, or toward other modes, government can compensate concessionaires through shadow toll payments. This reframes the shadow toll not as a subsidy to private operators, but as a payment for a public good: the government is purchasing congestion reduction, emissions abatement, and productivity gain. The cost of that payment is likely to be substantially offset by reduced infrastructure wear, lower health externalities, and avoided capital expenditure on capacity expansion that congestion would otherwise demand.

There is also an argument that extending this concept into full Road User Charging (RUC) would give the ultimate lever for optimising payments, alongside RUCs broader opportunities for excise recovery and broader policy outcomes. 

TRANSURBAN EXPRESS LANES  |  Virginia & Maryland, USA

Transurban’s Express Lanes network in Virginia and Maryland — including the I-495, I-95, and I-66 corridors — is perhaps the most directly relevant international precedent for NSW. Unlike London, Stockholm, or Singapore, these are privately operated managed lanes operating within a concession framework, which is structurally much closer to the NSW context. Tolls adjust dynamically in real time to maintain target travel speeds in the managed lanes, with prices rising sharply at peak periods and falling during off-peak hours. High-occupancy vehicles (three or more occupants) travel free of charge, embedding an explicit equity and mode-shift incentive directly into the pricing model. General purpose lanes remain free and available alongside the Express Lanes, meaning road users retain genuine choice: pay for reliability, or use the free alternative and accept variable conditions. The concessionaire’s revenue interests are served — not undermined — by the dynamic pricing mechanism, because the product being sold is a reliable journey time, and pricing is the tool that delivers it. Transurban’s Express Lanes demonstrate that dynamic demand management pricing and private concession operation are not in conflict. They can be designed to reinforce each other.

The key insight is that the concession contract and demand management are not mutually exclusive. They require compatible architecture such as a pricing engine that can reconcile dynamic charges with fixed revenue obligations, and a back-office that can account for both. That is a design challenge, not a structural impossibility.

The implementation strategy: From corridor charge to network intelligence

The transformation described in this paper does not require a single leap to full network pricing. It can be built incrementally, with each stage delivering genuine demand management outcomes while laying the foundation for the next. What matters is that the pricing logic is right from the outset. Technology follows that logic, rather than defining it.

The logical elegance of this progression is that each stage builds the business case and public acceptance for the next. Decision-makers are not being asked to commit to location-based RUC today. They are being asked to ensure that the architecture choices made at Stage 1 do not negatively impact Stage 3.

The infrastructure of change

The staged path described above is technically achievable. But it requires deliberate choices in several areas that are currently being decided:

Back-office architecture:  A demand-managed network requires a pricing engine that can operate across toll and non-toll roads, reconcile dynamic pricing with fixed concession obligations, and account for shadow toll payments. The case for back-office consolidation (moving away from fragmented operator systems toward a shared or interoperable infrastructure) becomes compelling at Stage 1 and essential by Stage 3.

Technology procurement:  Equipment and systems procured today for roadside tolling infrastructure should be evaluated not just on current function but on interoperability with a future location-based network. Decisions that lock in proprietary infrastructure create technical debt that will constrain Stage 2 and Stage 3.

Governance of the pricing algorithm:  Dynamic pricing raises immediate questions of accountability: who controls the algorithm, how is it audited, and how are concession revenue guarantees monitored? These are solvable governance problems, but they must be designed for. Stockholm's model of parliamentary oversight of the congestion tax parameters offers one template.

Facilitating compliance to a charge, rather than enforcing a toll: Shifting from a toll to a charge will need a new approach to compliance and enforcement. Introducing behaviour change, as well as revenue, means it is even more important to invest in compliance (seamless account and payment interaction) rather than enforcement (ensuring every last dollar is recovered).

What society gains

The case for demand management is not only that it can honour existing concession obligations. It is that it converts the road network from a passive revenue asset into an active economic lever that government currently does not have.

Congestion imposes a measurable cost on the NSW economy every year in lost productivity, delayed freight, increased emissions, and degraded liveability. The current tolling system does nothing to address this: it collects revenue whether the network is flowing freely or gridlocked. Demand management changes that equation.

Productivity gains.  More reliable journey times reduce freight costs and supply chain uncertainty. Businesses can make rational location decisions if travel time is predictable. The productivity benefits of reduced peak congestion are well documented in the international literature and have been observed empirically in both London and Stockholm.

Emissions and health.  Reduced peak congestion means lower stop-start emissions and fewer accidents. Pricing that incentivises mode shift reduces vehicle kilometres travelled over time. These benefits carry real fiscal value in avoided health costs and reduced infrastructure wear.

A new policy toolkit for government.  Beyond the day-to-day network benefits, demand management gives government something it currently lacks entirely: genuine agency over network outcomes. The ability to respond to congestion events, protect essential freight corridors, incentivise off-peak travel, and target relief at high-dependency cohorts are all capabilities that the current locked-in concession pricing model makes impossible.

Long-run capital efficiency.  Real-time demand data from a managed network provides a far more reliable basis for infrastructure investment decisions than modelled forecasts. Demand management may defer or avoid entirely some capacity expansion that congestion would otherwise appear to demand.

The honest counterarguments

A thought experiment is only useful if it stress-tests the idea as well as advocates for it. The case for demand management in NSW is compelling, but it is not without real obstacles, and some of them deserve more than a footnote.

The "tax on free roads" problem is politically live. Any scheme that extends charges beyond the existing toll network would mean pricing roads that drivers currently use for free. The net benefit argument, that broader cost sharing produces fairer individual outcomes, is sound but politically vulnerable. One could frame any extension of charging as a new tax, and that framing tends to stick regardless of the underlying economics. London and Stockholm both faced this opposition. Stockholm's solution was a time-limited trial that let residents experience the benefit before voting on permanence. NSW would need an equivalent strategy for building public acceptance, not just a policy rationale.

Dynamic pricing can hurt the people it is meant to help. The equity argument in this paper rests on the premise that those with flexible travel patterns will shift behaviour and pay less, while those without flexibility pay no more than today. That is the design intent. But implementation rarely matches intent perfectly. Shift workers, carers, tradespeople with fixed schedules, people who cannot change when they travel regardless of price, may find themselves paying peak rates with no practical alternative. The HOV discount, targeted concession schemes, and income-based caps can address this, but only if they are built into the system from the outset. Added later, they tend to be underfunded and under-utilised.

Governance of a pricing algorithm is an unsolved problem in NSW. Giving a pricing engine significant influence over the daily cost of living for millions of people raises legitimate questions about accountability and democratic oversight that the current toll system, for all its faults, does not raise in quite the same way. Who controls the algorithm? Who audits it? What prevents it from being used as a fiscal lever when government revenues are under pressure? Stockholm embedded parliamentary oversight into the scheme's design. NSW has no equivalent framework for this kind of decision-making, and building one would be a prerequisite, not an afterthought.

The transition itself carries real risk. Moving from a known system to a dynamic demand-managed network requires technology, back-office architecture, customer experience, compliance frameworks, and concession arrangements to all work simultaneously and to be trusted by road users from day one. If any element fails visibly at launch, the political damage could set the entire reform agenda back by years. The staged approach described in this paper reduces that risk considerably, but it does not eliminate it. Sequencing and timing matter enormously.

The question we should be asking

This thought experiment set out to ask what NSW's road network could look like if tolling was redesigned around demand management rather than revenue recovery. The honest answer is: significantly better, but not without real complexity, genuine political difficulty, and design choices that can go wrong if made carelessly.

The counterarguments are real. Dynamic pricing can harm the people it is meant to help if equity safeguards are not built in from the start. Extending charges to free roads will face political resistance regardless of the merits. These are not objections to be dismissed, they are the design problems that any serious attempt at reform would need to solve.

But the status quo deserves the same scrutiny. Doing nothing is not a neutral choice. Every year the current system operates, it compounds the problems the Fels Review documented: disproportionate cost burdens on those least able to bear them, no mechanism for managing congestion, no policy lever for government, and a compliance architecture that continues to haemorrhage revenue. The costs of inaction are real, they are simply less visible because they accumulate gradually rather than arriving with a price tag attached.

The international evidence of London, Stockholm, Singapore, Transurban's Express Lanes, New York, does not suggest this transition is easy. It suggests it is possible, that it produces better outcomes when done well, and that the difference between done well and done badly lies almost entirely in the quality of the decisions made early. Governance architecture, contract flexibility, back-office design, technology procurement are not implementation details to be resolved later. They are the decisions that determine whether demand management remains a policy ambition or becomes a practical reality.

That is the real provocation here. Not whether demand management is the right destination – the evidence suggests it is – but whether NSW is on a path that leads there, or one that forecloses the option by default through decisions that are being made right now.

So the question is not 'should NSW move toward demand management?' The question is 'what would it actually take, and are the right foundations being laid?'

That question does not have a simple answer. It requires an examination of what existing concession contracts actually permit, which technology decisions are locking in constraints, where the back-office architecture needs to evolve, and how a governance framework for dynamic pricing could be structured in the NSW context. 

The window to preserve the option is narrowing. Every procurement decision that locks in proprietary infrastructure, every contract variation that extends concession terms without pricing flexibility provisions, every back-office system built for revenue collection rather than network management, makes the transition harder and more expensive.

The time to design for optionality is before it is needed.


| --- | --- |

| Stage 1 – Corridor Demand Management: | Stage 1 – Corridor Demand Management: |

| Establish dynamic pricing across a defined corridor, with the toll road as the premium tier within it
Deliver the first genuine off-peak discount for road users on the network
Maintain concession revenue through pricing calibration and shadow toll mechanisms
Prove the model: demonstrate that demand responds to price signals and that the system can be governed fairly | Demand management begins at a defined corridor level: a specific crossing, an orbital segment, or a zone. Within that corridor, pricing becomes dynamic across all roads, including the toll road. The toll road is not exempt from demand management; it is the premium tier within it. Off-peak pricing falls below today's toll. Peak pricing holds at or above it. Road users on the toll road benefit from the same incentive as everyone else: shift to off-peak and pay less. The corridor charge covers alternative routes within the same zone but crucially, road users do not pay both: if they are on the toll road, that trip satisfies the corridor demand charge. Concession revenue is maintained through the pricing calibration and, where needed, shadow toll payments or broader RUC for diverted trips. This stage is achievable within existing tolling infrastructure; no new technology is required at the outset. |

| Stage 2 – Network Expansion: | Stage 2 – Network Expansion: |

| Extend demand management pricing logic beyond individual corridors to a broader connected network
Give road users meaningful route choice for the first time — not just time-of-day choice
Build the data and operational foundation for network-wide pricing decisions
Establish the inflection point at which fixed roadside infrastructure becomes the less efficient option | As the managed network grows beyond individual corridors, the demand management pricing logic extends with it. More roads, more route choices, more behavioural levers. The toll road remains the premium reliable option within a progressively larger managed system. At this stage, the economics of extending fixed roadside infrastructure to non-toll roads comes under pressure. Each new gantry on a free road carries capital and maintenance cost with diminishing marginal return. This creates a natural inflection point. |

| Stage 3 – Seamless Network Pricing: | Stage 3 – Seamless Network Pricing: |

| Transition to zero-infrastructure location-based pricing across the full network
Unify toll road premium pricing within a single network-wide pricing engine
Reconcile concession revenue obligations entirely through back-office architecture rather than physical infrastructure
Deliver the full demand management vision: every road priced, every user with genuine choice, every trip generating network intelligence | As network coverage expands, the case for zero-infrastructure location-based pricing becomes compelling, not as a policy objective in itself, but as the most efficient way to deliver what the earlier stages have already established: a single demand-managed network where every road is priced, every road user has genuine choice, and the toll road premium is one parameter within a unified system. Singapore's transition from gantry-based ERP to GNSS-based ERP 2.0 illustrates this endpoint. The technology changes; the pricing logic does not. |

---


## CBS-Tolling to Demand Management v1.1.docx

*File: `Archive/CBS-Tolling to Demand Management v1.1.docx`*

A Thought Experiment: Could NSW’s tolls be replaced with demand management schemes?

NSW road users pay some of the highest tolls in the world and still sit in congestion. What if the system was redesigned not to collect revenue, but to actually move people?

The provocation

NSW operates one of the most extensive urban toll networks in the world. It also carries some of its most expensive tolls, a compliance problem that costs the network hundreds of millions of dollars annually, and road users who consistently report that the system feels deeply unfair. The Independent Toll Review led by Professor Allan Fels documented this frustration in detail: people pay high tolls, have little ability to avoid them, and see no clear relationship between what they pay and the quality of service they receive.

 of pricing  to influence behaviour and allocate scarce capacity almost entirely absent from NSW tolling today. 

The model today is project oriented on the basis of guaranteeing a return on the capital investment in the asset. There is no connection to public good / service / community or transport outcomes. are set to meet revenue obligations. They escalate by contract regardless of network performance bear little relationship to actual congestion levels. They do not reward flexibility, and they do not respond to demand.

This thought experiment asks a different question: what if they did? What would NSW's road network look like if tolling was redesigned  demand management instrument, and what would it take to get there?

What demand management actually looks like

The international evidence on demand-managed road pricing is now substantial. Three examples are particularly instructive for NSW.

LONDON CONGESTION CHARGE  |  United Kingdom  |  Est. 2003

London's Congestion Charge Zone introduced a flat daily charge for driving in central London during peak hours. Within a year, traffic in the zone fell by around 30 per cent, journey times improved markedly, and revenue was hypothecated to public transport investment. The scheme demonstrated that demand responds to pricing, that a defined geographic zone is a practical unit of management, and that the revenue generated can be reinvested in the alternatives that make the charge politically sustainable. London later introduced the Ultra Low Emission Zone (ULEZ), showing that a charge structure can be layered to achieve multiple policy objectives simultaneously.

STOCKHOLM CONGESTION TAX  |  Sweden  |  Est. 2007

Stockholm went further than London by making the charge dynamic: prices vary by time of day, rising at peak periods and falling during off-peak hours. The scheme reduced traffic in the inner city by around 20 per cent, with the most significant reductions during peak hours – exactly the behaviour change a demand management system is designed to achieve. Crucially, a trial period preceded permanent implementation, and public support increased once residents experienced the benefit of reduced congestion firsthand. 

SINGAPORE ERP  |  Singapore  |  Est. 1998, ERP 2.0 from 2025

Singapore operates the world's most sophisticated urban demand management tolling system. The Electronic Road Pricing system uses dynamic pricing that adjusts in real time based on measured traffic speeds: if a monitored road segment falls below a target speed, the price increases at the next rate adjustment. The recently introduced ERP 2.0 replaces the original roadside gantry infrastructure entirely with GNSS-based on-board units, eliminating physical infrastructure from the equation.

NEW YORK CONGESTION PRICING  |  USA  |  Est. 2025

New York's Central Business District Tolling Program began charging in 2025. Its introduction was contentious and subject to significant political opposition, including a temporary suspension attempt, a useful reminder that the equity and political economy of demand management must be designed for from the outset, not treated as afterthoughts. New York also illustrates that the debate is no longer about whether demand management works, but about who bears the cost and who captures the benefit.

Taken together, these examples establish that demand management is not a theoretical idea. It reduces congestion, it changes behaviour, and when designed well, it generates revenue that can be reinvested in the network and its users. The question for NSW is not whether it works, it is whether the existing structure of the NSW network makes it possible, and what it would take to get there.

The Thought Experiment: NSW tolls redesigned for behaviour change

Imagine a version of tolling designed around a single question: how do we get the network flowing as efficiently as possible, and price access accordingly?

In this system, pricing is dynamic. It responds in real time to congestion levels, incidents, and network stress. The road network, toll and non-toll, is treated as a unified system rather than a collection of independent revenue assets. Revenue is an output of the model, not its primary input. And for the first time, road users have a genuine choice.

If you have to travel at peak, you pay the same toll as today. If you can shift to off-peak, you pay less. That is it.

This is the essential value proposition. Demand management does not mean loading additional cost onto road users who are already paying too much. It means creating a mechanism by which those users can actually reduce their cost by changing behaviour. Those with flexibility benefit. Those without it are no worse off than today, albeit with less congestion on their route.

For Western Sydney residents, who the Fels Review identified as bearing the most disproportionate toll burden, this matters. The current system offers no relief, no optionality, and no relationship between the price paid and the quality of the journey. Demand management at least creates the conditions in which off-peak travel is rewarded, and over time, as the system matures, more targeted relief for high-dependency corridors becomes structurally possible.

Concession Contracts: A feature, not a barrier

The immediate objection is obvious: existing concession contracts lock in revenue expectations. If prices fall off-peak and traffic redistributes, how do concessionaires receive their contracted revenue?

The answer is that demand management, properly designed, need not reduce aggregate revenue. Two complementary mechanisms make this work:

Optimised network pricing:  Dynamic pricing calibrated across network can hold peak prices while reducing off-peak rates, with the net effect being revenue-neutral or positive for concessionaires. Toll roads within a demand-managed network command a premium: they offer faster, more reliable, less congested journeys. Users who value that reliability will pay for it. The toll road becomes the premium lane within a broader managed system, not simply a debt-recovery mechanism.

Shadow tolls:  Where demand management deliberately diverts trips away from toll roads: onto alternative routes, into different time slots, or toward other modes, government can compensate concessionaires through shadow toll payments. This reframes the shadow toll not as a subsidy to private operators, but as a payment for a public good: the government is purchasing congestion reduction, emissions abatement, and productivity gain. The cost of that payment is likely to be substantially offset by reduced infrastructure wear, lower health externalities, and avoided capital expenditure on capacity expansion that congestion would otherwise demand.

There is also an argument that extending this concept into full Road User Charging (RUC) would give the ultimate lever for optimising payments, alongside RUCs broader opportunities for excise recovery and broader policy outcomes. 

TRANSURBAN EXPRESS LANES  |  Virginia & Maryland, USA

Transurban’s Express Lanes network in Virginia and Maryland cover the I-495, I-95, and I-66 corridors. Unlike London, Stockholm, or Singapore, these are privately operated managed lanes operating within a concession framework. Tolls adjust dynamically in real time to maintain target travel speeds in the managed lanes, with prices rising sharply at peak periods and falling during off-peak hours. High-occupancy vehicles (three or more occupants) travel free of charge, embedding an equity and mode-shift incentive into the pricing model. General purpose lanes remain free and available alongside the Express Lanes, meaning road users retain genuine choice. Transurban’s Express Lanes demonstrate that dynamic demand management pricing and private concession operation are not in conflict. They can be designed to reinforce each other.

The key insight is that the concession contract and demand management are not mutually exclusive. They require compatible architecture such as a pricing engine that can reconcile dynamic charges with fixed revenue obligations, and a back-office that can account for both. That is a design challenge, not a structural impossibility.

The implementation strategy: From corridor charge to network intelligence

The transformation described in this paper does not require a single leap to full network pricing. It can be built incrementally, with each stage delivering genuine demand management outcomes while laying the foundation for the next. What matters is that the pricing logic is right from the outset. Technology follows that logic, rather than defining it.

The logical elegance of this progression is that each stage builds the business case and public acceptance for the next. Decision-makers are not being asked to commit to location-based RUC today. They are being asked to ensure that the architecture choices made at Stage 1 do not negatively impact Stage 3.

The infrastructure of change

The staged path is technically achievable, but it requires deliberate choices in areas where decisions are already being made.

Back-office architecture. A demand-managed network needs a pricing engine that operates across toll and non-toll roads, reconciles dynamic pricing with fixed concession obligations, and accounts for shadow toll payments. The case for consolidation away from fragmented operator systems toward shared or interoperable infrastructure, becomes compelling at Stage 1 and essential by Stage 3.

Technology procurement. Systems and equipment procured today should be evaluated not just on current function but on interoperability with a future location-based network. Proprietary decisions made now create technical debt that constrains what is possible later.

Governance of the pricing algorithm. Dynamic pricing raises immediate questions of accountability: who controls the algorithm, how is it audited, and how are concession revenue guarantees monitored? These are solvable problems, but they must be designed for from the outset. Stockholm's parliamentary oversight of congestion tax parameters offers one template.

Compliance over enforcement. Shifting from a toll to a charge requires a different philosophy. When behaviour change is the objective alongside revenue recovery, investment in seamless account and payment interaction matters more than chasing every unpaid transaction. Compliance becomes a customer experience problem as much as an enforcement one.

What society gains

The case for demand management is that it can honour existing concession obligations whilst converting the road network from a passive revenue asset into an active economic lever that government currently does not have.

Congestion imposes a measurable cost on the NSW economy every year in lost productivity, delayed freight, increased emissions, and degraded liveability. The current tolling system does nothing to address this: it collects revenue whether the network is flowing freely or gridlocked. Demand management changes that equation.

Productivity gains.  More reliable journey times reduce freight costs and supply chain uncertainty. Businesses can make rational location decisions if travel time is predictable. The productivity benefits of reduced peak congestion are well documented in the international literature and have been observed empirically in both London and Stockholm.

Emissions and health.  Reduced peak congestion means lower stop-start emissions and fewer accidents. Pricing that incentivises mode shift reduces vehicle kilometres travelled over time. These benefits carry real fiscal value in avoided health costs and reduced infrastructure wear.

A new policy toolkit for government.  Beyond the day-to-day network benefits, demand management gives government something it currently lacks entirely: genuine agency over network outcomes. The ability to respond to congestion events, protect essential freight corridors, incentivise off-peak travel, and target relief at high-dependency cohorts are all capabilities that the current locked-in concession pricing model makes impossible.

Long-run capital efficiency.  Real-time demand data from a managed network provides a far more reliable basis for infrastructure investment decisions than modelled forecasts. Demand management may defer or avoid entirely some capacity expansion that congestion would otherwise appear to demand.

The honest counterarguments

A thought experiment is only useful if it stress-tests the idea as well as advocates for it. The case for demand management in NSW is compelling, but it is not without real obstacles, and some of them deserve more than a footnote.

The "tax on free roads" problem is politically live. Any scheme that extends charges beyond the existing toll network would mean pricing roads that drivers currently use for free. The net benefit argument, that broader cost sharing produces fairer individual outcomes, is sound but politically vulnerable. One could frame any extension of charging as a new tax, and that framing tends to stick regardless of the underlying economics. London and Stockholm both faced this opposition. Stockholm's solution was a time-limited trial that let residents experience the benefit before voting on permanence. NSW would need an equivalent strategy for building public acceptance, not just a policy rationale.

Dynamic pricing can hurt the people it is meant to help. The equity argument in this paper rests on the premise that those with flexible travel patterns will shift behaviour and pay less, while those without flexibility pay no more than today. That is the design intent. But implementation rarely matches intent perfectly. Shift workers, carers, tradespeople with fixed schedules, people who cannot change when they travel regardless of price, may find themselves paying peak rates with no practical alternative. The HOV discount, targeted concession schemes, and income-based caps can address this, but only if they are built into the system from the outset. Added later, they tend to be underfunded and under-utilised.

Governance of a pricing algorithm is an unsolved problem in NSW. Giving a pricing engine significant influence over the daily cost of living for millions of people raises legitimate questions about accountability and democratic oversight that the current toll system, for all its faults, does not raise in quite the same way. Who controls the algorithm? Who audits it? What prevents it from being used as a fiscal lever when government revenues are under pressure? Stockholm embedded parliamentary oversight into the scheme's design. NSW has no equivalent framework for this kind of decision-making, and building one would be a prerequisite, not an afterthought.

The transition itself carries real risk. Moving from a known system to a dynamic demand-managed network requires technology, back-office architecture, customer experience, compliance frameworks, and concession arrangements to all work simultaneously and to be trusted by road users from day one. If any element fails visibly at launch, the political damage could set the entire reform agenda back by years. The staged approach described in this paper reduces that risk considerably, but it does not eliminate it. Sequencing and timing matter enormously.

The question we should be asking

This thought experiment set out to ask what NSW's road network could look like if tolling was redesigned around demand management. The honest answer is: significantly better, but not without real complexity, political difficulty, and design choices that can go wrong if made carelessly.

The counterarguments are real. Dynamic pricing can harm the people it is meant to help if equity safeguards are not built in from the start. Extending charges to free roads will face political resistance regardless of the merits. These are not objections to be dismissed, they are the design problems any serious reform would need to solve.

But the status quo deserves the same scrutiny. Doing nothing is not a neutral choice. The costs of inaction: disproportionate burdens on those least able to bear them, no congestion lever, no policy toolkit, a compliance architecture haemorrhaging revenue, are real. They are simply less visible because they accumulate gradually rather than arriving with a price tag attached.

The international evidence does not suggest this transition is easy. It suggests it is possible, and that the difference between done well and done badly lies almost entirely in the quality of early decisions. Governance architecture, contract flexibility, back-office design, technology procurement are not details to resolve later. They determine whether demand management becomes a practical reality or remains a policy ambition.

That is the real provocation here. Not whether demand management is the right destination – the evidence suggests it is – but whether NSW is on a path that leads there, and what should be done now to strengthen that position and give policy makers and road operators maximum optionality.

That question does not have a simple answer. It requires an examination of what existing concession contracts actually permit, which technology decisions are locking in constraints, where the back-office architecture needs to evolve, and how a governance framework for dynamic pricing could be structured in the NSW context. 

The time to design for optionality is before it is needed.

CBS Group - Infrastructure advisors who deliver measurable impact

CBS Group brings together senior infrastructure expertise, proprietary technology platforms, and systems thinking to solve the most complex challenges facing Australia's infrastructure sector. We work across construction, mining, energy, transport, utilities, and financial services, partnering with government agencies, infrastructure operators, and major contractors to unlock hidden value and deliver measurable outcomes.

In road tolling and pricing, we've worked with toll operators, transport agencies, and technology providers across Australia and internationally, giving us insight into what works, and what doesn't, across different tolling regimes, regulatory environments, and customer expectations. This global perspective informs our strategic advice on tolling and pricing policy, technology selection, and compliance approaches.


| --- | --- |

| Nick May
Road Pricing SME


Jeff Dusting
CBS Group Partner | NSW road users pay some of the highest tolls in the world and still sit in congestion. What if the system was redesigned not to collect revenue, but to actually move people?
This thought experiment asks what would change if NSW tolling was redesigned around demand management: pricing access to manage network flow, rather than to service debt and honour concession contracts. The answer is more tractable than it might seem, but more complex than advocates for reform sometimes acknowledge. Concession obligations are navigable, political resistance to extending charges is real, and dynamic pricing can hurt the people it is meant to help if equity safeguards are not built in from the start.
None of that makes the case against change. It makes the case for doing it carefully.
The international evidence suggests that when demand management is designed well, it produces less congestion, more reliable journey times, and a fairer distribution of cost. It does not require an overnight leap to GPS-based charging. It can begin at corridor level, with the toll road repriced as the premium tier within a broader demand-managed zone, each stage building the case for the next.
The real provocation is not whether demand management would produce better outcomes. The evidence suggests it would. It is whether the decisions being made procurement, contract design, and back-office architecture preserv the option to get there, or . That question deserves a serious answer. This paper sets out what it might look like. |

| Demand management doesn't mean paying more. It means, for 
the first time, you can pay less – if the system is designed well. | Demand management doesn't mean paying more. It means, for 
the first time, you can pay less – if the system is designed well. |


| --- | --- |

| Stage 1 – Corridor Demand Management: |  |

| Dynamic pricing across a defined corridor, with the toll road as the premium tier
First genuine off-peak discount for road users
Concession revenue maintained through pricing calibration and shadow tolls
Prove the model: demand responds to price signals and the system can be governed fairly | Demand management begins at corridor level: a specific crossing, orbital segment, or zone. Pricing becomes dynamic across all roads within that corridor, including the toll road. Off-peak pricing falls below today's toll; peak pricing holds at or above it. Crucially, road users do not pay both a toll and a corridor charge: one satisfies the other. No new technology is required at this stage. |

| Stage 2 – Network Expansion: |  |

| Demand management pricing logic extended across a broader connected network
Meaningful route choice for road users — not just time-of-day choice
Data and operational foundation built for network-wide pricing
Fixed roadside infrastructure reaches its economic inflection point | As the managed network grows, more roads and more route choices extend the behavioural lever. The economics of adding fixed roadside infrastructure to free roads increasingly work against continued build-out — each new gantry delivers diminishing return, creating a natural case for a different approach. |

| Stage 3 – Seamless Network Pricing: |  |

| Zero-infrastructure location-based pricing across  network
Toll road premium unified within a single network-wide pricing engine
Concession revenue obligations reconciled through back-office architecture
Every road priced, every user with genuine choice, every trip generating network intelligence | The case for zero-infrastructure location-based pricing becomes compelling not as a policy objective, but as the most efficient way to manage a network that earlier stages have already established. Singapore's shift from gantry-based ERP to GNSS-based ERP 2.0 illustrates the endpoint. The technology changes; the pricing logic does not. |

---


## CBS-Tolling to Demand Management v1.0.docx

*File: `Tolling to demand management/CBS-Tolling to Demand Management v1.0.docx`*

A Thought Experiment: Could NSW’s tolls be replaced with demand management schemes?

NSW road users pay some of the highest tolls in the world and still sit in congestion. What if the system was redesigned not to collect revenue, but to actually move people?

The provocation

NSW operates one of the most extensive urban toll networks in the world. It also carries some of its most expensive tolls, a compliance problem that costs the network hundreds of millions of dollars annually, and road users who consistently report that the system feels deeply unfair. The Independent Toll Review led by Professor Allan Fels documented this frustration in detail: people pay high tolls, have little ability to avoid them, and see no clear relationship between what they pay and the quality of service they receive.

Yet the core purpose of pricing – to influence behaviour and allocate scarce capacity – is almost entirely absent from NSW tolling today. The model today is project oriented on the basis of guaranteeing a return on the capital investment in the asset. There is no real connection to public good / service / community or transport outcomes. Prices are set to meet revenue obligations. They escalate by contract regardless of network performance. They bear little relationship to actual congestion levels. They do not reward flexibility, and they do not respond to demand.

This thought experiment asks a different question: what if they did? What would NSW's road network look like if tolling was redesigned as a demand management instrument, and what would it take to get there?

What demand management actually looks like

The international evidence on demand-managed road pricing is now substantial. Three examples are particularly instructive for NSW.

LONDON CONGESTION CHARGE  |  United Kingdom  |  Est. 2003

London's Congestion Charge Zone introduced a flat daily charge for driving in central London during peak hours. Within a year, traffic in the zone fell by around 30 per cent, journey times improved markedly, and revenue was hypothecated to public transport investment. The scheme demonstrated that demand responds to pricing, that a defined geographic zone is a practical unit of management, and that the revenue generated can be reinvested in the alternatives that make the charge politically sustainable. London later introduced the Ultra Low Emission Zone (ULEZ), showing that a charge structure can be layered to achieve multiple policy objectives simultaneously.

STOCKHOLM CONGESTION TAX  |  Sweden  |  Est. 2007

Stockholm went further than London by making the charge dynamic: prices vary by time of day, rising at peak periods and falling during off-peak hours. The scheme reduced traffic in the inner city by around 20 per cent, with the most significant reductions during peak hours – exactly the behaviour change a demand management system is designed to achieve. Crucially, a trial period preceded permanent implementation, and public support increased once residents experienced the benefit of reduced congestion firsthand. 

SINGAPORE ERP  |  Singapore  |  Est. 1998, ERP 2.0 from 2025

Singapore operates the world's most sophisticated urban demand management tolling system. The Electronic Road Pricing system uses dynamic pricing that adjusts in real time based on measured traffic speeds: if a monitored road segment falls below a target speed, the price increases at the next rate adjustment. The recently introduced ERP 2.0 replaces the original roadside gantry infrastructure entirely with GNSS-based on-board units, eliminating physical infrastructure from the equation.

NEW YORK CONGESTION PRICING  |  USA  |  Est. 2025

New York's Central Business District Tolling Program began charging in 2025. Its introduction was contentious and subject to significant political opposition, including a temporary suspension attempt, a useful reminder that the equity and political economy of demand management must be designed for from the outset, not treated as afterthoughts. New York also illustrates that the debate is no longer about whether demand management works, but about who bears the cost and who captures the benefit.

Taken together, these examples establish that demand management is not a theoretical idea. It reduces congestion, it changes behaviour, and when designed well, it generates revenue that can be reinvested in the network and its users. The question for NSW is not whether it works, it is whether the existing structure of the NSW network makes it possible, and what it would take to get there.

The Thought Experiment: NSW tolls redesigned for behaviour change

Imagine a version of tolling designed around a single question: how do we get the network flowing as efficiently as possible, and price access accordingly?

In this system, pricing is dynamic. It responds in real time to congestion levels, incidents, and network stress. The road network, toll and non-toll, is treated as a unified system rather than a collection of independent revenue assets. Revenue is an output of the model, not its primary input. And for the first time, road users have a genuine choice.

If you have to travel at peak, you pay the same toll as today. If you can shift to off-peak, you pay less. That is it.

This is the essential value proposition. Demand management does not mean loading additional cost onto road users who are already paying too much. It means creating a mechanism by which those users can actually reduce their cost by changing behaviour. Those with flexibility benefit. Those without it are no worse off than today, albeit with less congestion on their route.

For Western Sydney residents, who the Fels Review identified as bearing the most disproportionate toll burden, this matters. The current system offers no relief, no optionality, and no relationship between the price paid and the quality of the journey. Demand management at least creates the conditions in which off-peak travel is rewarded, and over time, as the system matures, more targeted relief for high-dependency corridors becomes structurally possible.

Concession Contracts: A feature, not a barrier

The immediate objection is obvious: existing concession contracts lock in revenue expectations. If prices fall off-peak and traffic redistributes, how do concessionaires receive their contracted revenue?

The answer is that demand management, properly designed, need not reduce aggregate revenue. Two complementary mechanisms make this work:

Optimised network pricing:  Dynamic pricing calibrated across the network can hold or increase peak prices while reducing off-peak rates, with the net effect being revenue-neutral or positive for concessionaires. Toll roads within a demand-managed network command a premium: they offer faster, more reliable, less congested journeys. Users who value that reliability will pay for it. The toll road becomes the premium lane within a broader managed system, not simply a debt-recovery mechanism.

Shadow tolls:  Where demand management deliberately diverts trips away from toll roads: onto alternative routes, into different time slots, or toward other modes, government can compensate concessionaires through shadow toll payments. This reframes the shadow toll not as a subsidy to private operators, but as a payment for a public good: the government is purchasing congestion reduction, emissions abatement, and productivity gain. The cost of that payment is likely to be substantially offset by reduced infrastructure wear, lower health externalities, and avoided capital expenditure on capacity expansion that congestion would otherwise demand.

There is also an argument that extending this concept into full Road User Charging (RUC) would give the ultimate lever for optimising payments, alongside RUCs broader opportunities for excise recovery and broader policy outcomes. 

TRANSURBAN EXPRESS LANES  |  Virginia & Maryland, USA

Transurban’s Express Lanes network in Virginia and Maryland cover the I-495, I-95, and I-66 corridors. Unlike London, Stockholm, or Singapore, these are privately operated managed lanes operating within a concession framework. Tolls adjust dynamically in real time to maintain target travel speeds in the managed lanes, with prices rising sharply at peak periods and falling during off-peak hours. High-occupancy vehicles (three or more occupants) travel free of charge, embedding an equity and mode-shift incentive into the pricing model. General purpose lanes remain free and available alongside the Express Lanes, meaning road users retain genuine choice. Transurban’s Express Lanes demonstrate that dynamic demand management pricing and private concession operation are not in conflict. They can be designed to reinforce each other.

The key insight is that the concession contract and demand management are not mutually exclusive. They require compatible architecture such as a pricing engine that can reconcile dynamic charges with fixed revenue obligations, and a back-office that can account for both. That is a design challenge, not a structural impossibility.

The implementation strategy: From corridor charge to network intelligence

The transformation described in this paper does not require a single leap to full network pricing. It can be built incrementally, with each stage delivering genuine demand management outcomes while laying the foundation for the next. What matters is that the pricing logic is right from the outset. Technology follows that logic, rather than defining it.

The logical elegance of this progression is that each stage builds the business case and public acceptance for the next. Decision-makers are not being asked to commit to location-based RUC today. They are being asked to ensure that the architecture choices made at Stage 1 do not negatively impact Stage 3.

The infrastructure of change

The staged path is technically achievable, but it requires deliberate choices in areas where decisions are already being made.

Back-office architecture. A demand-managed network needs a pricing engine that operates across toll and non-toll roads, reconciles dynamic pricing with fixed concession obligations, and accounts for shadow toll payments. The case for consolidation away from fragmented operator systems toward shared or interoperable infrastructure, becomes compelling at Stage 1 and essential by Stage 3.

Technology procurement. Systems and equipment procured today should be evaluated not just on current function but on interoperability with a future location-based network. Proprietary decisions made now create technical debt that constrains what is possible later.

Governance of the pricing algorithm. Dynamic pricing raises immediate questions of accountability: who controls the algorithm, how is it audited, and how are concession revenue guarantees monitored? These are solvable problems, but they must be designed for from the outset. Stockholm's parliamentary oversight of congestion tax parameters offers one template.

Compliance over enforcement. Shifting from a toll to a charge requires a different philosophy. When behaviour change is the objective alongside revenue recovery, investment in seamless account and payment interaction matters more than chasing every unpaid transaction. Compliance becomes a customer experience problem as much as an enforcement one.

What society gains

The case for demand management is that it can honour existing concession obligations whilst converting the road network from a passive revenue asset into an active economic lever that government currently does not have.

Congestion imposes a measurable cost on the NSW economy every year in lost productivity, delayed freight, increased emissions, and degraded liveability. The current tolling system does nothing to address this: it collects revenue whether the network is flowing freely or gridlocked. Demand management changes that equation.

Productivity gains.  More reliable journey times reduce freight costs and supply chain uncertainty. Businesses can make rational location decisions if travel time is predictable. The productivity benefits of reduced peak congestion are well documented in the international literature and have been observed empirically in both London and Stockholm.

Emissions and health.  Reduced peak congestion means lower stop-start emissions and fewer accidents. Pricing that incentivises mode shift reduces vehicle kilometres travelled over time. These benefits carry real fiscal value in avoided health costs and reduced infrastructure wear.

A new policy toolkit for government.  Beyond the day-to-day network benefits, demand management gives government something it currently lacks entirely: genuine agency over network outcomes. The ability to respond to congestion events, protect essential freight corridors, incentivise off-peak travel, and target relief at high-dependency cohorts are all capabilities that the current locked-in concession pricing model makes impossible.

Long-run capital efficiency.  Real-time demand data from a managed network provides a far more reliable basis for infrastructure investment decisions than modelled forecasts. Demand management may defer or avoid entirely some capacity expansion that congestion would otherwise appear to demand.

The honest counterarguments

A thought experiment is only useful if it stress-tests the idea as well as advocates for it. The case for demand management in NSW is compelling, but it is not without real obstacles, and some of them deserve more than a footnote.

The "tax on free roads" problem is politically live. Any scheme that extends charges beyond the existing toll network would mean pricing roads that drivers currently use for free. The net benefit argument, that broader cost sharing produces fairer individual outcomes, is sound but politically vulnerable. One could frame any extension of charging as a new tax, and that framing tends to stick regardless of the underlying economics. London and Stockholm both faced this opposition. Stockholm's solution was a time-limited trial that let residents experience the benefit before voting on permanence. NSW would need an equivalent strategy for building public acceptance, not just a policy rationale.

Dynamic pricing can hurt the people it is meant to help. The equity argument in this paper rests on the premise that those with flexible travel patterns will shift behaviour and pay less, while those without flexibility pay no more than today. That is the design intent. But implementation rarely matches intent perfectly. Shift workers, carers, tradespeople with fixed schedules, people who cannot change when they travel regardless of price, may find themselves paying peak rates with no practical alternative. The HOV discount, targeted concession schemes, and income-based caps can address this, but only if they are built into the system from the outset. Added later, they tend to be underfunded and under-utilised.

Governance of a pricing algorithm is an unsolved problem in NSW. Giving a pricing engine significant influence over the daily cost of living for millions of people raises legitimate questions about accountability and democratic oversight that the current toll system, for all its faults, does not raise in quite the same way. Who controls the algorithm? Who audits it? What prevents it from being used as a fiscal lever when government revenues are under pressure? Stockholm embedded parliamentary oversight into the scheme's design. NSW has no equivalent framework for this kind of decision-making, and building one would be a prerequisite, not an afterthought.

The transition itself carries real risk. Moving from a known system to a dynamic demand-managed network requires technology, back-office architecture, customer experience, compliance frameworks, and concession arrangements to all work simultaneously and to be trusted by road users from day one. If any element fails visibly at launch, the political damage could set the entire reform agenda back by years. The staged approach described in this paper reduces that risk considerably, but it does not eliminate it. Sequencing and timing matter enormously.

The question we should be asking

This thought experiment set out to ask what NSW's road network could look like if tolling was redesigned around demand management. The honest answer is: significantly better, but not without real complexity, political difficulty, and design choices that can go wrong if made carelessly.

The counterarguments are real. Dynamic pricing can harm the people it is meant to help if equity safeguards are not built in from the start. Extending charges to free roads will face political resistance regardless of the merits. These are not objections to be dismissed, they are the design problems any serious reform would need to solve.

But the status quo deserves the same scrutiny. Doing nothing is not a neutral choice. The costs of inaction: disproportionate burdens on those least able to bear them, no congestion lever, no policy toolkit, a compliance architecture haemorrhaging revenue, are real. They are simply less visible because they accumulate gradually rather than arriving with a price tag attached.

The international evidence does not suggest this transition is easy. It suggests it is possible, and that the difference between done well and done badly lies almost entirely in the quality of early decisions. Governance architecture, contract flexibility, back-office design, technology procurement are not details to resolve later. They determine whether demand management becomes a practical reality or remains a policy ambition.

That is the real provocation here. Not whether demand management is the right destination – the evidence suggests it is – but whether NSW is on a path that leads there, and what should be done now to strengthen that position and give policy makers and road operators maximum optionality.

That question does not have a simple answer. It requires an examination of what existing concession contracts actually permit, which technology decisions are locking in constraints, where the back-office architecture needs to evolve, and how a governance framework for dynamic pricing could be structured in the NSW context. 

The time to design for optionality is before it is needed.

CBS Group - Infrastructure advisors who deliver measurable impact

CBS Group brings together senior infrastructure expertise, proprietary technology platforms, and systems thinking to solve the most complex challenges facing Australia's infrastructure sector. We work across construction, mining, energy, transport, utilities, and financial services, partnering with government agencies, infrastructure operators, and major contractors to unlock hidden value and deliver measurable outcomes.

In road tolling and pricing, we've worked with toll operators, transport agencies, and technology providers across Australia and internationally, giving us insight into what works, and what doesn't, across different tolling regimes, regulatory environments, and customer expectations. This global perspective informs our strategic advice on tolling and pricing policy, technology selection, and compliance approaches.


| --- | --- |

| Nick May
Road Pricing SME


Jeff Dusting
CBS Group Partner | NSW road users pay some of the highest tolls in the world and still sit in congestion. What if the system was redesigned not to collect revenue, but to actually move people?
This thought experiment asks what would change if NSW tolling was redesigned around demand management: pricing access to manage network flow, rather than to service debt and honour concession contracts. The answer is more tractable than it might seem, but more complex than advocates for reform sometimes acknowledge. Concession obligations are navigable, political resistance to extending charges is real, and dynamic pricing can hurt the people it is meant to help if equity safeguards are not built in from the start.
None of that makes the case against change. It makes the case for doing it carefully.
The international evidence suggests that when demand management is designed well, it produces less congestion, more reliable journey times, and a fairer distribution of cost. It does not require an overnight leap to GPS-based charging. It can begin at corridor level, with the toll road repriced as the premium tier within a broader demand-managed zone, each stage building the case for the next.
The real provocation is not whether demand management would produce better outcomes. The evidence suggests it would. It is whether the decisions being made in NSW in procurement, contract design, and back-office architecture are preserving the option to get there, or quietly excluding it. That question deserves a serious answer. This paper sets out what it might look like. |

| Demand management doesn't mean paying more. It means, for 
the first time, you can pay less – if the system is designed well. | Demand management doesn't mean paying more. It means, for 
the first time, you can pay less – if the system is designed well. |


| --- | --- |

| Stage 1 – Corridor Demand Management: |  |

| Dynamic pricing across a defined corridor, with the toll road as the premium tier
First genuine off-peak discount for road users
Concession revenue maintained through pricing calibration and shadow tolls
Prove the model: demand responds to price signals and the system can be governed fairly | Demand management begins at corridor level: a specific crossing, orbital segment, or zone. Pricing becomes dynamic across all roads within that corridor, including the toll road. Off-peak pricing falls below today's toll; peak pricing holds at or above it. Crucially, road users do not pay both a toll and a corridor charge: one satisfies the other. No new technology is required at this stage. |

| Stage 2 – Network Expansion: |  |

| Demand management pricing logic extended across a broader connected network
Meaningful route choice for road users — not just time-of-day choice
Data and operational foundation built for network-wide pricing
Fixed roadside infrastructure reaches its economic inflection point | As the managed network grows, more roads and more route choices extend the behavioural lever. The economics of adding fixed roadside infrastructure to free roads increasingly work against continued build-out — each new gantry delivers diminishing return, creating a natural case for a different approach. |

| Stage 3 – Seamless Network Pricing: |  |

| Zero-infrastructure location-based pricing across the full network
Toll road premium unified within a single network-wide pricing engine
Concession revenue obligations reconciled through back-office architecture
Every road priced, every user with genuine choice, every trip generating network intelligence | The case for zero-infrastructure location-based pricing becomes compelling not as a policy objective, but as the most efficient way to manage a network that earlier stages have already established. Singapore's shift from gantry-based ERP to GNSS-based ERP 2.0 illustrates the endpoint. The technology changes; the pricing logic does not. |

---


## CBS-Tolling to Demand Management v1.0.pdf

*File: `Tolling to demand management/CBS-Tolling to Demand Management v1.0.pdf`*

A RT I C L E | 1 0 - M I N U T E R E A D | M A RC H 2 0 2 6 | C B S G RO U P




A Thought Experiment: Could NSW’s tolls be
replaced with demand management schemes?
NSW road users pay some of the highest tolls in the world and still sit in congestion. What
if the system was redesigned not to collect revenue, but to actually move people?


                                         NSW road users pay some of the highest tolls in the world and still sit in
                                         congestion. What if the system was redesigned not to collect revenue, but to
                                         actually move people?

                                         This thought experiment asks what would change if NSW tolling was
 Nick May                                redesigned around demand management: pricing access to manage network
 Road Pricing SME
                                         flow, rather than to service debt and honour concession contracts. The answer
                                         is more tractable than it might seem, but more complex than advocates for
                                         reform sometimes acknowledge. Concession obligations are navigable,
                                         political resistance to extending charges is real, and dynamic pricing can hurt
                                         the people it is meant to help if equity safeguards are not built in from the start.

                                         None of that makes the case against change. It makes the case for doing it
 Jeff Dusting                            carefully.
 CBS Group Partner
                                         The international evidence suggests that when demand management is
                                         designed well, it produces less congestion, more reliable journey times, and a
                                         fairer distribution of cost. It does not require an overnight leap to GPS-based
                                         charging. It can begin at corridor level, with the toll road repriced as the
                                         premium tier within a broader demand-managed zone, each stage building the
                                         case for the next.

                                         The real provocation is not whether demand management would produce
                                         better outcomes. The evidence suggests it would. It is whether the decisions
                                         being made in NSW in procurement, contract design, and back-office
                                         architecture are preserving the option to get there, or quietly excluding it. That
                                         question deserves a serious answer. This paper sets out what it might look like.


                         Demand management doesn't mean paying more. It means, for
                         the first time, you can pay less – if the system is designed well.




© C B S G r o u p | c b sg r o u p . c o m . a u | S t ra t e g i c A d v i s o r y i n Tra n s p o r t I n f ra s t r u c t u r e
A RT I C L E | 1 0 - M I N U T E R E A D | M A RC H 2 0 2 6 | C B S G RO U P



The provocation
NSW operates one of the most extensive urban toll networks in the world. It also carries some of its
most expensive tolls, a compliance problem that costs the network hundreds of millions of dollars
annually, and road users who consistently report that the system feels deeply unfair. The Independent
Toll Review led by Professor Allan Fels documented this frustration in detail: people pay high tolls, have
little ability to avoid them, and see no clear relationship between what they pay and the quality of
service they receive.

Yet the core purpose of pricing – to influence behaviour and allocate scarce capacity – is almost entirely
absent from NSW tolling today. The model today is project oriented on the basis of guaranteeing a return
on the capital investment in the asset. There is no real connection to public good / service / community
or transport outcomes. Prices are set to meet revenue obligations. They escalate by contract regardless
of network performance. They bear little relationship to actual congestion levels. They do not reward
flexibility, and they do not respond to demand.

This thought experiment asks a different question: what if they did? What would NSW's road network
look like if tolling was redesigned as a demand management instrument, and what would it take to get
there?


What demand management actually looks like
The international evidence on demand-managed road pricing is now substantial. Three examples are
particularly instructive for NSW.

         LONDON CONGESTION CHARGE | United Kingdom | Est. 2003
         London's Congestion Charge Zone introduced a flat daily charge for driving in central London
         during peak hours. Within a year, traffic in the zone fell by around 30 per cent, journey times
         improved markedly, and revenue was hypothecated to public transport investment. The scheme
         demonstrated that demand responds to pricing, that a defined geographic zone is a practical unit
         of management, and that the revenue generated can be reinvested in the alternatives that make
         the charge politically sustainable. London later introduced the Ultra Low Emission Zone (ULEZ),
         showing that a charge structure can be layered to achieve multiple policy objectives
         simultaneously.




© C B S G r o u p | c b sg r o u p . c o m . a u | S t ra t e g i c A d v i s o r y i n Tra n s p o r t I n f ra s t r u c t u r e
A RT I C L E | 1 0 - M I N U T E R E A D | M A RC H 2 0 2 6 | C B S G RO U P



         STOCKHOLM CONGESTION TAX | Sweden | Est. 2007
         Stockholm went further than London by making the charge dynamic: prices vary by time of day,
         rising at peak periods and falling during off-peak hours. The scheme reduced traffic in the inner
         city by around 20 per cent, with the most significant reductions during peak hours – exactly the
         behaviour change a demand management system is designed to achieve. Crucially, a trial period
         preceded permanent implementation, and public support increased once residents experienced
         the benefit of reduced congestion firsthand.


         SINGAPORE ERP | Singapore | Est. 1998, ERP 2.0 from 2025
         Singapore operates the world's most sophisticated urban demand management tolling system.
         The Electronic Road Pricing system uses dynamic pricing that adjusts in real time based on
         measured traffic speeds: if a monitored road segment falls below a target speed, the price
         increases at the next rate adjustment. The recently introduced ERP 2.0 replaces the original
         roadside gantry infrastructure entirely with GNSS-based on-board units, eliminating physical
         infrastructure from the equation.


         NEW YORK CONGESTION PRICING | USA | Est. 2025
         New York's Central Business District Tolling Program began charging in 2025. Its introduction was
         contentious and subject to significant political opposition, including a temporary suspension
         attempt, a useful reminder that the equity and political economy of demand management must
         be designed for from the outset, not treated as afterthoughts. New York also illustrates that the
         debate is no longer about whether demand management works, but about who bears the cost
         and who captures the benefit.



Taken together, these examples establish that demand management is not a theoretical idea. It reduces
congestion, it changes behaviour, and when designed well, it generates revenue that can be reinvested
in the network and its users. The question for NSW is not whether it works, it is whether the existing
structure of the NSW network makes it possible, and what it would take to get there.




© C B S G r o u p | c b sg r o u p . c o m . a u | S t ra t e g i c A d v i s o r y i n Tra n s p o r t I n f ra s t r u c t u r e
A RT I C L E | 1 0 - M I N U T E R E A D | M A RC H 2 0 2 6 | C B S G RO U P



The Thought Experiment: NSW tolls redesigned for behaviour change
Imagine a version of tolling designed around a single question: how do we get the network flowing as
efficiently as possible, and price access accordingly?

In this system, pricing is dynamic. It responds in real time to congestion levels, incidents, and network
stress. The road network, toll and non-toll, is treated as a unified system rather than a collection of
independent revenue assets. Revenue is an output of the model, not its primary input. And for the first
time, road users have a genuine choice.


  If you have to travel at peak, you pay the same toll as today. If you can shift to off-peak, you pay less.
  That is it.


This is the essential value proposition. Demand management does not mean loading additional cost
onto road users who are already paying too much. It means creating a mechanism by which those users
can actually reduce their cost by changing behaviour. Those with flexibility benefit. Those without it are
no worse off than today, albeit with less congestion on their route.

For Western Sydney residents, who the Fels Review identified as bearing the most disproportionate toll
burden, this matters. The current system offers no relief, no optionality, and no relationship between
the price paid and the quality of the journey. Demand management at least creates the conditions in
which off-peak travel is rewarded, and over time, as the system matures, more targeted relief for high-
dependency corridors becomes structurally possible.


Concession Contracts: A feature, not a barrier
The immediate objection is obvious: existing concession contracts lock in revenue expectations. If
prices fall off-peak and traffic redistributes, how do concessionaires receive their contracted revenue?

The answer is that demand management, properly designed, need not reduce aggregate revenue. Two
complementary mechanisms make this work:

Optimised network pricing: Dynamic pricing calibrated across the network can hold or increase peak
prices while reducing off-peak rates, with the net effect being revenue-neutral or positive for
concessionaires. Toll roads within a demand-managed network command a premium: they offer faster,
more reliable, less congested journeys. Users who value that reliability will pay for it. The toll road
becomes the premium lane within a broader managed system, not simply a debt-recovery mechanism.

Shadow tolls: Where demand management deliberately diverts trips away from toll roads: onto
alternative routes, into different time slots, or toward other modes, government can compensate



© C B S G r o u p | c b sg r o u p . c o m . a u | S t ra t e g i c A d v i s o r y i n Tra n s p o r t I n f ra s t r u c t u r e
A RT I C L E | 1 0 - M I N U T E R E A D | M A RC H 2 0 2 6 | C B S G RO U P



concessionaires through shadow toll payments. This reframes the shadow toll not as a subsidy to
private operators, but as a payment for a public good: the government is purchasing congestion
reduction, emissions abatement, and productivity gain. The cost of that payment is likely to be
substantially offset by reduced infrastructure wear, lower health externalities, and avoided capital
expenditure on capacity expansion that congestion would otherwise demand.

There is also an argument that extending this concept into full Road User Charging (RUC) would give the
ultimate lever for optimising payments, alongside RUCs broader opportunities for excise recovery and
broader policy outcomes.

         TRANSURBAN EXPRESS LANES | Virginia & Maryland, USA
         Transurban’s Express Lanes network in Virginia and Maryland cover the I-495, I-95, and I-66
         corridors. Unlike London, Stockholm, or Singapore, these are privately operated managed lanes
         operating within a concession framework. Tolls adjust dynamically in real time to maintain target
         travel speeds in the managed lanes, with prices rising sharply at peak periods and falling during
         off-peak hours. High-occupancy vehicles (three or more occupants) travel free of charge,
         embedding an equity and mode-shift incentive into the pricing model. General purpose lanes
         remain free and available alongside the Express Lanes, meaning road users retain genuine choice.
         Transurban’s Express Lanes demonstrate that dynamic demand management pricing and private
         concession operation are not in conflict. They can be designed to reinforce each other.



The key insight is that the concession contract and demand management are not mutually exclusive.
They require compatible architecture such as a pricing engine that can reconcile dynamic charges with
fixed revenue obligations, and a back-office that can account for both. That is a design challenge, not a
structural impossibility.


The implementation strategy: From corridor charge to network
intelligence
The transformation described in this paper does not require a single leap to full network pricing. It can
be built incrementally, with each stage delivering genuine demand management outcomes while laying
the foundation for the next. What matters is that the pricing logic is right from the outset. Technology
follows that logic, rather than defining it.




© C B S G r o u p | c b sg r o u p . c o m . a u | S t ra t e g i c A d v i s o r y i n Tra n s p o r t I n f ra s t r u c t u r e
A RT I C L E | 1 0 - M I N U T E R E A D | M A RC H 2 0 2 6 | C B S G RO U P




 Stage 1 – Corridor Demand Management:

  • Dynamic pricing across a defined corridor, with                                                  Demand management begins at corridor
    the toll road as the premium tier                                                                level: a specific crossing, orbital segment, or
                                                                                                     zone. Pricing becomes dynamic across all
  • First genuine off-peak discount for road users
                                                                                                     roads within that corridor, including the toll
  • Concession revenue maintained through pricing                                                    road. Off-peak pricing falls below today's toll;
    calibration and shadow tolls                                                                     peak pricing holds at or above it. Crucially,
  • Prove the model: demand responds to price                                                        road users do not pay both a toll and a
    signals and the system can be governed fairly                                                    corridor charge: one satisfies the other. No
                                                                                                     new technology is required at this stage.


 Stage 2 – Network Expansion:

  • Demand management pricing logic extended                                                         As the managed network grows, more roads
    across a broader connected network                                                               and more route choices extend the
                                                                                                     behavioural lever. The economics of adding
  • Meaningful route choice for road users — not just
                                                                                                     fixed roadside infrastructure to free roads
    time-of-day choice
                                                                                                     increasingly work against continued build-
  • Data and operational foundation built for                                                        out — each new gantry delivers diminishing
    network-wide pricing                                                                             return, creating a natural case for a different
  • Fixed roadside infrastructure reaches its                                                        approach.
    economic inflection point

 Stage 3 – Seamless Network Pricing:

  • Zero-infrastructure location-based pricing across                                                The case for zero-infrastructure location-
    the full network                                                                                 based pricing becomes compelling not as a
                                                                                                     policy objective, but as the most efficient way
  • Toll road premium unified within a single network-
                                                                                                     to manage a network that earlier stages have
    wide pricing engine
                                                                                                     already established. Singapore's shift from
  • Concession revenue obligations reconciled                                                        gantry-based ERP to GNSS-based ERP 2.0
    through back-office architecture                                                                 illustrates the endpoint. The technology
  • Every road priced, every user with genuine                                                       changes; the pricing logic does not.
    choice, every trip generating network intelligence

The logical elegance of this progression is that each stage builds the business case and public
acceptance for the next. Decision-makers are not being asked to commit to location-based RUC today.
They are being asked to ensure that the architecture choices made at Stage 1 do not negatively impact
Stage 3.



© C B S G r o u p | c b sg r o u p . c o m . a u | S t ra t e g i c A d v i s o r y i n Tra n s p o r t I n f ra s t r u c t u r e
A RT I C L E | 1 0 - M I N U T E R E A D | M A RC H 2 0 2 6 | C B S G RO U P



The infrastructure of change
The staged path is technically achievable, but it requires deliberate choices in areas where decisions
are already being made.

     – Back-office architecture. A demand-managed network needs a pricing engine that operates
       across toll and non-toll roads, reconciles dynamic pricing with fixed concession obligations,
       and accounts for shadow toll payments. The case for consolidation away from fragmented
       operator systems toward shared or interoperable infrastructure, becomes compelling at Stage 1
       and essential by Stage 3.

     – Technology procurement. Systems and equipment procured today should be evaluated not
       just on current function but on interoperability with a future location-based network. Proprietary
       decisions made now create technical debt that constrains what is possible later.

     – Governance of the pricing algorithm. Dynamic pricing raises immediate questions of
       accountability: who controls the algorithm, how is it audited, and how are concession revenue
       guarantees monitored? These are solvable problems, but they must be designed for from the
       outset. Stockholm's parliamentary oversight of congestion tax parameters offers one template.

     – Compliance over enforcement. Shifting from a toll to a charge requires a different philosophy.
       When behaviour change is the objective alongside revenue recovery, investment in seamless
       account and payment interaction matters more than chasing every unpaid transaction.
       Compliance becomes a customer experience problem as much as an enforcement one.


What society gains
The case for demand management is that it can honour existing concession obligations whilst
converting the road network from a passive revenue asset into an active economic lever that
government currently does not have.

Congestion imposes a measurable cost on the NSW economy every year in lost productivity, delayed
freight, increased emissions, and degraded liveability. The current tolling system does nothing to
address this: it collects revenue whether the network is flowing freely or gridlocked. Demand
management changes that equation.

     – Productivity gains. More reliable journey times reduce freight costs and supply chain
       uncertainty. Businesses can make rational location decisions if travel time is predictable. The
       productivity benefits of reduced peak congestion are well documented in the international
       literature and have been observed empirically in both London and Stockholm.




© C B S G r o u p | c b sg r o u p . c o m . a u | S t ra t e g i c A d v i s o r y i n Tra n s p o r t I n f ra s t r u c t u r e
A RT I C L E | 1 0 - M I N U T E R E A D | M A RC H 2 0 2 6 | C B S G RO U P



     – Emissions and health. Reduced peak congestion means lower stop-start emissions and fewer
       accidents. Pricing that incentivises mode shift reduces vehicle kilometres travelled over time.
       These benefits carry real fiscal value in avoided health costs and reduced infrastructure wear.

     – A new policy toolkit for government. Beyond the day-to-day network benefits, demand
       management gives government something it currently lacks entirely: genuine agency over
       network outcomes. The ability to respond to congestion events, protect essential freight
       corridors, incentivise off-peak travel, and target relief at high-dependency cohorts are all
       capabilities that the current locked-in concession pricing model makes impossible.

     – Long-run capital efficiency. Real-time demand data from a managed network provides a far
       more reliable basis for infrastructure investment decisions than modelled forecasts. Demand
       management may defer or avoid entirely some capacity expansion that congestion would
       otherwise appear to demand.


The honest counterarguments
A thought experiment is only useful if it stress-tests the idea as well as advocates for it. The case for
demand management in NSW is compelling, but it is not without real obstacles, and some of them
deserve more than a footnote.

     – The "tax on free roads" problem is politically live. Any scheme that extends charges beyond
       the existing toll network would mean pricing roads that drivers currently use for free. The net
       benefit argument, that broader cost sharing produces fairer individual outcomes, is sound but
       politically vulnerable. One could frame any extension of charging as a new tax, and that framing
       tends to stick regardless of the underlying economics. London and Stockholm both faced this
       opposition. Stockholm's solution was a time-limited trial that let residents experience the
       benefit before voting on permanence. NSW would need an equivalent strategy for building
       public acceptance, not just a policy rationale.

     – Dynamic pricing can hurt the people it is meant to help. The equity argument in this paper
       rests on the premise that those with flexible travel patterns will shift behaviour and pay less,
       while those without flexibility pay no more than today. That is the design intent. But
       implementation rarely matches intent perfectly. Shift workers, carers, tradespeople with fixed
       schedules, people who cannot change when they travel regardless of price, may find
       themselves paying peak rates with no practical alternative. The HOV discount, targeted
       concession schemes, and income-based caps can address this, but only if they are built into
       the system from the outset. Added later, they tend to be underfunded and under-utilised.

     – Governance of a pricing algorithm is an unsolved problem in NSW. Giving a pricing engine
       significant influence over the daily cost of living for millions of people raises legitimate
       questions about accountability and democratic oversight that the current toll system, for all its


© C B S G r o u p | c b sg r o u p . c o m . a u | S t ra t e g i c A d v i s o r y i n Tra n s p o r t I n f ra s t r u c t u r e
A RT I C L E | 1 0 - M I N U T E R E A D | M A RC H 2 0 2 6 | C B S G RO U P



          faults, does not raise in quite the same way. Who controls the algorithm? Who audits it? What
          prevents it from being used as a fiscal lever when government revenues are under pressure?
          Stockholm embedded parliamentary oversight into the scheme's design. NSW has no
          equivalent framework for this kind of decision-making, and building one would be a
          prerequisite, not an afterthought.

     – The transition itself carries real risk. Moving from a known system to a dynamic demand-
       managed network requires technology, back-office architecture, customer experience,
       compliance frameworks, and concession arrangements to all work simultaneously and to be
       trusted by road users from day one. If any element fails visibly at launch, the political damage
       could set the entire reform agenda back by years. The staged approach described in this paper
       reduces that risk considerably, but it does not eliminate it. Sequencing and timing matter
       enormously.


The question we should be asking
This thought experiment set out to ask what NSW's road network could look like if tolling was redesigned
around demand management. The honest answer is: significantly better, but not without real
complexity, political difficulty, and design choices that can go wrong if made carelessly.

The counterarguments are real. Dynamic pricing can harm the people it is meant to help if equity
safeguards are not built in from the start. Extending charges to free roads will face political resistance
regardless of the merits. These are not objections to be dismissed, they are the design problems any
serious reform would need to solve.

But the status quo deserves the same scrutiny. Doing nothing is not a neutral choice. The costs of
inaction: disproportionate burdens on those least able to bear them, no congestion lever, no policy
toolkit, a compliance architecture haemorrhaging revenue, are real. They are simply less visible
because they accumulate gradually rather than arriving with a price tag attached.

The international evidence does not suggest this transition is easy. It suggests it is possible, and that
the difference between done well and done badly lies almost entirely in the quality of early decisions.
Governance architecture, contract flexibility, back-office design, technology procurement are not
details to resolve later. They determine whether demand management becomes a practical reality or
remains a policy ambition.

That is the real provocation here. Not whether demand management is the right destination – the
evidence suggests it is – but whether NSW is on a path that leads there, and what should be done now
to strengthen that position and give policy makers and road operators maximum optionality.

That question does not have a simple answer. It requires an examination of what existing concession
contracts actually permit, which technology decisions are locking in constraints, where the back-office



© C B S G r o u p | c b sg r o u p . c o m . a u | S t ra t e g i c A d v i s o r y i n Tra n s p o r t I n f ra s t r u c t u r e
A RT I C L E | 1 0 - M I N U T E R E A D | M A RC H 2 0 2 6 | C B S G RO U P



architecture needs to evolve, and how a governance framework for dynamic pricing could be structured
in the NSW context.

The time to design for optionality is before it is needed.




CBS Group - Infrastructure advisors who deliver measurable impact
CBS Group brings together senior infrastructure expertise, proprietary technology platforms, and systems thinking to solve
the most complex challenges facing Australia's infrastructure sector. We work across construction, mining, energy,
transport, utilities, and financial services, partnering with government agencies, infrastructure operators, and major
contractors to unlock hidden value and deliver measurable outcomes.
In road tolling and pricing, we've worked with toll operators, transport agencies, and technology providers across Australia
and internationally, giving us insight into what works, and what doesn't, across different tolling regimes, regulatory
environments, and customer expectations. This global perspective informs our strategic advice on tolling and pricing policy,
technology selection, and compliance approaches.




© C B S G r o u p | c b sg r o u p . c o m . a u | S t ra t e g i c A d v i s o r y i n Tra n s p o r t I n f ra s t r u c t u r e

---
