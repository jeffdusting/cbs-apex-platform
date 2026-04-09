---
entity: cbs-group
category: tender
title: "CBS Group Tender: DHS Victoria KPI Implementation — ISSRA Attachment - CBS Group Information Security Manual v1.1.pdf"
---

> **Parent document:** CBS Group Tender: DHS Victoria KPI Implementation
> **Entity:** CBS Group, a technical advisory firm specialising in infrastructure asset management, systems engineering, and tolling
> **Category:** tender submission and procurement documentation
> **Total sections in parent:** 38
>
> This is a sub-document extracted from the parent for retrieval optimisation.
> The parent document contains the complete collection; this section is independently
> retrievable for targeted queries.

## ISSRA Attachment - CBS Group Information Security Manual v1.1.pdf

*File: `ISSRA Attachment - CBS Group Information Security Manual v1.1.pdf`*

CBS GROUP INFORMATION SECURITY MANUAL
CBS Group Pty Ltd | ABN 20 164 870 080

Document Classification: OFFICIAL — Internal Use
 Field                 Detail

 Version               1.1

 Effective Date        [Date]

 Approved By           Jeff [Surname], Director / COO

 Next Review Date      [Date + 12 months]

 Document Owner        Information Security Officer



Document Control
 Version    Date     Author     Description

 1.0        [Date]   CBS        Initial release
                     Group

 1.1        [Date]   CBS        ISSRA compliance rectification — added legislative compliance (s.1.3A),
                     Group      amended cyber insurance to per-engagement model (s.1.8), amended password
                                policy (s.3.4.2), amended log retention (s.3.9.2), amended data sovereignty for
                                Victorian residency (s.4.8), added PIA section (s.4.9), added web filtering
                                (s.5.7.2(e)), added physical security (s.6.7), added regulatory reporting
                                obligations (s.10.2.6), updated ISSRA cross-reference matrix (Appendix A),
                                updated offboarding checklist (Appendix C.2)




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                            1/27
Table of Contents
    1. Governance & Framework

    2. Personnel Security

    3. Access Management

    4. Data Protection & Handling

    5. Technical Security Controls

    6. Asset & Device Management

    7. Backup & Recovery

    8. Third-Party & Supplier Security

    9. Security Awareness & Training

    10. Incident Response & Business Continuity

Appendices

    •    A: ISSRA Cross-Reference Matrix

    •    B: Security Roles Quick Reference

    •    C: Checklists & Templates




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                        2/27
1. Governance & Framework

1.1 Purpose
This Manual establishes CBS Group Pty Ltd's ("CBS Group") information security management framework. It
defines the policies, procedures and controls that protect the confidentiality, integrity and availability of
information held, accessed or processed by CBS Group, its personnel and its contractors.

This Manual serves as the single authoritative source for all information security obligations within CBS Group. It
applies to all personnel, contractors and third parties who access CBS Group or client information, systems or
networks.

1.2 Scope
This Manual applies to the following:

1.2.1 All CBS Group directors, employees, contractors and subcontractors (collectively, "personnel"), regardless
of location or engagement type.
1.2.2 All information assets owned, leased, controlled or processed by CBS Group, including client and public
sector information.
1.2.3 All technology systems, devices (company-issued and personally owned), cloud services and
communication platforms used for CBS Group business.
1.2.4 All third parties and suppliers who access, process or store information on behalf of CBS Group or its clients.

1.3 Framework Alignment
This Manual is aligned with the following frameworks and standards:

1.3.1 ISO/IEC 27001:2022 — Information Security Management Systems.
1.3.2 Australian Government Information Security Manual (ISM) — Australian Signals Directorate.
1.3.3 ASD Essential Eight Maturity Model — Australian Cyber Security Centre.
1.3.4 Victorian Protective Data Security Standards (VPDSS) v2.0 — Office of the Victorian Information
Commissioner.
1.3.5 Victorian Protective Data Security Framework (VPDSF) — for engagements with Victorian Government
departments.

1.3A Legislative Compliance
In addition to the frameworks and standards referenced in section 1.3, CBS Group acknowledges and complies
with the following legislation when handling Victorian Government and departmental information:

1.3A.1 Privacy and Data Protection Act 2014 (Vic) — governs the collection, handling, access to and correction
of personal data by the Victorian public sector and its contracted suppliers.
1.3A.2 Health Records Act 2001 (Vic) — governs the handling of health information, applicable where CBS Group
personnel access health records through departmental engagements.
1.3A.3 Children, Youth and Families Act 2005 (Vic) — applicable where CBS Group personnel access
information relating to children and families through DFFH or DH engagements.
1.3A.4 Child Wellbeing and Safety Act 2005 (Vic) — applicable where CBS Group personnel access child
wellbeing information.
1.3A.5 Family Violence Protection Act 2008 (Vic) — applicable where CBS Group personnel access family
violence information through departmental engagements.
1.3A.6 Privacy Act 1988 (Cth) — governs the handling of personal information by private sector organisations,
including obligations under the Notifiable Data Breaches scheme.

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                3/27
1.3A.7 CBS Group ensures all personnel working on Victorian Government engagements are briefed on the
legislative obligations relevant to their engagement, with specific emphasis on the sensitivity categories of
information they will access.

1.4 Information Risk Management Policy
CBS Group adopts a risk-based approach to information security. The following principles govern how information
security risks are identified, assessed, treated and monitored:

1.4.1 Risk identification. CBS Group maintains an Information Security Risk Register. Risks are identified through
ongoing operations, client engagement onboarding, security assessments, incident analysis and changes to the
threat landscape.
1.4.2 Risk assessment. Each identified risk is assessed for likelihood and consequence using a 5x5 risk matrix
consistent with ISO 31000 and the Victorian Government Risk Management Framework (VGRMF). The assessment
considers the classification level of information involved, the nature of the threat and the effectiveness of existing
controls.
1.4.3 Risk treatment. For each risk exceeding the acceptable risk threshold, CBS Group applies one or more
treatment strategies: avoidance, reduction (through controls), transfer (through insurance or contract) or
acceptance (with documented justification approved by the Information Security Officer).
1.4.4 Risk monitoring. The Risk Register is reviewed quarterly by the Information Security Officer and annually by
the Director. Material changes to risk profile (including new client engagements, technology changes or security
incidents) trigger an ad hoc review.
1.4.5 Risk appetite. CBS Group does not accept risks that would compromise the confidentiality of client or
public sector information, or that would breach legislative or contractual obligations.

1.5 Information Security Roles & Responsibilities
CBS Group defines the following information security roles. In a firm of CBS Group's size, individuals may hold
multiple roles:

1.5.1 Director / COO (Information Security Sponsor)
The Director is ultimately accountable for information security within CBS Group. Responsibilities include:
approving this Manual and material changes to it, setting the organisation's risk appetite, ensuring adequate
resources are allocated to information security, and representing CBS Group on security matters with clients and
regulators.
1.5.2 Information Security Officer (ISO)
The ISO is responsible for the day-to-day management of the information security framework. This role is held by:
[Nominated Person — recommended: Director / COO]. Responsibilities include:
    •    (a) Maintaining this Manual and the Risk Register.

    •    (b) Conducting and coordinating security assessments, including client ISSRAs.

    •    (c) Managing access provisioning and deprovisioning for client systems.

    •    (d) Overseeing incident response and escalation.

    •    (e) Coordinating security awareness training.

    •    (f) Serving as the designated contact for client information security queries.

    •    (g) Conducting quarterly access reviews and annual policy reviews.




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                 4/27
1.5.3 IT Systems Administrator

