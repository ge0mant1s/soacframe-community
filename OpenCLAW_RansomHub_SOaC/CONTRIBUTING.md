# Contributing to OpenCLAW RansomHub SOaC

Thank you for your interest in contributing! 🙏

## How to Contribute

### 1. Report Issues
- Found a false positive? Open an issue with details
- New RansomHub TTP discovered? Submit with references

### 2. Submit Detection Rules
- Fork the repository
- Add KQL rule to `detection-rules/sentinel-kql/`
- Include MITRE ATT&CK mapping in comments
- Test in your Sentinel environment
- Submit pull request

### 3. Share Threat Intelligence
- New IOCs? Add to `threat-intel/iocs.json`
- Updated affiliate TTPs? Document in `docs/threat-updates.md`

## Code Style

### KQL Rules
```kql
// [Title]
// [Description]
// MITRE: [Technique ID] - [Technique Name]

[Query]
| extend Severity = "High", ThreatCategory = "RansomHub-[Category]"
| project TimeGenerated, [relevant fields]
```

### Playbook Actions
- Use descriptive step names
- Include SLA targets
- Document API requirements

## Pull Request Process

1. Update README.md with any new rules/playbooks
2. Update MITRE ATT&CK mapping if applicable
3. Ensure tests pass (`python tests/test_detection_coverage.py`)
4. Request review from maintainers

## Community Guidelines

- Be respectful and professional
- Share knowledge, not tools for harm
- Defensive use only

## Recognition

Contributors will be acknowledged in:
- README.md
- LinkedIn posts
- Conference presentations (if applicable)

---

Questions? Tag us on LinkedIn with #OpenCLAW
