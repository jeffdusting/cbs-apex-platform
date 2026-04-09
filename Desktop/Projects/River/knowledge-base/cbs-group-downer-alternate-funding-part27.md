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

## Revised FE04 HVAC Software Proposal - Extract.docx

*File: `Revised FE04 HVAC Software Proposal - Extract.docx`*

FE04 –Software Energy Efficiency HVAC (SEE HVAC)

Executive Summary

The train’s Climate Control System (CCS) plays one of the most significant roles in influencing customer and crew comfort. The current HVAC units on the Waratah train have been proven in service for more than 10 years for both sound performance and reliability. However, energy used to operate the Heating, Ventilation, and Air Conditioning (HVAC) system is a significant factor in the operational cost of revenue service trains. Reducing energy consumption has been identified as a critical opportunity within this Fleet Enhancement.

Downer, together with Sigma, have reviewed the operation of the HVAC seeking to reduce energy consumption of the system. Revenue service data logs were analysed and opportunities to save energy were identified. In this proposal, Software Energy Efficiency HVAC (SEE HVAC) enhancements have been identified that reduce energy consumption without significantly impacting passenger and crew comfort. Hardware Energy Efficiency HVAC (HEE HVAC) Enhancements have been proposed separate to this document.

These SEE HVAC enhancements include:

Duct heater optimisation: Relaxing the set-point control for passenger saloon duct heaters, and minimising their usage particularly during warmer temperatures;

HVAC setback mode: Enabling the HVAC to significantly relax temperature set points while the train is powered and not attended. Further opportunities to save energy during this period are identified in Section 7. 

Simulations and calculations were developed to predict quantitatively the energy saved from these enhancements. Based on these predictions, typical operational conditions, 15% energy savings could be realised across the fleet.  

Scope

This proposal outlines the program of work to complete the design and verification of the SEE HVAC design. Downer will:  

Prepare the software specification;

Provide updated HVAC software to allow proposed enhancements to be trialled with configurable parameters;

Provide updated eTIS software allowing the HVAC setback mode to be trialled;

Provide formal Engineering Change Request (ECR) documentation to install software temporarily for in-service trial in accordance with the SGT Configuration Management Plan;

Prepare and undertake tests and trial for the two distinct enhancements to verify the updates:

Achieve energy savings; 

Maintain customer and crew expectations for heating and cooling performance; 

Maintain technical performance;

Implement the HVAC software on the SGT fleet.

Energy Savings

The enhancement technical and operational benefits realise the energy saving benefits as below.

Table 1: Energy Saving Benefits

Key assumptions on the fleet energy saving predictions include:

Simulation total is based on average climatic data for Sydney region and does not consider variations between the city and western suburbs;

The model does not include pull-down, it assumed that the train is at the correct operating temperature at the start of service; 

Passenger loads are from existing operational data but in practice will vary between trains.

Technical Solution

Enhancement Objectives

The SEE HVAC is designed to seamlessly enhance the HVAC system, to achieve four key objectives:

The SEE HVAC solution can be implemented to Waratah and SGT with no change to the hardware configuration;

The energy savings can be proven quantitively via measuring on the Set;

There is no significant impact to customer and crew expectations for heating and cooling performance; 

The design improves or has no-impact to the HVAC reliability.

Downer is proposing two software enhancements that can be implemented with no change to the hardware design. They include:

Duct heater optimisation: Relaxing the set-point control for passenger saloon duct heaters, and minimising their usage particularly during warmer temperatures;

HVAC setback mode: Enabling the HVAC to significantly relax temperature set points while the train is powered and not attended.

Description of Enhancement

Duct Heater Optimisation

Each saloon area of the car has duct heaters used to balance the temperatures between each area (Upper Saloon, Lower Saloon, Vestibules). This ensures the difference in temperatures between areas is not significant. The intensity of each duct heater is controlled using continuously variable Pulse Width Modulation (PWM) 0% to 100%. If the temperature between each area differs from another by more than 0.1°C, the HVAC control system will begin adjusting the heating intensity of the duct heaters to balance the saloon temperatures, where the heater intensity is based on the difference between desired temperature and rate of change in temperature. 