The IT Systems Administrator manages CBS Group's technology environment. This role is held by: [Nominated
Person]. Responsibilities include:
    •    (a) Administering Microsoft 365 tenant, Entra ID, and endpoint management.

    •    (b) Implementing technical security controls (MFA, conditional access, patching).

    •    (c) Managing device onboarding/offboarding and BYOD enrolment.

    •    (d) Monitoring security alerts and audit logs.

    •    (e) Executing backup and recovery procedures.

    •    (f) Maintaining the asset register.

1.5.4 All Personnel

Every person engaged by CBS Group has the following security responsibilities:
    •    (a) Complying with this Manual and any client-specific security requirements.

    •    (b) Completing mandatory security awareness training upon onboarding and annually thereafter.

    •    (c) Reporting security incidents, suspected breaches or policy violations promptly to the ISO.

    •    (d) Protecting credentials and not sharing login details under any circumstances.

    •    (e) Handling information in accordance with its classification and protective marking.

    •    (f) Using only approved devices and software for CBS Group and client work.

1.6 Cybersecurity Program Oversight
1.6.1 CBS Group maintains a structured cybersecurity program governed by this Manual. The program is overseen
by the Director with operational management by the ISO.

1.6.2 The program is reviewed annually against the ASD Essential Eight Maturity Model and any applicable client
security standards.
1.6.3 The annual review includes: assessment of the current threat landscape, review of incidents and near-
misses, evaluation of control effectiveness, update of the Risk Register, and identification of improvement
actions.

1.7 Security Assessments & Compliance
CBS Group commits to the following regarding client security assessments:

1.7.1 Client-initiated assessments. CBS Group agrees to participate in information security assessments
requested by clients as part of procurement (RFx), engagement onboarding, during the engagement, and following
any significant organisational change, at no additional cost to the client.
1.7.2 Lifecycle assessments. CBS Group will cooperate with security assessments at the following stages of a
client engagement: prior to engagement commencement, during the engagement (including periodic reviews),
and after any significant change to CBS Group's organisation, systems or security posture.
1.7.3 Notification of changes. CBS Group will promptly notify clients of material changes that may affect the
security of client information, including data breaches, changes in subcontractor arrangements, changes in
service location, or changes to CBS Group's organisational control.




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                5/27
1.8 Cyber Insurance
1.8.1 CBS Group secures cyber insurance coverage on a per-engagement basis, tailored to the risk profile, data
sensitivity and contractual requirements of each client engagement. Coverage is obtained prior to engagement
commencement where the engagement involves access to, processing of, or storage of client or public sector
information.

1.8.2 Each engagement-specific policy provides coverage for data breaches, ransomware attacks, business
interruption and third-party liabilities arising from information security incidents related to that engagement.
1.8.3 The ISO is responsible for assessing the cyber insurance requirement for each new engagement during the
engagement onboarding process, based on the following factors: the classification level of information to be
accessed, the contractual insurance requirements specified by the client, the nature and duration of the
engagement, and the risk assessment outcome.
1.8.4 A certificate of insurance or policy summary will be provided to clients upon request prior to engagement
commencement.
1.8.5 Where an engagement does not involve access to client or public sector information and no contractual
requirement for cyber insurance exists, the ISO will document the rationale for not obtaining coverage in the
engagement record.

1.9 Policy Review & Maintenance
1.9.1 This Manual is reviewed annually by the ISO, with approval by the Director.

1.9.2 Ad hoc reviews are triggered by: significant security incidents, material changes to CBS Group's technology
environment, new client security requirements, changes to applicable legislation or standards, or organisational
restructuring.
1.9.3 All personnel are notified of material changes to this Manual within five (5) business days of approval.



2. Personnel Security

2.1 Purpose
This chapter establishes the requirements for verifying the identity, suitability and ongoing security compliance of
all CBS Group personnel, from pre-engagement screening through to offboarding.

2.2 Pre-Engagement Screening
The following checks are completed before any person is granted access to CBS Group or client systems,
networks or information:

