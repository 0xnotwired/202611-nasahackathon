# Restore original samples and rebuild local IndexedDB

GitHub includes source code, tests and metadata manifests. It deliberately
excludes original CSV/XLS/ZIP/PDF files and browser/IndexedDB state. Rebuild
local data instead of copying a browser profile across machines.

## Five originals required for the existing import workflow

From a working branch based on main, this standard-library Python recipe downloads only
the five files required by scripts/import-real-samples.py, verifies their
recorded SHA256 and preserves source bytes. Do not disable TLS verification.

```bash
python3 - <<'PY'
from pathlib import Path
import hashlib, json, urllib.request
root = Path.cwd().resolve()
required = {
    'data/originals/CRF-daily-vitals.csv',
    'data/originals/MR079G-muscle-function.csv',
    'data/originals/additional/MR035G-sample-1.csv',
    'data/originals/additional/MR080G-sample-1.csv',
    'data/originals/but-cgm-1.0.0/101001_CGM.csv',
}
receipts = {}
def visit(value):
    if isinstance(value, dict):
        if value.get('file') in required and 'url' in value and 'sha256' in value:
            receipts[value['file']] = value
        for child in value.values(): visit(child)
    elif isinstance(value, list):
        for child in value: visit(child)
for name in ['acquisition-2026-11-15.json', 'additional-acquisition-2026-11-15.json']:
    visit(json.loads((root / 'docs/data' / name).read_text()))
if set(receipts) != required:
    raise RuntimeError('Required source receipts are incomplete')
for name in sorted(required):
    receipt = receipts[name]
    target = (root / name).resolve()
    if not target.is_relative_to(root / 'data/originals'):
        raise RuntimeError('Source target escapes original-data directory')
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        if hashlib.sha256(target.read_bytes()).hexdigest() != receipt['sha256']:
            raise RuntimeError('Existing source differs; preserve and investigate: ' + name)
        print('Already verified:', name)
        continue
    with urllib.request.urlopen(receipt['url'], timeout=60) as response:
        content = response.read(5 * 1024 * 1024 + 1)
    if len(content) > 5 * 1024 * 1024:
        raise RuntimeError('Unexpected sample size: ' + name)
    if hashlib.sha256(content).hexdigest() != receipt['sha256']:
        raise RuntimeError('Publisher response differs from acquired sample: ' + name)
    target.write_bytes(content)
    print('Downloaded and verified:', name)
PY
```

This does not authenticate a replacement source just because HTTP200 was
returned; the acquired receipt's exact bytes must match. If access fails,
report the actual host/redirect/network policy; do not repeatedly redownload,
replace the expected hash, or claim success on an HTML error page.

## Generate and check the local profile

In a compatible Linux development environment with the existing Chromium and
Python Playwright tooling available:

```bash
python3 scripts/import-real-samples.py
```

Expected:3861 source records, zero rejected rows, exact readback after browser
restart. A second run should insert0 and retain3861, assuming no additional
records were deliberately added. Output contains counts/hashes, not raw rows.

The script creates ignored data/local-import-profile/ and data/imported/.
The database is orbita-real-samples, scoped to the script's saved loopback
origin/port. It is not the shared browser or an implemented product import UI.
If that port is busy, investigate without deleting unrelated data or killing
another process. Never copy LevelDB files from a live browser profile.

## Browser executable

The script reads the environment variable `ORBITA_CHROMIUM` and defaults to
`/usr/bin/chromium` when it is unset or empty. Both browser launches (import
and restart readback) use that one path. Before any source or database work the
script resolves it (following symlinks) and fails with a named error if the
target is missing, is not a regular file or is not executable. It never searches
for another browser and does not create symlinks.

Check the real path on your machine instead of assuming it. On the runtime
verified on November 15, 2026, `/opt/pw-browsers/chromium` was a symlink to the
executable, not a directory:

```bash
readlink -f /opt/pw-browsers/chromium
# /opt/pw-browsers/chromium-1243/chrome-linux64/chrome
ORBITA_CHROMIUM="$(readlink -f /opt/pw-browsers/chromium)" python3 scripts/import-real-samples.py
```

Python Playwright must be importable by the `python3` that runs the script. If
it is not installed, a virtual environment outside the repository works
without touching the system Python; use the Playwright version of the Node
installation if one exists, then run the script with that environment's
`python3` (or set `PYTHONPATH` to its `site-packages`). The product itself needs
none of this. Playwright and Chromium are development tools only.

On another OS or with missing tools, first inspect the runtime instructions and
report what is available. Observed on November 15, 2026 with
`ORBITA_CHROMIUM` set to the Chrome for Testing 153.0.8010.12 executable above:
a first run on an empty profile inserted3861, restart readback was exact, and
a second run inserted0 and retained3861. That is one runtime, not a claim
about other browsers or platforms.
The Node suite and synthetic scenario do not require these original samples.

## Optional genomic originals

All three raw archive URLs, sizes and SHA256 are in
[data/genetic-archive-downloads-2026-11-15.json](data/genetic-archive-downloads-2026-11-15.json).
Together they are roughly451MB; download explicitly when needed, retain ZIPs
under their recorded data/originals/osdr/genetics/ paths and verify sizes,
SHA256 and ZIP CRC. Metadata/assay sources are recorded in
[data/osdr-published-followup-2026-11-15.json](data/osdr-published-followup-2026-11-15.json).
Current M21 does not import genomic arrays into the health-record store.

All source licenses/citations remain applicable. Do not git-add ignored
originals or browser state merely to make another machine look restored.