Since the temperature between areas is rarely the same, the consequence for this strict control algorithm means that even when operating in warm ambient temperatures, duct heaters operate frequently to balance the temperatures, contributing to the energy consumed by the duct heaters and the energy required to cool the air on the train.

Downer proposes the duct heater control algorithm is modified. An example of the modification proposed is as follows:

Relax the duct heating control setpoint from 0.1°C to 1.0°C i.e. duct heaters will not attempt to balance the temperature unless the temperatures differ by 1.0°C or more;

Disable duct heaters if the outdoor temperature exceeds 30°C.

HVAC Setback Mode

In current operation – to allow immediate return to service particularly between timetable peaks and when the full fleet is not required – Sets are left powered when not in-service and not attended. When the train is not powered down or ‘stabled’, HVAC is left running to regulate the cab and saloon environment to meet minimum operating specifications as if passengers and crew were onboard. Since nobody is onboard to benefit from the conditioned air, energy is wasted to maintain temperature. The Waratah and SGT Sets already meet strict temperature requirements to pull up or down the temperature within a short period to ensure comfort is provided by the time the train enters service, therefore there is no need to maintain ideal temperatures when the train isn’t in use.

Downer proposes that the HVAC software is updated to feature an ‘HVAC Setback Mode’ that will be self-initiated if crew have not signed in for 20 minutes (or other configurable time). This will be after crew have removed their keys. In HVAC Setback Mode, saving energy will be achieved by:

Disabling duct heaters;

Adjusting the passenger saloon and Crew Cab set point temperature to be between 10°C and 30°C where the HVAC will remain in ventilation mode; i.e.:

If outdoor temperature falls below 10°C, HVAC shall regulate to 10°C; 

If temperature rises above 30°C HVAC will regulate to 30°C;

TDC Cab end HVAC to continue operating in default mode to maintain equipment temperatures (similar to Nightsafe mode).

eTIS software shall be updated to provide an output to the HVAC PLC to indicate when the driver and guard is not signed in and when the train is not set to Presentation Mode.

Testing and Trials

The test phase has been planned to accelerate the implementation of the software on the SGT Sets.

Approval

Downer and Sigma will work with TfNSW and Sydney Trains to develop parameters and ensure changes meet the system specification. With software prepared, the project will undertake static train tests. A report of the static test results will be provided with an Impact Assessment as part of a formal ECR additionally seeking approval to take the software to in-service trials. 

Timeline

The duct heater optimisation and HVAC setback will follow separate test timelines. This will allow the eTIS version implementation to not impact other trials and reduce risk to the overall project timeline. Each in-service trial will be separately implemented on different sets over multiple phases allowing individual benefits of each enhancement to be measured and prompt identification of any impact. 

An outline of the SEE HVAC test plan is provided in Figure 2. 

Figure 2: SEE HVAC Timeline

Test Descriptions

A description of each test and trial is provided in Table 4.

Table 4: Testing and trial descriptions

Opportunities

Fresh Air Fan Control

The HVAC fresh air fan primary purpose is it to supply sufficient fresh air to the train interior, especially when doors are closed. When the passenger doors open, conditioned air is pushed out of the train by the static pressure generated by the fresh air fans pushing air into the moderately sealed saloon. The static pressure equalises between the train interior and outside allowing fresh air to be introduced:

naturally through the passenger doors; and 

by the fresh air fans. 

When doors are then closed, the HVAC must consume energy to condition the air from both sources.

Downer proposes to reduce the speed of the fresh air fans for the passenger area when doors are open to reduce the amount of fresh air that requires conditioning and reduce the energy consumption of the fresh air fan. The fresh air fans will then return to normal operation after a short pre-defined period after the doors are closed.

Table 5: Potential enhancements considered during development of this proposal

During the development of this software enhancement Downer and Sigma identified some system constraints which resulted in this enhancement not being able to be offered through a simple HVAC software update. Downer will continue to investigate the feasibility of this enhancement, investigating whether fresh air fan control can be implemented without major on set modifications.

