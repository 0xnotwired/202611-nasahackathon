# Órbita — Tu salud, a bordo

Propuesta para NASA Space Apps 2026: una aplicación personal de salud para astronautas que integra salud, adaptación física y hábitat con procedimientos A bordo y seguimiento del cuidado.

El recorrido central conecta observación, medición, interpretación, acción y resultado. El copiloto acompaña tanto la rutina preventiva como la revisión de un cambio.

## Estado

Frontend Next.js con Resumen, Evolución física, Ejercicio y Seguimiento; diseño
adaptado de Research y datos simulados. Backend independiente Node.js/TypeScript
con API de lectura. Los registros de actividad y revisiones del usuario se guardan
en su navegador; no se envían al especialista.

El catálogo y los escenarios son provisionales, pendientes de validación médica.
No hay interpretación clínica, prescripción, sensores, IA ni persistencia de servidor.

## Dos áreas de desarrollo

| Área                | Carpeta           | Entorno                                                          |
| ------------------- | ----------------- | ---------------------------------------------------------------- |
| Frontend            | `src/`, `public/` | Next.js, puerto 3000; package.json/lockfile raíz                 |
| Backend             | `backend/`        | Node.js + TypeScript, puerto 4000; package.json/lockfile propios |
| Contrato compartido | `contracts/`      | Tipos, validadores, OpenAPI y ejemplos; cambios coordinados      |

No se usan npm workspaces, base de datos ni Docker. Requiere Node.js 22.18 o superior.

## Arrancar el frontend

```bash
nvm use  # si usás nvm
npm ci
npm run dev
```

Abrir http://localhost:3000. Por defecto usa mocks y no necesita el backend.

## Arrancar solo el backend

```bash
npm --prefix backend ci
npm --prefix backend run dev
```

Comprobar http://127.0.0.1:4000/api/v1/health. No necesita instalar el frontend.
Instrucciones y puntos de extensión: [backend/README.md](backend/README.md).

## Conectar ambos

Mantener los dos procesos abiertos. En `.env.local` raíz:

```dotenv
HEALTH_DATA_SOURCE=api
HEALTH_API_BASE_URL=http://127.0.0.1:4000/api/v1
```

Reiniciar Next.js. El frontend pasa a leer astronautas, mediciones, evaluaciones y
sesiones del backend. Para volver a mocks, usar `HEALTH_DATA_SOURCE=mock`.
No se ocultan errores de integración con un reemplazo silencioso por ejemplos.

## Comprobar

```bash
npm run check                   # Frontend: ESLint, tipos y tests
npm run build                   # Frontend: producción
npm --prefix backend run check  # Backend: tipos y tests propios
npm run test:contracts          # Compatibilidad backend ↔ frontend
npm run contracts:export        # Actualizar OpenAPI después de acordar cambios
```

## Trabajar en equipo

La [guía de ramas y distribución de archivos](docs/team-workflow.md) explica qué
edita cada persona y cómo crear `backend/api` desde `origin/frontend`. **Primero
hay que hacer commit y push de esta base:** los cambios locales no aparecen en
el clon del compañero.

- [Contrato de API](docs/api.md) y [contrato ejecutable](contracts/README.md).
- [Arquitectura y análisis de boilerHack](docs/architecture.md).

Desafío: https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/
