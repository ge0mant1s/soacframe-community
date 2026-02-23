# OpenCLAW Playbook: Secrets Theft & Token Exfil Response
## Trigger Conditions
- npm preinstall hook spawning curl/wget/bun
- GitHub PAT pattern detected in process args
- Double base64 encoding in CI process
- shai-hulud-workflow.yml file creation detected

## Phase 1: CONTAIN (0–15 min)
1. Immediately revoke all GitHub PATs created in the last 48 hours for the affected developer account.
2. Rotate the npm publish token for the affected organization.
3. Disable the GitHub Actions runner that executed the suspicious workflow.
4. Temporarily disable OIDC role trust for the affected repository.
5. Block outbound traffic from the CI runner to non-approved endpoints (firewall rule).

## Phase 2: ERADICATE (15–60 min)
1. Audit all npm packages published by the affected account in the last 7 days.
2. Unpublish or deprecate any packages published during the compromise window.
3. Remove the malicious workflow file from .github/workflows/.
4. Force-reset the repository branch to the last verified clean commit.
5. Scan all CI environment variables for exposed secrets (use trufflehog).

## Phase 3: RECOVER (1–24 hrs)
1. Rotate ALL cloud credentials (AWS keys, GCP service accounts, Azure SPs) that were accessible in the CI environment.
2. Re-enable OIDC with updated trust conditions (restrict to specific branch/repo).
3. Notify downstream consumers of affected npm packages.
4. File a CISA/npm security advisory if packages were publicly compromised.
5. Enable npm audit + ignore-scripts policy org-wide.

## Phase 4: LESSONS LEARNED
- Were lifecycle scripts blocked? If not, enforce NPM-02 policy.
- Were OIDC conditions repo/branch-scoped? If not, enforce AWS-02 policy.
- Was secret scanning enabled? If not, enable GH-02 policy.
