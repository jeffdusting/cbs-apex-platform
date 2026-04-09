---
entity: cbs-group
category: tender
title: "CBS Group — Downer Alternate Funding Proposal (Energy Savings Scheme) — Revised FE04 HVAC Software Proposal - Extract..."
---

> **Parent document:** CBS Group — Downer Alternate Funding Proposal (Energy Savings Scheme)
> **Entity:** CBS Group, a technical advisory firm specialising in infrastructure asset management, systems engineering, and tolling
> **Category:** tender submission and procurement documentation
> **Total sections in parent:** 165
>
> This is a sub-document extracted from the parent for retrieval optimisation.
> The parent document contains the complete collection; this section is independently
> retrievable for targeted queries.

## Revised FE04 HVAC Software Proposal - Extract.pdf

*File: `Revised FE04 HVAC Software Proposal - Extract.pdf`*

1               FE04 –Software Energy Efficiency HVAC (SEE HVAC)
1.1             Executive Summary
The train’s Climate Control System (CCS) plays one of the most significant roles in influencing customer
and crew comfort. The current HVAC units on the Waratah train have been proven in service for more
than 10 years for both sound performance and reliability. However, energy used to operate the Heating,
Ventilation, and Air Conditioning (HVAC) system is a significant factor in the operational cost of revenue
service trains. Reducing energy consumption has been identified as a critical opportunity within this Fleet
Enhancement.
Downer, together with Sigma, have reviewed the operation of the HVAC seeking to reduce energy
consumption of the system. Revenue service data logs were analysed and opportunities to save energy
were identified. In this proposal, Software Energy Efficiency HVAC (SEE HVAC) enhancements have
been identified that reduce energy consumption without significantly impacting passenger and crew
comfort. Hardware Energy Efficiency HVAC (HEE HVAC) Enhancements have been proposed separate
to this document.
These SEE HVAC enhancements include:
§     Duct heater optimisation: Relaxing the set-point control for passenger saloon duct heaters, and
      minimising their usage particularly during warmer temperatures;
§     HVAC setback mode: Enabling the HVAC to significantly relax temperature set points while the
      train is powered and not attended. Further opportunities to save energy during this period are
      identified in Section 3.
Simulations and calculations were developed to predict quantitatively the energy saved from these
enhancements. Based on these predictions, typical operational conditions, 15% energy savings could be
realised across the fleet.

1.2             Scope
This proposal outlines the program of work to complete the design and verification of the SEE HVAC
design. Downer will:
§     Prepare the software specification;
§     Provide updated HVAC software to allow proposed enhancements to be trialled with configurable
      parameters;
§     Provide updated eTIS software allowing the HVAC setback mode to be trialled;
§     Provide formal Engineering Change Request (ECR) documentation to install software temporarily for
      in-service trial in accordance with the SGT Configuration Management Plan;
§     Prepare and undertake tests and trial for the two distinct enhancements to verify the updates:
      §   Achieve energy savings;
      §   Maintain customer and crew expectations for heating and cooling performance;
      §   Maintain technical performance;
§     Implement the HVAC software on the SGT fleet.

1.3             Energy Savings
The enhancement technical and operational benefits realise the energy saving benefits as below.




© Downer 2020                                                                             Commercial in Confidence
Table 1: Energy Saving Benefits

                                                                               Energy of the SGT/
    HVAC Enhancement                             Energy per HVAC / year1
                                                                               Waratah Fleet2/ year

    Current HVAC Unit – (Simulation Total)              (86.7 MWh)3                    (165 GWh)
    Duct Heater Optimisation – Energy
                                                          7.9 MWh                       15.2 GWh
    Saving4
    HVAC Setback Mode – Energy Saving                     5.5 MWh                       9.5 GWh5
    Total Energy Savings – Energy Saving                  13 MWh                       25.5 GWh
Key assumptions on the fleet energy saving predictions include:

§     Simulation total is based on average climatic data for Sydney region and does not consider
      variations between the city and western suburbs;
§     The model does not include pull-down, it assumed that the train is at the correct operating
      temperature at the start of service;
§     Passenger loads are from existing operational data but in practice will vary between trains.




1
  HVAC operating 24 hours per day, 7 days a week
