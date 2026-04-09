---
entity: cbs-group
category: tender
title: "CBS Group — Downer Alternate Funding Proposal (Energy Savings Scheme) — ST_CBSDST PIAMV M&V Plan Rev1.docx (+1 more)"
---

> **Parent document:** CBS Group — Downer Alternate Funding Proposal (Energy Savings Scheme)
> **Entity:** CBS Group, a technical advisory firm specialising in infrastructure asset management, systems engineering, and tolling
> **Category:** tender submission and procurement documentation
> **Total sections in parent:** 165
>
> This is a sub-document extracted from the parent for retrieval optimisation.
> The parent document contains the complete collection; this section is independently
> retrievable for targeted queries.

## ST_CBSDST PIAMV M&V Plan Rev1.docx

*File: `ST_CBSDST PIAMV M&V Plan Rev1.docx`*

Measurement and Verification Plan (Sampling)

SGT train sets HVAC control software upgrade.

Sydney Trains

June 2021

© Northmore Gordon Environmental Pty Ltd 2021

The concepts and information contained in this document are the property of Northmore Gordon Environmental Pty Ltd.  This document may only be used for the purposes for which, and upon the conditions that, the document is supplied. Use or copying of this document in whole or in part for any other purpose without the written permission of Northmore Gordon Environmental Pty Ltd constitutes an infringement of copyright.

While all care has been undertaken to ensure that the information provided in this document is accurate at the time of preparation to the extent permissible by the Competition and Consumer Act 2010 (Cth), Northmore Gordon Environmental Pty Ltd takes no responsibility for any loss or liability of any kind suffered by the recipient in reliance of its contents arising from any error, inaccuracy, incompleteness or similar defect in the information or any default, negligence or lack of care in relation to the preparation or provision of the information.

Northmore Gordon Environmental Pty Ltd
132 Cremorne Street
Cremorne, VIC 3121
ABN 45 160 805 649
Ph: 1300 878 500

For further information, please visit our website at http://Northmore Gordon Environmental.com.au/  

Project Overview

Summary 

Key Project Dates

Record Keeping Plan

As an Accredited Certificate Provider (ACP), Northmore Gordon Environmental Pty Ltd is required to keep records that substantiate the ESC created under the RESA 

Data relevant to certificate creation is stored in accordance with Northmore Gordon Environmental’s Activity Workflow & Record Keeping Process. All records are stored securely on Google Drive and can only be accessed by Northmore Gordon Environmental and NG staff. 

Ambient weather data is stored by the Bureau of Meteorology.

Quality Assurance

Northmore Gordon Environmental’s Workflow & Record Keeping Procedure will be followed for stages of this project’s submission. A Compliance Officer will review the documentation provided for the project to ensure it is compliant with the Northmore Gordon Environmental PIAMV Checklist (Annex 3 PIAMV Checklist).

Calculation Spreadsheet

The analysis process, including input data, can be found, or referenced, in the attached spreadsheet: Key Parameters Spreadsheet Company Descrip RevX.xlsx, which shall be referred to as the Key Parameters Spreadsheet throughout the remainder of this document.

M&V Background

Project Description

FROM PIAMV METHOD GUIDE (V4.2) TABLE A1:

Remember to:

Describe the facility and process on site

state whether this project is a single or multi site project

Describe the end use equipment that is being upgraded

Describe the boundary of the project

Discuss potential interactive effects

Which energy will be saved (elec, gas, etc)

Is it a fuel switch?

Site Description

The “sites” are the SGT train sets.

Each train set (unit) consists of 8 cars. The cars are not interchanged, they remain in the same set permanently.

The train sets are operated on “runs” on the Sydney Trains network.

ECM Description

The ECM is a change to the control of the HVAC system to eliminate the cooling and heating systems fighting each other and to reduce HVAC energy consumption without significantly impacting passenger.

The Software Energy Efficiency HVAC (SEE HVAC) enhancements include:

Duct heater optimisation: relax the set point control for passenger saloon duct heaters, and minimising their usage during water temperatures

HVAC set back mode: enabling the HVAC to significantly relax temperature set points while the train is powered and not attended.  

See “Revised FE04 HVAC Software Proposal - Extract.pdf” for details

