# Detection: CrowdStrike - Browser Spawns Suspicious Child Process
# Platform: CrowdStrike Falcon / Splunk / Falcon NGSIEM
# Language: Logic specification
# Precision: High-confidence LOLBin chains from browser

## Logic Specification

### Detection Logic (last 1 hour)
- Source: CrowdStrike ProcessRollup2 events
- Filter:
  - `ParentBaseFileName` IN ["chrome.exe", "msedge.exe", "firefox.exe", "brave.exe"]
  - `FileName` IN ["powershell.exe", "cmd.exe", "wscript.exe", "cscript.exe", "rundll32.exe", "mshta.exe", "regsvr32.exe", "reg.exe", "bitsadmin.exe", "certutil.exe"]
  - `CommandLine` contains any of:
    - "-enc", "-e ", "-w hidden", "FromBase64String", "iwr ", "curl "
    - "Invoke-WebRequest", "Invoke-Expression", "DownloadString"
    - "bitsadmin", "schtasks", "/create", "reg add"
- Tag: `Severity=HIGH`, `DetectionName=EDR-CS-BROWSER-LOLBIN-CHAIN`

### Splunk SPL Example (CrowdStrike Falcon Data Replicator)
```spl
index=crowdstrike event_simpleName=ProcessRollup2
| where ParentBaseFileName IN ("chrome.exe", "msedge.exe", "firefox.exe")
| where FileName IN ("powershell.exe", "cmd.exe", "wscript.exe", "rundll32.exe")
| where match(CommandLine, "(?i)(-enc|FromBase64String|iwr |Invoke-WebRequest|bitsadmin)")
| table _time, ComputerName, UserName, ParentBaseFileName, FileName, CommandLine, SHA256HashData
```

### Falcon NGSIEM Query Example
```sql
SELECT 
    timestamp, aid, ComputerName, UserName,
    ParentBaseFileName, FileName, CommandLine, SHA256HashData
FROM ProcessRollup2
WHERE ParentBaseFileName IN ('chrome.exe', 'msedge.exe', 'firefox.exe')
AND FileName IN ('powershell.exe', 'cmd.exe', 'wscript.exe', 'rundll32.exe')
AND (CommandLine LIKE '%FromBase64String%' OR CommandLine LIKE '%iwr %' OR CommandLine LIKE '%bitsadmin%')
AND timestamp > now() - INTERVAL 1 HOUR
```
