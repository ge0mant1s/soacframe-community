# Correlation Rule: Infostealer → Cloud Exfil (Behavioral Precision)
# Platform: CrowdStrike Falcon NGSIEM
# Language: SQL-like (adapt to Falcon NGSIEM syntax)
# Precision: Requires 2+ signals within 60 minutes

## Correlation Logic

### Signal 1: Identity Compromise (New Context)
```sql
WITH IdentityBaseline AS (
    SELECT user_principal, collect_set(concat(ip, '|', device_id)) as known_contexts
    FROM identity_signin_logs
    WHERE timestamp BETWEEN now() - INTERVAL 14 DAYS AND now() - INTERVAL 1 HOUR
    AND result = 'success'
    GROUP BY user_principal
),
IdentitySignal AS (
    SELECT timestamp, user_principal, ip, device_id, 
           concat(ip, '|', device_id) as current_context
    FROM identity_signin_logs
    WHERE timestamp > now() - INTERVAL 1 HOUR
    AND result = 'success'
)
SELECT i.timestamp, i.user_principal, i.ip, i.device_id
FROM IdentitySignal i
LEFT JOIN IdentityBaseline b ON i.user_principal = b.user_principal
WHERE i.current_context NOT IN (b.known_contexts)
```

### Signal 2: SaaS Behavioral Anomaly
```sql
WITH SaaSBaseline AS (
    SELECT user, AVG(daily_ops) as avg_ops, STDDEV(daily_ops) as stddev_ops
    FROM (
        SELECT user, date_trunc('day', timestamp) as day, COUNT(*) as daily_ops
        FROM saas_audit_logs
        WHERE timestamp BETWEEN now() - INTERVAL 14 DAYS AND now() - INTERVAL 1 HOUR
        AND action IN ('download', 'share', 'access')
        GROUP BY user, day
    )
    GROUP BY user
),
SaaSSignal AS (
    SELECT user, COUNT(*) as current_ops
    FROM saas_audit_logs
    WHERE timestamp > now() - INTERVAL 1 HOUR
    AND action IN ('download', 'share', 'access')
    GROUP BY user
)
SELECT s.user, s.current_ops, b.avg_ops, b.stddev_ops,
       (b.avg_ops + 3 * b.stddev_ops) as threshold
FROM SaaSSignal s
JOIN SaaSBaseline b ON s.user = b.user
WHERE s.current_ops > (b.avg_ops + 3 * b.stddev_ops)
AND s.current_ops >= 20
```

### Final Correlation
```sql
SELECT 
    i.timestamp as signin_time,
    i.user_principal,
    i.ip,
    i.device_id,
    s.current_ops,
    s.threshold,
    'HIGH' as severity,
    'Infostealer → Cloud Portal Exfiltration (Behavioral)' as incident_name
FROM IdentitySignal i
JOIN SaaSSignal s ON i.user_principal = s.user
WHERE s.timestamp BETWEEN i.timestamp AND i.timestamp + INTERVAL 60 MINUTES
```
