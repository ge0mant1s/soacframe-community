# Deployment Guide - OpenCLAW RansomHub SOaC Package

## Prerequisites

### Required Access & Licenses
- **Azure/M365 Tenant**: Global Administrator or Security Administrator role
- **Sentinel**: Contributor role on Log Analytics workspace
- **Entra ID**: P2 license (for Conditional Access and Identity Protection)
- **CrowdStrike or Defender**: Administrator access

### Required Tools
- Azure CLI (`az`) or PowerShell (`Az` module)
- KQL query editor (Sentinel Portal or Azure Data Explorer)
- Git (for version control)

---

## Step 1: Deploy Detection Rules to Sentinel

### Option A: Azure Portal (Manual)
1. Navigate to **Sentinel > Analytics > Create > Scheduled query rule**
2. Open each `.kql` file in `detection-rules/sentinel-kql/`
3. Copy the KQL query into the rule editor
4. Configure:
   - **Rule name**: Use filename (e.g., "RansomHub Initial Access - Public Facing App Exploitation")
   - **Severity**: High or Critical (as noted in KQL comments)
   - **Frequency**: 5 minutes
   - **Query period**: 15 minutes
5. Configure entity mapping (IP, Account, Host)
6. Save and enable

### Option B: PowerShell Automation
```powershell
# Connect to Azure
Connect-AzAccount
Set-AzContext -Subscription "<your-subscription-id>"

# Deploy all rules
$workspaceId = "<sentinel-workspace-id>"
$resourceGroup = "<resource-group-name>"

Get-ChildItem "./detection-rules/sentinel-kql/*.kql" | ForEach-Object {
    $ruleName = $_.BaseName
    $query = Get-Content $_.FullName -Raw

    New-AzSentinelAlertRule -ResourceGroupName $resourceGroup `
        -WorkspaceName $workspaceId `
        -RuleName $ruleName `
        -Query $query `
        -Severity "High" `
        -Frequency "PT5M" `
        -QueryPeriod "PT15M" `
        -Enabled $true
}
```

---

## Step 2: Deploy SOAR Playbooks (Logic Apps)

### Prerequisites
- Sentinel workspace with Logic Apps integration
- Service Principal with permissions to:
  - CrowdStrike API (if using Falcon)
  - Microsoft Graph API (for Entra ID actions)
  - Defender API (if using Defender for Endpoint)

### Deployment Steps
1. Navigate to **Sentinel > Automation > Create > Playbook**
2. Import each playbook JSON from `playbooks/soar/`
3. Configure connections:
   - **CrowdStrike Connector**: API Client ID + Secret
   - **Microsoft Graph**: Managed Identity or Service Principal
   - **Teams**: Webhook URL or Microsoft Teams connector
4. Link playbooks to analytics rules:
   - Go to **Analytics > [Rule] > Automated response**
   - Add playbook trigger

### Test Playbooks
```powershell
# Test incident creation
Invoke-AzLogicApp -ResourceGroupName $resourceGroup `
    -Name "RansomHub-Initial-Access-Response" `
    -TriggerName "When_a_Sentinel_alert_is_created"
```

---

## Step 3: Apply Conditional Access Policies

### Prerequisites
- Entra ID P2 license
- Identify break-glass account (exclude from all policies)

### Deployment
```powershell
# Connect to Microsoft Graph
Connect-MgGraph -Scopes "Policy.ReadWrite.ConditionalAccess"

# Deploy policies
Get-ChildItem "./policies/entra-conditional-access/*.json" | ForEach-Object {
    $policy = Get-Content $_.FullName | ConvertFrom-Json
    New-MgIdentityConditionalAccessPolicy -BodyParameter $policy
}
```

### Validation
1. Test each policy in **Report-only mode** for 7 days
2. Review sign-in logs for blocked legitimate users
3. Switch to **Enabled** after validation

---

## Step 4: Configure EDR Policies

### CrowdStrike Falcon
1. Navigate to **Configuration > Prevention Policies**
2. Import `edr_hardening_config.json` settings:
   - Create new policy: "RansomHub Defense - Critical"
   - Enable all behavioral IOAs for LSASS, drivers, ransomware
   - Apply to critical server groups first
3. Test in **Detect-only** mode for 48 hours

### Microsoft Defender for Endpoint
1. Navigate to **Settings > Endpoints > Attack Surface Reduction**
2. Apply ASR rules from `edr_hardening_config.json`
3. Enable **Controlled Folder Access** for critical servers

---

## Step 5: Schedule Threat Hunting

### Create Saved Searches
```powershell
# In Sentinel, create saved searches for each hunt query
Get-ChildItem "./threat-hunting/*.kql" | ForEach-Object {
    $huntName = $_.BaseName
    $query = Get-Content $_.FullName -Raw

    # Create as saved search
    New-AzOperationalInsightsSavedSearch -ResourceGroupName $resourceGroup `
        -WorkspaceName $workspaceId `
        -SavedSearchId $huntName `
        -DisplayName $huntName `
        -Query $query
}
```

### Schedule Weekly Hunts
- Run each hunt query Monday mornings
- Export results to dedicated Teams channel
- Triage findings with SOC Tier 2

---

## Step 6: Validation & Testing

### Tabletop Exercise
1. Simulate RansomHub kill chain phases
2. Verify alerts fire correctly
3. Test playbook responses

### Purple Team Exercise
```bash
# Simulate ADFind execution (safe test)
# WARNING: Only run in isolated test environment
adfind.exe -f "(objectcategory=person)" > ad_dump.txt
```

Expected result:
- Alert: "RansomHub Discovery - Active Directory Enumeration"
- Playbook: Create incident + isolate host

---

## Step 7: Monitor & Tune

### Week 1-2: Tuning Phase
- Review false positives daily
- Adjust thresholds (e.g., port scan counts, byte transfer limits)
- Document exclusions (minimize to prevent abuse)

### Ongoing Monitoring
- Weekly SOC review of RansomHub-tagged incidents
- Monthly update detection rules based on new IOCs
- Quarterly purple team exercises

---

## Rollback Plan

If deployment causes issues:
```powershell
# Disable all rules
Get-AzSentinelAlertRule -ResourceGroupName $rg -WorkspaceName $ws `
    | Where-Object {$_.DisplayName -like "*RansomHub*"} `
    | Update-AzSentinelAlertRule -Enabled $false

# Set CA policies to report-only
Get-MgIdentityConditionalAccessPolicy | Where-Object {$_.DisplayName -like "*RansomHub*"} `
    | Update-MgIdentityConditionalAccessPolicy -State "enabledForReportingButNotEnforced"
```

---

## Support

- Issues: [GitHub Issues](https://github.com/your-org/openclaw-ransomhub/issues)
- Community: LinkedIn #OpenCLAW
- Updates: Watch this repo for new threat intel

---

**Last Updated**: 2026-02-17
