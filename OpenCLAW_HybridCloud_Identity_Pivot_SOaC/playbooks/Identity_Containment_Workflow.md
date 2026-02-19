# Playbook: Cross-Cloud Identity Containment
1. **Trigger:** High-severity alert for Token Theft or AWS Admin Pivot.
2. **Action 1:** Revoke all Entra ID Refresh Tokens for the user.
3. **Action 2:** Disable AWS IAM User / Deactivate active AWS Sessions.
4. **Action 3:** Suspend Google Workspace account.
5. **Action 4:** Freeze Salesforce user profile.
6. **Action 5:** Trigger SAP 'Lock User' transaction.
7. **Notification:** Alert SOC Lead and Identity Team via Slack/Teams.