Sampling Plan

The requirements to meet Section 7A.20 Sampling Method are tabulated below.

Measurement Boundary

The measurement boundary will be defined by the electricity meters which meter only the HVAC systems of the entire train set.

A change to the car internal lighting could affect the HVAC energy consumption. Sydney Trains have no plans to make changes to the lighting during the life of this M&V project so there are no interactive effects likely.

The Measurement Boundary is shown in Figure 3.

Figure 3. M&V boundary for  . 

Measurement & Verification Method

Each train “set” is each considered a “site” for the purposes of PIAM&V ESC creation. Sampling will be used to determine the savings for a representative population of the sets in each of the two fleets. The fleets are referred to as “SGT” and “Waratah” type sets.

Option B: retrofit isolation, all parameter measurement will be applied as the HVAC energy consumption varies due to a number of factors including ambient conditions, operating hours, passenger loading etc.

The appropriate independent variables will be determined through testing. 

Variables

Energy Model Types

It is anticipated that Regression Analysis will be used for the Baseline and Operating Period:

Baseline Period – electricity: Regression Analysis

Operating Period – electricity: Regression Analysis

Further details on each model can be found in Sections 9 and 10 for Baseline and Operating Periods respectively. 

Energy Consumption Variables

Electricity Consumption

The source(s) of electricity consumption data are summarised in Table 1.

Table 1. Electricity consumption variables for  . 

Independent Variables

There are several factors which influence the performance of the energy consumption of the HVAC unit.

Climate (i.e. Fresh Air Temp, Solar Load, Humidity etc.)

Operational usage (i.e. where in Sydney the Set runs which leads to different climates experienced by each Set, different amounts of stabling experienced, how often they left with doors open etc.) This may be dealt with using set back mode to indicate operating hours of trains per day. Door opening is unlikely to have any measurable influence on electricity consumption.

Patronage – recorded as weight load on the train 

Driver/Guard control of HVAC in Crew Cab – We will assume this has minimal effect, as it is only a small proportion of the HVAC load.

The independent variables that may be used for this project are summarised in Table 3.

Table 3. Potential Independent variables for  . 

Heating Degree Day


Tmin is the minimum daily temperature for the day, in °C
Tma is the maximum daily temperature for the day, in °C

Tref is the reference ambient temperature, 22°C has been used as it is the set point of the train carriage.

Cooling Degree Day


Tmin is the minimum daily temperature for the day, in °C
Tma is the maximum daily temperature for the day, in °C

Tref is the reference ambient temperature, 8°C has been chosen. This temperature is reflective of the temperature at which cooling load is required within each car (train carriage). This low reference temperature was selected as it correlated best with HVAC energy consumption and is consistent with the current understanding that the cooling and heaving loads are currently “fighting” each other. 

Average longitude

The average longitude of the train set during the operating period of the train set.

Passenger loading

The average passenger load in kg during the operating period of the train set.

Operating hours

The operating hours of the train set for the measurement interval.

Solar insolation

The total solar insolation for the region during the operating period of the train set.

Production or Service Output

Site Constants (Static Factors)

Excluded Variables

These variables have been excluded as they are either dependent on the other variables or do not have a strong influence on energy consumption. 

Measurement Procedures

Frequency of Measurement

The frequency of measurement for energy consumption and independent variables are detailed in Sections 7.2 and 7.3.

Measurement Equipment and Data Sources

The measurement equipment and data source for energy consumption and independent variables are detailed in Sections 7.2 and 7.3.

Calibration Procedures

The calibration procedures for energy consumption and independent variables are detailed in Sections 7.2 and 7.3.

Increases in Electricity or Natural Gas Consumption

The circumstances under which electricity consumption might increase shall be covered by:

a full 12 months period is planned for the Operating period  

a wide range of independent variables considered (see Section 7.3) for the Baseline and Operating models.

Non-Routine Events & Adjustments

No non-routine adjustments are expected for this project.

Some data are expected to be missing from the train DNA data base. Only data sets with less than 20% data missing will be used in the models. 

Glossary



| Energy Saver (Business Name) | Sydney Trains |

| ABN |

| Short Energy Saver & Site Name
(used in this document) |  |

