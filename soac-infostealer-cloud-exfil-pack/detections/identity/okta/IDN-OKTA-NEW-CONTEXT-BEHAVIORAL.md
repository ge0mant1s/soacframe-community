# Detection: Okta - New Context Sign-In (Behavioral)
# Platform: Splunk / Elastic / Falcon NGSIEM
# Language: Logic specification (adapt to your SIEM query language)
# Precision: Behavioral baseline (14d lookback)

## Logic Specification

### Baseline Construction (14-day lookback, excluding last 1 hour)
- Source: Okta System Log (`eventType: user.session.start`, `outcome.result: SUCCESS`)
- Group by: `actor.alternateId` (user email)
- Collect:
  - `client.ipAddress` → set of known IPs
  - `client.device` → set of known device fingerprints
  - `client.geographicalContext.country` → set of known countries
- Filter: Users with >= 3 historical successful sign-ins

### Detection (last 1 hour)
- Source: Okta System Log (`eventType: user.session.start`, `outcome.result: SUCCESS`)
- For each event:
  - Check if `client.ipAddress` NOT IN baseline known IPs
  - AND (`client.device` NOT IN baseline devices OR `client.geographicalContext.country` NOT IN baseline countries)
- If match:
  - Tag: `Severity=HIGH`, `DetectionName=IDN-OKTA-NEW-CONTEXT-BEHAVIORAL`
  - Capture: `actor.alternateId`, `client.ipAddress`, `client.device`, `client.geographicalContext`, `target.displayName` (app)

### Splunk SPL Example
```spl
index=okta eventType="user.session.start" outcome.result="SUCCESS"
| eval context=client.ipAddress."|".client.device."|".client.geographicalContext.country
| eventstats dc(context) as baseline_contexts by actor.alternateId
| where baseline_contexts=1 OR (context NOT IN [baseline from last 14d])
| table _time, actor.alternateId, client.ipAddress, client.device, client.geographicalContext.country, target.displayName
```

### Elastic EQL Example
```eql
sequence by user.email with maxspan=1h
  [authentication where event.outcome == "success" and 
   not (source.ip in user_baseline.known_ips and 
        source.geo.country_name in user_baseline.known_countries)]
```
