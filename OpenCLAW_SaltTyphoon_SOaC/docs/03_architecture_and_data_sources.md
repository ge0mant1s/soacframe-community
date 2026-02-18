# Architecture & Data Sources

Required telemetry (recommended):
- Microsoft Defender for Endpoint: `DeviceProcessEvents`, `DeviceNetworkEvents`, `DeviceFileEvents` (Windows + macOS)
- Entra ID sign-in logs: `SigninLogs`
- IIS logs (Exchange) to Sentinel: `W3CIISLog`
- Network/Flow logs (optional but strong): firewall logs, VPC Flow Logs, NetFlow
- **macOS MDM logs:** Jamf Pro / Intune device compliance and configuration logs