Future Considerations 

All equipment in the Climate Control System has been holistically reviewed for optimisation to realise the energy saving. Further energy efficiency could be gained in other areas as outlined in Table 6 below.

Table 6: Potential enhancements for future considerations.

Additional investigations could be undertaken by Downer subject to further time and cost consideration. 

Timeline

Table of Key Milestones

An approximate timeline of key milestones has been considered and outlined in Table 7 below. All dates and timelines are provisional and will be confirmed in the next phase once the enhancements are selected and the suppliers are formally agreed to meet the agreed delivery timeframe. 

Table 7: Indicative timetable

Appendix D – Prototype Setback Mode Test

An informal test was performed at Auburn Maintenance Centre to demonstrate energy savings for the Setback mode proposal. 

In this test a set was fully powered set left in normal mode and parked simulating the current baseline. The HVAC power consumed to-date was recorded to form a baseline followed by recordings every hour after to monitor the energy being consumed in this static, ‘powered’ state. 

The same test was performed with another Set, but in this test all HVAC units set to ventilation mode to simulate the newly proposed set-back mode. The same baseline and hourly power consumption recordings were taken in the ventilation mode. 

The comparative results are shown below:

Table 10 Prototype Setback Mode Test Energy Saving Results

The energy savings demonstrated by this test are significantly higher than the predicted calculation. However, this test didn’t fully simulate all seasonal scenarios, energy required to pull up or down the temperature when the Set returns to service or maintaining the temperature between 10°C and 30°C. While the predicted calculations are conservative, this test provides further evidence that significant energy savings can be achieved from the implementation of this enhancement.

Appendix E – HVAC Logs Demonstrating Duct Heater Operation

The following image is a snapshot of HVAC data logs taken from N1824 (B24) on 4th January 2020 demonstrating duct heater operation during ambient temperatures of approximately 45°C. The numbers in the duct heater column indicate the power level of the upper and lower deck heater heaters operating at up to 100% power.

Figure 4 Snapshot from N1824 HVAC data logs.

Glossary for Fleet Enhancement



| HVAC Enhancement | Energy per HVAC / year | Energy of the SGT/ Waratah Fleet/ year |

| Current HVAC Unit – (Simulation Total) | (86.7 MWh) | (165 GWh) |

| Duct Heater Optimisation – Energy Saving | 7.9 MWh | 15.2 GWh |

| HVAC Setback Mode – Energy Saving | 5.5 MWh | 9.5 GWh |

| Total Energy Savings – Energy Saving | 13 MWh | 25.5 GWh |



| Software Update | Description of update | Impact of update |

| Duct Heater Optimisation | Modify the duct heater control algorithm for temperature balancing during normal operation | + Significantly reduce overall duct heater power consumption
+ Reduce power required to cool saloon air
- Slight increase in temperature difference between passenger areas
o No impact to the average saloon temperature and passenger comfort |



| Software Update | Description of update | Impact of update |

| HVAC Setback Mode | HVAC Setback Mode is activated after the driver has keyed out of the train. In this mode, the HVAC will widen setpoint temperatures and disable duct heaters | + Reduce HVAC power consumption |



| Test | Description |

| Software Factory and Regression Test
(Simulated) | Sigma and Downer with EKE will complete simulated software testing to within the factory and ITF to ensure expected software functionality. The HVAC software test will include all enhancements. |

| Static On-Train Type Test (1 Set) | Sigma and Downer will test completed software on the set. Initial temperature measurements will be taken to ensure no significant impact prior to in-service testing. The report from this test will be provided as evidence for in-service approval. |

| Parameter Change Trial
(1 Set per enhancement) | Downer will seek approval for an in-service trial for the agreed parameters to be installed and trialled in service over a 4-week trial period. This will clarify the impact of each enhancement and determine the optimal control parameters.
Based on a test specification developed by Sigma, each enhancement will be trialled on an individual set. Each parameter will be closely monitored to ensure climate regulation remains within specification. Energy consumption will be noted during this process for information.  Parameters will be applied to the HVAC on half the set allowing for a direct comparison to the baseline software on the other half.
The Parameter Chance Trial will be conducted as follows:
*Preferred, highest energy saving parameter
No changes to the 20-minute inactive period unless operational issue identified during the trial period. |



