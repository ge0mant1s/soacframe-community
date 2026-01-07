# Detection: Google Drive - Behavioral Anomaly in Downloads/Shares
# Platform: Chronicle / Splunk / Elastic
# Language: Logic specification
# Precision: Behavioral (mean + 3σ)

## Logic Specification

### Baseline Construction (14-day lookback, excluding last 1 hour)
- Source: Google Workspace Drive Logs (`doc_type: "document"`, events: `download`, `change_user_access`, `share`)
- Group by: `actor.email`
- Calculate per user:
  - Daily event count
  - Mean (μ) and Standard Deviation (σ) of daily counts
  - Threshold = μ + 3σ

### Detection (last 1 hour)
- Source: Google Workspace Drive Logs (same events)
- Count events per `actor.email` in last 1 hour
- Compare to baseline threshold
- If current count > threshold AND >= 20:
  - Tag: `Severity=HIGH`, `DetectionName=SAAS-GDRIVE-BEHAVIORAL-EXFIL`
  - Capture: `actor.email`, `current_count`, `baseline_mean`, `baseline_stddev`, `deviation_factor`

### Splunk SPL Example
```spl
index=google_workspace doc_type="document" (event_name="download" OR event_name="change_user_access" OR event_name="share")
| bin _time span=1d
| stats count as daily_ops by actor.email, _time
| eventstats avg(daily_ops) as avg_ops, stdev(daily_ops) as stddev_ops by actor.email
| eval threshold = avg_ops + (3 * stddev_ops)
| where daily_ops > threshold AND daily_ops >= 20
| table actor.email, daily_ops, avg_ops, stddev_ops, threshold
```
