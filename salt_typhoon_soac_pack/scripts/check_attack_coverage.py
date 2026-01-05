#!/usr/bin/env python3
"""
Checks ATT&CK coverage for Salt Typhoon campaign
"""
import yaml
from pathlib import Path
from collections import defaultdict

# Salt Typhoon TTPs from AA25-239A
SALT_TYPHOON_TTPS = {
    'T1190': 'Exploit Public-Facing Application',
    'T1133': 'External Remote Services',
    'T1505.003': 'Web Shell',
    'T1543.003': 'Create or Modify System Process',
    'T1098': 'Account Manipulation',
    'T1082': 'System Information Discovery',
    'T1590': 'Gather Victim Network Information',
    'T1040': 'Network Sniffing',
    'T1005': 'Data from Local System',
    'T1572': 'Protocol Tunneling',
    'T1090': 'Proxy',
    'T1020': 'Automated Exfiltration',
}

def extract_attack_techniques(rule_path):
    """Extract ATT&CK techniques from a detection rule"""
    with open(rule_path) as f:
        rule = yaml.safe_load(f)

    techniques = []
    if 'tags' in rule:
        for tag in rule['tags']:
            if tag.startswith('attack.t'):
                technique = tag.replace('attack.', '').upper()
                techniques.append(technique)

    return techniques

def main():
    detections_dir = Path('detections')
    coverage = defaultdict(list)

    # Scan all detection rules
    for rule_file in detections_dir.rglob('*.yml'):
        techniques = extract_attack_techniques(rule_file)
        for technique in techniques:
            coverage[technique].append(rule_file.name)

    # Check coverage
    print("\n" + "="*60)
    print("Salt Typhoon ATT&CK Coverage Report")
    print("="*60 + "\n")

    covered = 0
    for technique, name in SALT_TYPHOON_TTPS.items():
        if technique in coverage:
            print(f"✅ {technique} - {name}")
            for rule in coverage[technique]:
                print(f"   └─ {rule}")
            covered += 1
        else:
            print(f"❌ {technique} - {name} [NO COVERAGE]")

    coverage_pct = (covered / len(SALT_TYPHOON_TTPS)) * 100
    print(f"\n📊 Coverage: {covered}/{len(SALT_TYPHOON_TTPS)} ({coverage_pct:.1f}%)")

    if coverage_pct < 70:
        print("\n⚠️  Warning: Coverage below 70%")
        return 1

    return 0

if __name__ == '__main__':
    exit(main())
