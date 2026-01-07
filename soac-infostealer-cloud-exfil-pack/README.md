# SOaC Infostealer → Cloud Portal Exfiltration Detection Pack
**Version:** 1.0.0  
**Precision Mode:** Behavioral (Mean + 3σ)  
**Framework:** Security Operations as Code (SOaC)

## Overview
This pack detects and responds to the current wave of infostealer-driven attacks where adversaries:
1. Infect endpoints with RedLine/Lumma/Vidar-class infostealers
2. Steal browser credentials and session tokens
3. Use stolen sessions to access cloud portals (M365, AWS, GDrive, Box)
4. Exfiltrate data at scale via bulk downloads/shares

**Key Innovation:** Behavioral precision using statistical baselines (mean + 3 standard deviations) instead of static thresholds.

## Supported Environments
- **Identity:** Entra ID, Okta, Google Workspace
- **Endpoint:** Microsoft Defender for Endpoint, CrowdStrike Falcon, SentinelOne
- **SIEM:** Microsoft Sentinel, Splunk, Elastic, CrowdStrike Falcon NGSIEM
- **SaaS/Cloud:** M365 (SharePoint/OneDrive), Google Drive, Box, AWS

## Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Identity Logs  │────▶│  Behavioral     │────▶│  Correlation    │
│  (Entra/Okta)   │     │  Baseline       │     │  Engine         │
└─────────────────┘     │  (14d lookback) │     └─────────────────┘
                        └─────────────────┘              │
┌─────────────────┐     ┌─────────────────┐              │
│  SaaS Logs      │────▶│  Anomaly        │──────────────┤
│  (M365/GDrive)  │     │  Detection      │              │
└─────────────────┘     │  (mean + 3σ)    │              ▼
                        └─────────────────┘     ┌─────────────────┐
┌─────────────────┐                             │  Automated      │
│  Endpoint EDR   │────────────────────────────▶│  Response       │
│  (MDE/CS/S1)    │     (Optional boost)        │  Playbook       │
└─────────────────┘                             └─────────────────┘
```

## Quick Start

### 1. Deploy Detections
Choose your environment and deploy the corresponding detection rules:

**Microsoft Sentinel (Entra ID + M365):**
```bash
# Deploy identity detection
az sentinel alert-rule create --rule-file detections/identity/entra/IDN-ENTRA-NEW-CONTEXT-BEHAVIORAL.kql

# Deploy SaaS detection
az sentinel alert-rule create --rule-file detections/saas/m365/SAAS-M365-BEHAVIORAL-EXFIL.kql

# Deploy correlation rule
az sentinel alert-rule create --rule-file detections/correlation/sentinel/CORR-SENTINEL-INFOSTEALER-EXFIL.kql
```

**CrowdStrike Falcon NGSIEM:**
```bash
# Import correlation rule
falcon-ngsiem import-rule detections/correlation/falcon_ngsiem/CORR-FALCON-INFOSTEALER-EXFIL.sql
```

**Splunk:**
```bash
# Deploy correlation search
splunk add saved-search -name "Infostealer Exfil Correlation" -search "$(cat detections/correlation/splunk/CORR-SPLUNK-INFOSTEALER-EXFIL.spl)"
```

### 2. Configure Automation
Wire the playbook to your SOAR platform:

**Example: Azure Logic Apps**
```bash
az logic workflow create --resource-group SOC --name InfostealerContainment --definition playbooks/PB-INFOSTEALER-CONTAIN-BEHAVIORAL.yaml
```

**Example: Splunk SOAR (Phantom)**
```bash
# Import playbook
phenv python playbooks/PB-INFOSTEALER-CONTAIN-BEHAVIORAL.yaml
```

### 3. Run Tests
Validate detection coverage:
```bash
# Run test scenario
python tests/run_scenario.py tests/scenarios/TEST-001-stolen-session-bulk-download.json

# Validate assertions
python tests/validate_assertions.py tests/assertions.yaml
```

## Detection Logic

### Identity Signal (New Context)
Triggers when a user signs in from a context (IP + Device + Geo) not seen in the last 14 days.

**Precision:** Requires >= 3 historical sign-ins to establish baseline.

### SaaS Signal (Behavioral Anomaly)
Triggers when file operations (downloads/shares) exceed `mean + 3 * stddev` of the user's 14-day baseline.

**Precision:** Minimum floor of 20 operations to avoid noise on low-activity users.

### Correlation
HIGH severity alert fires when **both signals occur within 60 minutes** for the same user.

## Response Playbook

### Automated Actions (< 10 minutes)
1. **Revoke all sessions** (Entra/Okta/Google)
2. **Reset password**
3. **Isolate endpoint** (if EDR signal present)
4. **Remove external shares** created in window

### Manual Actions
5. Scope data exfiltration
6. Reimage endpoint
7. Rotate credentials
8. Update conditional access policies

## MITRE ATT&CK Coverage
- **T1539:** Steal Web Session Cookie
- **T1555:** Credentials from Password Stores
- **T1078:** Valid Accounts
- **T1567:** Exfiltration Over Web Service
- **T1530:** Data from Cloud Storage Object

## Tuning Guide

### Reduce False Positives
- Increase baseline period: `baselinePeriod = 30d`
- Increase deviation threshold: `threshold = mean + 4*stddev`
- Increase minimum floor: `minFloor = 50`

### Increase Detection Sensitivity
- Decrease deviation threshold: `threshold = mean + 2*stddev`
- Decrease minimum floor: `minFloor = 10`
- Add geo-velocity checks (impossible travel)

## References
- [CyberInsider: Cloud portals at 50+ global firms breached](https://cyberinsider.com/cloud-portals-at-50-global-firms-breached-by-infostealer-malware/)
- [BleepingComputer: Cloud file-sharing sites targeted](https://www.bleepingcomputer.com/news/security/cloud-file-sharing-sites-targeted-for-corporate-data-theft-attacks/)
- [SOaC Framework](https://soacframe.io)

## License
MIT License - See LICENSE file

## Contributing
Contributions welcome! Please submit PRs with:
- New environment support (e.g., Azure AD B2C, Duo)
- Detection improvements
- Playbook enhancements
- Test scenarios

## Support
- GitHub Issues: [github.com/your-org/soac-infostealer-pack/issues]
- SOaC Community: [soacframe.io/community]
