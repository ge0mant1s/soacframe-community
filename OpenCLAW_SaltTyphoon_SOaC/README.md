# OpenCLAW SOaC: Salt Typhoon Defense Package

> GitHub-ready **Security-as-Code** package to operationalize public reporting on **Salt Typhoon** (state-linked telecom/critical-infrastructure intrusion tradecraft).

## Why Salt Typhoon is different
Salt Typhoon operations focus on **communications infrastructure** and long-term persistence. Public reporting highlights multiyear activity and broad targeting, including telecom providers and other critical infrastructure.

Key takeaways from baseline sources:
- Empirical telemetry describing long-running attack patterns against telecom-like decoys ([Global Cyber Alliance](https://globalcyberalliance.org/new-report-salt-typhoon-across-the-internet/))
- High-risk assessment and long-term pre-positioning against critical infrastructure ([NJCCIC](https://www.cyber.nj.gov/threat-landscape/nation-state-threat-analysis-reports/china-linked-cyber-operations-targeting-us-critical-infrastructure/salt-typhoon))
- Example intrusion chain with **Citrix NetScaler exploitation**, **DLL sideloading**, and C2 patterns ([Darktrace](https://www.darktrace.com/ja/blog/salty-much-darktraces-view-on-a-recent-salt-typhoon-intrusion))
- Ongoing public scrutiny and claims of continuing activity ([Reuters](https://www.reuters.com/business/media-telecom/senator-says-att-verizon-blocking-release-salt-typhoon-security-assessment-2026-02-03/))

## Covered stack
- Identity: **Entra ID**
- SIEM: **Microsoft Sentinel**
- Endpoint: **Microsoft Defender for Endpoint + CrowdStrike Falcon**
- Cloud/SaaS: **Microsoft 365 + AWS**

## Repository layout
```text
OpenCLAW_SaltTyphoon_SOaC/
  detection-rules/
    sentinel-kql/
    defender-advanced-hunting/
    crowdstrike-ioa/
  playbooks/soar/
  policies/
    entra-conditional-access/
    m365-defender/
    aws/
  threat-hunting/
  mitre-attack/
  docs/
  tests/
```

## What9s inside
- **5 Sentinel analytics rules** (starter set)
- **2 Defender Advanced Hunting queries** (starter set)
- **2 Entra Conditional Access policy templates** (report-only)
- **Deployment guide + sources**
- **MITRE mapping**

> If you want, I can expand this starter set to match the RansomHub package size (15-25 rules + playbooks) while keeping it aligned to the Salt Typhoon public reporting.

## Safety
Defensive content only.

**Last updated:** 2026-02-17
