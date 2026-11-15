# Órbita threat model — M00

Written before implementation, 2026-11-15. Evidence labels follow [METHOD.md](METHOD.md).

## Assets, actors and scope

SOURCE: D7, D9 and contracts 0.4 define a single user on their own device, without accounts. Health and mood self-reports will be stored unencrypted in the browser. Session unlock is a usability/privacy boundary, not encryption or authentication against another local process. Use fictional data during development.

ASSUMED: The user controls their OS and browser; browser extensions, other local users, disk access, backups, malware and developer tools can read or alter browser data. Confidentiality, tamper resistance, clinical correctness and availability against those actors are not promised.

ASSUMED: An attacker can control HTTP request paths, encodings and methods, imported files (BUT CGM, NLSP, OSDR), procedure content and other displayed text. Local files under the checkout are trusted developer-controlled content, but accidental symlinks must not expose files outside app/. Concurrent privileged mutation of files/symlinks is outside the server threat model.

## Trust boundaries and authority

SOURCE: CONTRACTS.md wins over JSDoc and tests. Every persisted object requires schema_version; unknown versions must fail closed in the future store. Domain time and ids are injected. Missing data never becomes zero or confirmed_none, and provenance and subject remain attached.

ASSUMED: Each importer must validate untrusted rows at its boundary, reject malformed/non-finite values, exclude clinical comments, and keep subjects and cohorts separate. Views must render untrusted strings as text, not executable HTML. These are future-module obligations, not implemented protections in M00.

SOURCE: Nothing leaves the device without an explicit user action logged as Shared. D9 sync is simulated inside the application; it is not a transport or remote service. No account, remote API, analytics or external content is needed by the M00 shell. Actual transmission would reopen this model.

## Local development server design

ASSUMED: Bind only 127.0.0.1; support GET and HEAD; serve regular files only inside app/. Decode the request path once, reject malformed encoding, dot segments, backslashes and null bytes, and check real filesystem containment with complete path segments. Reject directories instead of listing them. Refuse non-loopback Host headers to reduce DNS rebinding exposure. Keep error bodies generic and do not expose paths or request content. Unknown media types download as octet-stream, with nosniff.

ASSUMED: A server exposing the whole repository would put documents and future local inputs in the HTTP trust boundary. A platform-only server restricted to app/ is chosen instead. This choice is falsified if traversal or symlink probes retrieve an outside canary. Tests will check confinement on an isolated temporary fixture; they do not prove race resistance or comprehensive OS security.

## M00 limitations and reopening conditions

SOURCE: The reference core fake is test-only, never product code. Placeholders return not_implemented and provide no data storage, clinical content, authorization or sharing capability. JSDoc is documentation, not runtime enforcement.

ASSUMED: No protection against local disk readers, malicious extensions, OS compromise, XSS in future views, browser storage eviction, denial of service, or clinical misuse is claimed. Loopback HTTP is not encrypted. A real backend, actual personal health data, multi-user use, third-party libraries or remote transport requires revisiting this threat model.

## Verification evidence

ASSUMED: All server defenses above are design predictions until the experiment record records their observed checks. See [M00 record](experiments/M00.md) for executed checks and remaining limits.

## F1 implementation evidence — November 15, 2026

RUN: Core accepts only bounded plain data, preserves state/origin and rejects
invalid UTC/calendar/non-finite values. Store invokes core for records,
checks schema versions, forbids record/shared updates, isolates known
synthetic subjects from real provenance and commits batches atomically.
Input/output snapshots prevent caller aliasing. Memory storage is explicitly
nonpersistent; IndexedDB absence is an error, not an automatic fallback.

BROWSER: Actual Chromium IndexedDB passed the same portable store/integration
operations, browser restart, clean-profile isolation and future-version
read rejection. Private-context availability and explicit unavailable-state
propagation were tested. This is not proof of storage survival after private
context closure or browser eviction. Test notices are harness output; the
product UI warning is still M07 work.

READ: Persistent health/mood data is still unencrypted, no user authentication
or disk-confidentiality claim is added, and a privileged local actor can read
or alter browser storage. Real importers and their input sanitization remain
future work. Skills under .agents/ are user-authorized development material,
not imported into app/ or exposed by the app-only server. Evidence and
negative controls: [G1](experiments/G1.md) and M01–M05 records.
