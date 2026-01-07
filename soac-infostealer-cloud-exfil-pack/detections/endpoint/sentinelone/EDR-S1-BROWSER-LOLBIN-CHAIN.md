# Detection: SentinelOne - Browser Spawns Suspicious Child Process
# Platform: SentinelOne / Splunk / Elastic
# Language: Logic specification
# Precision: High-confidence LOLBin chains from browser

## Logic Specification

### Detection Logic (last 1 hour)
- Source: SentinelOne Deep Visibility events (`event.type: "process"`)
- Filter:
  - `process.parent.name` IN ["chrome.exe", "msedge.exe", "firefox.exe", "brave.exe"]
  - `process.name` IN ["powershell.exe", "cmd.exe", "wscript.exe", "cscript.exe", "rundll32.exe", "mshta.exe", "regsvr32.exe"]
  - `process.cmdline` contains suspicious patterns (encoded commands, download utilities, registry modifications)
- Tag: `Severity=HIGH`, `DetectionName=EDR-S1-BROWSER-LOLBIN-CHAIN`

### Splunk SPL Example (SentinelOne Data)
```spl
index=sentinelone event.type="process"
| where match(process.parent.name, "(?i)(chrome|msedge|firefox)")
| where match(process.name, "(?i)(powershell|cmd|wscript|rundll32)")
| where match(process.cmdline, "(?i)(-enc|FromBase64|iwr|Invoke-|bitsadmin|schtasks)")
| table _time, endpoint.name, user.name, process.parent.name, process.name, process.cmdline, process.sha256
```
