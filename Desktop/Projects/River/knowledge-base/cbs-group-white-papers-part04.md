---
entity: cbs-group
category: ip
title: "CBS Group White Papers - Tolling and Demand Management — CBS-WP-001_When_Tolling_Becomes_Safety.pdf"
---

> **Parent document:** CBS Group White Papers - Tolling and Demand Management
> **Entity:** CBS Group, a technical advisory firm specialising in infrastructure asset management, systems engineering, and tolling
> **Category:** intellectual property and capability documentation
> **Total sections in parent:** 10
>
> This is a sub-document extracted from the parent for retrieval optimisation.
> The parent document contains the complete collection; this section is independently
> retrievable for targeted queries.

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