2.2.1 Identity verification. A minimum of two forms of identification are verified, including at least one
government-issued photo identification (passport or driver's licence). Copies are retained securely in the
personnel file.
2.2.2 Right to work. Verification of the individual's right to work in Australia is completed and documented.
2.2.3 National Police Check. A National Police Check (or equivalent criminal history check) is required for all
personnel. The check must be current (less than 12 months old at the time of engagement) and renewed every
three (3) years, or as required by client contracts.
2.2.4 Working with Children Check (WWCC). Where a client engagement involves access to information relating
to children, young people or families (including Victorian Department of Health or Department of Families,
Fairness and Housing engagements), a current WWCC is required prior to access being granted.
2.2.5 Qualifications and experience verification. Professional qualifications, certifications and relevant
employment history claimed by the individual are verified prior to engagement.



L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                               6/27
2.2.6 Client-specific checks. Where a client requires additional screening (e.g., security clearances, specific
industry checks), these are completed and evidenced prior to the individual commencing work on that
engagement.

2.3 Onboarding
The following steps are completed for all new personnel:

2.3.1 The individual reads and acknowledges this Manual, including the Acceptable Use provisions in section 6.5.
2.3.2 The individual signs the CBS Group Confidentiality and Security Acknowledgement (Appendix C.1).
2.3.3 The individual completes CBS Group's cybersecurity awareness induction (see Chapter 9).
2.3.4 User accounts are provisioned in accordance with the access management procedures in Chapter 3,
applying the principle of least privilege.
2.3.5 Devices are configured in accordance with the device management requirements in Chapter 6.
2.3.6 The individual is briefed on any client-specific security requirements relevant to their assigned
engagement(s).

2.4 Ongoing Personnel Security
2.4.1 All personnel complete annual cybersecurity awareness refresher training (see Chapter 9).

2.4.2 National Police Checks are renewed every three (3) years, or more frequently if required by a client contract.
2.4.3 Personnel must promptly report to the ISO any change in circumstances that may affect their security
suitability, including criminal charges, bankruptcy proceedings or loss/theft of devices.

2.5 Offboarding
The following steps are completed when any person ceases engagement with CBS Group, changes role, or no
longer requires access to specific client systems:

2.5.1 Notification. The ISO is notified of the departure or role change as soon as practicable, and no later than
the individual's last working day.
2.5.2 Client notification. For personnel with access to client systems, networks or data, the ISO notifies the
relevant client contact within the contractual timeframes. Where no specific timeframe is contractually defined,
the following timelines apply based on the data classification level:
    •    (a) PROTECTED — within one (1) business day.

    •    (b) OFFICIAL: Sensitive — within three (3) business days.

    •    (c) OFFICIAL — within five (5) business days.

2.5.3 Access revocation. All access to CBS Group and client systems is revoked in accordance with the
deprovisioning timelines in section 3.7. Access revocation is completed by the IT Systems Administrator and
confirmed to the ISO.

2.5.4 Device and data return. All company-issued devices, access tokens and physical materials are returned.
For BYOD devices, CBS Group data is removed in accordance with section 6.4.
2.5.5 Knowledge transfer. Client-related files, correspondence and work products are transferred to the
engagement lead or stored in the appropriate client repository.
2.5.6 Offboarding record. The Offboarding Checklist (Appendix C.2) is completed and retained in the personnel
file.




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                               7/27
3. Access Management

3.1 Purpose
This chapter establishes the policies and procedures for provisioning, reviewing and revoking access to CBS
Group and client systems, networks and data.

3.2 Principles
All access management decisions are governed by the following principles:

3.2.1 Least privilege. Personnel are granted only the minimum access necessary to perform their duties.
3.2.2 Need to know. Access to information is restricted to personnel who require it for their current role and
engagement.
3.2.3 Separation of duties. Where practicable, critical functions are divided among different personnel to reduce
risk.
3.2.4 Individual accountability. Each user account is assigned to a single individual. Shared or generic accounts
are not permitted except where technically unavoidable, in which case they are documented and reviewed
quarterly.

3.3 Access Provisioning
3.3.1 All access requests are submitted to the ISO (or delegate) and must include: the individual's name and role,
the system(s) or data requiring access, the business justification, the required access level, and the expected
duration of access.

3.3.2 The ISO (or authorised delegate) validates the request, confirms the individual has completed the required
screening (Chapter 2), and approves or rejects the request.
3.3.3 The IT Systems Administrator implements approved access. An access approval record is maintained.
3.3.4 For client systems, access requests follow the client's provisioning procedures, with the ISO serving as the
designated authorising role within CBS Group.

3.4 Credential Management
3.4.1 All personnel are informed during onboarding, security training and through this Manual that credentials
(usernames and passwords) must not be shared under any circumstances.

3.4.2 Passwords must meet the following minimum requirements: at least fourteen (14) characters in length.
Passphrases (a sequence of random words forming a memorable but unpredictable phrase) are recommended
as the preferred approach, consistent with current ASD guidance. Where traditional passwords are used, they
must include a combination of upper and lower case letters, numbers and special characters. Passwords and
passphrases must not be reused across systems and must not include easily guessable information such as
names, dates or dictionary words.
3.4.3 Password managers (approved by CBS Group) are recommended for managing credentials securely.
3.4.4 Default or vendor-supplied credentials must be changed immediately upon system provisioning.

3.5 Multi-Factor Authentication (MFA)
3.5.1 MFA is mandatory for all CBS Group systems and cloud services, including Microsoft 365, remote access
and any system containing client or sensitive information.

3.5.2 Approved MFA methods include authenticator applications (e.g., Microsoft Authenticator) and hardware
security tokens. SMS-based MFA is discouraged and only permitted where no alternative is available.
3.5.3 MFA is enforced through Microsoft Entra ID conditional access policies.



L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                             8/27
3.6 Access Reviews
3.6.1 The ISO conducts formal access reviews on the following schedule:

    •    (a) Quarterly — for all personnel with access to client systems classified OFFICIAL: Sensitive or above.

    •    (b) Bi-annually — for all personnel with access to CBS Group internal systems and client systems
         classified OFFICIAL.

3.6.2 Each review covers: identification of all active user accounts, validation of ongoing business need for
access, verification that access levels remain appropriate for current role and engagement, and identification and
remediation of orphaned or excessive accounts.

3.6.3 Access review outcomes are documented and retained for a minimum of two (2) years.
3.6.4 Where a review identifies access that is no longer required, it is revoked within five (5) business days.

3.7 Access Deprovisioning
3.7.1 When a person leaves CBS Group, changes role or no longer requires access to specific systems, access is
revoked in accordance with the following timelines:

    •    (a) PROTECTED information/systems — within one (1) business day of notification.

    •    (b) OFFICIAL: Sensitive information/systems — within three (3) business days of notification.

    •    (c) OFFICIAL information/systems — within five (5) business days of notification.

3.7.2 The IT Systems Administrator confirms completion of deprovisioning to the ISO, who logs the action in the
access register.

3.7.3 For client systems, the ISO notifies the relevant client contact within the applicable timelines, following the
client's deprovisioning procedures.

3.8 Privileged Access Management
3.8.1 Administrative (privileged) accounts are limited to the IT Systems Administrator and the ISO.

3.8.2 Privileged accounts are separate from standard user accounts. Personnel with administrative duties
maintain two accounts: one for daily use and one for administrative tasks.
3.8.3 Privileged accounts are subject to the following additional controls: MFA is mandatory, conditional access
policies restrict login to compliant devices, and administrative accounts are restricted from accessing email,
internet browsing and web services.
3.8.4 Privileged access is reviewed quarterly and documented.

3.9 Audit Logging & Monitoring
3.9.1 CBS Group's technology environment generates and retains audit logs that capture: user logins and logouts,
access to sensitive records or systems, administrative actions and privilege use, changes to security
configurations, and failed authentication attempts.

3.9.2 Logs are retained for a minimum of twelve (12) months within the Microsoft 365 environment. Where client
contracts, legislative requirements or protective data security standards require longer retention periods (for
example, engagements involving health records under the Health Records Act 2001 (Vic) or public records under
the Public Records Act 1973 (Vic)), CBS Group will extend retention periods accordingly and document the
applicable retention requirement in the engagement record.
3.9.3 The IT Systems Administrator reviews security alerts weekly and conducts a monthly review of audit logs for
anomalous activity.


L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                9/27
3.9.4 Audit trails are made available to clients upon request for the purpose of compliance verification or forensic
investigation.



4. Data Protection & Handling

4.1 Purpose
This chapter establishes the requirements for classifying, handling, sharing, storing and disposing of information,
with particular emphasis on client and public sector information.

4.2 Data Classification & Protective Markings
4.2.1 CBS Group recognises and applies the Victorian Protective Data Security Framework (VPDSF) protective
marking scheme when handling Victorian Government information. The classifications are:

    •    (a) OFFICIAL — information that is not sensitive but requires baseline protection.

    •    (b) OFFICIAL: Sensitive — information that could cause limited harm if compromised, requiring
         additional controls.

    •    (c) PROTECTED — information that could cause serious harm if compromised, requiring significant
         additional controls.

4.2.2 CBS Group personnel are trained to recognise protective markings on documents, emails and data files, and
to handle information in accordance with the controls applicable to its classification level.

4.2.3 Where CBS Group generates documents or information on behalf of a client, the classification is applied as
directed by the client. In the absence of specific direction, information is treated as OFFICIAL: Sensitive by default.
4.2.4 CBS Group's internal information is classified as follows: business-sensitive information (e.g., financial
data, client contracts, proprietary methodologies) is treated as OFFICIAL: Sensitive; general operational
information is treated as OFFICIAL.

4.3 Information Handling Controls
The following minimum controls apply based on classification level:

