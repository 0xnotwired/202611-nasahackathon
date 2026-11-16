# Órbita shared contract

This folder belongs to both owners. It is the only agreement on structures
between frontend and backend; it contains no components, simulation or persistence.

- `models.ts`: transport types without framework dependencies. The backend
  can check types without installing the frontend dependencies.
- `schemas.ts`: Zod validators, compatible with those types, used by the frontend
  client and the integration tests.
- `openapi.ts`: route description and schema export.
- `openapi.json`: versioned OpenAPI 3.1 specification, served by the backend.
- `fixtures/`: examples of valid responses; they are not the API's storage.
- `tests/`: compatibility of responses, examples and specification.

## Change the contract

1. Agree with the other person on the fields or routes that will change.
2. Update the relevant types, validators, route description and examples.
3. From the root run:

```bash
npm ci
npm run contracts:export
npm run test:contracts
```

4. Include the code that produces and consumes the change in a coordinated integration.

You do not need to touch these files to change colors, screens, simulation
algorithms or internal implementations. Avoid incompatible changes in
version 0.2; if they are necessary, agree on their versioning and migration.

Relationships between fields (for example, that each record belongs to the
requested astronaut) are also checked in integration. OpenAPI describes
structure and routes; it does not certify clinical validity or comparability of results.
