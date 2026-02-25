# Simulations (Safe Testing)

## AWS
1. In a test account, attempt `StopLogging` on a non-production trail (should alert and/or be denied by guardrail policy in enforce mode).
2. Create a test IAM user and run `CreateAccessKey` (should alert).
3. Modify a test role trust policy (UpdateAssumeRolePolicy) (should alert).

## Azure
1. In a test subscription, create a role assignment for a test principal (should alert).
2. Simulate a risky sign-in (use identity protection test methods where available) then perform RBAC change to validate correlation rule.

## macOS
1. Validate logging forwarders are sending auth/process events to Wazuh/SIEM.
