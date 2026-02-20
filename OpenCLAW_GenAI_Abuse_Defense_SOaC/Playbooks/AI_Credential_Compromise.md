# Playbook: AI API Key Compromise
**Trigger:** Detection of unauthorized AI API usage or leaked keys in GitHub.

1. **Immediate Action:** Revoke the compromised API key in the provider portal (OpenAI/Azure/AWS).
2. **Automated Action:** Identify all applications/services using the compromised key.
3. **Containment:** Temporarily suspend the associated service principal or IAM role.
4. **Investigation:** Review AI usage logs for "Data Poisoning" or "Prompt Injection" attempts during the compromise.
5. **Remediation:** Rotate keys, update secrets management (KeyVault/SecretsManager), and audit AI outputs for integrity.
