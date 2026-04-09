---
entity: cbs-group
category: tender
title: "CBS Group - JV with Egis Proposals — Delivery_Concept_of_Operations_(TCC-SPC-0008_Market_Facing).pdf"
---

> **Parent document:** CBS Group - JV with Egis Proposals
> **Entity:** CBS Group, a technical advisory firm specialising in infrastructure asset management, systems engineering, and tolling
> **Category:** tender submission and procurement documentation
> **Total sections in parent:** 17
>
> This is a sub-document extracted from the parent for retrieval optimisation.
> The parent document contains the complete collection; this section is independently
> retrievable for targeted queries.

## Delivery_Concept_of_Operations_(TCC-SPC-0008_Market_Facing).pdf

*File: `STC IS/VP440649/RequestDocs/Delivery_Concept_of_Operations_(TCC-SPC-0008_Market_Facing).pdf`*

North East Link State
Tolling Corporation

Concept of Operations
            Contents
            1.      EXECUTIVE SUMMARY ............................................................................................. 4
            1.1.     Situation ...................................................................................................................................... 4
            1.2.     Challenge .................................................................................................................................... 4
            1.3.     The TCC Concept of Operations (ConOps) ................................................................................ 4
            1.4.     Key Terms and Definitions .......................................................................................................... 5

            2.      TCC CONOPS CONTEXT ........................................................................................... 9
            2.1.     STC vision ................................................................................................................................... 9
            2.2.     STC purpose ............................................................................................................................... 9
            2.3.     STC values .................................................................................................................................. 9
            2.4.     TCC Project Objectives & Guiding Principles ............................................................................. 9
            2.5.     Project Overview ....................................................................................................................... 10
            2.6.     Key Constraints ......................................................................................................................... 11

            3.      ROLES AND RESPONSIBILITIES (ACTORS) .......................................................... 13
            3.1.     Key Stakeholders and Actors .................................................................................................... 13

            4.      Customer operations and support Scenarios ........................................................ 15
            4.1.     ConOps Scenarios and Variations ............................................................................................ 15
            4.2.     Scenario 1: Existing Interoperable Toll Account Customer ...................................................... 16
            4.3.     Scenario 2: Road User account updated after travel ................................................................ 18
            4.4.     Scenario 3: No Arrangement Travel ......................................................................................... 19
            4.5.     Scenario 4: Exempt Vehicle Travel ........................................................................................... 21
            4.6.     Scenario 5: Customer Management ......................................................................................... 22
            4.7.     Scenario 6: Duplicate Charging Error ....................................................................................... 23
            4.8.     Scenario 7: Exception Handling ................................................................................................ 24
            4.9.     Scenario 8: Stopped Traffic Revenue Leakage ........................................................................ 24
            4.10.    Scenario 9: Toll Performance and Reporting ............................................................................ 25
            4.11.    Scenario 10: Passage to Receipt Performance – “Detection to Collection” ............................. 25
            4.12.    Scenario 11: Revenue Leakage Investigation .......................................................................... 26
            4.13.    Scenario 12: Maintenance ........................................................................................................ 26

            5.      KEY CONSIDERATIONS .......................................................................................... 29
            5.1.     Vehicle Classification at Roadside ............................................................................................ 29
            5.2.     No Arrangement Travel and Casual NEL Road Users ............................................................. 30
            5.3.     Tag Detection at Roadside ........................................................................................................ 31

            6.      CURRENT SITUATION + PROJECT NEEDS ........................................................... 32
            6.1.     Current Situation ....................................................................................................................... 32




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                                                                          Page 1
            6.2.      Tolling Topology ........................................................................................................................ 33
            6.3.      Target Operating Model ............................................................................................................ 35
            6.4.      TCC Solution Landscape .......................................................................................................... 38
            6.5.      TCC Context.............................................................................................................................. 39
            6.6.      Roadside Tolling Gantries (or equivalent) ................................................................................. 41
            6.7.      Digital Technology Guidelines................................................................................................... 41
            6.8.      Preliminary Non-Functional Needs ........................................................................................... 42
            6.9.      Operational Readiness – Transition from Project Delivery to Operations ................................ 43
            6.10.     Tolling Context – the flow of money .......................................................................................... 44
            6.11.     Tolling Context – Data Flow ...................................................................................................... 45

            7.       FUTURE STATE CONSIDERATIONS....................................................................... 47
            7.1.      Current Considerations ............................................................................................................. 47
            7.2.      Future Proofing – Capabilities to be considered in the future ................................................... 48

            8.       MEASURES OF EFFECTIVENESS AND SUITABILITY ........................................... 49
            8.1.      Measures of Suitability and Effectiveness ................................................................................ 49
            8.2.      Options and Solution Selection ................................................................................................. 50


            List of Figures
            Figure 1: STC Values .............................................................................................................................. 9
            Figure 2. TCC Roles and Responsibilities (Actors) .............................................................................. 13
            Figure 3. Existing Interoperable Toll Account Customer ...................................................................... 17
            Figure 4. First Time Traveller, Account Opened after Travel ................................................................ 19
            Figure 5. No Arrangement Travel ......................................................................................................... 20
            Figure 6. No Arrangement Travel process ............................................................................................ 21
            Figure 7. Exempt Vehicle Travel ........................................................................................................... 22
            Figure 8. Duplicate Charging Error ....................................................................................................... 24
            Figure 9. Detection to Collection Sample .............................................................................................. 26
            Figure 10. Anticipated Product Mix ....................................................................................................... 31
            Figure 11. Tolling Topology................................................................................................................... 34
            Figure 12. Example Split of In House/Outsourced functions ................................................................ 37
            Figure 13. TCC High Level Solutions Functions ................................................................................... 38
            Figure 14. STC-TCC External Interactions ........................................................................................... 38
            Figure 15. Separation of Scope between Project Co and TCC ............................................................ 39
            Figure 16. TCC System Component Overview ..................................................................................... 40
            Figure 17. TCC Capability Overview (example).................................................................................... 40
            Figure 18: Project delivery outline ......................................................................................................... 44
            Figure 19. Flow of money...................................................................................................................... 45
            Figure 20. Data Flow ............................................................................................................................. 46
            Figure 21: Document overview ............................................................................................................. 51


            List of Tables
            Table 1: Key Terms and Definitions ........................................................................................................ 8
            Table 2: TCC Program .......................................................................................................................... 11
            Table 3. Key Constraints ....................................................................................................................... 12
            Table 4. TCC Roles and Responsibilities (Actors) ................................................................................ 14
            Table 5. ConOps Scenarios .................................................................................................................. 15
            Table 6. Scenario 1 TCC supported variations ..................................................................................... 18
            Table 7. Scenario 2 TCC supported variations ..................................................................................... 19




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                                                                     Page 2
            Table 8. Scenario 3 TCC supported variations ..................................................................................... 21
            Table 9. Possible trip combinations ...................................................................................................... 35
            Table 10: TOM alignment to the TCC Project Objectives ..................................................................... 36
            Table 11: TOM alignment to the TCC Project Guiding Principles......................................................... 36
            Table 12: Design technology guidelines ............................................................................................... 42
            Table 13. Key non-functional requirements .......................................................................................... 43
            Table 14. Measures of Suitability .......................................................................................................... 49
            Table 15. Measures of Effectiveness .................................................................................................... 50




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                                                              Page 3
            1. EXECUTIVE SUMMARY

            1.1. Situation
            The North East Link (NEL) State Tolling Corporation (STC) was established under the NEL Act
            (2020). STC must establish a Toll Collection Capability (TCC) that effectively and efficiently collects
            NEL toll revenue – optimising community value to the State and ensuring a scalable State capability
            for future motorways, returning concessions and related opportunities.

            1.2. Challenge
            STC must successfully establish a TCC, concurrent with the delivery of the NEL. STC must consider:
                 •    the timeframe for delivery of the solution, to commence tolling as the NEL road is completed
                      and open
                 •    relevant tolling legislation and regulatory requirements
                 •    interoperability requirements under the MoU and for potential 3rd party retailers (for casual
                      products)
                 •    customer expectations
                 •    service and technology providers in the Global Tolling market and presence in the Australian
                      Tolling market
                 •    potential changes in tolling technology and operational practices
                 •    the opportunity to innovate toll collection practices.

            1.3. The TCC Concept of Operations (ConOps)
            This version of the ConOps reflects on-going evolution from interactions and feedback with
            contractors and operators through the formal engagements undertaken to this point.
            The Concept of Operations will continue to be updated through procurement, delivery and operations.




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                      Page 4
            1.4. Key Terms and Definitions
              Term                                             Definition
                                                               A vehicle that has been registered to a retail product
                                                               for travel on NEL whether with STC casual products
              Authorised Vehicle                               or retail products of other Australian Tolling
                                                               Operators or the vehicle is otherwise exempt to
                                                               charging for Tolls (such as emergency vehicles)
                                                               A person or business with a valid NEL pass
              Casual Road User
                                                               arrangement in place for payment for travel on NEL.
                                                               The Central Package (formerly Primary Package)
                                                               Project Deed establishes the contractual relationship
                                                               between State Parties and Project Co. Project Co
              Central Package Project Deed
                                                               will design, construct, operate and maintain the
                                                               Central Package (the NEL road) and will provide the
                                                               TEI.
                                                               A component of the Back Office Solution that
                                                               undertakes the management of casual customer
              Commercial Back Office (CBO)                     arrangements, processing for No Arrangement
                                                               Travel and interactions with customers and NAT
                                                               road users.
                                                               DSRC Tag are the dominant tolling technology
                                                               equipment that has been adopted for use in the
              Dedicated Short Range Communication (DSRC) Tag
                                                               Australian Tolling market for on board units in
                                                               participating Authorised Vehicles.
                                                               Other defined fees chargeable under the Tolling
              Fees
                                                               Agreement or other applicable legislation.
                                                               Global Navigation Satellite System (GNSS) refers to
                                                               a constellation of satellites providing signals from
              Global Navigation Satellite System (GNSS)
                                                               space that transmit positioning and timing data to
                                                               receiving devices
                                                               A term used to refer to the maximum permissible
                                                               weight of a vehicle when fully loaded. This includes
              Gross Vehicle Mass (GVM)                         the weight of the vehicle itself, any passengers or
                                                               cargo, fuel, and any other equipment or accessories
                                                               that may be on board.
                                                               Victorian Government procurement governance
              High Value High Risk
                                                               framework
                                                               Interoperability is the process of data exchange and
                                                               financial settlement between participating Road
                                                               Assets and Tolling Retailers who are participating in
                                                               the Australian Tolling market and have agreed to
              Interoperability                                 share their data as per the MoU. Each Asset and
                                                               Retailer pair will enter into a Roaming agreement
                                                               which outlines the terms of the exchange of
                                                               information and financial parameters of the
                                                               relationship.
                                                               One of the current toll retailers in Australia that
              Interoperability Retailer                        operate in line with the Australian MoU governing
                                                               interoperability
                                                               A road user travelling on NEL that has a valid
              Interoperable Customer                           arrangement with an Interoperable Retailer at the
                                                               time of Travel




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                        Page 5
              Term                            Definition
              LPN                             License Plate Number
                                              No Arrangement Travel, is travel by a NEL Road
                                              User without a valid payment arrangement in place
              No Arrangement Travel (NAT)     at the time of travel or established within the
                                              allowable payment period nor is the vehicle
                                              otherwise not exempt from tolls.
              NEL Act                         North East Link Act 2020 (Vic)
                                              A road user by whom a NEL toll is payable – may be
              NEL Road User                   the owner of a vehicle, or an interoperable account
                                              holder or a nominated person.
                                              The arrangement in place to collect the toll and fees
              Payment mechanism
                                              from the NEL Road User
                                              A component of the Back Office Solution that
                                              undertakes processing functions to convert
                                              detections from the Roadside Systems into billable
              Operational Back Office (OBO)
                                              Trips with identified Vehicles and assign the resulting
                                              Trips to known customers, either local arrangements
                                              or interoperable arrangements.
                                              Spark North East Link Pty Ltd as trustee of the Spark
                                              North East Link Trust, being a PPP consortium
              Project Co
                                              formed for the purposes of performing services
                                              under the Project Deed
                                              The collective term incorporating an Interoperability
              Retailer                        Retailer and a 3rd Party Retailer who may make
                                              tolling accounts available to a NEL road user.
                                              Means a system to detect, record and classify data
                                              (including tag and licence plate details) relating to
              Roadside System (RSS)           vehicles passing through toll zones on the NEL,
                                              including software and telecommunications network
                                              infrastructure.
                                              Road User Charging (RUC) is a charge or fee issued
                                              to drivers for the use of a defined area of road based
              Road User Charging (RUC)        on data collected regarding the vehicles travel and
                                              actual usage of road infrastructure on a user pays
                                              model.
                                              The fee that is agreed to be paid as part of an
                                              agreement between two participants of the
              Roaming Fee
                                              Australian MoU governing Tolling Interoperability in
                                              the Australian Tolling market.
                                              The collective term as represented by the Minister of
                                              Transport Infrastructure for and on behalf of the
              State Parties
                                              Crown in right of the State of Victoria and North East
                                              Link State Tolling Corporation (NELSTC)
                                              Toll Collection Capability – the systems and
              TCC                             processes required to allow STC to perform toll
                                              collection and associated processing fees for NEL
                                              The TCC register of Authorised Users (by tag /
                                              License Plate Number / Vehicle ID) and their
              TCC Retailer Register           preferred Retailer who is to be charged tolls and fees
                                              associated with the Authorised User’s NEL travel (by
                                              date range)




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                        Page 6
              Term                                    Definition
                                                      The TCC register of Authorised Vehicles (by License
                                                      Plate Number / Vehicle ID) and vehicle owner, noting
              TCC Vehicle Register                    that this register may need to split due to the
                                                      temporal nature of ownership details and the
                                                      associated privacy implications.
                                                      The amount charged for use of the road for a class
              Toll Charge
                                                      and trip on NEL as per the Tolling Agreement
                                                      The NEL Tolling Agreement (Deed) that sets out the
                                                      terms on which STC may fix and collect tolls and
              Tolling Agreement
                                                      fees for use of the Tollway (or part of it) for the
                                                      passage of vehicles.
                                                      The Tolling Enabling Infrastructure (TEI) is
                                                      comprised of the civil, electrical, communications
              Tolling Enabling Infrastructure (TEI)
                                                      and supporting elements that the Central Package
                                                      PPP Consortia will design, construct and maintain.
                                                      The interface deed to be executed between
              Tolling Interface Deed (TID)            applicable TCC Contractors, STC and the NEL
                                                      Project Co
                                                      The group that administers that Australian Tolling
                                                      MoU, comprising of the representatives of the
                                                      companies that participate in the MoU and operate
              Tolling MoU Group
                                                      as Interoperable tolling entities. This group manages
                                                      the membership and participation in the MoU and
                                                      any interface or tolling issues that arise.
                                                      Vehicle-to-everything (V2X) is communication
                                                      between a vehicle and any entity that may affect, or
                                                      may be affected by, the vehicle. It is a vehicular
                                                      communication system that incorporates other more
              Vehicle to Everything (V2X)
                                                      specific types of communication as V2I (vehicle-to-
                                                      infrastructure), V2N (vehicle-to-network), V2V
                                                      (vehicle-to-vehicle), V2P (vehicle-to-pedestrian),
                                                      V2D (vehicle-to-device).
                                                      The current vehicle classes as defined for NEL in the
                                                      Tolling Agreement are as follows:
                                                       • Motor Cycle - a two-wheeled Motor Vehicle (and
                                                         includes such a Motor Vehicle even if it has a
                                                         trailer, fore car or side car attached)
                                                       • Car – a Motor Vehicle, other than a Motor Cycle
                                                         or a Commercial Vehicle (even if such a Motor
                                                         Vehicle is towing a trailer or caravan).
                                                       • Light Commercial Vehicle (LCV) – a Motor
              Vehicle Class                              Vehicle that is a two-axle rigid Truck, having a
                                                         gross vehicle mass that does not exceed 4.5
                                                         tonnes.
                                                       • Heavy Commercial Vehicle (HCV) – a Motor
                                                         Vehicle that is
                                                                   o    a rigid Truck with three or more
                                                                        axles;
                                                                   o    an articulated Truck;
                                                                   o    a Bus; or




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                              Page 7
              Term                               Definition
                                                              o    a two axle rigid Truck having a
                                                                   gross vehicle mass greater than
                                                                   4.5 tonnes,
                                                              o    but does not include a High
                                                                   Productivity Freight Vehicle.
                                                  • High Productivity Freight Vehicle (HPFV) means a
                                                    Motor Vehicle that is:
                                                              o    a rigid Truck with more than three
                                                                   axles;
                                                              o    an articulated Truck;
                                                              o    a Bus; or
                                                              o    a two axle rigid Truck having a
                                                                   gross vehicle mass which exceeds
                                                                   4.5 tonnes, and which has a total
                                                                   length equal to or greater than 26
                                                                   metres.
                                                 Fees that are currently levied by Interoperability
                                                 Retailers for toll road trips by account-based
              Video Matching Fee
                                                 customers without a valid tag being detected in the
                                                 vehicle

            Table 1: Key Terms and Definitions




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                        Page 8
            2. TCC CONOPS CONTEXT

            2.1. STC vision
            STC’s vision is:

               A commercially orientated Government owned toll road owner and manager that supports
               DTP’s wider network vision of simple, connected, accessible, reliable and safe journeys.
                STC’s vision describes an aspiration future-state for the Victorian transport system that
               aligns with the direction of the DTP and TIA. It focuses on developing key elements of the
             system – such as simplicity, connection, etc. – for which STC has greater control and license
               to influence in its role as a toll road owner-operator and a key stakeholder to the State in
                                                       transport policy.


            2.2. STC purpose
            STC’s purpose is:

             Protect and enhance the value and legacy of the North East Link Project while exploring ways
                        to unlock shared value with the State using our specialist capabilities
              STC's purpose describes what we exist to do. By contributing to the value and legacy of the
              North East Link Project, we support DTP’s purpose of creating simple, safe, and connected
                                                      journeys.


            2.3. STC values
            STC acknowledge and abide by the Victorian Public Sector core values, from the Public Administration Act 2004
            (PAA). STC has adopted four key values, illustrated in Figure 1.




            Figure 1: STC Values


            2.4. TCC Project Objectives & Guiding Principles

            Objectives of the TCC Project
            The agreed objectives of the toll collection services for the TCC Project are to deliver:
                 •    Flexibility: Maintain flexibility in the operational structure of STC’s toll collection capability to
                      allow for changes that may occur between now and the required operational date
                 •    Entity Agnostic: Ensure the structure can be operated by different entities (including the
                      State, an existing service provider or another external party)




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                              Page 9
                 •    Max Net Revenue: Maximise the collection of tolling revenue, while minimising whole-of-life
                      operational and capital expenditure
                 •    Program: On time, under-budget, and seamless delivery of the full end to end tolling solution,
                      including the Tolling Enabling Infrastructure (TEI), provided by Project Co
                 •    NEL Road User Experience: Ensure the payment of tolls and interaction with STC is simple
                      and convenient, recognising the current toll payment mechanisms available in the market
                 •    Social Licence: Earn, grow, and protect STC’s social licence to operate.
            Guiding Principles of the TCC Project
                 •    Protect Future Options: The selection of a specific option shall not preclude other feasible
                      alternate options being implemented in the future. For example, flexibility to expand to include
                      retail options or other tolling scenarios in line with the needs of the State.
                 •    Minimise Delivery & Operational Risk: Minimise delivery and operational risk with proven
                      robust technology and business practices and positive relationships. The TCC solution is not
                      expected to include new or unproven technologies or solutions
                 •    Future Proof: Ensure that the TCC provides flexibility for future State applications, and to
                      accommodate advances in technology
                 •    Preserve Future Applications for STC: Maximise the opportunity for scalability across other
                      tolling arrangements the State may wish to establish in the future and provide the opportunity
                      for the State to use STC’s capabilities to drive innovation and change in the toll-road sector.

            2.5. Project Overview
            Overall program based on 3 year planning and procurement phase (2022-2026) and 3 year delivery
            phase (2025-2028). The project will be delivered following Victorian government’s, Department of
            Treasury and Finance (DTF), High Value High Risk (HVHR) governance processes.

            Key Assumptions:
                 •    STC procures, delivers and operates the Toll Collection Capability
                 •    STC will not be a Tag issuer or major toll account retailer and will leverage the market already
                      dominated by Interoperability Retailers
                 •    STC will ensure that a suitable solution is available for casual NEL Road Users (with casual
                      use products being available before and after travel, and post-paid trip invoicing for No
                      Arrangement Travel which will be aligned with Victorian Government legislative requirements)
                 •    STC will retain flexibility to accommodate an evolving market for retail, technology, customer
                      expectations, and payment options. The procured TCC BOS solution may have existing
                      defined products and customer operations functionality, such as retail tag and video account
                      management, as built in the solution that could be activated for STC at a later date.
                 •    The TCC selection criteria will include consideration of the TCC solutions ability to
                      accommodate emerging tolling technologies, commercial arrangements, future toll roads and
                      revenue opportunities – but not at the expense of NEL delivery outcomes and timeframes.
                      STC must have a reliable revenue collection system ready for the opening of the toll road
                 •    Road User Charging (RUC) is explicitly excluded from the TCC scope.
                 •    STC project governance and DTF HVHR framework applies to the TCC procurement process
                 •    Project Co (Spark) will design, build and maintain the Tolling Enabling Infrastructure (TEI).
                      The successful TCC Roadside Systems (RSS) contractor will be required to provide a
                      solution that interfaces with the TEI. The TEI requirements have been specified based on a
                      single gantry structure spanning the entire width of the carriageway with sufficient access for
                      maintenance (without impeding traffic flow), and connections to tolling cabinets for power and




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                         Page 10
                      network communications (full details are provided in the extract of Part H21 of the PSDR).
                      The TCC contractor will also be required to accede to the Tolling Interface Deed alongside
                      STC and Project Co under a tripartite arrangement. The Tolling Interface Deed defines the
                      necessary and important interface controls between the successful TCC and the TEI
                 •    The TCC RSS contractor will be required to design, manufacture, install and maintain the
                      gantry structure that will be installed on the footings provided in the TEI.
                 •    TCC delivery is planned to be ready prior to the completion of the road to reduce the delivery
                      risk and enable a readiness program for STC operations and the solution must be capable of
                      being deployed as soon as possible once the NEL is ready for the RSS to be deployed
                      successfully.
                 •    The TCC must allow for STC to operate it internally or outsource independent functions as
                      required (e.g. image processing, call centre, debt collection, etc.).
            Program & Approach
            The TCC is currently planned to be procured and delivered generally in line with the following
            program, subject to final government approvals:
              Program                                                       Date
              Market Sounding                                               2022 – 2023 (Q4 2022 to Q1 2023) - Completed
              EOI RSS release                                               Q4 2023 - Completed
              EOI RSS Shortlist announced                                   Q2 2024 - Completed
              EOI BOS release                                               Q4 2024
              EOI BOS Shortlist announced                                   Q1 2025
              RFP RSS release                                               Q3 2024 - Completed
              RFP BOS release                                               Q2 2025
              RSS Contract Award                                            Q2 2025
              BOS Contract Award                                            Q2 2026
              TCC Operational Readiness                                     mid 2028

            Table 2: TCC Program

            Operating models, technology solution, contractual framework for delivery and operating phases will
            be further refined after the EOI phase prior to being defined in the RFT.

            2.6. Key Constraints
            The following table details key constraints that have been applied to the development of the TCC
            Concept of Operations
              Constraint                    Constraint or Assumption Description               Source / Origin
                                            Customers who have valid arrangements in
                                            place with existing Interoperability Retailers
                                            must be able to use NEL without the need to        NEL Tolling Agreement, MOU and
              Interoperability
                                            establish another tolling account for their use    NEL Act
                                            of NEL. The NEL road must be an
                                            interoperable toll road.
                                            No changes to the current Victorian toll
              Vehicle Class                 classification basis are to be applied (with the   Tolling Agreement
                                            exception of the introduction of a HPFV class).




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                                Page 11
              Constraint                    Constraint or Assumption Description                 Source / Origin
                                            Tolling Enabling Infrastructure will be as
                                            governed by Central Package Project Deed
                                            (including the Development Phase Milestones)         PP Project Deed and Tolling
              Spark Interface
                                            and Tolling Interface Deed. The Tolling              Interface Deed
                                            Interface needs to be developed and locked
                                            down as early as possible.
                                            STC will seek membership with the Tolling
                                            MOU Group and collaborate with this group.           Tolling Agreement –
              MOU Group Interface
                                            Roaming Agreements will be required with             Interoperability
                                            each Interoperability Retailer.
                                            Tolling topology has been finalised and may
                                            not be amended. A single physical gantry
                                                                                                 Central Package Project Scope &
              Tolling Topology              detection will be available for each vehicle trip.
                                                                                                 Delivery Requirements Part H21
                                            Each detection will allow the entry/exit
                                            combination to be derived.
                                            The NEL Act and Tolling Agreement provide
                                            for toll collection, toll notices and enforcement
                                            that will be applied to the future STC TCC.          Victorian State Legislation, NEL
              Legislation
                                            Note that electronic issue of toll notices is        Act and Tolling Agreement
                                            assumed to be supported by the legislation
                                            prior to NEL opening.
                                                                                                  Operational Readiness Plans will
              Operational
                                            TCC Operational Readiness date is Mid 2028.          be developed further during the
              Readiness
                                                                                                 Project Delivery phase.

            Table 3. Key Constraints




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                                     Page 12
            3. ROLES AND RESPONSIBILITIES (ACTORS)
            The TCC comprises a set of human, organisational and system actors as illustrated at the high level
            in the context diagram Figure 2 and further described in Table 4. The role of each of these key actors
            is described in the ConOps Scenarios that follow.




            Figure 2. TCC Roles and Responsibilities (Actors)


            3.1. Key Stakeholders and Actors
            Table 4 provides more details on each of the stakeholders, actors and their roles.
              #     Actor                                 Actor Role
              1     NEL Road User                         The driver of a vehicle that undertakes a trip on NEL
              2     Passage Detection                     System function of the RSS to detect the vehicle
                    Trip Construction Classification
              3                                           System function to build, classify and rate the trip
                    and Rating
              4     Trip Routing                          System function to determine which entity to bill for the trip charge
                                                          The MOU party entity responsible for toll collection and customer
              5     Interoperable Retailer
                                                          management
              6     Commercial Back Office                Systems and processes to support customer interactions
                                                          All functions provided by STC, may include NEL Road User
                                                          communications, Interoperable Retailer Management, TCC
                                                          maintenance and support, Cyber Security and TCC IT Network
              7     STC
                                                          Infrastructure – noting that the future business model may allow for
                                                          some/all of these functions to be outsourced. STC funds the TCC
                                                          and NEL road.
                                                          Responsible for the design, delivery and operation and maintenance
              8     TCC Contractors
                                                          of the TCC




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                                  Page 13
              #     Actor                                 Actor Role
                                                          The register mapping NEL Road Users to Retailers so that the correct
              9     TCC Retailer Register                 Retailer can be notified of the trip to be charged to the customer, and
                                                          STC is able to reconcile toll revenue.
                                                          The mechanism used to transfer funds from NEL Road Users to the
              10    Payment Gateway
                                                          Retailer or STC in the event of NAT
                    Department of Justice &               The agency responsible for issue of penalty notices and subsequent
              11
                    Community Safety                      enforcement action if applicable
                    Department of Treasury &              DTF responsible to administer the HVHR process and ensure STC is
              12
                    Finance                               adequately funded
                                                          DTP responsible for network traffic management, vehicle registration
                    Department of Transport and           and licensing (to provide STC with the applicable vehicle class and
              13
                    Planning                              owner details associated with LPN), commercial management of STC
                                                          (in Operations Phase)
                    NEL Program (part of Major            Delegated responsibility from STC to manage the delivery of the NEL
              14
                    Roads Project Vic)                    road and Projects

                    SPARK                                 Responsible for design, construction and maintenance of the Tolling
              15                                          Enabling Infrastructure, and the PPP operating and maintaining the
                    (Project Co)                          NEL road.
                                                          Responsible for the provision and maintenance of the MOU toll road
              16    TfNSW (Interoperability Hub)
                                                          interoperability gateway

            Table 4. TCC Roles and Responsibilities (Actors)




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                                    Page 14
            4. Customer operations and support Scenarios

            4.1. ConOps Scenarios and Variations
            The below summary table outlines the broad NEL Road User and Customer Support scenarios that
            STC will need to support and execute on a continual basis to collect Tolls on NEL.
              Scenario      Title                    Description                             Variations
                                                                                             Casual Interoperable Customer
                                                                                             Interoperable Video Account
                                                     A customer of an interoperable          Customer
                            Existing Interoperable
              1                                      tolling retailer makes use of NEL,
                            Tag or Video Customer                                            Suspended Customer/ Invalid
                                                     with inter-operability supported.
                                                                                             Account/LPN not on Account



                            Road User Account                                                Casual (one-time) NEL Road User
              2                                      First time traveller on NEL.
                            (Updated After Travel)                                           Interstate Vehicle
                                                                                             No STC records
                            No arrangement travel    Vehicle travels, with no identifiable
              3                                                                              Cash Payment
                            (NAT)                    payment mechanism
                                                                                             No Vehicle Registration Record
                                                     Vehicle travels and is exempt from
              4             Exempt Vehicle Travel
                                                     tolls
              5             Customer Management      Direct customer contact to STC
                                                     Customers are impacted by
                            Duplicate Charging
              6                                      incorrect charging from a STC
                            Error
                                                     TCC system failure
              7             Exception handling       Retailer dispute management
                            Stopped Traffic          Revenue leakage due to traffic
              8
                            Revenue Leakage          being congested on NEL
                            Tolling Performance &    STC management and reporting
              9
                            Reporting                requirements
                            Passage to Receipt       TCC data warehouse and data
                            Performance –            analytics to support STC revenue
              10
                            “Detection to            and business process monitoring
                            Collection”              and reporting
                                                     On review of Detection to
                            Revenue Leakage
              11                                     Collection reports a revenue
                            Investigation
                                                     leakage situation is investigated
                                                     There is a requirement for maintenance and support of the TCC, with this
                            Maintenance and          scenario to be developed once the business model for the TCC is further
              9                                      defined.
                            operations


            Table 5. ConOps Scenarios




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                                Page 15
            4.2. Scenario 1: Existing Interoperable Toll Account Customer

            Primary scenario
                      1. Road User Travel
            Mark Thompson is transporting goods in his truck from Sydney to a business in Melbourne’s south
            eastern suburbs. Mark has an E-Toll account and his vehicle is fitted with an E-Toll tag. Mark’s E-Toll
            account is active and setup with automatic payments. Mark travels on NEL and when passing through
            a NEL toll point Mark hears a single beep from his E-Toll tag. Mark continues on his journey to his
            destination knowing that his trip on NEL will be charged to his E-Toll account.
            Later when Mark views his E-Toll account he can see the charge for his trip on NEL.
                      2. Passage Detected
            As Mark’s truck enters the tollway, the STC TCC detects and identifies his entry using the tag
            provided by E-Toll.
            The STC TCC records the details of Mark’s passage (his tag and vehicle) with sufficient detail to be
            able to satisfy the legal evidence requirements while ensuring that only a single passage and trip
            record is recorded (no duplicates).
                      3. Trip Constructed, Classified and Rated
            The STC TCC completes a calculation of the trip completed by the vehicle, confirms the vehicle
            classification via its LPN (using a lookup process) and with reference to STC TCC’s records of the
            vehicle (tag) calculates the toll applicable to his journey.
                      4. Trip Routed
            Based upon the detection of the unique identifier (eTag identifier), STC TCC is able to consult an
            interoperability register and identify the applicable retailer account to be charged for the trip. STC
            submits a payment claim that includes the relevant details including the Toll and Fees applicable to
            Mark’s trip.
                      5. Account charged and Settled with STC
            The interoperability retailer confirms that Mark’s account is in order and accepts the charges on behalf
            of its customer. As Mark’s retailer is interoperable the daily Australian MoU batch process is utilised
            and Mark’s account is updated some time later with the charges as determined by the retailer.
            The retailer remits the Toll and Fees owing for Mark’s trip, less any fee due to the Retailer (Discount
            Amount) with STC reconciling this leveraging the MOU framework that both parties have signed up to.
                      6. Customer Enquiry
            When Mark gets his next statement from his tolling retailer, he notes that there is a problem with the
            toll charged. He calls / emails / contacts his retailer to resolve the issue – the Retailer action taken is
            independent of any outstanding issues with STC
            Scenario Specific Assumptions
                 •    Customer has a pre-existing current toll tag account with an Interoperable Retailer.
                 •    The TCC Interoperable Retailer Register has a commencement and expiry date, allowing for
                      ‘back dating of effective date.
                 •    The Foreign Toll Operator ‘Hub’ or gateway will continue to be used to manage Interoperable
                      Retailer arrangements (Black and white lists’).




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                          Page 16
            Figure 3. Existing Interoperable Toll Account Customer


            TCC Supported Variations
            Table 6 below outlines variations of Scenario 1 that will be supported by the TCC.
              #   Variation            Impact + Issues                                 Operational Needs
                  Casual
                                       No change, customer is identified as
              1   Interoperable                                                        LPN readers (ANPR)
                                       customer of the interoperability retailer
                  Customer
                                       No process change – noting that fee             Image processing capability (OCR, finger
                                       payment for video matching may apply            printing))
                  Video Account
              2                        The interoperability file submission and        Mechanism to apply additional fees based
                  Customer
                                       response file process differs for video         upon method of passage detection and
                                       based and tag based transactions.               identification
                                                                                       The TCC must be able to hold a trip and
                  Interoperable                                                        check in a configured number of days time
                                       The TCC must be able to hold trips for a
                  Customer                                                             to see if an account / payment method has
              3                        configured period to enable road users to
                  Registers after                                                      been established. MOU guidelines apply
                                       sign up for arrangements post travel.
                  travel                                                               before subsequent NAT processing should
                                                                                       commence for unknown users.
                  Interoperable        No change, customer and vehicle fleet are       The nature of the customer relationship
              4   Business             identified as customer of an Interoperability   with the Interoperability Retailer is
                  Customer             Retailer                                        independent of the TCC capability.

                                       Mark’s account failed to maintain a             No new requirements, this risk and issue is
                                       suitable balance (Retailer requirements),       treated as a Retailer risk and issue. STC
                                       and the Retailer notifies the STC TCC of        seeks to recover the toll notice admin fees
                                       the end of his payment arrangement.             and tolls. Where an Interoperable Retailer
                                                                                       rejects a payment request the transaction
                  Suspended            Mark receives a toll notice, contacts his       must be able to be reprocessed by the
                  Customer/            retailer, and looks to pay only the toll (not   system.
              5   Invalid              the additional fees)
                  Account/LPN                                                          However, a set of business rules will be
                  not on Account       The Retailer re-activates his account,          required that provide for new payment
                                       updating the TCC Retailer Register with an      mechanisms that are back dated / date
                                       effective date prior to his date of travel.     windows so that NAT is avoided if possible
                                       The Retailer remits the toll and NAT Fees       There is also a requirement for the TCC to
                                       to STC                                          perform sweeps of NAT, build in
                                                                                       configurable delays before initiating a toll




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                                      Page 17
                                                                             notice in the case of a Retailer backdated
                                                                             notice of a payment arrangement.
                                                                             Where a customer has received a valid toll
                                                                             notice and wishes to later transfer the
                                                                             value to an interoperable account the TCC
                                                                             must allow for this as a Manual Debit
                                                                             process in accordance with the MOU.

            Table 6. Scenario 1 TCC supported variations


            4.3. Scenario 2: Road User account updated after travel

            Primary scenario
                      1. NEL Road User Travels
            David Anderson is travelling from Balwyn to Macleod. David has a Linkt account however his vehicle
            is being repaired and he is using a loan vehicle.
                      2. Passage Detected
            As David’s car enters the tollway, the STC TCC detects and identifies his vehicle.
            The STC TCC records and stores the details of David’s trip (that of his vehicle) with sufficient detail to
            be able to satisfy the legal evidence requirements and establish the vehicle class.
                      3. Trip Constructed, Classified and Rated
            The STC TCC determines the vehicle class and completes a calculation of the trip completed by the
            vehicle and calculates the toll applicable to his journey.
                      4. Trip Routed
            The STC TCC looks up the tolling account register(s) and finds that the LPN is not registered with a
            payment method. The STC TCC flags/stores the trip for review periodically and for several days after
            the travel date as configured in the TCC system.
            When David arrives at work (after travelling on NEL), he adds his LPN of his vehicle to his account
            and receives verification. His account retailer adds his details to the TCC register of authorised road
            users (assuming back dated travel is allowed).
            When the STC TCC next consults the TCC Arrangement Register, David has added his LPN to his
            preferred retailer, and the STC TCC is able to locate David’s account to be charged for the trip.
                 5&6. Account charged
            STC charges the applicable retailer for the trip (including any applicable administration fees) and
            passes the trip details to the retailer for settlement. David’s preferred retailer updates his account in
            accordance with the Retailer’s standard of service.
            Account charged and Settled with STC as for Scenario 1
                 7. Customer Enquiry
            [As for Scenario 1]
            Scenario Specific Assumptions
                 •    Customer is an existing Interoperability Retailer account holder in good standing.




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                          Page 18
            Figure 4. First Time Traveller, Account Opened after Travel


            TCC Supported Variations
            Table 7 below outlines variations of Scenario 2 that will be supported by the TCC.
              #     Variation                       Impact + Issues                   Operational Needs
                    Casual (One-time) NEL
                                                    The TCC Retailer Register
                    Road User
                                                    must allow the utility provider
                    David decides to                to activate and de-activate an    Add vehicles for defined windows to the
                    authorise his chosen            Interoperable Customer.           TCC register – implement start/end times for
              1     retailer just this one travel                                     validity.
                                                    The TCC Retailer Register
                    date, wanting to see what
                                                    must allow authorisation to be
                    the costs are before
                                                    set for a defined period of
                    deciding what to do for
                                                    time.
                    future trips.
                                                    Implications limited to dealing
                                                    with interstate LPNs and
                                                                                      TCC must be able to recognise interstate
                                                    engaging interstate agencies
                                                                                      LPNs
                                                    to locate registered vehicle
              2     Interstate Vehicle              owner details for NAT             TCC must be able to consult interstate
                                                                                      registries to determine vehicle class and
                                                    Toll Notices are issued under
                                                                                      owner contact details
                                                    Victorian Law, as is any
                                                    enforcement action.

            Table 7. Scenario 2 TCC supported variations


            4.4. Scenario 3: No Arrangement Travel

            Primary Scenario
                      1. Road User Travels
            Emily Carter is travelling from Nunawading to Campbellfield and uses the NEL. Emily’s vehicle is
            registered in Victoria but is not linked to a tolling account and she has not purchased a Casual Use
            Product. Several days after travelling on NEL Emily receives a Toll Notice for the unpaid travel on
            NEL.




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                                     Page 19
                      2. Passage Detected
            Emily’s car is detected by the TCC on her travel on the NEL.
                      3. Trip Constructed, Classified and Rated
            As for Scenario 1
                      4. Trip Routed
            TCC is unable to locate Emily’s car on the TCC Retailer Register, and the LPN is assigned as No
            Arrangement Travel. A configured number of days later when a search for Emily’s LPN is conducted,
            no valid arrangement can be located.
            The TCC generates toll notices and manages an escalating cycle of notices and fees in an attempt to
            recover the unpaid tolls.
                      5. Issue Toll Notice
            Emily receives her toll notice (In the post or electronically via email or SMS if they have been provided
            from the registry) and she makes payment as shown on the notice.
                      6. Customer queries charge
            In the event that Emily does not pay, and the issue proceeds to debt recovery the TCC is able to
            generate a court file of enforceable evidence that can prove the trip was taken, and that it was Emily’s
            vehicle. At this stage, it is expected that this evidence pack will include a date/time stamped image
            with chain of custody requirements met (alternate electronic evidence may be applicable at the time of
            TCC operation). The ability of the TCC to accurately identify each vehicle LPN and record that trip
            correctly is critical.
            Scenario Specific Assumptions
                 •    No arrangement established
                 •    Once-off travel, no pattern of use
                 •    STC will require the ability to choose to refer to an external Debt Collection Agency or take
                      enforcement action (in line with the legislative provisions).




            Figure 5. No Arrangement Travel

            No Arrangement Travel Process Flow




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                        Page 20
            Figure 6 below outlines the parties involved in the No Arrangement Travel process and the types of
            interaction that they perform.




            Figure 6. No Arrangement Travel process


            TCC Supported Variations
              #    Variation                Impact + Issues                       Operational Needs
                                            STC must contact the applicable
                                            state registration authority and      State of registration determined via video tolling
                                            request the contact details for the   equipment.
                                            vehicle owner (if it does not         A business rule must be established to
              1    No STC records           already have a “current” record for   managing ageing vehicle owner details.
                                            that vehicle).
                                                                                  Privacy implications of owner details are to be
                                            Also applies where the owner          managed by the TCC.
                                            details are ‘aged’.
                                            The following options are
                                            available to meet this need:
                                             • STC establishes a retail front
                                               office
                                             • STC establishes an
                                               arrangement with an existing       TCC provides cash payment option (direct or
              2    Cash Payment
                                               provider to allow cash payment     via commercial arrangement).
                                               of tolls (AusPost for example)
                                             • STC ensures that at least one
                                               of its Authorised Retailers
                                               provides a cash payment
                                               option
                                                                                  The TCC should allow an exception process to
                                            If the vehicle registration agency    review rejections (or non-returns) from the
                   No Vehicle               cannot provide the identity of the    vehicle registration agency.
              3    registration             owner the TCC cannot determine        Trip LPN details found to be incorrect should be
                   Record                   who to invoice and may result in      able to be re-validated and corrected and
                                            lost revenue.                         resubmitted for reprocessing according to
                                                                                  business rules.

            Table 8. Scenario 3 TCC supported variations


            4.5. Scenario 4: Exempt Vehicle Travel
                      1. Road User Travels
            Ambulance Victoria is responding to an emergency incident in the northern suburbs. The Ambulance
            Victoria Dispatcher plots the fastest route to the location of the emergency incident which includes
            using the NEL toll road. The route is sent to the Paramedics responding to the incident.


            As the Ambulance is registered on the CityLink Exempt vehicle list no toll charge is applied for the trip
            on NEL.




OFFICIAL SENSITIVE
North East Link State Tolling Corporation
Concept of Operations
                                                                                                                                       Page 21
                      1. Passage Detected
            The Ambulance is detected by the TCC on its travel on the NEL.
                      2. Trip Constructed, Classified and Rated
            As for Scenario 1
                      3. Trip Routed
            TCC is able to find the Ambulance vehicle details in the Exempt Vehicle Register. As the vehicle is a
            valid exempt vehicle the TCC marks the trip as toll exempt and ceases processing




            Figure 7. Exempt Vehicle Travel




            4.6. Scenario 5: Customer Management
            Customer Contact
            Alex Turner calls the NEL call centre to check whether the Casual Use Product they purchased is still
            valid.
            Identification and Verification Check
            Sara

[... content truncated at 80,000 characters ...]

---
