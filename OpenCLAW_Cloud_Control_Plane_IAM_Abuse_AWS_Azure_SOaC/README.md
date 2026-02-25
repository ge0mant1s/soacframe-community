# OpenCLAW SOaC: Cloud Control Plane & IAM Abuse (AWS + Azure)

**Wave 3 — Package 2**

This Security-as-Code package addresses the threat pattern highlighted in modern threat reporting: adversaries abusing **valid identities** and **cloud control planes** to achieve persistence, privilege escalation, defense evasion (log disruption), and rapid impact.

## Objectives
- Detect and contain **IAM privilege escalation**, **suspicious role assumption**, and **telemetry disruption**.
- Reduce blast radius with **policy guardrails** (AWS SCP/IAM, Entra Conditional Access) and operational hardening.
- Provide **playbooks-as-code** and **hunt queries** for rapid response.

## Stack Coverage
- Microsoft Sentinel (KQL)
- Splunk (SPL)
- Sigma (generic mappings)
- Wazuh (rules for cloud/audit event ingestion + macOS endpoint signals)
- CrowdStrike (Falcon query examples)
- Microsoft Defender for Endpoint (MDE) queries (where applicable)
- macOS endpoint posture (basic hardening + local logging signals)

## Key Detections
- AWS: `StopLogging`, `DeleteTrail`, `PutEventSelectors`, `CreateAccessKey`, `AttachRolePolicy`, `UpdateAssumeRolePolicy`, unusual `AssumeRole` chains
- Azure/Entra: privileged role assignment changes, consent/OAuth abuse signals, conditional access failures, suspicious sign-in + subsequent Azure activity

## How to Use
1. Deploy detections in your SIEM (Sentinel/Splunk) and normalize cloud audit logs.
2. Apply guardrails in AWS and Entra (test in audit mode first).
3. Run simulations to validate alerting and response playbooks.

**Generated:** 2026-02-25
