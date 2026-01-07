# Deployment Guide
## SOaC Infostealer → Cloud Portal Exfiltration Detection Pack

### Prerequisites
- [ ] 14 days of historical log data for baseline construction
- [ ] SIEM with query/correlation capabilities
- [ ] Identity provider API access (for session revocation)
- [ ] Endpoint EDR with isolation capabilities
- [ ] SOAR platform (optional but recommended)

### Deployment Steps

#### Phase 1: Baseline Construction (Week 1)
1. **Validate data sources**
   - Confirm identity logs flowing to SIEM (Entra/Okta/Google)
   - Confirm SaaS audit logs flowing (M365/GDrive/Box/AWS)
   - Confirm endpoint telemetry flowing (MDE/CS/S1)

2. **Build baselines**
   - Run baseline queries for 14 days
   - Validate statistical distributions (mean, stddev)
   - Identify low-activity users (< 3 events in 14d)

#### Phase 2: Detection Deployment (Week 2)
1. **Deploy identity detections**
   - Start with "alert only" mode (no auto-response)
   - Monitor for false positives
   - Tune thresholds if needed

2. **Deploy SaaS detections**
   - Start with "alert only" mode
   - Validate behavioral thresholds
   - Adjust minimum floor if needed

3. **Deploy correlation rules**
   - Enable HIGH severity alerts
   - Route to SOC queue

#### Phase 3: Automation (Week 3)
1. **Deploy playbook (manual trigger)**
   - Test session revocation
   - Test endpoint isolation
   - Test external share removal

2. **Enable auto-response (staged)**
   - Week 3: Auto-revoke sessions only
   - Week 4: Add endpoint isolation
   - Week 5: Full automation

#### Phase 4: Continuous Improvement
1. **Monitor metrics**
   - Time to detection
   - Time to containment
   - False positive rate
   - Coverage gaps

2. **Iterate**
   - Add new data sources
   - Refine thresholds
   - Expand playbook actions

### Environment-Specific Guides

#### Microsoft Sentinel + Entra ID + M365
```bash
# 1. Deploy analytics rules
az sentinel alert-rule create \
  --resource-group SOC \
  --workspace-name SentinelWorkspace \
  --rule-file detections/correlation/sentinel/CORR-SENTINEL-INFOSTEALER-EXFIL.kql

# 2. Deploy Logic App playbook
az logic workflow create \
  --resource-group SOC \
  --name InfostealerContainment \
  --definition playbooks/PB-INFOSTEALER-CONTAIN-BEHAVIORAL.yaml

# 3. Grant permissions
az role assignment create \
  --assignee <logic-app-identity> \
  --role "Microsoft Sentinel Responder" \
  --scope /subscriptions/{sub}/resourceGroups/SOC
```

#### CrowdStrike Falcon NGSIEM + Okta + AWS
```bash
# 1. Import correlation rule
falcon-ngsiem import-rule \
  detections/correlation/falcon_ngsiem/CORR-FALCON-INFOSTEALER-EXFIL.sql

# 2. Configure Okta API integration
# (Manual: Falcon NGSIEM UI → Integrations → Okta)

# 3. Configure AWS CloudTrail ingestion
# (Manual: Falcon NGSIEM UI → Data Sources → AWS)
```

#### Splunk + Okta + M365
```bash
# 1. Deploy correlation search
splunk add saved-search \
  -name "Infostealer Exfil Correlation" \
  -search "$(cat detections/correlation/splunk/CORR-SPLUNK-INFOSTEALER-EXFIL.spl)" \
  -cron_schedule "*/5 * * * *"

# 2. Configure Okta Add-on
# (Manual: Splunk UI → Apps → Okta Add-on for Splunk)

# 3. Configure O365 Add-on
# (Manual: Splunk UI → Apps → Microsoft Office 365 Add-on)
```

### Validation Checklist
- [ ] Identity baseline established (14d data)
- [ ] SaaS baseline established (14d data)
- [ ] Test scenario passes (TEST-001)
- [ ] Session revocation tested
- [ ] Endpoint isolation tested
- [ ] Playbook SLA met (< 10 min session revocation)
- [ ] Metrics dashboard deployed
- [ ] SOC team trained