| Project Description | Software upgrades to SGT fleet HVAC
(Sydney Trains HVAC Upgrade) |

| Energy Saver person(s) contact details | Full Name
Title
email address
phone number(s) |



| Accredited Certificate Provider (ACP) | Northmore Gordon Environmental Pty Ltd |

| Address | 132 Cremorne St
Cremorne VIC 3121 |

| Accreditation ID | GHGR01891E |

| RESA Name | Northmore Gordon Environmental’s PIAM&V General Method |

| Northmore Gordon Environmental person(s) contact details | Patrick Blain
patrick@wattly.com  
0403 969 162 |

| ACP Upgrade Manager contact details | Waven Pyke
waven@northmoregordon.com
0412 832 907 |

| M&V Professional Contact Details | Collin MacPherson
Collin@jcmsolutions.com.au 
JCM Solutions 
0434 194 780 |



| Total Number of ESCs Calculated | Up to 50,000 per population |



| Other details |  |

| Type of End-Use Service for which energy was saved, if known (see Table A17 of Schedule A of the ESS Rule of 2009) | Air heating and cooling |

| Business Classification of the entity utilising the End-Use Service, if known (see Table A18 of Schedule A of the ESS Rule of 2009) | I Transport Postal and Warehousing |



| Key Date | Start date | End date |

| Nomination Form Signed | TBA | N/A |

| Baseline Period | 1st October 2020 | 30th September 2021 |

| Implementation date | Est October 2021 | Est November 2021 |

| Operating Period | December 2021 | TBA |

| Forward Creation | =Imp Date | = Imp Date + 10 yrs – 1 day for projects with 10 yr life |



| Rule | Approach |

| a) i) | SGT and Waratah fleets separate populations, but they are basically the same design, identical EUE, EUS, RESA, static factor |

| a) ii) | Passenger train services |

| a) iii) | Software upgrade, hardware upgrade as defined by project docs |

| a) iv) | Number of cars in the set |

| b) | No other train types will be included |

| c) | All site constants will be the same across all sites. |

| d) | All trains are identical within the fleets |

| e) | Variation in regression results too great for aim precision |

| f) | 1 site constant in the population, therefore minimum 6 sample sites/sets. Do 10 of each train and check results. Waratah and SGT implementations are separate, so train type is not a static factor within the population. |

| g) | Random – the trains will be selected on a random basis. |

| h) | Take data from various parts of the last two years or whatever data is available |



| Data Source | On board HVAC (real power) electricity meters |

| Meter Identifier | TBC |

| Meter Type | kWh |

| Meter Model | Crompton Instruments Integra 1630 |

| Meter Accuracy | 0.3% of reading |

| Data Accuracy |  |

| Evidence | TBC |

| Calibration | NA. Manufacturer does not recommend any calibration regime for this meter. |

| Applicable Periods | Baseline and Operating Period |

| Raw Data Units |  |

| Raw Data Measurement Frequency | 10 seconds |

| Units used in Models |  |

| Data Frequency used in Models | Daily |

| Conversions / Calculations | Energy data is stored as a cumulative value. The difference between the stored data shall be used as the daily energy consumption. |

| Additional Notes |  |



| Variable Name | HDD for (Heating Degree Day) | CDD (Heating Degree Day) | Average longitude of train while operating (may effect relationship with CDD/ HDD, and solar insolation) | Passenger loading (kg) | Train operational hours | Solar insolation |

| Data Source | Bureau of Meteorology | Bureau of Meteorology | From Train DNA data base | From Train DNA data base | From Train DNA data base | Bureau of Meteorology |

| SCADA/DSC Tag | NA | NA | NA |  |  |  |

| Meter Type | NA | NA | NA |  |  |  |

| Meter Model | NA | NA | NA |  |  |  |

| Meter Accuracy | taken to be ±0% | taken to be ±0% | This information has been requested from the Energy Saver | This information has been requested from the Energy Saver | This information has been requested from the Energy Saver | taken to be ±0% |

| Data Accuracy | taken to be ±0% | taken to be ±0% | This information has been requested from the Energy Saver | This information has been requested from the Energy Saver | This information has been requested from the Energy Saver | taken to be ±0% |

