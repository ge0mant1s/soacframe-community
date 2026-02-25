# OpenCLAW Playbook: Cloud Control Plane & IAM Abuse (AWS + Azure)

## Trigger Conditions
- CloudTrail telemetry disruption (StopLogging/DeleteTrail/PutEventSelectors)
- IAM escalation primitives (CreateAccessKey/AttachRolePolicy/UpdateAssumeRolePolicy)
- Azure RBAC role assignment changes

## Phase 1: Immediate Containment (Minutes 0-15)
1. **Freeze identity**: disable suspected user, revoke Entra sessions, rotate credentials.
2. **AWS**: disable/rotate access keys; apply emergency SCP to block IAM & CloudTrail changes; restrict AssumeRole.
3. **Azure**: remove recent role assignments; enable PIM emergency controls; block sign-in for user.

## Phase 2: Telemetry Integrity
1. Validate CloudTrail trails are enabled and log delivery is intact.
2. Validate Azure diagnostic settings + activity logs continue to flow.

## Phase 3: Eradication + Recovery
1. Remove backdoored roles/policies; revert trust relationships.
2. Review OAuth consent / app registrations in Entra.
3. Post-incident: implement phishing-resistant MFA + least privilege + breakglass process.
