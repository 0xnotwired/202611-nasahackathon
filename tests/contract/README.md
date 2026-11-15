# Foundation contract checks

Run from the repository root, without installing packages:

```sh
node --test
python3 scripts/check_docs.py
node tests/contract/run.mjs core --reference
```

The normal test run verifies the foundation: every checker rejects its
placeholder on an assertion, the test-only core reference passes, field names
match the authoritative Markdown, and the HTTP server confines requests.
A green run does **not** mean future product modules work.

To see the raw contract failures, run:

```sh
node tests/contract/run.mjs all
node tests/contract/run.mjs core
```

Both intentionally exit 1 while the selected modules remain placeholders.
The direct runner catches each interface failure separately and prints it;
import errors and assertion failures are not interchangeable evidence.

Every checker exports a `check<Name>(implementation, dependencies)` function.
Future builders import that checker and pass their implementation in their
own `*.test.js` file. A builder replacing a placeholder must also retire that
interface's placeholder entry in `registry.js` through the orchestrator;
the permanent foundation meta-test intentionally rejects implemented modules.
The checker files are the reusable API; `registry.js` describes M00's initial
placeholder state, not a permanent list of unimplemented modules.

Domain checkers accept `{store}` with an `openStore` method. The storage
collaborator under `fakes/` is an isolated fixture, not a production store or
proof of M04. The core reference also stays under tests: never import a fake
into app/.

`checkImporters` additionally needs verified fixtures with `method`, `text`,
`options`, and an exact expected Result. The source file formats were not
available for M00: no fabricated CSV schema is included. `checkView` requires
services, parameters, actions, and a real browser `element` to exercise mount.
The base UI signatures/return shapes left unspecified by CONTRACTS.md are
not invented by this foundation. Add behavioral cases when those contracts
are defined; existence of a placeholder rejection does not validate the
untested branches of a future implementation.

See [the experiment record](../../docs/experiments/M00.md) for predictions,
negative controls, browser evidence, and limitations.
