# Órbita Backend

- This project uses Node.js/TypeScript, not Next.js. The Next.js-specific rules
  in the root AGENTS apply to the frontend.
- This folder belongs to the backend work: code, simulation data,
  dependencies, configuration and its own tests.
- Do not import or edit `../src/`, `../public/`, the frontend mocks or its lockfile
  to implement backend logic.
- The shared interface is in `../contracts/`. Do not change fields or routes
  unilaterally: agree on the change with the frontend person first.
- The initial extension point is `src/data/provider.ts`; do not add layers,
  infrastructure or frameworks before they are needed.
- Use only fictional data; do not add clinical interpretation or prescriptions.
- Verify with `npm run check` from this folder. Contract changes also
  require `npm run test:contracts` from the root, with root dependencies installed.
- Install dependencies here (`npm install ...`), never in the root package.json.
