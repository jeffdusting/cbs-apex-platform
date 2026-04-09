---
entity: cbs-group
category: tender
title: "CBS Group — Downer Alternate Funding Proposal (Energy Savings Scheme) — PC-07 Wolf Computer simulation PrinciplesCour..."
---

> **Parent document:** CBS Group — Downer Alternate Funding Proposal (Energy Savings Scheme)
> **Entity:** CBS Group, a technical advisory firm specialising in infrastructure asset management, systems engineering, and tolling
> **Category:** tender submission and procurement documentation
> **Total sections in parent:** 165
>
> This is a sub-document extracted from the parent for retrieval optimisation.
> The parent document contains the complete collection; this section is independently
> retrievable for targeted queries.

## PC-07 Wolf Computer simulation PrinciplesCourse - with watermark.pdf

*File: `PC-07 Wolf Computer simulation PrinciplesCourse - with watermark.pdf`*

Use of Simulation Modeling to Analyze
Vehicle and Track Interaction

                Presented by:

                Gary Wolf
                               Wolf Railway Consulting
                               2838 Washington Street
                            Avondale Estates, Georgia 30002
                                    404‐600‐2300
                                www.wolfrailway.com


                                                              1
  Computer Simulation Models used in
     Train and Vehicle Dynamics
• Train Operations Simulator (TOS)
• Train Operations and Energy Simulator
  (TOES™)
• NUCARS™, VAMPIRE, SIMPACK, GENSYS,
  ADAMS RAIL, Universal Mechanism (UM)




                           TOES and NUCARS are trademarks of TTCI
Simulation – the imitation of the operation of a real‐
         world process or system over time Wikipedia


  Simulation - the representation of the
  behavior or characteristics of one system
  through the use of another system, especially
  a computer program designed for the       purpose.
                                      Dictionary.com



   Simulation - the imitative representation of the
   functioning of one system or process by means of the
   functioning of another <a computer simulation of an
   industrial process> Webster

                                                  3
         2 Kinds of Simulation
• Deterministic
  – Based on laws of physics and uses real world
    inputs
     Excellent when there is certainty about inputs


• Probabilistic or Stochastic
  – Based on probabilities of something
    happening, often using random or defined
    probability distribution of various inputs
     Excellent when there is uncertainty about inputs

                                                         4
     Advantages of Simulation
• Re‐create the impossible
• More cost effective than testing
• Can perform many “what if’s”
• Removes Opinions and Biases
• Consistent Methodology
• Proven results; all models validated
Two Types of Simulation Models
     in Railway Dynamics

• Simulation of longitudinal train dynamics;
  coupler to coupler forces in a moving train

• Simulation of individual vehicle dynamics



                                                6
                 TOS Model
• Developed in early 70’s by AAR and industry group of TTD
  Officers
• Developed in FORTRAN for DEC Mainframe Computer
• Well Validated by rail industry
• Primarily Longitudinal Dynamics
• Predict Speeds and Coupler Forces
• Slack Action
• Useful for Train Stopping distances
• Limited to 2 Locomotive Positions in train
• Downside
   – Cannot adequately model EOC devices
   – Cannot adequately model articulated connectors
        Examples of Validations
of TOS braking performance calculations




                                          8
Validations




              9
Validations



              1
Validations



              11
      Conclusions TOS Validation
• Over 200 instrumented and measured stop test
  validations have been performed
   – Typical accuracy +/‐ 3%
• Numerous instrumented drawbar tests on loaded coal
  and grain trains
   – Typical accuracy +/‐ 5% accuracy in steady state pulling
      or buff
   – +/‐ 15% accuracy in predicting the magnitude of slack
      events
   – Very accurate on predicting location and timing of
      slack
• Nearly every Class 1 railroad in North America has
  successfully used the TOS Model

                                                                12
          Simple TOS FORTRAN Input File

REVERSE
 37.0080. 80. 42.00
 42.00 666
  9. 42.   0.00       38.70   38.80
  4. 41.   0.00       38.9    39.10
  3. 31.   0.00       39.1    39.20
  3. 21.   0.00       39.3    39.50
  3. 20.   0.00       39.6    39.80
                                         LAST
0370006568 0420010000                              LAST
LAST
O2       SD6072. 199                  CF CP   90
O72     LB5 56. 83                    CF CP   23
       LAST
WI
FORCES 1 2 74
B P 80
L3
P 1
IDLE
START 38.8 20 MPH
BE
BAIL
C 0 MPH
STOP




                                                          1
             TOS Output File
                    BRAKES     MAXIMUMS      ACCEL          FOR SPECIFIED VEHICLES
   STATION   SPEED THTLE AMPS SETTING PRESSURE (AND LOCATION) MPH PER POSI IDENTIFIER    DRAWBAR FORCES       L/V
 TIME    MP LMT RUN      TRN IND PIPE CYL KIPS:CAR L/V:CAR SEC MIN TION          FORE AFT RATIO