2
  1904 HVAC Units across 78 A-Sets and 41 B-Sets
3
  Refer to FE04 HVAC Hardware Proposal, Appendix A – Sigma Software Upgrade Change Proposal
4
  Refer to Appendix A – Sigma Software Upgrade Change Proposal for the calculations for enhancement savings
5
  Annual energy saving based on Setback mode where duct heats are switched off for 5 hours


© Downer 2020                                                                              Commercial in Confidence
2               Technical Solution
2.1             Enhancement Objectives
The SEE HVAC is designed to seamlessly enhance the HVAC system, to achieve four key objectives:
1. The SEE HVAC solution can be implemented to Waratah and SGT with no change to the hardware
   configuration;
2. The energy savings can be proven quantitively via measuring on the Set;
3. There is no significant impact to customer and crew expectations for heating and cooling
   performance;
4. The design improves or has no-impact to the HVAC reliability.
Downer is proposing two software enhancements that can be implemented with no change to the
hardware design. They include:
§     Duct heater optimisation: Relaxing the set-point control for passenger saloon duct heaters, and
      minimising their usage particularly during warmer temperatures;
§     HVAC setback mode: Enabling the HVAC to significantly relax temperature set points while the
      train is powered and not attended.

2.2             Description of Enhancement
2.2.1           Duct Heater Optimisation
Each saloon area of the car has duct heaters used to balance the temperatures between each area
(Upper Saloon, Lower Saloon, Vestibules). This ensures the difference in temperatures between areas is
not significant. The intensity of each duct heater is controlled using continuously variable Pulse Width
Modulation (PWM) 0% to 100%. If the temperature between each area differs from another by more than
0.1°C, the HVAC control system will begin adjusting the heating intensity of the duct heaters to balance
the saloon temperatures, where the heater intensity is based on the difference between desired
temperature and rate of change in temperature.
Since the temperature between areas is rarely the same, the consequence for this strict control algorithm
means that even when operating in warm ambient temperatures, duct heaters operate frequently to
balance the temperatures, contributing to the energy consumed by the duct heaters and the energy
required to cool the air on the train.
Downer proposes the duct heater control algorithm is modified. An example of the modification proposed
is as follows:
§     Relax the duct heating control setpoint from 0.1°C to 1.0°C i.e. duct heaters will not attempt to
      balance the temperature unless the temperatures differ by 1.0°C or more;
§     Disable duct heaters if the outdoor temperature exceeds 30°C.

    Software Update      Description of update             Impact of update
                                                           + Significantly reduce overall duct heater
                                                           power consumption
                         Modify the duct heater control    + Reduce power required to cool saloon air
    Duct Heater          algorithm for temperature
    Optimisation         balancing during normal           - Slight increase in temperature difference
                         operation                         between passenger areas
                                                           o No impact to the average saloon temperature
                                                           and passenger comfort



© Downer 2020                                                                               Commercial in Confidence
2.2.2           HVAC Setback Mode
In current operation – to allow immediate return to service particularly between timetable peaks and
when the full fleet is not required – Sets are left powered when not in-service and not attended. When
the train is not powered down or ‘stabled’, HVAC is left running to regulate the cab and saloon
environment to meet minimum operating specifications as if passengers and crew were onboard. Since
nobody is onboard to benefit from the conditioned air, energy is wasted to maintain temperature. The
Waratah and SGT Sets already meet strict temperature requirements to pull up or down the temperature
within a short period to ensure comfort is provided by the time the train enters service, therefore there is
no need to maintain ideal temperatures when the train isn’t in use.
Downer proposes that the HVAC software is updated to feature an ‘HVAC Setback Mode’ that will be
self-initiated if crew have not signed in for 20 minutes (or other configurable time). This will be after crew
have removed their keys. In HVAC Setback Mode, saving energy will be achieved by:
§     Disabling duct heaters;
§     Adjusting the passenger saloon and Crew Cab set point temperature to be between 10°C and 30°C
      where the HVAC will remain in ventilation mode; i.e.:
     §    If outdoor temperature falls below 10°C, HVAC shall regulate to 10°C;
     §    If temperature rises above 30°C HVAC will regulate to 30°C;
