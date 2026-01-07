# Detection: Google Workspace - New Context Sign-In (Behavioral)
# Platform: Chronicle / Splunk / Elastic
# Language: Logic specification
# Precision: Behavioral baseline (14d lookback)

## Logic Specification

### Baseline Construction (14-day lookback, excluding last 1 hour)
- Source: Google Workspace Admin Logs (`login` events, `login_success`)
- Group by: `actor.email`
- Collect:
  - `ipAddress` → set of known IPs
  - `events.parameters.device_id` → set of known devices
  - `events.parameters.login_challenge_method` → set of known auth methods
- Filter: Users with >= 3 historical successful logins

### Detection (last 1 hour)
- Source: Google Workspace Admin Logs (`login` events, `login_success`)
- For each event:
  - Check if `ipAddress` NOT IN baseline known IPs
  - AND `events.parameters.device_id` NOT IN baseline devices
- If match:
  - Tag: `Severity=HIGH`, `DetectionName=IDN-GOOGLE-NEW-CONTEXT-BEHAVIORAL`
  - Capture: `actor.email`, `ipAddress`, `events.parameters.device_id`, `events.parameters.login_challenge_method`

### Chronicle YARA-L Example
```yara-l
rule google_new_context_signin {
  meta:
    author = "SOaC Framework"
    severity = "HIGH"
  events:
    $login.metadata.event_type = "USER_LOGIN"
    $login.security_result.action = "ALLOW"
    $login.principal.user.userid = $user
    $login.principal.ip = $ip
    not $ip in %baseline_ips
  condition:
    $login
}
```
