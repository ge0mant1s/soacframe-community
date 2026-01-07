# Detection: AWS - New Console Login + S3 GetObject Spike (Behavioral)
# Platform: Splunk / Elastic / Falcon NGSIEM
# Language: Logic specification
# Precision: Behavioral (mean + 3σ for S3 access)

## Logic Specification

### Part 1: New Console Login Detection
- Source: CloudTrail (`eventName: "ConsoleLogin"`, `responseElements.ConsoleLogin: "Success"`)
- Baseline (14d): Collect known source IPs and countries per `userIdentity.principalId`
- Detection (1h): Flag logins from new IP or new country

### Part 2: S3 GetObject Behavioral Spike
- Source: CloudTrail (`eventName: "GetObject"`)
- Baseline (14d): Calculate per-user daily mean and stddev of GetObject calls
- Detection (1h): Flag if current count > (mean + 3*stddev) AND >= 50

### Correlation
- If both signals occur for the same principal within 60 minutes:
  - Tag: `Severity=HIGH`, `DetectionName=CLOUD-AWS-CONSOLE-S3-EXFIL-BEHAVIORAL`

### Splunk SPL Example
```spl
index=aws_cloudtrail eventName="ConsoleLogin" responseElements.ConsoleLogin="Success"
| eval context=sourceIPAddress."|".userIdentity.principalId
| eventstats dc(context) as baseline_contexts by userIdentity.principalId
| where baseline_contexts=1
| join type=inner userIdentity.principalId [
    search index=aws_cloudtrail eventName="GetObject"
    | bin _time span=1d
    | stats count as daily_ops by userIdentity.principalId, _time
    | eventstats avg(daily_ops) as avg_ops, stdev(daily_ops) as stddev_ops by userIdentity.principalId
    | eval threshold = avg_ops + (3 * stddev_ops)
    | where daily_ops > threshold AND daily_ops >= 50
]
| table _time, userIdentity.principalId, sourceIPAddress, daily_ops, threshold
```