§     TDC Cab end HVAC to continue operating in default mode to maintain equipment temperatures
      (similar to Nightsafe mode).
eTIS software shall be updated to provide an output to the HVAC PLC to indicate when the driver and
guard is not signed in and when the train is not set to Presentation Mode.

    Software Update      Description of update             Impact of update
                         HVAC Setback Mode is
                         activated after the driver has
    HVAC Setback         keyed out of the train. In this
                                                           + Reduce HVAC power consumption
    Mode                 mode, the HVAC will widen
                         setpoint temperatures and
                         disable duct heaters




© Downer 2020                                                                                Commercial in Confidence
2.3             Testing and Trials
The test phase has been planned to accelerate the implementation of the software on the SGT Sets.

2.3.1           Approval
Downer and Sigma will work with TfNSW and Sydney Trains to develop parameters and ensure changes
meet the system specification. With software prepared, the project will undertake static train tests. A
report of the static test results will be provided with an Impact Assessment as part of a formal ECR
additionally seeking approval to take the software to in-service trials.

2.3.2           Timeline
The duct heater optimisation and HVAC setback will follow separate test timelines. This will allow the
eTIS version implementation to not impact other trials and reduce risk to the overall project timeline.
Each in-service trial will be separately implemented on different sets over multiple phases allowing
individual benefits of each enhancement to be measured and prompt identification of any impact.
                              An outline of the SEE HVAC test plan is provided in




Figure 1.




                                         Figure 1: SEE HVAC Timeline

2.3.3           Test Descriptions
A description of each test and trial is provided in Table 4.
Table 2: Testing and trial descriptions
 Test                      Description
 Software Factory          Sigma and Downer with EKE will complete simulated software testing to within
 and Regression            the factory and ITF to ensure expected software functionality. The HVAC
 Test                      software test will include all enhancements.



© Downer 2020                                                                             Commercial in Confidence
 (Simulated)
 Static On-Train     Sigma and Downer will test completed software on the set. Initial temperature
 Type Test (1 Set)   measurements will be taken to ensure no significant impact prior to in-service
                     testing. The report from this test will be provided as evidence for in-service
                     approval.
 Parameter           Downer will seek approval for an in-service trial for the agreed parameters to be
 Change Trial        installed and trialled in service over a 4-week trial period. This will clarify the
 (1 Set per          impact of each enhancement and determine the optimal control parameters.
 enhancement)        Based on a test specification developed by Sigma, each enhancement will be
                     trialled on an individual set. Each parameter will be closely monitored to ensure
                     climate regulation remains within specification. Energy consumption will be
                     noted during this process for information. Parameters will be applied to the
                     HVAC on half the set allowing for a direct comparison to the baseline software
                     on the other half.
                     The Parameter Chance Trial will be conducted as follows:
                                  Parameter 1         Parameter 2
                      Week 1*     1.5°C               25°C
                      Week 2      1°C                 30°C
                      Week 3      0.5°C               35°C
                      Week 4      Rerun most promising parameters
                     *Preferred, highest energy saving parameter
                     No changes to the 20-minute inactive period unless operational issue identified
                     during the trial period.




© Downer 2020                                                                           Commercial in Confidence
3               Opportunities
3.1             Fresh Air Fan Control
The HVAC fresh air fan primary purpose is it to supply sufficient fresh air to the train interior, especially
when doors are closed. When the passenger doors open, conditioned air is pushed out of the train by
the static pressure generated by the fresh air fans pushing air into the moderately sealed saloon. The
static pressure equalises between the train interior and outside allowing fresh air to be introduced:
      § naturally through the passenger doors; and
      § by the fresh air fans.
When doors are then closed, the HVAC must consume energy to condition the air from both sources.
Downer proposes to reduce the speed of the fresh air fans for the passenger area when doors are open
to reduce the amount of fresh air that requires conditioning and reduce the energy consumption of the
fresh air fan. The fresh air fans will then return to normal operation after a short pre-defined period after
the doors are closed.
                Table 3: Potential enhancements considered during development of this proposal
      Proposed Update             Description of update                    Impact of update
    Fresh air fan control     Reduce speed of the fresh        + Reduce power consumption of fresh air
                              air fan for a period after       fans6
                              passenger doors are opened       + Reduce power required to condition
                                                               fresh air
