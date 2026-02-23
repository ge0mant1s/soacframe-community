
# Playbook: CI/CD Workflow Injection Response
1. **Identify**: Confirm the malicious commit/workflow run ID.
2. **Contain**: 
   - Disable the GitHub/GitLab runner immediately.
   - Revoke the PAT (Personal Access Token) associated with the actor.
3. **Eradicate**:
   - Revert the repository to the last known good commit.
   - Delete any malicious artifacts/packages published to npm/PyPI.
4. **Recovery**:
   - Rotate all secrets stored in CI/CD variables (AWS keys, API tokens).
   - Force MFA reset for the compromised developer account.
