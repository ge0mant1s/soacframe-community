# OpenCLAW SOaC Package — Salt Typhoon (G1045)
## Cross-Platform Defense: Windows + macOS + Network Infrastructure

Security-as-Code (SOaC) artifacts to help defenders detect, respond to, and harden against **Salt Typhoon (MITRE ATT&CK Group G1045)** across **Windows, macOS, and network infrastructure**.

## What's New: macOS Support
This package now includes **macOS-specific detections, policies, and playbooks** to protect high-value targets like developers and executives who often use Mac devices.

### macOS Coverage Includes:
- **Persistence Detection:** LaunchAgents, LaunchDaemons, LoginItems
- **Defense Evasion:** Gatekeeper/SIP/TCC tampering
- **Credential Access:** Keychain access, dscl enumeration
- **MDM Hardening:** FileVault, Firewall, System Extension policies
- **Cross-Platform Hunting:** Unified KQL queries across Windows + macOS

## Target Stack
- **Identity:** Entra ID (Azure AD) with Platform SSO for macOS
- **Endpoint:** Microsoft Defender for Endpoint / CrowdStrike Falcon (Windows + macOS)
- **SIEM:** Microsoft Sentinel
- **Workloads:** M365
- **Cloud:** AWS (CloudTrail, VPC Flow Logs)
- **MDM:** Jamf Pro / Microsoft Intune (macOS management)

## Package Contents
- **Detections-as-Code** (KQL): 24 rules (18 Windows/Linux + 6 macOS)
- **Hunting-as-Code** (KQL): 15 queries (10 Windows/Linux + 5 macOS)
- **Playbooks-as-Code**: 8 Logic Apps + 3 MDM response workflows
- **Policies-as-Code**: 15 templates (CA, EDR, MDM)
- **MITRE Mapping**: Full G1045 technique coverage

## How to Use
1. Read `docs/11_macos_integration.md` for macOS-specific setup
2. Read `docs/04_deployment_guide.md` for general deployment
3. Import detections from `artifacts/detections/`
4. Deploy playbooks from `artifacts/playbooks/`
5. Apply policies from `artifacts/policies/`
6. Validate using `docs/05_validation_and_testing.md`

## Safety
This repo contains **defensive detections and hardening guidance only**.

## References
- MITRE ATT&CK — Salt Typhoon (G1045): https://attack.mitre.org/groups/G1045/
- macOS Security Compliance Project: https://github.com/usnistgov/macos_security

*Generated: 2026-02-18*