-----> USE WIDE CARRIAGE FORMAT FOR OUTPUT DATA
-----> PRINT OUT FORCES ON VEHICLE 1
-----> PRINT OUT FORCES ON VEHICLE 2
-----> PRINT OUT FORCES ON VEHICLE 74
-----> USE 80 P.S.I. BRAKE PIPE PRESSURE
-----> LEAKAGE = 3 P.S.I. PER MINUTE
-----> PRINT OUT (AT LEAST) EVERY 1 SECONDS
-----> IDLE
-----> EMERGENCY APPLICATION
-----> BAIL OFF TO 0 P.S.I. IN BRAKE CYLINDER
-----> CONTINUE UNTIL SPEED REACHES 0 M.P.H.
>>>>>>>>>>>>>>> TRAIN STARTING AT-1.30% GRADE
 0: 0: 0 38.800 80 20+IDLE 0 EMG REL 80# 0# 2:10 .09:10 0 14       1 LOCOMOTIVE        0 KIPS   0 KIPS 0.00
         38.814                80# 0#              2 LOCOMOTIVE     0 KIPS     1 KIPS 0.00
         39.580                80# 0#             74 BOX       0 KIPS    0 KIPS 0.00
 0: 0: 1 38.794 80 20+IDLE 0 EMG REL 0# 0# 2:3 .09:10 0 14        1 LOCOMOTIVE        0 KIPS  1 KIPS 0.00
         38.808                 0# 0#             2 LOCOMOTIVE     1 KIPS     2 KIPS 0.00
         39.575                80# 0#             74 BOX       0 KIPS    0 KIPS 0.00