| Evidence | Not required | Not required | This information has been requested from the Energy Saver | This information has been requested from the Energy Saver | This information has been requested from the Energy Saver |  |

| Calibration | Not required | Not required | This information has been requested from the Energy Saver | This information has been requested from the Energy Saver | This information has been requested from the Energy Saver |  |

| Applicable Periods | Baseline and Operating Period | Baseline and Operating Period | Baseline and Operating Period | Baseline and Operating Period | Baseline and Operating Period | Baseline and Operating Period |

| Raw Data Units | °C | - | number | kg |  |  |

| Raw Data Measurement Frequency | Daily | Daily | Daily |  |  |  |

| Units used in Models | °C | - | number |  |  |  |

| Data Frequency used in Models | Daily | Daily | Daily |  |  |  |

| Additional Notes | See below | See below |  |  |  |  |



| Critical quality parameter | Meeting temperature requirement for Sydney Trains |

| Units | oC |

| Description | The range of temperatures during the baseline will set the standard required for the operating period. The allowable temperature may depend on the outside temperature. Some comparison with BOM maximum and minimum temps may be required. |

| How it is measured / calculated | Onboard temperature monitoring in all compartments |

| Typical value (if known) |  |



| Site Constant Name | Temperature set point |

| Description | The set point for air temperature in the passenger compartments of the train during operations |

| How it is measured / calculated | The setpoints are not recorded but are controlled within a restricted system and require formal change management processes to be followed for any changes to be made. Confirmation will be sought in letter form. |

| Typical value (if known) |  |

| Notes | This set point has not changed in the last few years and is not expected to change in the future. |



| Site Constant Name | Number of carriages in a set |

| Description | The set point for air temperature in the passenger compartments of the train |

| How it is measured / calculated | Measured continuously |

| Typical value (if known) |  |

| Notes | This set point has not changed in the last few years, and is not expected to change in the future. |



| Variable Name | TBC |

| Description |  |

| How it is measured / calculated |  |

| Typical value (if known) |  |

| Reason for exclusion |  |



| Term | Definition |

| ACP | Accredited Certificate Provider -  a person accredited under the ESS to create ESCs for Recognised Energy Saving Activities. |

| AM&VP | Approved Measurement and Verification Professional. A person approved by the ESC to validate Measurement and Verification plans. |

| AP | Accredited Provider -  a person accredited under the ESC to create VEECs for Prescribed Activities. |

| BMS | Building management system, used to control the operation of the air-conditioning equipment. |

| Accuracy factor | A number between 0 and 1, used to discount energy savings according to the relative precision of normal year energy savings at 90% confidence level. |

| Coefficient of variation | The sample standard deviation expressed as a percentage of the sample mean. |

| Decay factor | A number between 0 and 1 which quantifies the decay of the energy savings due to degradation over time. |

| ECM | Energy Conservation Measure |

| Effective range | The range over which values of independent variables and/ or site constants for which a baseline energy model or operating energy model (as the case may be) is valid. |

| Electricity savings | The reduction of the amount or equivalent amount of electricity consumption (in MWh) arising from the implementation, may be negative for fuel switching activities. |

| Energy model | A mathematical model describing the energy use profile before an implementation (baseline) and after an implementation (operating) occurs. |

| Energy savings | Electricity savings or gas savings, or both. |

| ESS Rule | Energy Savings Scheme Rule of 2009 effective 30 March 2020 |

| Estimate of the mean | A method in PBA that can be used to establish an energy model. |

| Gas | Any fuel listed in National Greenhouse and Energy Reporting (Measurement) Determination 2008 (Cth) Schedule 1 Part 2—Fuel combustion—gaseous fuels or liquefied petroleum gas. |

| Gas savings | The reduction of the amount of gas combusted for stationary energy (in MWh) arising from the implementation, may be negative for fuel switching activities. |

| HVAC | Heating, ventilation and air-conditioning |

| Implementation | The delivery of a Prescribed Activity at a site. |

| Implementation date | The implementation date is the date that the implementation commenced under normal operations. |

| Independent variable | A parameter that varies over time, that can be measured and affects the end-user equipment’s energy consumption at a site. |