| Proposed Update | Description of update | Impact of update |

| Fresh air fan control | Reduce speed of the fresh air fan for a period after passenger doors are opened | + Reduce power consumption of fresh air fans
+ Reduce power required to condition fresh air |



|  | Enhancement | Observation | Consideration |

| 1 | Drivers Cabin | Foot heater may be used when the cabin set point temperature is set to cool | Foot heater operation can be operated against the cooling of the cabin air-conditioning resulting in a waste of energy. 
Foot heaters could be disabled when the cabin setpoint requires the HVAC to cool, however this removes desirable control from the user. |

| 2 | High End Temperature Control | At ambient temperatures between 35°C and 45°C the HVAC will consume energy to maintain interior temperature between 26°C and 27°C | When the ambient temperatures are between 35°C and 45°C, trial the HVAC to maintain the interior temperature between 26°C and 29°C instead to reduce effects of thermal shock at high ambient temperatures. |

| 3 | Train Level Low Power Mode (Lighting) | Outside of peaks, while the train is left powered but not in use, systems are consuming power when not required. | In addition to the HVAC Setback mode, lighting and other system could be automatically turned off to save energy when crew is not keyed in. |



| Average Energy Saved | Per Set (MWh) | Per Unit (MWh) |

| Per hour | 0.194 | 0.012 |

| Per 5 hours | 0.970 | 0.061 |

| Per year | 354 | 22 |



| Term | Meaning |

| A Set | Waratah Train Series 1; An alternative reference to Waratah Trains |

| AIS | Asset Information System – can be used interchangeably with the MFAIS |

| AMC | Auburn Maintenance Centre |

| AP | Availability Period |

| ASA | Asset Standards Authority |

| ASDO | Automatic Selective Door Operation |

| ATO | Automatic Train Operation |

| ATP | Automatic Train Protection |

| ATR | Automatic Train Regulation |