((((((((((( TRAIN ENTERING -9 DEGREE 42 MINUTE CURVE
 0: 0: 2 38.789 80 20+IDLE 0 EMG REL 0# 0# 7:16 .25:1 0 11        1 LOCOMOTIVE        0 KIPS  2 KIPS 0.25
         38.802                 0# 0#             2 LOCOMOTIVE     2 KIPS     5 KIPS 0.00
         39.569                80# 0#             74 BOX       0 KIPS    0 KIPS 0.00
 0: 0: 3 38.783 80 21+IDLE 0 EMG REL 0# 0# -30:20 .25:1 0 6       1 LOCOMOTIVE        0 KIPS  3 KIPS 0.25
         38.797                 0# 0#             2 LOCOMOTIVE     3 KIPS     8 KIPS 0.01
         39.563                80# 0#             74 BOX      -2 KIPS     0 KIPS 0.00
 0: 0: 4 38.777 80 21+IDLE 0 EMG REL 0# 0# -47:17 .25:1 0 1       1 LOCOMOTIVE        0 KIPS  5 KIPS 0.25
         38.791                 0# 0#             2 LOCOMOTIVE     5 KIPS 10 KIPS 0.25
         39.558                 0# 1#            74 BOX      -2 KIPS     0 KIPS 0.00
 0: 0: 5 38.772 80 21-IDLE 0 EMG REL 0# 0# -49:14 .25:1 0 -5     1 LOCOMOTIVE        0 KIPS   5 KIPS 0.25
         38.785                 0# 0#             2 LOCOMOTIVE     5 KIPS 12 KIPS 0.25
         39.552                 0# 13#            74 BOX      -2 KIPS     0 KIPS 0.00
 0: 0: 6 38.766 80 20-IDLE 0 EMG REL 0# 0# -48:13 .27:2 0 -11     1 LOCOMOTIVE        0 KIPS   6 KIPS 0.25
         38.780                 0# 0#             2 LOCOMOTIVE     6 KIPS 12 KIPS 0.27




                                                                                                                    1
Inputs to TOS Model
                                                          Analysis
                                                               ,
                                          Train Speed and Maximum In-Train (Drawbar) Forces
                              40
                                                     MP of Lead                 Train Direction                    SPEED
                              35                    Loco at Time
                              30                    of Derailment
               Speed (mph)


                              25
                              20
                                                                           Simulated Speed
                              15                                           Event Recorder Speed (Lead Locomotive 4481)
                                                                           Event Recorder Speed (3rd Locomotive 3872)
                              10
                               5
                                0
                              250 Draft                                                                       MAXIMUM
Drawbar Force (kips)




                              200                                                                             FORCES
                              150
                              100
                               50
                                0
                              -50
                             -100
                             -150
                             -200
                             -250 Buff
                             -300
                                515.8       515.9           516.0       516.1           516.2            516.3           516.4
                                                             Mile Post of Lead Locomotive




                                   17
                                              TOS Analysis
                                                        ,
                                          Drawbar Forces on 1st Derailed Car
                       300
                              Draft
                       250
                                                                                       Train Direction
                       200
                                                           POD
                       150
Drawbar Force (kips)




                       100

                        50

                         0

                        -50

                       -100

                       -150

                       -200

                       -250
                              Buff
                       -300
                          515.2       515.3        515.4     515.5    515.6      515.7      515.8        515.9
                                                     Mile Post of First Derailed Car



                                              18
                     TOES™
• Similar to TOS; designed by AAR/TTCI in the late
  80’s for use on PC’s
• Written in C+
• Can Model EOC Cushion Devices
• Different Brake Pipe Model based on fluid
  dynamics
• Can Model Slackless Articulated Connections
• Can model more than 2 locomotive Positions
• Can model collisions (g’s)
                                       TOES trademark of TTCI
                   TOES Track Input Data
STARTING FOOTAGE: 1642238.4           AT HEADING(deg):=      0.00

 MARKER        FOOTAGE       CURVE SP_ELV          ELEVTN   %GRADE     SPEED LUB MILEPOST   STATION

 'TRKBGN '     1642238.4     0.00 0.000    243.0      0.00 80.00 'N' ' 311.03' '     '
 'CRV-TS '   1642238.4     0.00 0.000     243.0     0.00 80.00 'N' ' '     ''
 'CRV-SC '   1642238.4     3.05 0.000     243.0      0.00 80.00 'N' ' '     ''
'ELVATN '    1642766.4     3.05 0.000     243.0    -0.50 80.00 'N' ' '     ''
 'CRV-CS '   1644403.2     3.05 0.000     234.8     -0.50 80.00 'N' ' '     ''
 'CRV-ST '   1644403.2     0.00 0.000     234.8    -0.50 80.00 'N' ' '      ''
 'ELVATN '   1647148.8     0.00 0.000     221.1     -0.26 80.00 'N' ' '     ''
 'CRV-TS '   1647360.0     0.00 0.000     220.5    -0.26 80.00 'N' ' '      ''
 'CRV-SC '   1647360.0     1.00 0.000     220.5     -0.26 80.00 'N' ' '     ''
 'ELVATN '   1647571.2     1.00 0.000     220.0     -0.45 80.00 'N' ' '     ''
 'ELVATN '   1648468.8     1.00 0.000     216.0     -0.05 80.00 'N' ' '     ''
 'ELVATN '   1650316.8     1.00 0.000     215.1     -0.11 80.00 'N' ' '     ''
 'ELVATN '    1651161.6    1.00 0.000     214.2      0.30 80.00 'N' ' '     ''
 'ELVATN '    1651531.2    1.00 0.000     215.3      0.54 80.00 'N' ' '     ''
 'CRV-CS '   1652006.4     1.00 0.000     217.9      0.54 80.00 'N' ' '     ''
 'CRV-ST '   1652006.4     0.00 0.000     217.9     0.54 80.00 'N' ' '     ''
 'ELVATN '    1653537.6    0.00 0.000     226.2      0.30 80.00 'N' ' '     ''
 'CRV-TS '   1653960.0     0.00 0.000     227.4     0.30 80.00 'N' ' '     ''
 'CRV-SC '   1653960.0     2.33 0.000     227.4      0.30 80.00 'N' ' '     ''
 'ELVATN '   1654857.6     2.33 0.000     230.1     -0.42 80.00 'N' ' '     ''
 'ELVATN '    1655544.0    2.33 0.000     227.2      0.00 80.00 'N' ' '     ''
 'CRV-CS '   1656283.2     2.33 0.000     227.2      0.00 80.00 'N' ' '     ''
 'CRV-ST '   1656283.2     0.00 0.000     227.2     0.00 80.00 'N' ' '     ''
 'ELVATN '   1656283.2      0.00 0.000    227.2     -0.12 80.00 'N' ' '     ''
 'ELVATN '    1657867.2    0.00 0.000     225.3      0.00 80.00 'N' ' '     ''
 'CRV-TS '   1658131.2     0.00 0.000     225.3     0.00 80.00 'N' ' '     ''
 'CRV-SC '   1658131.2     1.50 0.000     225.3      0.00 80.00 'N' ' '     ''
 'ELVATN '   1658606.4     1.50 0.000     225.3     -0.09 80.00 'N' ' '     ''
 'CRV-CS '   1660560.0     1.50 0.000     223.5     -0.09 80.00 'N' ' '     ''
 'CRV-ST '   1660560.0     0.00 0.000     223.5    -0.09 80.00 'N' ' '      ''
 'ELVATN '   1663200.0     0.00 0.000     221.1     -0.09 80.00 'N' ' '     ''
 'ELVATN '   1666790.4     0.00 0.000     217.9      0.00 80.00 'N' ' '     ''



                                                                                                      2
 RECTYP = 'PLATFORM'
 &END
 &PLATFM
     PLATID = 'SD40-2', DESC = 'PLATFORM ID FIELD',
     AIRDVF = 0.09, DESC = 'DAVIS AERODYNAMIC FOR PLATFORM A-END',
     AIRDVR = 0.09, DESC = 'DAVIS AERODYNAMIC FOR PLATFORM B-END',
     KSTIFF = 140000., DESC = 'PLATFORM LONGITUDINAL STIFFNESS (LBS/IN)',
     LENS2S = 68.83, DESC = 'LENGTH STRIKER TO STRIKER (FT)',
     PLTWGT = 287030., DESC = 'PLATFORM **ONLY** EMPTY WEIGHT (LBS)',
     HEMCG = 72., DESC = 'CENTER OF GRAVITY HEIGHT (EMPTY) (IN)',
     HLDCG = 72., DESC = 'CENTER OF GRAVITY HEIGHT (FULLY LOADED) (IN)',

 PLATID = 'AUTORACK', DESC = 'PLATFORM ID FIELD',
     AIRDVF = 0.0853, DESC = 'DAVIS AERODYNAMIC FOR PLATFORM A-END',
     AIRDVR = 0.0853, DESC = 'DAVIS AERODYNAMIC FOR PLATFORM B-END',
     KSTIFF = 140000., DESC = 'PLATFORM LONGITUDINAL STIFFNESS (LBS/IN)',
     LENS2S = 94.7, DESC = 'LENGTH STRIKER TO STRIKER (FT)',
     PLTWGT = 29356., DESC = 'PLATFORM **ONLY** EMPTY WEIGHT (LBS)',
     HEMCG = 72., DESC = 'CENTER OF GRAVITY HEIGHT (EMPTY) (IN)',
     HLDCG = 72., DESC = 'CENTER OF GRAVITY HEIGHT (FULLY LOADED) (IN)',




FUELID = 'SD60', DESC = 'PLATFORM ID FIELD',             &END
                                                          &COUPLR
   LWIDGL = 2.9, DESC = 'GAL/HOUR LOW IDLE',
                                                             CPLRID = 'LONG1', DESC = 'COUPLER ID FIELD',
   HGIDGL = 2.9, DESC = 'GAL/HOUR HIGH IDLE',
                                                             CPRLEN = 60., DESC = 'COUPLER LENSTR (IN)',
   R1GAL = 11.7, DESC = 'GAL/HOUR RUN 1',
                                                             KNUTYP = 'E', DESC = 'E, F, OR H KNUCKLE',
   R2GAL = 22.6, DESC = 'GAL/HOUR RUN 2',
                                                             CPRANG = 12.75, DESC = 'COUPLER ANGLE
   R3GAL = 47.8, DESC = 'GAL/HOUR RUN 3',
                                                         (DEGREES)',
   R4GAL = 65.2, DESC = 'GAL/HOUR RUN 4',
                                                             FRESLK = 0.5, DESC = 'FREE SLACK (IN)',
   R5GAL = 87.4, DESC = 'GAL/HOUR RUN 5',
                                                             ISALN = F, DESC = 'TRUE IF ALIGNMENT CONTROL,
   R6GAL = 133.7, DESC = 'GAL/HOUR RUN 6',
                                                         ELSE FALSE',
   R7GAL = 158.89999, DESC = 'GAL/HOUR RUN 7',
   R8GAL = 186., DESC = 'GAL/HOUR RUN 8',
   DYNGAL = 10.4, DESC = 'GAL/HOUR DYNAMIC',


                        TOES Consist Input Data

                                                                                                             2
                        TOES Command File Data
BRAKE PIPE_PRESSURE 90.
SWITCH ON POST_PROCESSOR
FORWARD_DIRECTION INCREASING_FOOTAGE FORWARD
COM OUTPUT ALL_LOCOMOTIVES ON

ISOLATE THROTTLE START_STOP_ISOLATE 3 6
ISOLATE THROTTLE START_STOP_ISOLATE 8 9
ISOLATE DYNAMIC START_STOP_ISOLATE 3 6
ISOLATE DYNAMIC START_STOP_ISOLATE 8 9

PILOT_VALVE CUT_OUT 1 LAST_THROTTLE
MU2A_VALVE CUT_OUT 1 LAST_THROTTLE

OUTPUT EVERY 1 ON

RUN 4
START 23 1681415 INCREASING_FOOTAGE FIRST_RECORD
CON 10 S

UNDESIRED_EMERGENCY 21
CON 1 S
BAIL 0

CON 1 S

UNDESIRED_EMERGENCY 101
CON 5 SECONDS

RUN 3
CON 3 SECONDS

IDLE
CON 0 MPH 999 SECONDS

CON 10 S

STOP



                                                   2
ISOLATE DYNAMIC START_STOP_ISOLATE 8 9
 PILOT_VALVE CUT_OUT FROM THROTTLE 1 TO LAST_THROTTLE
 MU2A_VALVE CUT_OUT FROM THROTTLE 1 TO LAST_THROTTLE
 OUTPUT EVERY 1 ON
 RUN 4 [LOCOMOTIVE NUMBER 1]
 RUN 4 [LOCOMOTIVE NUMBER 2]
 IDLE [LOCOMOTIVE NUMBER 3]
 IDLE [LOCOMOTIVE NUMBER 4]
 IDLE [LOCOMOTIVE NUMBER 5]
 IDLE [LOCOMOTIVE NUMBER 6]
 RUN 4 [LOCOMOTIVE NUMBER 7]                        TOES Output File Data
 IDLE [LOCOMOTIVE NUMBER 8]
 IDLE [LOCOMOTIVE NUMBER 9]
 RUN 4 [LOCOMOTIVE NUMBER 10]
 SPEED SPECIFIED AT    23.00 MPH
 HEAD OF TRAIN FOOTAGE SPECIFIED AT     1681415.0
 GENERAL TRAIN DIRECTION SPECIFIED IN INCREASING FOOTAGE
 HEAD OF TRAIN SPECIFIED TO BE FIRST VEHICLE RECORD
 CONTINUE      10.000 SECONDS

VEH    LOCATION SPEED-mph ACC-mphpm GRADE CURVE NOTCH FORE AFT BPP BCP

T: 0: 0: 0.000 [Spd-Lmt: 80]  No buff force    Max Draft/Veh: 10> 52K
Tot Cyls: Tr Av BCP: Tot Loc Cyls: Loc Av BCP: Tot Car Cyls: Car Av BCP:
    171      0.00         80   0.00         91     0.00
Avg Trn Speed: 23.00 Avg Trn Accel:        4.473
 1 311.03 +39140.1 23.00S 0.00a 0.4% 0.0D RUN 4 0K 16K 90# 0#
 2 311.03 +39067.0 23.00S 0.00a 0.4% 0.0D RUN 4 16K 33K 90# 0#
 3 311.03 +38997.4 23.00S 0.00a 0.4% 0.0D ISOLAT 33K 29K 90# 0#
 4 311.03 +38929.8 23.00S 0.00a 0.4% 0.0D ISOLAT 29K 26K 90# 0#
 5 311.03 +38860.7 23.00S 0.00a 0.4% 0.0D ISOLAT 26K 23K 90# 0#
 6 311.03 +38789.6 23.00S 0.00a 0.4% 0.0D ISOLAT 23K 20K 90# 0#
 7 311.03 +38716.0 23.00S 0.00a 0.4% 0.0D RUN 4 20K 43K 90# 0#
 8 311.03 +38641.9 23.00S 0.00a 0.4% 0.0D ISOLAT 43K 40K 90# 0#
 9 311.03 +38567.7 23.00S 0.00a 0.4% 0.0D ISOLAT 40K 36K 90# 0#
10 311.03 +38493.6 23.00S 0.00a 0.4% 0.0D RUN 4 36K 52K 90# 0#
11 311.03 +38419.8 23.00S 0.00a 0.4% 0.0D             52K 52K 90# 0#
12 311.03 +38354.3 23.00S 0.00a 0.4% 0.0D             52K 51K 90# 0#
13 311.03 +38298.0 23.00S 0.00a 0.4% 0.0D             51K 50K 90# 0#
14 311.03 +38237.9 23.00S 0.00a 0.4% 0.0D             50K 48K 90# 0#



                                                                            2
   Train Energy Model (TEM)
• Used for over‐the‐road simulation
• Useful for determining approximate speeds
• Accurate predictions of fuel consumption
• Can be used in wheel/rail lubrication
  studies
Summary of Longitudinal Models
• Accurate in predicting traction and braking
  forces
  – On any vehicle in the train anywhere on the
    track
• Accurate in predicting speed of the train
• Accurate in predicting over the road run
  times
• Accurate in predicting fuel consumption


                                                  29
            Rail Anchoring ‐ Restraint Analysis
• Effect of introduction of AC’s on rail anchoring
   – Will AC’s accelerate joint problems such as joint batter
      and joint bar cracking?
   – What anchor patterns required to restrain longitudinal
      forces?
   – What curves/tangents should have priority for anchor
      upgrading?
   – Does train handling need to be restricted in certain
      areas?


          Effect of Poor Rail Anchoring
     Priority Rating for Rail Anchoring
               Improvements
• Determine highest areas of grade resistance
   – Track profile ‐ grades and curvature
   – Train lengths ‐ looking for average grade resistance
     under entire train ‐ varies with different train lengths
• Determine areas of high longitudinal forces
• Prioritize based on these factors
   SD70M AC                                            Rail Anchoring Project
3 Locos, 9075 TT                                      Over the Road Sim ulation



                                  2000     Train Direction



     Elevation (ft)
                                  1000



                                     0
                                                                                                                       Rail Anchoring
                                    50
                                                             Speed Limit
                                                                                                                       Study -
      Speed (m ph)




                                    40
                                    30
                                    20
                                                       Simulated Speed
                                                                                                                       Over-The-Road
                                    10
                                     0                                                                                 Simulation
                                     8
                                     6
              Throttle Position




                                     4
                                     2
                                     0
                                    -2
                                    -4
                                    -6
                                    -8

                                   Off
       Brake




                                   On
 Drawbar Force (Kips)




                                   300
                                   200
                                   100
                                     0
                                  -100
                                  -200
                                  -300

                                     100   150      200         250         300       350   400   450     500
                                                                           Milepost
               5NBAF1                                                                             Rail Sciences Inc.
    Curve Elevation Optimization
• Longitudinal modeling provides a range of actual train
  speeds under a variety of tonnage, power, and train
  operations factors (slow orders, speed restrictions, etc.)
• Issues with determining optimum elevation
   – Mixed freight and passenger
   – Heavy grade territory; uphill vs. downhill speeds
   – Distances from know speed restrictions;
      acceleration/deceleration
   – Different tonnage trains in same direction (drag vs.
      manifest/intermodal)


                                                               33
            Second Case
• High rail wear rate on low rail in 6 degree
  curve at location of heavily used siding
  switch.
• Many loaded trains slowing to enter siding
  at 10‐15 MPH.
• Curve balanced for 30 MPH operation with
  2.75” elevation


                                                36
Increased Rail Wear due to Operational Factors

   Subdivision 1
  Head
  Loss


                      High Wear Rate
                      on Low Rail


           Vertical Wear
  Track Profile



Trains slow for
meets at siding

                    Loaded Train
                    Direction


  Loaded train
  speeds under
  balance speed
  in these curves
     Effect of Operating Speed on Wheel Loading
                                                       Speed Effect on Vertical Forces
                                                     Low and High Rail Vertical Wheel Loads
                            40000


                            35000


                            30000
Vertical Wheel Load (Lb.)




                            25000


                            20000


                            15000


                            10000


                             5000


                                0
                                                11                19                         25              30
                     263,000 GRL Car                                     Speed (MPH)
                     6 Degree Curve, 2.75" Superelvation
                     Balance Speed = 29.5 MPH
                                                                   Low Vertical   High Vertical
                                                                                                  From NUCARS
                                                                                                  Simulation Analysis
                                    Effect of Speed on Lateral Forces
                                                       Speed Effect on Lateral Forces
                                                     Low and High Rail Lateral Wheel Loads
                            14000


                            12000


                            10000
Lateral Wheel Force (Lb.)




                            8000


                            6000


                            4000


                            2000


                                0
                                                11                19                           25              30
                     263,000 GRL Car
                                                                             Speed (MPH)
                     6 Degree Curve, 2.75" Superelvation
                     Balance Speed = 29.5 MPH                                                       From NUCARS
                                                                       Low Lateral   High Lateral
                                                                                                    Simulation Analysis
  Possible Solution


El. Eq. = .00067 (6) (15 x15)

  = 0.90 inch call it ~ 1.0 inch

For speeds entering siding between
10-15 MPH, an elevation of 1.0 inch
would be more appropriate.



                                      4
     Vehicle Dynamics Models
• Generally used to model one vehicle operating
  over a section of track (1000 ft. typical)
• Can simulate multiple types of car defects or
  wear
• Can simulate multiple types of rail geometry
  perturbations
• Can simulate at any speed
• Can predict wheelset lateral, vertical forces and
  L/V ratios (At a minimum)
• Generally called MBS (Multi‐Body Simulation)
  models

                                                      42
   Leading MBS Simulation Models
• VAMPIRE
   – Developed by British Rail Starting in 1970s
   – Now managed by Delta Rail of Derby England
• NUCARSTM
   – Developed by AAR/TTCI in mid 1980’s
   – First release 1987, many revisions since
• SIMPACK
   – Developed in Germany as MBS package at German
     Aerospace Research (DLR)
   – In 1995 first release with rail version; Siemens involved
     in effort
   – Claims to do vehicle dynamics and train dynamics

                                                                 43
Leading MBS Simulation Models
•   ADAMS Rail
     – Started with MBS software MSC.ADAMS as platform
     – In 1993 Dutch Rail began effort to customize for rail applications
     – In 1996, MEDYNAs development team joined up with MSC.ADAMS/RAIL
     – Now Marketed by MSC Software
•   Universal Mechanism (UM)
     – Developed as MBS open platform by Laboratory of Computational
        Mechanics
        Bryansk State Technical University, Russia
     – Has Rail capabilities, claims to do vehicle and train dynamics
•   GENSYS
     – Started in Sweden in 1980’s with ASEA
     – In 1992 full MBS version released for rail vehicles




                                                                        44
    University of Manchester
          Benchmark
• Completed ~1998
• Compared NUCARS, VAMPIRE, ADAMS
  RAIL, GENSYS, SIMPACK
• In general, all models were in close
  agreement on predicting wheel/rail forces
• NUCARS and VAMPIRE had fastest run
  times

                                              45
    How can MBS modeling help in
    the wheel/rail environment?
•   Optimize wheel profiles
•   Optimize turnout design
•   Optimize rail profiles; rail grinding strategies
•   Optimize curve elevation
•   Study rail lubrication strategies and quantify benefits
•   Study wheel and rail wear under various regimes
•   Analyze RCF issues
•   Study derailments and contributions from various factors
•   Acoustic Modeling



                                                               46
        Vehicle Dynamics Models
•   Car Conditions
     – Springs
     – Side Bearings
          Constant Contact
          Standard roller
     – Damping Levels
          Friction wedges
          Hydraulic
     – Wheel Profiles
     – Car center of gravity
     – Centerplate conditions
     – Steering linkages
     – Bump stops
Vehicle Dynamics Models Con’t.
•   Track Conditions
     – Crosslevel
     – Gage
     – Alignment
     – Rail Profile
     – Rail Lubrication
          • Gage face and top of rail
•   Operating Conditions
     – Speed
 Vehicle Dynamics Models Con’t
• Outputs
  – Vertical Wheel Forces
  – Lateral Wheel Forces
  – L/V ratios
  – Accelerations
  – Displacements of springs, dampers, side
    bearings
  – Wheelset position
  – Transducers anywhere on car
Rail-to-Wheel Contact
- Arbitrary number of contact patches
- Each wheel considered separately
- Profiles from library or measured
- Variable friction coefficient
Flexible Bodies




                               Mängel/Hecht, SIMPACK User Meeting 2011
Flexible carbody
- Passenger comfort analysis

Flexible bogie frame
- Derailment tests
- Durability

Flexible wheelsets
- Drivetrain analysis
- Durability

FE Interfaces
- ANSYS, NASTRAN, Abaqus, …
SIMPACK Kalker Contact
- Integration of Kalker/Vollebregt‘s CONTACT into SIMPACK
- Postprocessing of SIMPACK results with CONTACT
- Verification of critical simulations with CONTACT
- Easy to handle interface to CONTACT
  Rail and Wheel Forces




  Filters: Low-Pass, Band-Pass,    Long Tracks with Irregularities
Sliding Mean/RMS, Percentiles, …     Q, Y, ΣY, Y/Q, H, ÿ, ÿ+, ÿ*, ž, …
Derailment Safety




       Twisted Track with Dip, Narrow Curves   Q, Y, Y/Q, ∆Q/Q0, ∆z
  Running Stability




Non-Linear Time-Domain Analysis
      with Track Excitation
  Freight Trains

Longitudinal Train and Coupler Dynamics
- Buffers
- Cushioned couplers
- Shock absorbers
- Anti-climbing devices

Pneumatic brake system by
- SIMPACK Control
- External software (SIMPACK FMU Interface)
5
5
5
Interactive Vehicle Builder




                              6
Derailment analysis comparing
proper vs. insufficient constant
  contact side bearing set up
             height



                            61
Derailment analysis investigating
      effect of track twist




                            63
Wheel unloading due to crosslevel twist




                                     POD
Wheel unloading due to crosslevel twist




                                    POD
   Longitudinal Steering Moment

• The goal of wheelset steering is to develop a
 larger radius on High Rail vs. Low Rail




                                                  6
   What Factors Reduce Steering
             Moment
• Hollow Worn Wheels, False Flanges
• Over‐lubrication of High Rail
• Severe Two‐Point Wheel‐Rail Contact
• Wheel Tape Mismatches
     Normal Curving

         RL   < RR

                                  RR



RL

         Strong Steering Moment
         Generated
     Hollow Wheel Curving

           RL   = RR

                                   RR



RL

            ZERO Steering Moment
            Generated!
 Wheel/Rail Contact Geometry




               Moderate two-   Severe two-
Single Point
                  point           point
  Contact
                 Contact         Contact
Average Low Rail Lateral Forces for
Different Rail Profiles

                       12000
                       10000
 Lateral Force (Lb.)




                       8000
                       6000
                       4000
                       2000
                          0
                               Single-Point   Moderate    Severe two-
                                              Two-Point      Point
Subdivision 1 ‐ Proper Rail Profile
Subdivision 2 ‐ Heavy Gage Corner Wear High
   Rail, Minimal Field Side Relief Low Rail
Wheel Profiles
                                               New AAR 1B and Hollow Worn Wheel
                                                on Sub 2 Rail Profile and New Rail
                                                   Effect of Rail Profile on Lateral Force
                                                          Subdivision 2 Rail Profile
                                       11000

                                       10000
Lateral Force at Contact Patch (Lb.)




                                       9000

                                       8000

                                       7000

                                       6000

                                       5000

                                       4000

                                       3000

                                       2000

                                       1000

                                          0
                                                 Low Lateral                         High Tread Lateral                          High Flange Lateral
                                                        New 1B on Actual Profile   Hollow Worn Wheel on Actual Profile   New 1B on New 136#
Effect of track geometry (curve
misalignment) on rail wear in a
              curve




                           76
Effect of Track Geometry on Rail Wear

Subdivision 2




       Increase in Hi Gage
       Wear on High Rail




                              Sudden increase in
                              Head Loss Low Rail
Rail Profiles At Nominal Curvature
    and at Curve Misalignment
          Nominal
          Curvature




          Curve
          Misalignment
                                                                           Subdivision 2
                                                              Curve 30D, 3.5 Degree Right Hand Curve

                                           3.5

                                             3
Curvature (Deg) and Superelevation (In.)




                                           2.5

                                             2

                                           1.5

                                             1

                                           0.5                                   Rapid
                                                                                Curvature
                                             0                                  Changes
                                           -0.5

                                            -1

                                           -1.5

                                            -2
                                             30.64   30.645         30.65               30.655          30.66   30.665   30.67
                                                                                    Milepost

                                                                            Curvature       Superelevation
                             Effect of Curvature Anomaly on Tread and Flange Wear

                                         Effect of Track Geometry on Tread and Flange Wear
                                                    Values at Curvature Misalignment
                                   100

                                   90
                                                                                                              80
                                   80
Tread and Flange Wear (in-lb/in)




                                                                                                                             110%
                                   70
                                                                                                                             Increase
                                   60

                                   50

                                                                                                                                 38
                                   40
                                                53% Increase
                                   30

                                   20
                                                 10
                                   10                         6.5


                                    0
                                                  Low TreadWear                                                    High Flangewear

                                                                  Actual Track Geometry   Nominal Curve Geometry
 Case 1. Derailment in Curve
of Doublestack Car with Hollow
         Worn Wheel
Wheel‐Rail Contact Geometry
           Lead Axle ‐ DTTX 54214
Low Rail                            High Rail
                  2-point contact




                                    76°




                         2-point contact, loss of steering
                         Gage face angle 76°
                         Flange climb more likely
Wheel‐Rail Contact Geometry
           Second Axle ‐ DTTX 54214
Low Rail                                    High Rail
                  Contact points on
                 hollow treads cause
                 reverse steering




               (Wheelset lateral position
                                            76°
                                                                                 Simulation Results
                                                                                 Effect of Wheel/Rail Profiles
                                                                DTTX 54214, nominal cond., at MP 39.9; 32 mph
                                           F1 Ratio L/V Lft Wh Axle 1         F1 Ratio L/V Rgt Wh Axle 1        F2 Ratio L/V Lft Wh Axle 1   F2 Ratio L/V Rgt Wh Axle 1
                                1.00
                                                                                                   File 2 = Actual wheel/rail profiles
                                                                                                   File 1 = New wheel/rail Profiles
                   (wheel that climbed)




                                          .75


                                          .50
                (nondimen)




                                          .25


                                           0
L/V for L4 and R4




                                     -.25


                                     -.50
                                                                                                                                                   POD

                                     -.75
                                         200              225           250         275       300      325      350       375                400          425         450
                                                                                          Distance along the Track (feet)
           Case 2.
Derailment of Locomotive with
Asymmetrical Wheel Wear on
       switch point rail
                          Background

•   The train was operating at 28 mph in dynamic brake #3 at the time of
    the derailment.
•   Locomotive was SD90MAC equipped with HTCR (radial steering)
    trucks.
•   The wheels of the #4 axle revealed asymmetric flange wear. L4 is 3
    tape sizes smaller (~3mm, 0.118‐in) than R4. The L4 flange wear is
    greater than the R4.
•   L4 does not "take the gauge" for thin flange.
•   Track observations showed joints in both running rails with vertical
    deflection (pumping) 5‐ft ahead of the POD at the points.
•   Gauge face wear and head‐crushing were also evident in the 5‐ft.
    ahead of the switch.
•   The L4 wheel of Locomotive, climbed the point end of the point rail of
    a crossover switch. The switch was lined for the diverging route from
    Main #2 to Main #1.
               Wheel Profiles
                                                           L4 Wheel Profile -
                                                           significant flange wear -
                                                           approx. 79º flange angle




                         R4 Wheel Profile - almost
                         no flange wear - approx.
                         74º maximum flange angle


These profiles confirm that Axle 4 has been “crowding” consistently
toward the Left side, causing asymmetric wear to the wheel flanges
             Rail Sections


South Rail             North Rail
           Wheel and Rail Profiles




L4 Wheel                    R4 Wheel
                                                              Vampire® Simulation Results
                                                                     L4 Lateral Force
                                                      UPR0252 - Nelson Derailment - 28 Feb 03
                                     File 1: nelsonk-nomN.out            File 2: nelsonk-mp39N.out   File 3: nel~k-L4mp39N.out
                                60

                                     File 1: Nominal conditions
                                50   File 2: Worn Rail
                                     File 3: Worn L4 + Worn Rail

                                                          35 kips lateral force on
4L Lateral Wheel Load ( kips)




                                40                        Left Rail immediately
                                                          ahead of switch point

                                30
                                     These forces arise from deflection of the left rail,
                                     which is modeled with a high lateral stiffness.
                                20


                                10


                                 0


                                -10                                                POD/switch points
                                  120.0 122.5 125.0 127.5 130.0 132.5 135.0 137.5 140.0 142.5 145.0 147.5 150.0
                                                           Distance along the Track (meters)
                                                              Vampire® Simulation Results
                                          L4 Lateral Force in an ideal 6‐deg RH Curve

                                          UPR0252 - Nelson Derailement 28 Feb. 03

                                30        L4 Lat. Wheel Force - Nominal Wheel Profile

                                25        L4 Lat. Wheel Force - Actual L4 Profile
L4 Lateral Wheel Force [kips]




                                20

                                15

                                10                                                                             Avg:
                                                                                                               5.2 kips
                                 5

                                 0

                                 -5

                                -10
                                      0    20            40             60              80   100   120   140
                                                                 Distance Along the Track [m]
Miniprof to Measure Wheel & Rail Profile
LazerView
Hand Held Laser
Wheel Profiler
ARM
Optical Rail
Measurement
                   Conclusions
• Simulation modeling is mature and well validated
• Simulation is more cost effective than physical testing
• Simulation is excellent tool for design and analysis
• Simulation modeling is well suited to help solve a variety
  of wheel/rail interaction issues
• Simulation is only a tool; there is as much art as there is
  science in mastering simulation analysis
• Don’t let simulation ever supplant common sense and
  experience



                                                                95

---
