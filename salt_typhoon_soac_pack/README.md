# Salt Typhoon Detection Engineering Pack

## 🎯 Purpose

This is a **plug-and-play Security Operations as Code (SOaC) pack** for detecting and responding to **Salt Typhoon** (aka OPERATOR PANDA, Earth Estries) campaign activity, based on CISA Advisory AA25-239A.

## 📦 What's Included

### Detection Rules (`detections/`)
- **Sigma format** detection rules mapped to MITRE ATT&CK
- Coverage for Salt Typhoon TTPs:
  - Non-standard management ports
  - SPAN/ERSPAN session changes
  - Cisco Guest Shell abuse
  - SNMP manipulation
- Alternative formats: KQL (Sentinel), Splunk SPL, Elastic EQL

### Parsers (`parsers/`)
- Log normalization for:
  - Cisco IOS/NX-OS
  - Palo Alto PAN-OS
  - Ivanti logs
  - SNMP traps

### Playbooks (`playbooks/`)
- Incident response playbook for suspected Salt Typhoon compromise
- Step-by-step procedures for:
  - Device isolation
  - Evidence collection
  - Configuration analysis
  - Remediation

### Threat Intelligence (`threat_intel/`)
- Structured campaign object with:
  - TTPs mapped to ATT&CK
  - CVEs and affected products
  - IOCs and tools
  - Mitigation recommendations

### Assets (`assets/`)
- Device inventory template
- Hardening baseline configuration
- Network topology templates

### Scripts (`scripts/`)
- `exposure_assessment.py` - Check your environment for Salt Typhoon exposure
- `validate_detections.py` - Validate detection rule syntax and structure
- `check_attack_coverage.py` - Verify ATT&CK coverage

### CI/CD (`.github/workflows/`)
- GitHub Actions pipeline for:
  - Detection validation
  - ATT&CK coverage checks
  - Automated testing
  - SIEM deployment

## 🚀 Quick Start

### 1. Clone or Download This Pack
```bash
git clone <your-repo-url>
cd salt_typhoon_soac_pack
```

### 2. Populate Your Device Inventory
Edit `assets/device_inventory_template.yml` with your actual network devices:
```yaml
devices:
  - hostname: edge-router-01
    ip: 10.0.1.1
    role: internet-edge
    vendor: cisco
    os_version: IOS-XE 17.6.1
```

### 3. Run Exposure Assessment
```bash
python3 scripts/exposure_assessment.py
```

This will identify:
- **Tier 0** devices (critical exposure - CVE + high-risk role)
- **Tier 1** devices (high exposure - CVE exposure)
- **Tier 2** devices (medium exposure - high-risk role)

### 4. Deploy Detection Rules

#### Option A: Sigma to Your SIEM
```bash
# Convert to your SIEM format
sigmac -t splunk detections/network/edge/non_standard_mgmt_ports.yml
sigmac -t elastalert detections/network/router/span_config_changes.yml
```

#### Option B: Use Pre-converted Queries
- **Microsoft Sentinel**: `detections/alternative_formats/kql_queries.txt`
- **Splunk**: `detections/alternative_formats/splunk_queries.txt`
- **Elastic**: `detections/alternative_formats/elastic_queries.txt`

### 5. Review and Customize
- Update management network ranges in SNMP detection rules
- Adjust device roles to match your environment
- Customize playbook steps for your organization

### 6. Set Up CI/CD (Optional)
If using GitHub:
```bash
# The pipeline is already configured in .github/workflows/
# Just push to your repo and it will run automatically
git add .
git commit -m "Initial Salt Typhoon SOaC pack"
git push
```

## 📊 ATT&CK Coverage

This pack provides detection coverage for the following Salt Typhoon TTPs:

| Technique | Name | Coverage |
|-----------|------|----------|
| T1190 | Exploit Public-Facing Application | ⚠️ Partial |
| T1133 | External Remote Services | ⚠️ Partial |
| T1505.003 | Web Shell | ✅ Covered |
| T1543.003 | Create or Modify System Process | ✅ Covered |
| T1098 | Account Manipulation | ⚠️ Partial |
| T1082 | System Information Discovery | ✅ Covered |
| T1590 | Gather Victim Network Information | ✅ Covered |
| T1040 | Network Sniffing | ✅ Covered |
| T1005 | Data from Local System | ⚠️ Partial |
| T1572 | Protocol Tunneling | ⚠️ Partial |
| T1090 | Proxy | ⚠️ Partial |
| T1020 | Automated Exfiltration | ⚠️ Partial |

Run `python3 scripts/check_attack_coverage.py` for detailed coverage report.

## 🛡️ Hardening Recommendations

Apply the hardening baseline from `assets/hardening_baseline.yml`:

### Critical Actions
1. ✅ Patch all CVEs from AA25-239A
2. ✅ Disable HTTP server: `no ip http server`
3. ✅ Use SNMPv3 only with strong authentication
4. ✅ Remove default credentials (cisco/cisco)
5. ✅ Disable Guest Shell unless required
6. ✅ Enable comprehensive logging to SIEM

### High Priority
- Review and document all ACLs (especially 10, 20, 50)
- Monitor SPAN/ERSPAN session changes
- Use SSH on standard port 22 only
- Implement strict change management

## 🔄 Continuous Improvement

This pack follows SOaC principles:

1. **Detection rules are code** - version controlled, tested, reviewed
2. **Playbooks are code** - automated where possible, documented always
3. **Threat intel is code** - structured, machine-readable, actionable
4. **CI/CD validates everything** - no manual deployment errors

### Contributing
- Add new detection rules in `detections/`
- Update threat intel in `threat_intel/salt_typhoon_campaign.yml`
- Improve playbooks in `playbooks/`
- Submit PRs - the CI pipeline will validate automatically

## 📚 References

- [CISA AA25-239A Advisory](https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-239a)
- [CISA STIX Package](https://www.cisa.gov/sites/default/files/2025-01/aa25-239a-stix.xml)
- [MITRE ATT&CK](https://attack.mitre.org/)

## 📝 License

This pack is released under MIT License for community use.

## 🙏 Acknowledgments

Based on research and analysis of CISA Advisory AA25-239A and community threat intelligence.

---

**Questions or Issues?**  
Open an issue or contribute improvements via pull request.

**Stay safe. Detect early. Respond fast.**