| Authorised Personnel | Personnel that have been authorised to enter a Train Set (e.g. Train Operators, Maintainers, Cleaners |

| AW0 | No Passengers |

| AW1 | All seats occupied |

| AW2 | All seats occupied and standing passengers @ 2.5 passengers m2 |

| AW2.5 | All seats occupied and standing passengers @ 4 passengers m2 |

| B Set | Waratah Train Series 2; An alternative reference to Waratah Series II Trains |

| B2B | Business to Business – this is the secure communications pathway between Downer and Sydney Trains |

| BOS | Back Office Systems |

| BS | Base Stations |

| BS-EDI | Body Side Electronic Destination Indicator |

| Business to Business (B2B) | A secure internet-based link between two organisations allowing specific interaction. In this document it is used to refer to the existing link between TfNSW and Downer allowing Set to Operator communications to piggyback off Downer’s connection to the Sets. |

| CBSD | Cab Body Side Door |

| CCO | Component Change Out |

| CCS | Climate Control System |

| CCTV | Close Circuit Television |

| Cleaner | Contracted to clean trains |

| CONOPS | Concept of Operations |

| CPG | Central Processing Unit with Graphic Display Processor |

| Crew Cab | Train Operator’s cab |

| CSIRO | Commonwealth Scientific and Industrial Research Organisation |

| CSS | Communications and Surveillance System |

| CTD | Crew Transverse Door |

| CTI | Company Test Instruction |

| CTIP | Common Telemetry Infrastructure Platform |

| CTR | Company Test Report |

| CU | Central Unit |

| DAS | Driver Advisory System |

| DCU | Door Control Unit |

| DDU | Driver Display Units |

| DMI | Driver Machine Interface |

| Driver (Train Operator) | Qualified train driver |

| DRM | Dynamic Route Map |

| DRMD | Dynamic Route Map Display |

| DSAPT | Disability Standards for Accessible Public Transport |

| Dwell Time | Time spent stopped at a station platform for passenger boarding and egress |

| Dynamic Route Map (DRM) | A specific representation of the train path, stopping pattern etc. which uses a linear ‘map’ projection of the train route. The train location is shown progressing through the route. |

| EAD | Electronic Access Device |

| EAS | Electronic Access System |

| ECR | Engineering Change Request |

| EDI | Electronic Destination Indicator – Front / Rear |

| EDR | Emergency Door Release |

| EKE | EKE Group – the vendor which provides the Train Management System for WTP and SGT |

| EE | Energy Efficient |

| EMC | Electromagnetic Compatibility |

| ETA | Estimated Time of Arrival |

| ETCS | European Train Control System |

| eTIS | Electronic Train Information System – The Train Management System developed by EKE |

| External Destination Indicator (EDI) | Displays external to the train (front headboard above the cab and proposed on car bodyside) used to provide visual information channel for critical passenger information and selected supplementary information provided externally to the train |

| FAT | Factory Acceptance Test |

| FE | Fleet Enhancement – Identification number for the proposed enhancement package |

| FE01-FE10 | Fleet Enhancement – Identification number for the proposed enhancement package (alternatively referred to as PE) |

| Glass Reinforced Plastic (GRP) | Fibre-glass used extensively to provide the interior structure to the cars. |

| Guard (Train Operator) | Qualified train Guard |

| HEE HVAC | Hardware Energy Efficient HVAC |

| HMI | Human Machine Interface |

| HVAC | Heating, Ventilation and Air Conditioning |

| IBM | International Business Machines – the supplier and maintainer of the Downer MFAIS |

| ICT | Information and Communication Technology |

| IDD | Interface Design Description |

| IDI | Internal Destination Indicator |

| Key Off | To use a key to disable train controls and deactivate Crew Cab |

| Key On | To use a key to enable train controls and activate Crew Cab |

| M Set | Millennium Train |

| Maintainer | Qualified maintainer |

| MC | Motor Car |

| MFAIS | Multi-Fleet Asset Information System – can be used interchangeably with the AIS |

| MTBF | Mean time between failures |

| MOS | Minimum Operating Standards |

| NIF | New Intercity Fleet |

| OMG | On-board Mobile Gateway |

| PA | Public Address |

| PBSD | Passenger Body Side Door |

| PEI | Passenger Emergency Information |

| PLC | Programmable Logic Controller |

| PID | Passenger Information Display |

| Project | Downer Fleet Enhancement Project |

| ROC | Rail Operations Centre |

| S&V | Shock and Vibration |

| SAI | Seat Availability Indicator |

| SAR | Safety Assurance Report |

| SB-DAS | Set Borne Driver Advisory System |

| SB-EASE | Set Borne Electronic Access System Elements |

| SBG | Set Borne Gateway |

| SDC | Selective Door Control |

| (HVAC) Setback Mode | An HVAC self-initiated low power consumption mode |

| SEE HVAC | Software Energy Efficient HVAC |

| Set Possession States | SPS: Operations (remotely started, locally started) |

| Set Possession States | SPS: Power Saver, Low Power |

| Set Possession States | SPS: Power Saver, Extra Low Power |

| Set Possession States | SPS: Power Saver, Fully Stabled |

| Set Possession States | SPS: Maintenance |

| SGT Fleet | Sydney Growth Trains Fleet – otherwise known as the B Sets |

| SIL | Safety Integrity Level |

| STN | Special Train Notice |

| SPS | Set Possession State |

| ST | Sydney Trains |

| TTU | Tangara Technology Upgrade |

| TC | Trailer Car |

| TCS | Train Control System |

| TDC | Trailer Driver Car |

| TfNSW | Transport for New South Wales |

| TIMS | Train Information Management System |

| TMC-ROC | Traffic Management System, Rail Operations Centre |

| TMS | Train Management System |

| TOSA | Train Operator Stopping Aid |

| Train Operator | Driver or Guard |

| Train Set (Set) | A set of carriages coupled together for a particular service |

| Works | The scope of activity to be undertaken on the enhancement Project by Downer |

| WTP Fleet | Waratah Train Project Fleet – otherwise known as the A Sets |

---
