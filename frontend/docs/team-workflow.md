# Frontend y backend sin pisarse

## Distribución de archivos

| Área              | Responsable         | Archivos habituales                                                                                                                                  |
| ----------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend          | Persona de frontend | `src/`, `public/`, `tests/`, package.json/lockfile raíz, `tsconfig.json`, configuración Next/ESLint, `.env.example` raíz, `.github/workflows/ci.yml` |
| Backend           | Persona de backend  | `backend/**`, incluido su package.json/lockfile, `.env.example`, tests y README; `.github/workflows/backend.yml`                                     |
| Contrato          | Ambos, coordinado   | `contracts/**`, `docs/api.md`, `.github/workflows/contracts.yml`                                                                                     |
| Acuerdos del repo | Coordinar cambios   | README raíz, AGENTS raíz, `.gitignore`, esta guía                                                                                                    |

El backend no importa componentes ni mocks del frontend. El frontend no importa
la implementación ni los seeds del backend. En modo integración se comunican
por HTTP y el contrato compartido comprueba la compatibilidad.

La separación reduce las zonas habituales de conflicto. Git no impide editar una
carpeta ajena ni garantiza un merge sin conflictos: respetar la distribución y
acordar los cambios compartidos sigue siendo parte del trabajo del equipo.

## Publicar primero esta base

El compañero solo recibe commits publicados. Los archivos locales sin commit o
sin push no aparecerán al clonar ni al crear su rama desde origin/frontend.

Desde `frontend`, revisar el contenido y seleccionar los archivos de esta base
para el commit; luego publicar esa rama:

```bash
git status
# git add <archivos que revisaste>
git commit -m "chore: separar frontend backend y contrato de API"
git push -u origin frontend
```

No ejecutar el commit si la selección no incluye la base necesaria. Los `.env`
locales y `node_modules` están ignorados; los `.env.example` sí se versionan.

## Tu compañero: clonar y crear la rama backend

```bash
git clone git@github.com:0xnotwired/202611-nasahackathon.git
cd 202611-nasahackathon
git fetch origin
git switch --no-track -c backend/api origin/frontend
npm --prefix backend ci
npm --prefix backend run dev
```

`--no-track` evita que su nueva rama quede siguiendo por accidente a
`origin/frontend`. Cuando quiera publicar su trabajo:

```bash
git add backend/
git commit -m "feat(backend): describir el cambio"
git push -u origin backend/api
```

Abrir un PR **backend/api → frontend** para integrar con tu trabajo actual.
Si acuerdan otra rama de integración, cambiar la base del PR de forma explícita.

Para traer avances de frontend a su rama backend sin reescribir commits publicados:

```bash
git fetch origin
git switch backend/api
git merge origin/frontend
```

Hacerlo con sus cambios guardados en commits. Resolver los conflictos revisando
el contenido; no usar estrategias que descarten automáticamente un lado entero.

## Tu trabajo de frontend

Podés seguir en `frontend`, como hasta ahora. Para una tarea aislada también podés
crear una rama `frontend/<tarea>` desde la base actual y abrir un PR a `frontend`.
Tu entorno continúa siendo:

```bash
npm ci
npm run dev
```

Funciona con mocks sin levantar el backend. No cambiar el lockfile del backend
para instalar una dependencia visual.

## Integrar ambos procesos localmente

- Backend en una terminal: `npm --prefix backend run dev` → puerto 4000.
- Frontend en otra: `npm run dev` → puerto 3000.
- Para consumir la API, poner en `.env.local` raíz:

```dotenv
HEALTH_DATA_SOURCE=mock
HEALTH_API_BASE_URL=http://127.0.0.1:4000/api/v1
```

Reiniciar Next.js al cambiar esta configuración. El botón superior alterna entre
simulación local y backend. También se puede abrir `/?source=mock` o `/?source=api`;
el parámetro se conserva al navegar y prevalece sobre el valor inicial de entorno.
La API 0.1 sigue siendo sintética: el botón muestra «Datos sintéticos · Fuente: Backend».
Si falta configuración, falla la conexión o la respuesta es incompatible, se muestra
un estado recuperable con regreso explícito a simulación, sin fallback automático.

 En modo API también se leen las
evaluaciones aeróbicas y sesiones del backend; no se mezclan con fixtures locales
para ocultar errores. Los borradores de actividad y revisión del usuario siguen
siendo locales al navegador, aislados por fuente y persona, hasta acordar un contrato
de escritura. Los estados de las sesiones recibidos por API son de solo lectura.
Las claves mock anteriores se conservan; no se copian notas entre fuentes.

Para volver al desarrollo independiente: abrir `/?source=mock`; no requiere reiniciar.

## Comprobaciones antes de integrar

| Cambio                       | Comando                                                         |
| ---------------------------- | --------------------------------------------------------------- |
| Frontend                     | `npm run check` y `npm run build`, en raíz                      |
| Backend                      | `npm --prefix backend run check`                                |
| Contrato o respuestas de API | `npm run test:contracts`, en raíz                               |
| Cambios del contrato         | Además, `npm run contracts:export` y versionar el JSON generado |

El CI separa frontend, backend y compatibilidad. Los cambios solo en backend no
ejecutan el build del frontend, pero sí la comprobación de compatibilidad. El CI
del backend instala únicamente sus propias dependencias.

Los archivos AGENTS por área documentan los límites para asistentes. No se activa
CODEOWNERS con usuarios inventados: para asignar revisores automáticamente hace
falta acordar los handles reales de GitHub y las reglas del repositorio.