4.3.1 OFFICIAL
    •    (a) Stored on CBS Group-approved systems (Microsoft 365).

    •    (b) Access restricted to authorised personnel.

    •    (c) Transmitted via encrypted channels (TLS 1.2 or above).

4.3.2 OFFICIAL: Sensitive

    •    (a) All OFFICIAL controls, plus:

    •    (b) Access restricted on a need-to-know basis.

    •    (c) Stored only in access-controlled SharePoint sites or OneDrive locations.

    •    (d) Encrypted at rest and in transit.

    •    (e) Not printed unless necessary; printed copies secured when not in use and disposed of by cross-cut
         shredding.

    •    (f) Not discussed in public places or unsecured communications.


L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                                10/27
4.3.3 PROTECTED

    •    (a) All OFFICIAL: Sensitive controls, plus:

    •    (b) Specific handling in accordance with client instructions.

    •    (c) Access limited to named individuals approved by the client.

    •    (d) CBS Group does not routinely handle PROTECTED information. Where such handling is required,
         specific arrangements will be agreed with the client prior to commencement.

4.4 Artificial Intelligence (AI) Restrictions
4.4.1 CBS Group personnel and subcontractors must not upload, enter or submit any client or public sector
information into any artificial intelligence platform, tool or model (including but not limited to ChatGPT, Google
Gemini, Microsoft Copilot, Claude or custom machine learning models) without explicit prior written consent from
the relevant client.

4.4.2 This prohibition applies to: public AI services, in-house AI applications or tools, AI features embedded in
productivity software (e.g., Microsoft 365 Copilot) where the client has not approved their use, and any system
that uses client data for training purposes.
4.4.3 Where a client has provided written approval for specific AI tool use, that approval is documented and the
approved scope and conditions are communicated to all relevant personnel.
4.4.4 CBS Group's internal AI use policy permits the use of AI tools for internal business purposes (e.g., drafting,
analysis of non-client data) provided no client or public sector information is entered into any AI system without
the required consent.

4.5 Data Sharing Restrictions
4.5.1 Client data (including public sector information) must not be shared with any third party, subcontractor or
supplier unless: the sharing is explicitly authorised in the relevant contract, or the client has provided separate
written authorisation.

4.5.2 CBS Group maintains controls to ensure that data flows to subcontractors are pre-approved and traceable.
This applies to all external parties including cloud vendors, analytics firms and IT support providers.
4.5.3 Where CBS Group intends to use a subcontractor or fourth party for work involving client data, this is
disclosed to the client prior to engagement (see Chapter 8).

4.6 Data Return & Disposal
4.6.1 Data return. Upon termination or completion of a client engagement, CBS Group will return all client data,
records, documents and other public sector information (electronic and physical) to the client promptly. The
process includes identifying, extracting and securely transferring all data.

4.6.2 Data destruction. Where data cannot be returned to the client (e.g., data embedded in backup systems or
integrated platforms), CBS Group will permanently delete or de-identify the data and provide written confirmation
(certificate of destruction) to the client.
4.6.3 Destruction methods. Data destruction is carried out using methods appropriate to the media type: secure
deletion using overwrite methods for electronic storage, cross-cut shredding for paper documents, and certified
destruction for physical media.
4.6.4 No unauthorised retention. CBS Group does not retain copies of client data beyond the period required by
the contract or by law.

4.7 Encryption
4.7.1 CBS Group encrypts sensitive and client information both at rest and in transit using industry-accepted
standards.

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                              11/27
4.7.2 Encryption at rest. The following controls are applied: BitLocker full-disk encryption on all Windows
devices, Microsoft 365 service encryption for data stored in SharePoint, OneDrive and Exchange, and AES-256
encryption for backup data.
4.7.3 Encryption in transit. All data transmitted over networks uses TLS 1.2 or above. VPN connections use AES-
256 encryption. Email containing OFFICIAL: Sensitive or above information uses Microsoft 365 message
encryption or equivalent.
4.7.4 Key management. Encryption keys are managed through Microsoft's key management infrastructure.
Where client-specific key management is required, arrangements are agreed with the client.

4.8 Data Sovereignty & Offshore Data
4.8.1 CBS Group stores all client and public sector information within Australian data centres unless explicit prior
written approval is obtained from the relevant client.

4.8.2 CBS Group's Microsoft 365 tenant is configured with Australian data residency. Microsoft's Australian data
centres are located in New South Wales and Victoria, which satisfies Victorian Government data residency
preferences.
4.8.3 Where a Victorian Government client requires data to be stored specifically within Victoria, CBS Group will
confirm the data residency location of its cloud services and, where technically feasible, configure storage to
prioritise Victorian data centre regions.
4.8.4 CBS Group will not: store or process client information in data centres located overseas, or use international
SaaS, PaaS or cloud providers with non-Australian data residency for client data, unless the client has provided
written approval.
4.8.5 Where offshore processing is proposed, CBS Group will disclose full details of the location(s) and providers,
request and receive explicit written approval from the client, and comply with any conditions the client stipulates,
including obligations under the Privacy and Data Protection Act 2014 (Vic) regarding transborder data flows.

4.9 Privacy Impact Assessments
4.9.1 CBS Group will contribute to Privacy Impact Assessments (PIAs) initiated by clients, particularly where the
engagement involves the collection, handling or processing of personal or health information governed by
Victorian privacy legislation.

4.9.2 Where CBS Group identifies activities within an engagement that may create new or increased privacy risks
(for example, new data flows, changes to data storage, or use of new technology platforms), the ISO will raise this
with the client's privacy contact and recommend a PIA be conducted.
4.9.3 CBS Group maintains internal awareness of PIA methodologies consistent with the Office of the Victorian
Information Commissioner (OVIC) guidance.



5. Technical Security Controls

5.1 Purpose
This chapter establishes the technical security controls implemented by CBS Group, aligned to the ASD Essential
Eight Maturity Model and relevant industry standards.

5.2 Essential Eight Alignment
5.2.1 CBS Group implements the ASD Essential Eight mitigation strategies and assesses its environment against
the Essential Eight Maturity Model. CBS Group's current target is Maturity Level Two across all eight strategies.

5.2.2 The eight strategies and CBS Group's implementation approach are as follows:




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                              12/27
(a) Application control. CBS Group maintains a list of approved applications for all workstations. Unapproved
software execution is restricted through Microsoft Intune application management policies. The approved
application list is reviewed and validated annually, and maintained through a change management process.
(b) Patch applications. Third-party applications are patched within two (2) weeks of release, or within 48 hours
for critical/high-risk vulnerabilities. Patching status is monitored via Microsoft Intune.
(c) Configure Microsoft Office macro settings. Macros are disabled by default for all users. Exceptions require
approval from the ISO and are documented. Only macros from trusted locations are permitted.
(d) User application hardening. Web browsers and Microsoft Office are configured to block: Flash,
advertisements, Java from the internet, and other unnecessary features. Hardening baselines are applied through
Intune configuration profiles.
(e) Restrict administrative privileges. Administrative access is managed in accordance with section 3.8 of this
Manual. Privileged accounts are separate, subject to MFA, and reviewed quarterly.
(f) Patch operating systems. Operating system patches are applied within two (2) weeks of release, or within 48
hours for critical/high-risk vulnerabilities. Unsupported operating systems are not permitted on the network.
(g) Multi-factor authentication. MFA is mandatory for all users, in accordance with section 3.5 of this Manual.
(h) Regular backups. Backups are managed in accordance with Chapter 7 of this Manual.
5.2.3 CBS Group conducts an annual self-assessment against the Essential Eight Maturity Model. Assessment
results are documented and an improvement plan is maintained for any gaps.

