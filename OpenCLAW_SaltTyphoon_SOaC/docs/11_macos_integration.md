# macOS Integration Guide

## Overview
This package now includes comprehensive macOS support to protect high-value targets (executives, developers) who often use Mac devices.

## Prerequisites
1. **Entra ID Platform SSO** configured for macOS (requires macOS 13+)
2. **MDM enrollment:** Jamf Pro or Microsoft Intune
3. **EDR deployment:** Microsoft Defender for Endpoint or CrowdStrike Falcon for Mac
4. **Log forwarding:** Ensure macOS devices send logs to Sentinel via MDE connector

## Deployment Steps

### 1. Enable Platform SSO (Entra ID)
- Configure Platform SSO in Intune or Jamf
- Enforce device compliance before granting access
- Reference: https://learn.microsoft.com/en-us/azure/active-directory/devices/macos-psso

### 2. Deploy EDR
- **Microsoft Defender:** Deploy via Intune or Jamf
- **CrowdStrike:** Deploy Falcon sensor via MDM
- Approve system extensions via MDM profile (see `MDM-MAC-004-System-Extension-Approval.json`)

### 3. Import macOS Detections
- Navigate to `artifacts/detections/macos/`
- Import all `.kql` files as Sentinel Analytics Rules
- Validate `OSPlatform == "macOS"` filter is working

### 4. Deploy MDM Hardening Policies
- Import profiles from `artifacts/policies/macos_mdm/`
- Priority order:
  1. FileVault enforcement
  2. Firewall enabled
  3. Gatekeeper enforced
  4. System extension approval (for EDR)
  5. Screen lock policy

### 5. Configure MDM Playbooks
- Integrate `artifacts/playbooks/macos_mdm/` with your MDM API
- Test device lock/wipe in a lab environment first

## Testing
- Create a test LaunchAgent: `~/Library/LaunchAgents/test.plist`
- Attempt to disable Gatekeeper: `sudo spctl --master-disable`
- Verify detections fire in Sentinel

## Troubleshooting
- **No macOS logs in Sentinel:** Verify MDE connector is configured and macOS devices are onboarded
- **False positives on LaunchAgents:** Baseline legitimate agents first using `HUNT-MAC-001`
- **MDM commands not working:** Verify device enrollment status and API permissions

## References
- macOS Security Compliance Project: https://github.com/usnistgov/macos_security
- MITRE ATT&CK for macOS: https://attack.mitre.org/matrices/enterprise/macos/