During the development of this software enhancement Downer and Sigma identified some system
constraints which resulted in this enhancement not being able to be offered through a simple HVAC
software update. Downer will continue to investigate the feasibility of this enhancement, investigating
whether fresh air fan control can be implemented without major on set modifications.

3.2             Future Considerations
All equipment in the Climate Control System has been holistically reviewed for optimisation to realise the
energy saving. Further energy efficiency could be gained in other areas as outlined in Table 6 below.
                            Table 4: Potential enhancements for future considerations.
       Enhancement                Observation                     Consideration
    1 Drivers Cabin               Foot heater may be used         Foot heater operation can be operated
                                  when the cabin set point        against the cooling of the cabin air-
                                  temperature is set to cool      conditioning resulting in a waste of
                                                                  energy.
                                                                  Foot heaters could be disabled when the
                                                                  cabin setpoint requires the HVAC to cool,
                                                                  however this removes desirable control
                                                                  from the user.
    2 High End                    At ambient temperatures         When the ambient temperatures are
      Temperature                 between 35°C and 45°C the       between 35°C and 45°C, trial the HVAC to
      Control                     HVAC will consume energy        maintain the interior temperature between
                                  to maintain interior            26°C and 29°C instead to reduce effects


6
    Refer to Appendix A


© Downer 2020                                                                                 Commercial in Confidence
      Enhancement            Observation                        Consideration
                             temperature between 26°C           of thermal shock at high ambient
                             and 27°C                           temperatures.
 3 Train Level Low           Outside of peaks, while the        In addition to the HVAC Setback mode,
   Power Mode                train is left powered but not in   lighting and other system could be
   (Lighting)                use, systems are consuming         automatically turned off to save energy
                             power when not required.           when crew is not keyed in.
Additional investigations could be undertaken by Downer subject to further time and cost consideration.




© Downer 2020                                                                             Commercial in Confidence
4               Timeline
4.1             Table of Key Milestones
An approximate timeline of key milestones has been considered and outlined in Table 5 below. All dates
and timelines are provisional and will be confirmed in the next phase once the enhancements are
selected and the suppliers are formally agreed to meet the agreed delivery timeframe.
Table 5: Indicative timetable




© Downer 2020                                                                         Commercial in Confidence
© Downer 2020   Commercial in Confidence
FE04 HVAC Energy Efficiency – Software                        11
© Downer 2020                            Commercial in Confidence
Appendix D – Prototype Setback Mode Test
An informal test was performed at Auburn Maintenance Centre to demonstrate energy savings for the
Setback mode proposal.
In this test a set was fully powered set left in normal mode and parked simulating the current baseline.
The HVAC power consumed to-date was recorded to form a baseline followed by recordings every hour
after to monitor the energy being consumed in this static, ‘powered’ state.
The same test was performed with another Set, but in this test all HVAC units set to ventilation mode to
simulate the newly proposed set-back mode. The same baseline and hourly power consumption
recordings were taken in the ventilation mode.
The comparative results are shown below:
                           Table 6 Prototype Setback Mode Test Energy Saving Results

                           Average Energy Saved      Per Set (MWh)      Per Unit (MWh)
                           Per hour                       0.194               0.012
                           Per 5 hours                    0.970               0.061
                           Per year7                       354                 22
The energy savings demonstrated by this test are significantly higher than the predicted calculation.
However, this test didn’t fully simulate all seasonal scenarios, energy required to pull up or down the
temperature when the Set returns to service or maintaining the temperature between 10°C and 30°C.
While the predicted calculations are conservative, this test provides further evidence that significant
energy savings can be achieved from the implementation of this enhancement.




7
    Annual energy saving based on Setback mode where duct heats are switched off for 5 hours

FE04 HVAC Energy Efficiency – Software                                                                              12
© Downer 2020                                                                                  Commercial in Confidence
Appendix E – HVAC Logs Demonstrating Duct Heater Operation
The following image is a snapshot of HVAC data logs taken from N1824 (B24) on 4th January 2020
demonstrating duct heater operation during ambient temperatures of approximately 45°C. The numbers
in the duct heater column indicate the power level of the upper and lower deck heater heaters operating
at up to 100% power.




                                   Figure 2 Snapshot from N1824 HVAC data logs.