5.3 Patch Management
5.3.1 CBS Group maintains a formal patch management process covering operating systems and third-party
applications.

5.3.2 The patching schedule is as follows: critical and high-risk security patches are applied within 48 hours of
release, all other security patches are applied within two (2) weeks of release, and feature updates are applied
within one (1) month of release following testing.
5.3.3 Patch deployment is managed through Microsoft Intune and Windows Update for Business.
5.3.4 The IT Systems Administrator monitors patch compliance status weekly and reports non-compliant devices
to the ISO.

5.4 Vulnerability Management
5.4.1 CBS Group conducts regular vulnerability assessments of its technology environment.

5.4.2 External vulnerability scanning is conducted quarterly using an approved scanning tool.
5.4.3 Internal infrastructure scanning is conducted bi-annually.
5.4.4 Identified vulnerabilities are triaged based on risk and criticality, with remediation timelines as follows:
critical — within 48 hours, high — within two (2) weeks, medium — within one (1) month, and low — within three
(3) months.
5.4.5 A vulnerability remediation register is maintained by the IT Systems Administrator.

5.5 Penetration Testing
5.5.1 CBS Group engages an independent, accredited security provider to conduct penetration testing at least
annually, or following major changes to its network, systems or web applications.

5.5.2 The scope includes: external network assessment, cloud configuration review (Microsoft 365/Entra ID), and
web application testing (where applicable).
5.5.3 Findings are triaged, prioritised and remediated in accordance with section 5.4.4 timelines. Remediation is
verified by the testing provider where critical or high-risk findings are identified.


L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                            13/27
5.6 Email Security
5.6.1 CBS Group implements the following email security controls:

(a) SPF (Sender Policy Framework). DNS records specify which mail servers are authorised to send email on
behalf of CBS Group's domain.
(b) DKIM (DomainKeys Identified Mail). Outgoing emails are cryptographically signed to verify integrity.
(c) DMARC (Domain-based Message Authentication, Reporting and Conformance). A DMARC policy is
published with a minimum enforcement level of "quarantine", progressing to "reject". DMARC reports are
reviewed monthly.
5.6.2 Anti-phishing and anti-malware protections are enabled through Microsoft Defender for Office 365 (or
equivalent), including safe links, safe attachments and impersonation protection.
5.6.3 External email warnings are applied to emails originating from outside the organisation.

5.7 Network & Communications Security
5.7.1 CBS Group operates a cloud-first environment with no on-premise servers. Network security is primarily
managed through Microsoft 365 and Entra ID security controls.

5.7.2 The following network security controls are maintained:
(a) Perimeter controls. Where CBS Group personnel connect to client networks, they comply with the client's
network security requirements. CBS Group's cloud environment is protected by Microsoft's network security
infrastructure.
(b) Endpoint protection. All devices are protected by Microsoft Defender for Endpoint (or equivalent), providing
real-time threat detection, endpoint detection and response (EDR) and automated investigation.
(c) Conditional access. Microsoft Entra ID conditional access policies restrict access based on device
compliance, location, user risk level and sign-in risk level.
(d) Secure remote access. Personnel accessing client or CBS Group systems remotely do so via encrypted
connections (VPN or HTTPS/TLS 1.2+).
(e) Web filtering and DNS protection. CBS Group implements web content filtering and DNS-level protection
through Microsoft Defender for Endpoint's web protection capabilities, including: blocking access to known
malicious websites and domains, web content filtering to restrict access to inappropriate or high-risk categories,
and SmartScreen integration for real-time URL reputation checking. Where client environments require additional
web proxy or DNS filtering controls, CBS Group will comply with client-specified configurations.
5.7.3 The IT Systems Administrator monitors security alerts from Microsoft Defender and Entra ID and reviews
network security configurations quarterly.

5.8 Intrusion Detection & Prevention
5.8.1 CBS Group leverages Microsoft Defender for Endpoint and Microsoft Sentinel (or equivalent) capabilities for
intrusion detection and prevention, including: real-time threat detection and alerting, behavioural analysis for
anomalous activity, and automated threat response for known attack patterns.

5.8.2 Security alerts are reviewed by the IT Systems Administrator. Critical alerts are escalated immediately to the
ISO.



6. Asset & Device Management

6.1 Purpose
This chapter establishes the requirements for managing hardware and software assets throughout their lifecycle,
including company-issued and personally owned (BYOD) devices.


L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                              14/27
6.2 Asset Management Policy
6.2.1 CBS Group maintains an asset register that records all hardware and software assets, including: device type,
make, model and serial number, assigned user, location, operating system and version, software installed,
acquisition date and disposal date.

6.2.2 The asset register is maintained by the IT Systems Administrator and audited annually.
6.2.3 Only approved devices and software may be used for CBS Group or client work. The approved software list
is maintained by the IT Systems Administrator and reviewed annually.

6.3 Company-Issued Devices
6.3.1 Company-issued devices are configured with the following security baseline prior to deployment: full-disk
encryption (BitLocker), Microsoft Defender for Endpoint, Microsoft Intune enrolment, automatic updates enabled,
and a local firewall enabled.

6.3.2 Company devices remain the property of CBS Group and are subject to monitoring, remote wipe and security
audits.

6.4 Bring Your Own Device (BYOD)
6.4.1 CBS Group permits the use of personally owned devices for business purposes, subject to the following
conditions:

(a) Enrolment. BYOD devices must be enrolled in Microsoft Intune (or approved MDM solution) before accessing
CBS Group or client data.
(b) Minimum security requirements. BYOD devices must meet the following baseline: current and supported
operating system, full-disk encryption enabled, screen lock with PIN/biometric (minimum 6-digit PIN), up-to-date
antivirus/endpoint protection, and automatic updates enabled.
(c) Conditional access. BYOD devices are subject to the same conditional access policies as company devices.
Non-compliant devices are blocked from accessing CBS Group resources.
(d) Separation of data. CBS Group data on BYOD devices is containerised through Microsoft Intune application
protection policies to separate business and personal data.
(e) Remote wipe. CBS Group reserves the right to remotely wipe CBS Group data (selective wipe) from BYOD
devices in the event of loss, theft, security incident or personnel departure. Full device wipe is not performed on
BYOD devices without the owner's consent, except where required to protect client data classified OFFICIAL:
Sensitive or above.
(f) Departure. When a BYOD user departs CBS Group, CBS Group data is removed via selective wipe. The
individual confirms removal is complete.

6.5 Acceptable Use
6.5.1 CBS Group systems, devices and data are provided for legitimate business purposes. The following
requirements apply to all personnel:

