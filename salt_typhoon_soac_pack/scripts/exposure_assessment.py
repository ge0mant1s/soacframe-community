#!/usr/bin/env python3
"""
Salt Typhoon Exposure Assessment Script
Checks your environment against known vulnerabilities and tradecraft
"""
import yaml
import sys
from pathlib import Path
from typing import List, Dict

# CVEs from AA25-239A
SALT_TYPHOON_CVES = {
    'CVE-2024-20931': {
        'product': 'Cisco IOS XE',
        'affected_versions': ['< 17.6.6', '< 17.9.4'],
        'severity': 'critical'
    },
    'CVE-2024-21887': {
        'product': 'Ivanti Connect Secure',
        'affected_versions': ['< 9.1R14.4', '< 22.5R2.2'],
        'severity': 'critical'
    },
    'CVE-2023-46805': {
        'product': 'Ivanti Connect Secure',
        'affected_versions': ['< 9.1R14.4', '< 22.5R2.2'],
        'severity': 'critical'
    },
}

def load_inventory():
    """Load device inventory"""
    inventory_path = Path('assets/device_inventory_template.yml')
    if not inventory_path.exists():
        print("❌ Device inventory not found. Please populate assets/device_inventory_template.yml")
        sys.exit(1)

    with open(inventory_path) as f:
        data = yaml.safe_load(f)

    return data.get('devices', [])

def check_cve_exposure(device: Dict) -> List[str]:
    """Check if device is exposed to known CVEs"""
    exposures = []

    vendor = device.get('vendor', '').lower()
    os_version = device.get('os_version', '')

    for cve, details in SALT_TYPHOON_CVES.items():
        if vendor in details['product'].lower():
            # Simplified version check - in production, use proper version comparison
            exposures.append({
                'cve': cve,
                'severity': details['severity'],
                'product': details['product']
            })

    return exposures

def check_high_risk_roles(device: Dict) -> bool:
    """Check if device is in a high-risk role"""
    high_risk_roles = ['internet-edge', 'provider-edge', 'vpn-gateway']
    return device.get('role') in high_risk_roles

def main():
    print("\n" + "="*70)
    print("Salt Typhoon Exposure Assessment")
    print("="*70 + "\n")

    devices = load_inventory()

    if not devices:
        print("⚠️  No devices found in inventory")
        return 0

    print(f"📊 Analyzing {len(devices)} devices...\n")

    tier_0_devices = []  # Critical exposure
    tier_1_devices = []  # High exposure
    tier_2_devices = []  # Medium exposure

    for device in devices:
        hostname = device.get('hostname', 'unknown')
        role = device.get('role', 'unknown')

        cve_exposures = check_cve_exposure(device)
        is_high_risk_role = check_high_risk_roles(device)

        if cve_exposures and is_high_risk_role:
            tier_0_devices.append({
                'device': device,
                'exposures': cve_exposures,
                'reason': 'CVE exposure + high-risk role'
            })
        elif cve_exposures:
            tier_1_devices.append({
                'device': device,
                'exposures': cve_exposures,
                'reason': 'CVE exposure'
            })
        elif is_high_risk_role:
            tier_2_devices.append({
                'device': device,
                'exposures': [],
                'reason': 'High-risk role'
            })

    # Report Tier 0 (Critical)
    if tier_0_devices:
        print("🚨 TIER 0 - CRITICAL EXPOSURE")
        print("-" * 70)
        for item in tier_0_devices:
            dev = item['device']
            print(f"\n  Device: {dev['hostname']} ({dev['role']})")
            print(f"  IP: {dev['ip']}")
            print(f"  Vendor: {dev['vendor']} {dev.get('model', 'N/A')}")
            print(f"  OS: {dev.get('os_version', 'N/A')}")
            print(f"  Reason: {item['reason']}")
            if item['exposures']:
                print(f"  CVEs:")
                for exp in item['exposures']:
                    print(f"    - {exp['cve']} ({exp['severity']})")
        print()

    # Report Tier 1 (High)
    if tier_1_devices:
        print("\n⚠️  TIER 1 - HIGH EXPOSURE")
        print("-" * 70)
        for item in tier_1_devices:
            dev = item['device']
            print(f"  • {dev['hostname']} - {item['reason']}")

    # Report Tier 2 (Medium)
    if tier_2_devices:
        print("\n📋 TIER 2 - MEDIUM EXPOSURE")
        print("-" * 70)
        for item in tier_2_devices:
            dev = item['device']
            print(f"  • {dev['hostname']} - {item['reason']}")

    # Summary
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    print(f"  Tier 0 (Critical): {len(tier_0_devices)} devices")
    print(f"  Tier 1 (High):     {len(tier_1_devices)} devices")
    print(f"  Tier 2 (Medium):   {len(tier_2_devices)} devices")
    print(f"  Total Analyzed:    {len(devices)} devices")
    print()

    if tier_0_devices:
        print("⚠️  IMMEDIATE ACTION REQUIRED for Tier 0 devices")
        print("   1. Review playbooks/salt_typhoon_edge_compromise.yml")
        print("   2. Patch or isolate affected devices")
        print("   3. Run detection rules against historical logs")
        print()

    return 0

if __name__ == '__main__':
    exit(main())
