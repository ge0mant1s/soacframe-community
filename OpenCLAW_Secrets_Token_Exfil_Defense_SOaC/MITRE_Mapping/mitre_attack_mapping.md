# MITRE ATT&CK Mapping: Secrets Theft & Token Exfil Defense
| Technique ID | Technique Name | Detection File | Platform |
|---|---|---|---|
| T1059.007 | JavaScript (npm lifecycle hooks) | npm_preinstall_hook_exec.* | Sigma/Splunk/Sentinel/Humio |
| T1027 | Obfuscated Files (Base64) | double_base64_exfil.* | Sigma/Splunk/Humio |
| T1552.001 | Credentials In Files | cloud_key_in_process_args.spl | Splunk |
| T1041 | Exfiltration Over C2 | suspicious_github_api_dns.yml | Sigma |
| T1119 | Automated Collection | npm_preinstall_hook_exec.* | All |
| T1087 | Account Discovery | secrets_exfil_hunting.md | Hunt |
| T1562 | Impair Defenses | npm_hardening_policy.json | Policy |
| T1105 | Ingress Tool Transfer | npm_preinstall_hook_exec.* | All |

## CVEs Covered
- CVE-2023-46747
- CVE-2024-3400
- CVE-2025-59287
- CVE-2024-1709
- CVE-2021-4436
- CVE-2025-0282
