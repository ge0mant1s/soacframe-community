# Validation & Testing

- Run hunts in `artifacts/hunting/kql/` and `artifacts/hunting/macos/` across a known-good baseline.
- Use purple-team simulations (safe) to generate benign equivalents:
  - Create/remove SSH keys on a test host
  - Create a GRE tunnel in a lab
  - Simulate legacy auth sign-in attempts
  - **macOS:** Create a test LaunchAgent, attempt to disable Gatekeeper in a VM

Capture detection hit rate and false positives.
