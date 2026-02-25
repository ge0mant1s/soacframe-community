# macOS Hardening Notes (Control Plane Risk Reduction)

## Goal
Reduce credential/session theft on macOS endpoints that authenticate to AWS/Azure consoles and admin portals.

## Recommendations
- Enforce FileVault, OS updates, and MDM baseline
- Disable unapproved browser extensions; monitor for suspicious extension installs
- Require phishing-resistant MFA for admin portals (Entra)
- Prefer short session lifetimes for privileged roles
- Ensure local security logging is forwarded (unified log, auth events) to SIEM/Wazuh

## Telemetry to Collect
- Process execution for browser and credential tooling
- Network connections to unusual domains (phishing kits)
- New login items / persistence
