# OpenCLAW SOaC: RansomHub Defense Package 🛡️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MITRE ATT&CK](https://img.shields.io/badge/MITRE-ATT%26CK-red)](https://attack.mitre.org/)
[![Detection Coverage](https://img.shields.io/badge/Detection%20Coverage-85%25-green)]()

> **Security-as-Code framework to defend against RansomHub ransomware-as-a-service (RaaS) operations**

## 🎯 Overview

RansomHub is an aggressive RaaS platform that emerged after the ALPHV/BlackCat exit scam. This package provides:

- **18 Detection Rules** for Sentinel, CrowdStrike, and Defender
- **7 SOAR Playbooks** for automated incident response
- **12 Security Policies** (Conditional Access, EDR configurations)
- **Full MITRE ATT&CK Mapping** across 12+ techniques
- **Threat Hunting Queries** for proactive defense

## 🏗️ Tech Stack Coverage

| Component | Coverage |
|-----------|----------|
| **Identity** | Entra ID (Azure AD) |
| **SIEM** | Microsoft Sentinel |
| **EDR** | CrowdStrike Falcon + Microsoft Defender |
| **Cloud** | Microsoft 365 + AWS |

## 📦 Package Contents

```
OpenCLAW_RansomHub_SOaC/
├── detection-rules/
│   ├── sentinel-kql/          # 12 KQL analytics rules
│   └── crowdstrike-ioa/       # 6 CrowdStrike IOA rules
├── playbooks/
│   └── soar/                  # 7 Logic App playbooks
├── policies/
│   ├── entra-conditional-access/  # 8 CA policies
│   └── edr-configurations/        # 4 EDR hardening configs
├── threat-hunting/            # 15 proactive hunt queries
├── mitre-attack/              # Full ATT&CK mapping + heatmap
├── docs/                      # Deployment guides
└── tests/                     # Validation framework

```

## 🚀 Quick Start

### Prerequisites
- Microsoft Sentinel workspace
- Entra ID P2 license
- CrowdStrike Falcon or Defender for Endpoint

### Deployment

```bash
# Clone the repository
git clone https://github.com/your-org/openclaw-ransomhub.git
cd openclaw-ransomhub

# Deploy detection rules
./deploy-detections.sh --workspace-id <sentinel-workspace-id>

# Apply Conditional Access policies
./deploy-policies.sh --tenant-id <tenant-id>
```

See [Deployment Guide](docs/deployment-guide.md) for detailed instructions.

## 🎓 What This Package Defends Against

### RansomHub Kill Chain
1. **Initial Access** (T1190, T1078)
   - Exploiting Citrix, Fortinet, VMware vulnerabilities
   - Compromised VPN/RDP credentials
   - ZeroLogon exploitation

2. **Execution & Persistence** (T1059, T1053)
   - PowerShell Empire, Cobalt Strike
   - Scheduled task creation
   - RMM tool abuse (AnyDesk, Atera, MeshCentral)

3. **Credential Access** (T1003, T1558)
   - LSASS dumping via Mimikatz
   - Kerberoasting
   - DCSync attacks

4. **Discovery** (T1087, T1482)
   - ADFind, ADRecon, BloodHound
   - Network scanning

5. **Lateral Movement** (T1021)
   - RDP, SMB, PsExec, Impacket

6. **Collection & Exfiltration** (T1560, T1048)
   - WinRAR compression
   - Rclone to Mega.nz
   - SSH/WinSCP tunneling

7. **Defense Evasion** (T1562, T1070)
   - EDRKillShifter (BYOVD attacks)
   - Event log clearing
   - Shadow copy deletion

8. **Impact** (T1486, T1490)
   - File encryption
   - VSS deletion

## 📊 Detection Coverage

| TTP Category | Coverage | Rules |
|--------------|----------|-------|
| Initial Access | 90% | 3 rules |
| Credential Access | 85% | 4 rules |
| Discovery | 80% | 3 rules |
| Lateral Movement | 85% | 2 rules |
| Exfiltration | 90% | 3 rules |
| Defense Evasion | 75% | 5 rules |
| Impact | 95% | 2 rules |

## 🧪 Testing

```bash
cd tests/
python3 test_detection_coverage.py --rules ../detection-rules/
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md).

## 📜 License

MIT License - see [LICENSE](LICENSE)

## 🙏 Acknowledgments

Based on research from:
- Palo Alto Networks Unit 42
- Arctic Wolf Labs
- Forescout Vedere Labs
- Microsoft Threat Intelligence
- Trend Micro
- Sophos X-Ops

## 📞 Contact

Questions? Open an issue or reach out on LinkedIn.

---

**⚠️ Disclaimer**: This package is for defensive purposes only. Test in non-production environments first.
