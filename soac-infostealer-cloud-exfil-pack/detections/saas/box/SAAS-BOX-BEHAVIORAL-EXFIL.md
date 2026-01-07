# Detection: Box - Behavioral Anomaly in Downloads
# Platform: Splunk / Elastic / Falcon NGSIEM
# Language: Logic specification
# Precision: Behavioral (mean + 3σ)

## Logic Specification

### Baseline Construction (14-day lookback, excluding last 1 hour)
- Source: Box Enterprise Events API (`event_type: "DOWNLOAD"`, `event_type: "SHARE"`)
- Group by: `created_by.login` (user email)
- Calculate per user:
  - Daily event count
  - Mean (μ) and Standard Deviation (σ)
  - Threshold = μ + 3σ

### Detection (last 1 hour)
- Source: Box Enterprise Events (same event types)
- Count events per user in last 1 hour
- Compare to baseline threshold
- If current count > threshold AND >= 20:
  - Tag: `Severity=HIGH`, `DetectionName=SAAS-BOX-BEHAVIORAL-EXFIL`

### Splunk SPL Example
```spl
index=box event_type IN ("DOWNLOAD", "SHARE")
| bin _time span=1d
| stats count as daily_ops by created_by.login, _time
| eventstats avg(daily_ops) as avg_ops, stdev(daily_ops) as stddev_ops by created_by.login
| eval threshold = avg_ops + (3 * stddev_ops)
| where daily_ops > threshold AND daily_ops >= 20
| table created_by.login, daily_ops, avg_ops, stddev_ops, threshold
```