(a) Permitted use. CBS Group resources may be used for business purposes and reasonable incidental personal
use that does not interfere with work duties or compromise security.
(b) Prohibited activities. The following activities are prohibited on CBS Group or client systems: sharing
credentials or allowing others to use your account, installing unapproved software, disabling security controls
(antivirus, firewall, encryption), accessing, storing or transmitting illegal, offensive or inappropriate material,
using client data for purposes not authorised by the client, connecting to unsecured public Wi-Fi without VPN
protection, and storing client data on personal cloud storage services (e.g., personal Dropbox, Google Drive).
(c) Monitoring. CBS Group monitors the use of its systems and devices for security purposes. Personnel have no
expectation of privacy when using CBS Group systems.



L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                             15/27
6.6 Secure Disposal
6.6.1 When hardware assets reach end of life or are decommissioned, the following procedures apply: all data is
securely erased using an approved method (e.g., NIST SP 800-88 guidelines), disposal is documented in the asset
register including the date, method and person responsible, and certificates of destruction are obtained where
third-party disposal services are used.

6.6.2 Media containing client data classified OFFICIAL: Sensitive or above is destroyed using certified destruction
methods (e.g., physical shredding of drives).

6.7 Physical Security
6.7.1 General. CBS Group operates a distributed, cloud-first working environment with no centralised data centre
or server room. The following physical security controls apply to all locations where CBS Group personnel access,
process or store client or departmental information.

6.7.2 Clean desk. Personnel must ensure that client or departmental documents (printed or displayed on screen)
are secured when not actively in use. Screens must be locked when unattended (enforced through Windows auto-
lock policy with a maximum timeout of five (5) minutes). Printed documents classified OFFICIAL: Sensitive or
above must not be left unattended and must be stored securely or disposed of by cross-cut shredding when no
longer required.
6.7.3 Premises security. Where CBS Group personnel work from CBS Group premises, the following controls
apply: access to the office is restricted to authorised personnel, visitors are accompanied at all times, and client
information is stored in locked cabinets or secure digital storage rather than in open areas.
6.7.4 Client site security. CBS Group personnel comply with client site physical security requirements, including
building access controls, visitor procedures and security zone restrictions.
6.7.5 Return of departmental access items. Upon offboarding, role change or at the department's request, CBS
Group ensures the prompt return of all departmental physical access items, including building swipe cards,
security tokens, hardware tokens and any other access credentials issued by the department. The return of these
items is tracked through the offboarding checklist (Appendix C.2) and confirmed to the department's designated
contact.



7. Backup & Recovery

7.1 Purpose
This chapter establishes the requirements for backing up CBS Group data and systems to ensure recoverability in
the event of data loss, corruption or disaster.

7.2 Backup Management
7.2.1 CBS Group maintains a formal backup management process covering all critical business data and
systems.

7.2.2 Backup schedule. The following backup schedule is maintained: Microsoft 365 data (SharePoint, OneDrive,
Exchange, Teams) is backed up daily through Microsoft's native retention policies and a third-party backup
solution, and critical business data is backed up incrementally daily and fully weekly.
7.2.3 Off-site / cloud backup. Backup data is stored in a geographically separate Australian data centre (cloud-
based) to provide disaster recovery capability.
7.2.4 Backup encryption. All backup data is encrypted at rest using AES-256 encryption. Access to backup data
is restricted to the IT Systems Administrator and the ISO.




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                              16/27
7.3 Backup Testing
7.3.1 Restoration testing is conducted at least every six (6) months to verify that backup data can be recovered
successfully.

7.3.2 Restoration tests include: verification of data integrity, confirmation of recovery time, and documentation of
results and any issues.
7.3.3 Records of backup tests are retained for a minimum of two (2) years.

7.4 Backup Media Handling & Disposal
7.4.1 Where physical backup media is used, the following controls apply: media is stored in a secure, access-
controlled location, transport of media is tracked and documented, and disposal is performed using certified
destruction methods with disposal logs or certificates of destruction maintained as evidence.

7.4.2 For cloud-based backups, disposal is managed through the backup provider's secure deletion processes,
verified through the provider's compliance certifications.



8. Third-Party & Supplier Security

8.1 Purpose
This chapter establishes the requirements for managing information security risks arising from CBS Group's use
of third-party suppliers, subcontractors and service providers.

8.2 Subcontractor Disclosure
8.2.1 Where CBS Group intends to engage subcontractors, service providers or partners who will access, process
or share client information, the names and roles of those parties will be disclosed to the relevant client prior to
engagement.

8.2.2 Subcontractors are subject to the same security obligations as CBS Group personnel, as outlined in the
relevant client contract and this Manual.

8.3 Due Diligence
8.3.1 CBS Group performs due diligence on all third parties who will have access to client or sensitive information
before engagement. Due diligence includes: assessment of the third party's information security capability and
maturity, including any certifications (ISO 27001, SOC 2, Essential Eight alignment), verification of financial
solvency (where material to the engagement), and review of the third party's privacy and data handling practices.

8.3.2 Due diligence outcomes are documented and retained.

8.4 Third-Party Compliance
8.4.1 Contracts, statements of work and engagement terms with third parties include security clauses requiring
the third party to: comply with CBS Group's information security policies, comply with any applicable client
security requirements, notify CBS Group promptly of any security incident affecting CBS Group or client data, and
permit security assessments or audits where reasonably required.

8.4.2 CBS Group confirms that third parties comply with these obligations through periodic review (at least
annually) or as triggered by incidents or significant changes.

8.5 Third-Party Risk Assessment
8.5.1 CBS Group assesses the information security risk from each third party based on the nature and sensitivity
of information they access, the type of access granted (direct system access, data processing, data storage), the
third party's security maturity, and the availability of alternative providers.

L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                              17/27
8.5.2 Risk assessments are reviewed annually or when there is a material change in the third party's engagement
or security posture.



9. Security Awareness & Training

9.1 Purpose
This chapter establishes the requirements for ensuring all CBS Group personnel understand their information
security obligations and are equipped to identify and respond to threats.

9.2 Training Program
9.2.1 CBS Group maintains a structured cybersecurity awareness training program covering the following topics:
phishing and email scams (including social engineering), password management and credential security, safe
internet and remote work practices, physical and mobile device security, data classification and handling
obligations, reporting incidents and suspicious activity, AI use restrictions (section 4.4), and client-specific
security requirements.

9.3 Training Delivery
9.3.1 Induction training. All new personnel complete cybersecurity awareness training as part of their
onboarding, prior to being granted access to CBS Group or client systems.

9.3.2 Annual refresher training. All personnel complete refresher training annually.
9.3.3 Ad hoc training. Additional training is provided in response to: emerging threats (e.g., new phishing
campaigns targeting the sector), changes to this Manual or CBS Group's technology environment, security
incidents or near-misses, and new client engagement requirements.
9.3.4 Training may be delivered through: online modules, team briefings, simulated phishing exercises, or written
advisories.

9.4 Training Records
9.4.1 Training completion records are maintained by the ISO. Records include the individual's name, training
topic, date completed and training method.

9.4.2 Personnel who do not complete mandatory training within the required timeframe are reported to the
Director for follow-up.

