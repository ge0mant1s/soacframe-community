# OpenCLAW Playbook: Crimson Collective Cloud Intrusion Response
## Phase 1: CONTAIN
1. **Revoke IAM Sessions**: Immediately invalidate all active sessions for the compromised IAM user/role.
2. **Rotate GitLab Tokens**: Revoke and rotate Personal Access Tokens (PATs) and CI/CD runner tokens.
3. **Block IPs**: Block the attacker's source IP at the AWS WAF or VPC Security Group level.

## Phase 2: ERADICATE
1. **Audit S3/RDS**: Check for any unauthorized snapshots or public access changes.
2. **Revert GitLab Workflows**: Audit `.gitlab-ci.yml` files for unauthorized changes and revert to known-good state.
3. **Delete Malicious IAM**: Remove any newly created IAM users, keys, or policy versions.

## Phase 3: RECOVER
1. **Enforce MFA**: Ensure MFA is mandatory for all cloud console and CLI access.
2. **Apply SCPs**: Deploy Service Control Policies to restrict high-risk actions (e.g., disabling CloudTrail).