FE04 HVAC Energy Efficiency – Software                                                                      13
© Downer 2020                                                                          Commercial in Confidence
Glossary for Fleet Enhancement
 Term                                    Meaning
 A Set                                   Waratah Train Series 1; An alternative reference
                                         to Waratah Trains
 AIS                                     Asset Information System – can be used
                                         interchangeably with the MFAIS
 AMC                                     Auburn Maintenance Centre
 AP                                      Availability Period
 ASA                                     Asset Standards Authority
 ASDO                                    Automatic Selective Door Operation
 ATO                                     Automatic Train Operation
 ATP                                     Automatic Train Protection
 ATR                                     Automatic Train Regulation
 Authorised Personnel                    Personnel that have been authorised to enter a
                                         Train Set (e.g. Train Operators, Maintainers,
                                         Cleaners
 AW0                                     No Passengers
 AW1                                     All seats occupied
 AW2                                     All seats occupied and standing passengers @
                                         2.5 passengers m2
 AW2.5                                   All seats occupied and standing passengers @ 4
                                         passengers m2
 B Set                                   Waratah Train Series 2; An alternative reference
                                         to Waratah Series II Trains
 B2B                                     Business to Business – this is the secure
                                         communications pathway between Downer and
                                         Sydney Trains
 BOS                                     Back Office Systems
 BS                                      Base Stations
 BS-EDI                                  Body Side Electronic Destination Indicator
 Business to Business (B2B)              A secure internet-based link between two
                                         organisations allowing specific interaction. In this
                                         document it is used to refer to the existing link
                                         between TfNSW and Downer allowing Set to
                                         Operator communications to piggyback off
                                         Downer’s connection to the Sets.
 CBSD                                    Cab Body Side Door
 CCO                                     Component Change Out
 CCS                                     Climate Control System
 CCTV                                    Close Circuit Television
 Cleaner                                 Contracted to clean trains
 CONOPS                                  Concept of Operations


FE04 HVAC Energy Efficiency – Software                                                            14
© Downer 2020                                                                Commercial in Confidence
 CPG                                     Central Processing Unit with Graphic Display
                                         Processor
 Crew Cab                                Train Operator’s cab
 CSIRO                                   Commonwealth Scientific and Industrial Research
                                         Organisation
 CSS                                     Communications and Surveillance System
 CTD                                     Crew Transverse Door
 CTI                                     Company Test Instruction
 CTIP                                    Common Telemetry Infrastructure Platform
 CTR                                     Company Test Report
 CU                                      Central Unit
 DAS                                     Driver Advisory System
 DCU                                     Door Control Unit
 DDU                                     Driver Display Units
 DMI                                     Driver Machine Interface
 Driver (Train Operator)                 Qualified train driver
 DRM                                     Dynamic Route Map
 DRMD                                    Dynamic Route Map Display
 DSAPT                                   Disability Standards for Accessible Public
                                         Transport
 Dwell Time                              Time spent stopped at a station platform for
                                         passenger boarding and egress
 Dynamic Route Map (DRM)                 A specific representation of the train path,
                                         stopping pattern etc. which uses a linear ‘map’
                                         projection of the train route. The train location is
                                         shown progressing through the route.
 EAD                                     Electronic Access Device
 EAS                                     Electronic Access System
 ECR                                     Engineering Change Request
 EDI                                     Electronic Destination Indicator – Front / Rear
 EDR                                     Emergency Door Release
 EKE                                     EKE Group – the vendor which provides the Train
                                         Management System for WTP and SGT
 EE                                      Energy Efficient
 EMC                                     Electromagnetic Compatibility
 ETA                                     Estimated Time of Arrival
 ETCS                                    European Train Control System
 eTIS                                    Electronic Train Information System – The Train
                                         Management System developed by EKE
 External Destination Indicator (EDI)    Displays external to the train (front headboard
                                         above the cab and proposed on car bodyside)
                                         used to provide visual information channel for

FE04 HVAC Energy Efficiency – Software                                                             15
© Downer 2020                                                                 Commercial in Confidence
                                         critical passenger information and selected
                                         supplementary information provided externally to
                                         the train
 FAT                                     Factory Acceptance Test
 FE                                      Fleet Enhancement – Identification number for the
                                         proposed enhancement package
 FE01-FE10                               Fleet Enhancement – Identification number for the
                                         proposed enhancement package (alternatively
                                         referred to as PE)
 Glass Reinforced Plastic (GRP)          Fibre-glass used extensively to provide the
                                         interior structure to the cars.
 Guard (Train Operator)                  Qualified train Guard
 HEE HVAC                                Hardware Energy Efficient HVAC
 HMI                                     Human Machine Interface
 HVAC                                    Heating, Ventilation and Air Conditioning
 IBM                                     International Business Machines – the supplier
                                         and maintainer of the Downer MFAIS
 ICT                                     Information and Communication Technology
 IDD                                     Interface Design Description
 IDI                                     Internal Destination Indicator
 Key Off                                 To use a key to disable train controls and
                                         deactivate Crew Cab
 Key On                                  To use a key to enable train controls and activate
                                         Crew Cab
 M Set                                   Millennium Train
 Maintainer                              Qualified maintainer
 MC                                      Motor Car
 MFAIS                                   Multi-Fleet Asset Information System – can be
                                         used interchangeably with the AIS
 MTBF                                    Mean time between failures
 MOS                                     Minimum Operating Standards
 NIF                                     New Intercity Fleet
 OMG                                     On-board Mobile Gateway
 PA                                      Public Address
 PBSD                                    Passenger Body Side Door
 PEI                                     Passenger Emergency Information
 PLC                                     Programmable Logic Controller
 PID                                     Passenger Information Display
 Project                                 Downer Fleet Enhancement Project
 ROC                                     Rail Operations Centre
 S&V                                     Shock and Vibration


FE04 HVAC Energy Efficiency – Software                                                           16
© Downer 2020                                                               Commercial in Confidence
 SAI                                     Seat Availability Indicator
 SAR                                     Safety Assurance Report
 SB-DAS                                  Set Borne Driver Advisory System
 SB-EASE                                 Set Borne Electronic Access System Elements
 SBG                                     Set Borne Gateway
 SDC                                     Selective Door Control
 (HVAC) Setback Mode                     An HVAC self-initiated low power consumption
                                         mode
 SEE HVAC                                Software Energy Efficient HVAC
 Set Possession States                   SPS: Operations (remotely started, locally
                                         started)
 Set Possession States                   SPS: Power Saver, Low Power
 Set Possession States                   SPS: Power Saver, Extra Low Power
 Set Possession States                   SPS: Power Saver, Fully Stabled
 Set Possession States                   SPS: Maintenance
 SGT Fleet                               Sydney Growth Trains Fleet – otherwise known
                                         as the B Sets
 SIL                                     Safety Integrity Level
 STN                                     Special Train Notice
 SPS                                     Set Possession State
 ST                                      Sydney Trains
 TTU                                     Tangara Technology Upgrade
 TC                                      Trailer Car
 TCS                                     Train Control System
 TDC                                     Trailer Driver Car
 TfNSW                                   Transport for New South Wales
 TIMS                                    Train Information Management System
 TMC-ROC                                 Traffic Management System, Rail Operations
                                         Centre
 TMS                                     Train Management System
 TOSA                                    Train Operator Stopping Aid
 Train Operator                          Driver or Guard
 Train Set (Set)                         A set of carriages coupled together for a particular
                                         service
 Works                                   The scope of activity to be undertaken on the
                                         enhancement Project by Downer
 WTP Fleet                               Waratah Train Project Fleet – otherwise known as
                                         the A Sets




FE04 HVAC Energy Efficiency – Software                                                           17
© Downer 2020                                                               Commercial in Confidence

---

## SARAH_Tuesday_RFI #1 Clarifications 31052021 (1).docx

*File: `SARAH_Tuesday_RFI #1 Clarifications 31052021 (1).docx`*

CBS/Downer/NGE team

Sydney Trains HVAC ESC

28th May 2021

Configuration – 

Seasonal cycles

Data – gross or refined?

Clarifications regarding response to and high level data needs summary.

Andrew Clarke

Clarifications and information requests in red. Data in the summary is required for 10 trains of each type. 6 months data to the end of May 2021 please.

Collated data request:

Fresh Air Temp (from one HVAC unit per set only required, this may provide a solution to the issue of trains being on different lines)

Relative Humidity (is this internal RH or incoming air? Data from one car per set only required if it relates to incoming air)

Internal Temperature (prefer hourly, average or instantaneous. for comparison of baseline and operating periods for HVAC performance check) – what is the performance check we are seeking here?

Temperature Set Point (for carriage, not crew cab. Static factor for model)

HVAC Mode (one minute data would suffice)

Patronage levels (in kg) (ideally total per set, one minute average data would suffice) – pass load in Kg?

Run # (one minute data would suffice) – is this the routes?

Door status (1 carriage door signal used to represent whole of train door status)

Electricity consumption (totaliser kWh not average kW) hourly for entire set HVAC. Power consumption per car? Per hvac/per car?

From RFI #1

The problem with this is what is hinted at in the next question, different climate, passenger loading and operational usage of the Sets will impact how much energy is used, so several assumptions would need to be made and potentially data adjusted to account for climate and passenger loading. Doing this is even more work to download different data sets and evaluate them.

Our modelling process will take care of this. Downer only need to provide the raw data.

RFI#2

There are several factors which will influence the performance of the energy consumption of the HVAC unit.

Climate (i.e. Fresh Air Temp, Solar Load, Humidity etc.) We will use BOM solar insolation data if needed as an independent variable in the regression modelling.

Operational usage (i.e. where in Sydney the Set runs which leads to different climates experienced by each Set, different amounts of stabling experienced, how often they left with doors open etc.) We will use the onboard fresh air temperature and humidity 

Patronage

Driver/Guard control of HVAC in Crew Cab – We will assume this has minimal effect, as it is only a small proportion of the HVAC load.

Etc.

Each HVAC on a train (16 in total) records its operational in a log, the log includes the following information:

Fresh Air Temp (from HVAC unit per set only required, this may provide a solution to the issue of trains being on different lines)

Relative Humidity (is this internal RH or incoming air? Data from one car only required if it relates to incoming air)

Internal Temperature (prefer hourly, average or instantaneous. for comparison of baseline and operating periods for performance check)

Temperature Set Point (for carriage, not crew cab. Static factor for model)

HVAC Mode

Events/Faults

Etc, (full list below)*

This information is recorded about once every 30 seconds, and the logs carry about 7 days of information before being overwritten. So you end up with a lot of data, about 46,000 individual data points per Set per Day.

The event recorder records data about twice a second and you can get:

GPS location,

patronage levels (in kg) (one minute average data would suffice)

direction,

Run #

door status (1 carriage door signal used to represent whole of train door status, as a total of number of door hours open per day while operating etc)

etc.

All this will influence HVAC power consumption.  The event recorder data is stored on the set for about 14 days before being overwritten.

Every 10 minutes a huge number of signals off the train is dumped to the shore (what’s in the ER plus other diagnostic information from many systems), this is stored in the Databank and then can be accessed by through Train DNA. Accessing this data can be a bit hit and miss as sometimes large chunks are missing. We will work out how many sets we need to model, and avoid missing data.

RFI #3

For the HVAC Hardware Trial we used specific power meters and data loggers which were calibrated as we needed to gain a higher resolution compared to what was available using the existing on train power meters.

Let’s focus on the train equipment that is operational not the test equipment – we can investigate calibration post the data interrogation

The on board energy meters do have calibration requirements however TLS does not complete these activities. Does someone test these in the stables? Otherwise will need to check each that is used in modelling, briefly using a power logger/ true RMS tong tester.

The HVAC units ‘metering instruments’ i.e. temperature and humidity sensors, don’t go through a calibration or testing schedule, rather they are maintained along according to the Technical Maintenance Plan (TMP), or fixed on failure

We will need copies of the Technical Maintenance Plan and documents confirming the relevant maintenance of the sensors is performed (e.g. reports). For a sample of each type of train only, during both baseline and operating periods.

Please confirm numbering of sets of SGT and Waratah trains are continuous, i.e. no number missing in the sequence.

---