| Interactive energy savings | A change in a site’s energy consumption due to interactions with end-user equipment for which energy consumption is not measured. |

| LED | Light Emitting Diode |

| Measurement and Verification professional | A person approved by the Scheme Administrator to validate Measurement and Verification plans. |

| Measurement boundary | The area of a site that is subject to the implementation, where the energy consumption by any end-user equipment located within it is directly affected by the implementation. |

| Measurement period | The duration of time over which measurement of energy consumption will be taken for the purposes of calculating the energy savings. |

| Non-routine Adjustments | Events which affect energy use, within the chosen measurement period, that are not modelled by any independent variables or site constants. They are required to be removed from the measurement period to enable like-for-like comparison of before and after energy savings scenarios. They are typically due to static factors that may include fixed, environmental, operational and maintenance characteristics. |

| Normal operations | Typical operating conditions of end-user equipment, excluding commissioning. |

| Normal year | A typical year for the operation of the end-user equipment at the site after the implementation date. |

| Number of model parameters | In relation to an energy model, means the number of parameters required to unambiguously define the functional form of the energy model. In a linear energy model, it is the number of coefficients or the number of independent variables and site constants that are used to explain energy consumption variation. |

| PBA | Project-based activities (PBA) are methods that help businesses access incentives for large and custom projects. They are a Victorian Government initiative and are offered as part of the Victorian Energy Upgrades program |

| Persistence model | A model used to forecast the continuation of energy savings from an implementation over its useful lifetime. |

| Purchaser | Refer to section 3.2 of the PIAMV Method Guide on the ESS Website. |

| Pre-implementation period | The measurement period prior to the implementation period. |

| Regression analysis | A method in PBA used to establish an energy model that determines a mathematical function for approximating the relationship between energy consumption and independent variables and / or site constants and includes, but is not limited to, linear regression, and mixed models. |

| Relative precision | A measure of the relative range within which a true value is expected to occur with some specified confidence level. |

| RESA | Recognised Energy Saving Activity |

| Prescribed Activity | Activities that generate certificates in the Victorian Energy Efficiency Target scheme are known as prescribed activities |

| Site constant | A parameter for a site, which does not vary over time under normal operating conditions and affects the equipment’s energy consumption. |

---

## Summary of Funding Options - Notes.pdf

*File: `Summary of Funding Options - Notes.pdf`*

29€
FLEET                                                               fund NC                              options     David Rees
                             ENHANCEMENT                                             ,
                                                                                                                           haha son




                                                                                                                    I
                                                                                                                    Brad              .


                                                                                                                    -




        ① FED                                     EMISSIONS         RED N FUND
                                      o       C
                                                offset Quarterly Auction                                                .    Paekenham
                                                      abatement credit


                                          o.IE#g:s7IEIEn2odeadl.ieio/z-Prapo@
                                              7
                                                  years
                                      •




                                          •   Reverse Auction                            .   .   -
                                                                                                     we       can
                                                                                                                         o
                                                                                                                             offset       4   Clients
                                                    set the             price                to          win
                                                                                                                                          McG
                                                                                                                                 eg   .         .




    2                    Clean                                      Innova                       fund
                                                  Energy
            .




                                                                    CEFC.COM.AU
                     -

                             Specialist financier
                             Invest      behalf of fed Govt
                    -


                                                  on                                                                    -
                                                                                                          .




                                                                                                                            Power Purchase
 ⑥
                                                                                                                                                        .




                         EPC                  -

                                                   estates         Epe           between
                                  4- Nsw                 t

                                                         +
                                                               Utility
                                                              Downer
                                                                             .   .   -
                                                                                         fund FE                                Agreement ?
    4   .
                         Nsw
                                                  Energy Saving                      Scheme


                                                   generate certificates
                                  •
                                      we

                                                              retailers
                                                                                                     '
                                              +     sell to
                                          I MWF           l ESS     -
                                                                        $25


-




 *
        Nsw                       Environmental trust                    .




                         "                                     '

                         contestable
                                                    grants
                             '
                                                       with
                                                               pollution
                                                                             '


                                 dealing
*
                Arena                                    ARENA .GOV.AU
                    Australian Renewable
                                                                                 Agency
                '

                                                                   Energy

---
