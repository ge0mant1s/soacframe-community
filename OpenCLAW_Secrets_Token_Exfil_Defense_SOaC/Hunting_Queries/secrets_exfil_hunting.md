# OpenCLAW Threat Hunting: Secrets Theft & Token Exfil
## Hunt 1: Find all npm installs that spawned network connections (Sentinel KQL)
DeviceNetworkEvents
| where InitiatingProcessFileName in~ ("npm", "node", "bun")
| where RemoteIPType != "Loopback"
| project TimeGenerated, DeviceName, AccountName, InitiatingProcessFileName, RemoteIP, RemoteUrl
| order by TimeGenerated desc

## Hunt 2: Find base64 blobs in process command lines (Splunk SPL)
index=endpoint
| rex field=CommandLine "(?<b64>[A-Za-z0-9+/]{40,}={0,2})"
| where len(b64) > 100
| stats count by host, user, CommandLine, b64
| sort -count

## Hunt 3: Find public GitHub repo commits containing secrets (Sentinel KQL)
GitHubAuditLog
| where Action == "repo.create"
| where RepoName contains "shai-hulud"
| project TimeGenerated, Actor, RepoName, OrgName

## Hunt 4: Detect TruffleHog-style secret scanning activity (Sigma-based)
# Look for trufflehog process execution — may indicate attacker recon OR defender activity
# Cross-reference with user context to determine intent
