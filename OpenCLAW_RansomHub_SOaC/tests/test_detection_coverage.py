#!/usr/bin/env python3
# Testing Framework for OpenCLAW RansomHub Detection Coverage

import json
import os
from pathlib import Path

def load_detection_rules(rules_dir):
    rules = []
    for kql_file in Path(rules_dir).glob("*.kql"):
        with open(kql_file, 'r') as f:
            content = f.read()
            # Extract MITRE technique from comments
            for line in content.split('\n'):
                if 'MITRE:' in line:
                    technique = line.split('MITRE:')[1].strip().split('-')[0].strip()
                    rules.append({'file': kql_file.name, 'technique': technique})
    return rules

def calculate_coverage(rules, mitre_file):
    with open(mitre_file, 'r') as f:
        mitre_data = json.load(f)

    total_techniques = mitre_data['total_techniques_covered']
    covered = len(set([r['technique'] for r in rules]))

    coverage_pct = (covered / total_techniques) * 100
    return coverage_pct, covered, total_techniques

def main():
    print("=== OpenCLAW RansomHub Detection Coverage Test ===")

    rules_dir = "../detection-rules/sentinel-kql"
    mitre_file = "../mitre-attack/attack_mapping.json"

    rules = load_detection_rules(rules_dir)
    coverage, covered, total = calculate_coverage(rules, mitre_file)

    print(f"\nTotal Detection Rules: {len(rules)}")
    print(f"Techniques Covered: {covered}/{total}")
    print(f"Coverage: {coverage:.1f}%")

    if coverage >= 80:
        print("\n✅ PASS: Coverage meets 80% threshold")
        return 0
    else:
        print("\n❌ FAIL: Coverage below 80% threshold")
        return 1

if __name__ == "__main__":
    exit(main())
