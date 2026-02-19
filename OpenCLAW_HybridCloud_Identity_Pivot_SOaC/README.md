# OpenCLAW SOaC: Hybrid Cloud & SaaS Identity Pivot Defense
## Pattern-Based Defense Framework (M365 -> Entra ID -> AWS -> SaaS)

This package provides Security-as-Code (SOaC) artifacts to detect, respond to, and prevent cross-cloud identity-led intrusions.

### Target Stack
- **Identity:** Entra ID (Azure AD)
- **Productivity:** M365 & Google Workspace
- **Cloud Infrastructure:** AWS (via SSO/Federation)
- **Enterprise SaaS:** Salesforce & SAP
- **Security:** Microsoft Sentinel, CrowdStrike/Defender, AWS CloudTrail

### Contents
1. `detections/`: KQL and logic for cross-platform correlation.
2. `playbooks/`: Logic apps and manual IR workflows for identity containment.
3. `policies/`: Conditional Access and IAM guardrails.
4. `hunting/`: Proactive queries for token theft and persistence.
5. `tests/`: Atomic Red Team style validation steps.
