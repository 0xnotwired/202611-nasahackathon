<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Órbita: alcance actual

- El bloque de Next.js anterior corresponde al frontend; trabajar solo en
  `backend/` no requiere instalar Next.js ni las dependencias raíz.
- Priorizar frontend con datos ficticios. El contrato y catálogo clínico son
  provisionales hasta recibir la validación médica.
- Organizar la funcionalidad en `src/features/health-monitoring`. Los componentes
  consumen `data/service.ts`; no deben importar fixtures ni URLs de API.
- Mantener los mocks reproducibles y distinguir `null`, cero y ausencia de registros.
- No añadir rangos, diagnósticos ni tratamientos inferidos a partir de las muestras.
- El frontend vive en `src/` y `public/`; el backend independiente en `backend/`.
  Cada lado tiene package.json, lockfile, configuración y comprobaciones propias.
- La API de lectura corre en Node.js/TypeScript en el puerto 4000; el frontend
  Next.js en el 3000. No implementar lógica del backend en `src/app/api/`.
- El contrato compartido vive en `contracts/`. Coordinar cambios entre ambos
  responsables y actualizar OpenAPI, ejemplos y pruebas de compatibilidad.
- No importar código de frontend desde backend ni a la inversa. El único enlace
  en ejecución es HTTP; los tipos de transporte compartidos no tienen framework.
- Ver la distribución de archivos y el flujo de ramas en `docs/team-workflow.md`.
- Usar `npm run check` y `npm run build` como validación. Añadir dependencias solo
  cuando resuelvan una necesidad presente.
