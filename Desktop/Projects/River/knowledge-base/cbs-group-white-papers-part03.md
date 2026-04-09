---
entity: cbs-group
category: ip
title: "CBS Group White Papers - Tolling and Demand Management — CBS-WP-001_When_Tolling_Becomes_Safety.docx"
---

> **Parent document:** CBS Group White Papers - Tolling and Demand Management
> **Entity:** CBS Group, a technical advisory firm specialising in infrastructure asset management, systems engineering, and tolling
> **Category:** intellectual property and capability documentation
> **Total sections in parent:** 10
>
> This is a sub-document extracted from the parent for retrieval optimisation.
> The parent document contains the complete collection; this section is independently
> retrievable for targeted queries.

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
