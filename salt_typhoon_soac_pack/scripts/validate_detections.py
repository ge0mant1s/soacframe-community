#!/usr/bin/env python3
"""
Validates detection rules for proper structure and ATT&CK mappings
"""
import yaml
import sys
from pathlib import Path

def validate_detection_rule(rule_path):
    """Validate a single detection rule"""
    with open(rule_path) as f:
        rule = yaml.safe_load(f)

    required_fields = ['title', 'id', 'description', 'tags', 'logsource', 'detection']
    errors = []

    for field in required_fields:
        if field not in rule:
            errors.append(f"Missing required field: {field}")

    # Check for ATT&CK tags
    if 'tags' in rule:
        attack_tags = [t for t in rule['tags'] if t.startswith('attack.t')]
        if not attack_tags:
            errors.append("No ATT&CK technique tags found")

    # Check for campaign tags
    if 'tags' in rule:
        campaign_tags = [t for t in rule['tags'] if 'salt_typhoon' in t.lower()]
        if not campaign_tags:
            errors.append("No Salt Typhoon campaign tag found")

    return errors

def main():
    detections_dir = Path('detections')
    all_errors = {}

    for rule_file in detections_dir.rglob('*.yml'):
        errors = validate_detection_rule(rule_file)
        if errors:
            all_errors[str(rule_file)] = errors

    if all_errors:
        print("❌ Validation failed:\n")
        for file, errors in all_errors.items():
            print(f"{file}:")
            for error in errors:
                print(f"  - {error}")
        sys.exit(1)
    else:
        print("✅ All detection rules validated successfully")
        sys.exit(0)

if __name__ == '__main__':
    main()