9.5 Secure Information Handling Awareness
9.5.1 In addition to general cybersecurity awareness, personnel are specifically trained on their obligations
regarding the secure handling of information, including: recognising and applying protective markings, secure
storage and transmission practices, acceptable use requirements, and information disposal procedures. This
training is reinforced through signed Acceptable Use acknowledgements and ongoing operational reminders.



10. Incident Response & Business Continuity

10.1 Purpose
This chapter establishes CBS Group's processes for responding to information security incidents, maintaining
business continuity during disruptions and recovering from disasters.




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                           18/27
10.2 Security Incident Response Plan (SIRP)
10.2.1 Definition. An information security incident is any event that compromises or threatens the confidentiality,
integrity or availability of CBS Group's or a client's information, systems or services. Examples include:
unauthorised access to systems or data, malware infection (including ransomware), data breach or data loss,
phishing compromise, denial of service, loss or theft of devices containing business or client data, and policy
violations involving client data.

10.2.2 Incident classification. Incidents are classified as follows:
    •    (a) Critical — confirmed data breach involving client or public sector information, ransomware, or system
         compromise affecting client operations.

    •    (b) High — suspected data breach, malware infection, unauthorised access to client systems, or
         loss/theft of device containing client data.

    •    (c) Medium — phishing compromise (no data loss), policy violation, failed intrusion attempt.

    •    (d) Low — suspicious activity under investigation, near-miss events.

10.2.3 Incident response stages. The following stages are followed for all incidents:

(a) Detection and reporting. All personnel must report suspected incidents immediately to the ISO via phone,
email or Teams. The ISO logs the incident in the Incident Register.
(b) Triage and classification. The ISO assesses the incident, assigns a classification (Critical/High/Medium/Low)
and determines the response team.
(c) Containment. Immediate actions to contain the incident and prevent further damage. This may include:
isolating affected systems, disabling compromised accounts, blocking malicious IP addresses or domains, and
preserving evidence for investigation.
(d) Client notification. For incidents affecting client data or systems, the ISO notifies the relevant client contact
immediately for Critical incidents and within 24 hours for High incidents. Notification includes: a description of
the incident, the systems and data affected, the actions taken to contain the incident, and the expected timeline
for resolution.
(e) Investigation. The ISO coordinates the investigation, which may involve: analysis of audit logs and system
records, forensic examination (internal or by engaging a specialist provider), identification of root cause, and
assessment of the scope and impact.
(f) Eradication and recovery. The threat is removed, affected systems are restored, and normal operations are
resumed. Restoration is verified before systems are returned to production.
(g) Post-incident review. A post-incident review is conducted within ten (10) business days of incident closure.
The review covers: timeline of events, effectiveness of the response, root cause analysis, lessons learned, and
recommended improvements to controls or procedures. Findings are documented and incorporated into this
Manual where applicable.
10.2.4 Client access during incidents. CBS Group acknowledges that clients may temporarily suspend CBS
Group's access to client systems during a security incident. Access will be reinstated upon the client's
satisfaction that the incident is contained and resolved. CBS Group will cooperate fully during such periods.
10.2.5 Forensic investigation support. CBS Group agrees to provide log files, audit trails and system evidence
to clients upon request for the purpose of forensic investigation. CBS Group will facilitate secure transfer or
access for forensic analysis and retain logs in a manner that allows retrieval within agreed retention periods.
10.2.6 Regulatory and statutory reporting. In addition to client notification (section 10.2.3(d)), CBS Group will
comply with the following regulatory reporting obligations where applicable:
    •    (a) Notifiable Data Breaches (NDB) scheme — where an incident constitutes an eligible data breach
         under the Privacy Act 1988 (Cth), CBS Group will notify the Office of the Australian Information
         Commissioner (OAIC) and affected individuals in accordance with the NDB scheme requirements.


L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                               19/27
    •    (b) Victorian privacy reporting — where an incident involves Victorian public sector information, CBS
         Group will cooperate with the client's obligations to report to the Office of the Victorian Information
         Commissioner (OVIC) and, where required, to Cyber Security and Digital Solutions (CSDS) within the
         Victorian Government.

    •    (c) Client-directed reporting — CBS Group will comply with any additional incident reporting
         requirements specified in client contracts or departmental security standards, including providing
         information necessary for the client to meet its own statutory reporting obligations.

    •    (d) Reporting timelines — CBS Group will not wait for an investigation to conclude before making
         required notifications. Initial notifications will be made within the timeframes specified in the applicable
         legislation, contract or standard, with updates provided as the investigation progresses.

10.3 Business Continuity Plan (BCP)
10.3.1 CBS Group maintains the following business continuity arrangements to ensure critical operations
continue during disruptions.

10.3.2 Critical functions. CBS Group's critical business functions are: client engagement delivery,
communications with clients and stakeholders, and access to client and business systems and data.
10.3.3 Continuity arrangements. The following arrangements support continuity of operations: cloud-first
architecture (Microsoft 365) enables personnel to work from any location with internet access, data is stored in
the cloud with geo-redundant backup (see Chapter 7), personnel can work remotely using company or BYOD
devices, and key client contacts and engagement information are maintained in a centralised, accessible
location.
10.3.4 Communication plan. In the event of a disruption, the ISO coordinates communication with: CBS Group
personnel (via alternate communication channels if primary systems are unavailable), clients (to advise of any
impact on engagement delivery), and relevant authorities (where required by law or regulation).

10.4 Disaster Recovery Plan (DRP)
10.4.1 CBS Group's disaster recovery arrangements are designed to restore systems and data following a major
outage or breach.

10.4.2 Recovery objectives. The following targets apply: Recovery Time Objective (RTO) — critical systems
restored within 24 hours, Recovery Point Objective (RPO) — maximum data loss of 24 hours through daily
backups.
10.4.3 Recovery procedures. In the event of a major disruption: the ISO activates the disaster recovery process
and notifies the Director, the IT Systems Administrator initiates restoration from the most recent backup, restored
systems and data are verified for integrity before being placed into production, and clients are notified of the
disruption and expected recovery timeline.

10.5 Testing & Exercises
10.5.1 CBS Group tests its incident response, business continuity and disaster recovery plans at least annually
through tabletop exercises or simulated scenarios.

