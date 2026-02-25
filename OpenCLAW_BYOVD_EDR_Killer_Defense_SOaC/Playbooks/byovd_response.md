# OpenCLAW Playbook: BYOVD & EDR-Killer Response
## Phase 1: IMMEDIATE CONTAINMENT
1. **Isolate Host**: If a known vulnerable driver is loaded, isolate the host immediately.
2. **Verify EDR Health**: Check the EDR console to see if the agent is still reporting. If "Offline" or "Tampered," assume compromise.
3. **Snapshot Memory**: If possible, take a memory snapshot before the system is rebooted or the driver is unloaded.

## Phase 2: ERADICATION
1. **Delete Driver File**: Locate and delete the .sys file from the staging directory.
2. **Unload Driver**: Use `sc stop` or `fltmc unload` if the driver is running as a service or filter.
3. **Audit Registry**: Check `HKLM\SYSTEM\CurrentControlSet\Services` for any new or suspicious driver services.

## Phase 3: HARDEN
1. **Enforce WDAC**: Deploy Windows Defender Application Control (WDAC) in "Enforce" mode for drivers.
2. **Enable HVCI**: Ensure Hypervisor-Protected Code Integrity (HVCI) is enabled to prevent unsigned/vulnerable driver loading.
