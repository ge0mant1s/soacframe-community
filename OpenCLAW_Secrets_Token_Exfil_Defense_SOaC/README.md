# OpenCLAW SOaC: Secrets Theft & Token Exfil Defense
**Wave 1 | Developer Endpoints + CI/CD | Pattern-Based**
**Source Intel: Shai-Hulud Worm 1.0 & 2.0 (Intel 471)**

## What This Package Defends Against
The Shai-Hulud worm pattern:
- npm preinstall/postinstall hook abuse
- Node.js spawning Bun runtime (novel execution path)
- Base64 / double-base64 credential exfiltration
- GitHub PAT, npm token, and cloud key theft (AWS/GCP/Azure)
- Malicious GitHub Actions workflow injection for persistence
- Automated propagation via npm package republishing

## Package Structure
```
OpenCLAW_Secrets_Token_Exfil_Defense_SOaC/
├── Detections/
│   ├── Sigma/          # Generic SIEM rules
│   ├── Splunk/         # SPL queries
│   ├── Sentinel/       # KQL queries
│   └── Humio/          # LQL queries (Falcon LogScale)
├── Policies/
│   ├── npm/            # npm hardening controls
│   ├── GitHub/         # Token & secret scanning policies
│   ├── GitLab/         # CI variable & runner policies
│   └── AWS/            # OIDC least-privilege controls
├── Playbooks/          # Incident response steps
├── Hunting_Queries/    # Proactive threat hunting
├── MITRE_Mapping/      # ATT&CK coverage map
└── Executive_Brief_Secrets_Token_Exfil.docx
```

## Quick Start
1. Deploy Sigma rules to your SIEM of choice.
2. Apply npm + GitHub policies to your developer baseline.
3. Run hunting queries monthly or after any supply-chain advisory.
4. Use the playbook as your IR runbook for any npm compromise alert.

## CTA Keyword: LOADER
*Part of the OpenCLAW SOaC series — comment LOADER on LinkedIn to receive this package.*