10.5.2 CBS Group agrees to participate in client-initiated incident response exercises (e.g., tabletop exercises
simulating data breaches, ransomware or service disruptions) upon request.
10.5.3 Test outcomes are documented, and improvement actions are tracked to completion.




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                               20/27
Appendix A: ISSRA Cross-Reference Matrix
The following table maps each question in the Victorian Department of Health / DFFH Third-Party Information
Security Standards Requirements Assessment (ISSRA) to the relevant section(s) of this Manual.

 ISSRA Q#     Domain                                         Manual Section

 Q1           Assurance — Security assessments               1.7.1

 Q2           Governance — Risk Management Policy            1.4

 Q3           Governance — Information Security Policy       This Manual (entirety)

 Q4           Governance — Roles & Responsibilities          1.5

 Q5           Governance — Cybersecurity Program             1.6

 Q6           Identification — Staff identity verification   2.2.1

 Q7           Identification — Police checks                 2.2.3, 2.2.4

 Q8           Access — Access management process             3.3, 3.6, 3.7

 Q9           Access — Credential sharing prohibition        3.4.1, 6.5

 Q10          Access — Access reviews (departmental)         3.6

 Q11          Access — Environment access management         3.3, 3.8

 Q12          Access — Time-bound access                     3.3.1, 3.6

 Q13          Access — Access review schedule                3.6

 Q14          Access — Deprovisioning notification           2.5.2

 Q15          Access — Deprovisioning timelines              2.5.3, 3.7

 Q16          Access — Monitoring & audit logging            3.9

 Q17          Fourth-party — Subcontractor disclosure        8.2

 Q18          Fourth-party — Due diligence                   8.3

 Q19          Fourth-party — Third-party compliance          8.4

 Q20          Fourth-party — Third-party risk assessment     8.5

 Q21          Not included in ISSRA v1.2                     N/A

 Q22          Data — Protective markings awareness           4.2

 Q23          Data — Classification-based controls           4.3

 Q24          Data — Data return                             4.6.1

 Q25          Data — Data deletion / de-identification       4.6.2

 Q26          Data — AI restrictions                         4.4

 Q27          Data sharing — Contractual restrictions        4.5

 Q28          Data sharing — Written authorisation           4.5.1


L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                      21/27
 ISSRA Q#     Domain                                           Manual Section

 Q29          Contract reviews — Lifecycle assessments         1.7.2

 Q30          Technical — Essential Eight alignment            5.2

 Q31          Technical — MFA                                  3.5

 Q32          Technical — Application control                  5.2.2(a)

 Q33          Technical — Privileged access management         3.8

 Q34          Technical — Patch management                     5.3

 Q35          Technical — Backup management                    7.2, 7.3

 Q36          Technical — Backup media disposal                7.4

 Q37          Asset — Asset management policy                  6.2

 Q38          Asset — Asset inventory                          6.2.1

 Q39          Technical — Vulnerability management             5.4

 Q40–Q43      Not included in ISSRA v1.2                       N/A

 Q44          Email — SPF                                      5.6.1(a)

 Q45          Mobile device and BYOD security                  6.4

 Q46          Email and web browsing protection                5.6.2, 5.7.2(e)

 Q47          Email — DMARC, DKIM, SPF                         5.6.1

 Q48          Network — Network management policy              5.7

 Q49          Network — IDS/IPS                                5.8

 Q50          Network — Penetration testing                    5.5

 Q51          Training — Cybersecurity awareness               9.2, 9.3

 Q52          Training — Secure handling obligations           9.5

 Q53–Q54      Physical security / remote access                5.7.2, 6.4, 6.5, 6.7

 Q55          Return of departmental access items              6.7.5, Appendix C.2

 Q56–Q57      Data sovereignty — Offshore storage/processing   4.8

 Q58–Q60      Logging, monitoring & data location              3.9, 4.8

 Q61          Incident — SIRP, BCP, DRP                        10.2, 10.3, 10.4

 Q62          Incident — Access suspension                     10.2.4

 Q63          Incident — Exercise participation                10.5.2

 Q64          Roles — Designated access authoriser             1.5.2

 Q65          Roles — Designated security contact              1.5.2(f)



L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                            22/27
 ISSRA Q#     Domain                               Manual Section

 Q66–Q72      Incident management & notification   10.2.3, 10.2.4, 10.2.6

 Q73          Encryption                           4.7

 Q74          Forensic investigation access        10.2.5

 Q75          Cyber insurance                      1.8




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                  23/27
Appendix B: Security Roles Quick Reference
 Role                                   Held By    Key Responsibilities

 Information Security       Sponsor     [Name]     Policy approval, risk appetite, resource allocation
 (Director / COO)

 Information Security Officer (ISO)     [Name]     Framework management, assessments, access reviews,
                                                   incident response, client liaison

 IT Systems Administrator               [Name]     M365 admin, device management, technical controls,
                                                   backup, monitoring

 All Personnel                          Everyone   Policy compliance, training completion, incident reporting




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                               24/27
Appendix C: Checklists & Templates

C.1 Confidentiality and Security Acknowledgement
I, [Full Name], acknowledge that I have read and understood the CBS Group Information Security Manual. I agree
to comply with all policies and procedures set out in the Manual, including the acceptable use requirements, data
handling obligations and incident reporting requirements.

I understand that failure to comply with these obligations may result in disciplinary action, termination of
engagement and/or legal proceedings.

I understand that my obligations regarding client confidentiality and data protection continue after my
engagement with CBS Group ends.

Name: ___________

Signature: ___________

Date: ___________




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                           25/27
C.2 Offboarding Checklist
 #       Action                                                                       Completed   Date     By

 1       Client notified of departure (per timelines in s.2.5.2)                      ☐

 2       CBS Group system access revoked (M365, Entra ID)                             ☐

 3       Client system access revoked / deprovisioning requested                      ☐

 4       Company devices returned                                                     ☐

 5       BYOD selective wipe completed                                                ☐

 6       Physical materials / access cards returned                                   ☐

 6A      Departmental physical access items returned (swipe cards, tokens, badges)    ☐

 7       Client files transferred to engagement lead                                  ☐

 8       Asset register updated                                                       ☐

 9       Personnel file updated with departure date                                   ☐


C.3 Incident Report Template
 Field                                     Detail

 Incident ID                               INC-[YYYY]-[###]

 Date/Time Detected

 Reported By

 Classification                            ☐ Critical ☐ High ☐ Medium ☐ Low

 Description

 Systems/Data Affected

 Client(s) Affected

 Containment Actions Taken

 Client Notified                           ☐ Yes ☐ No — Date/Time:

 Regulatory Notification Required          ☐ NDB (OAIC) ☐ OVIC ☐ CSDS ☐ Other ☐ N/A

 Regulatory Notification Completed         ☐ Yes ☐ No — Date/Time:

 Root Cause

 Resolution

 Lessons Learned

 Closed Date




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                         26/27
C.4 Access Request Form
 Field                            Detail

 Requestor Name

 Date

 Person Requiring Access

 Role / Engagement

 System(s) Requiring Access

 Access Level Required

 Business Justification

 Duration (if time-limited)

 Screening Confirmed (ISO)        ☐ Yes

 Approved By (ISO)

 Implemented By (IT Admin)

 Date Implemented


C.5 Cyber Insurance Engagement Assessment
 Field                                         Detail

 Engagement Name

 Client

 Data Classification Level                     ☐ OFFICIAL ☐ OFFICIAL: Sensitive ☐ PROTECTED

 Client Contractual Insurance Requirement      ☐ Yes (specify) ☐ No

 Public Sector Information Accessed            ☐ Yes ☐ No

 Cyber Insurance Required                      ☐ Yes ☐ No

 If No, Rationale

 Policy Obtained                               ☐ Yes — Policy #:

 Certificate of Insurance Provided to Client   ☐ Yes — Date:

 Assessed By (ISO)

 Date




L22, 180 GEORGE ST, SYDNEY, NSW, 2000
CBS.COM.AU                                                                                    27/27

---
