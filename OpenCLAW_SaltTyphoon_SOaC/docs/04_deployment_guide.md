# Deployment Guide

## 1) Detections
- Import `artifacts/detections/sentinel/kql/*.kql` as Analytics Rules.
- Import `artifacts/detections/macos/*.kql` for macOS-specific rules.
- Validate table names match your workspace.

## 2) Playbooks
- Deploy templates from `artifacts/playbooks/logic_apps/`.
- Wire them to Sentinel incidents or analytics rule triggers.
- For macOS MDM playbooks, integrate with Jamf Pro or Intune APIs.

## 3) Policies
- Review templates under `artifacts/policies/`.
- For macOS, deploy MDM profiles from `artifacts/policies/macos_mdm/`.
- Adapt to your change control and apply in staging first.

## 4) macOS-Specific Setup
See `docs/11_macos_integration.md` for detailed macOS deployment steps.
