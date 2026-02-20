# Playbook: Rapid Identity Containment
**Trigger:** High-Risk Identity Detection (Token Theft/MFA Fatigue)

1. **Automated Action:** Revoke all active Refresh Tokens (Entra ID).
2. **Automated Action:** Disable User Account in Source Directory.
3. **Notification:** Alert SOC via Teams/Slack with User Context.
4. **Verification:** Check for concurrent AWS/SaaS sessions and terminate.
5. **Recovery:** Require FIDO2/Hardware Key re-enrollment for the user.
