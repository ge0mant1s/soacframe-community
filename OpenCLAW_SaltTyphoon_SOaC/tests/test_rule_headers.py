#!/usr/bin/env python3
from pathlib import Path
rules_dir = Path(__file__).resolve().parents[1] / 'detection-rules' / 'sentinel-kql'
missing=[]
for p in rules_dir.glob('*.kql'):
    txt=p.read_text(errors='ignore')
    if 'MITRE:' not in txt:
        missing.append(p.name)
if missing:
    raise SystemExit('Missing MITRE tags: '+', '.join(missing))
print('PASS')
