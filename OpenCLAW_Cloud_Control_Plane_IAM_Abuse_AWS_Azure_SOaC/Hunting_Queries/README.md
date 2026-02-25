# Hunting Queries (Ideas)

## AWS
- Find new access keys created in last 24h for privileged principals
- Enumerate role trust policy changes
- Look for CloudTrail configuration changes and gaps in log delivery

## Azure/Entra
- Role assignments write/delete events
- App consent and app registration changes
- Risky sign-ins followed by privileged operations within 30 minutes
