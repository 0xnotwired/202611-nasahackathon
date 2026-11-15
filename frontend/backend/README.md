# Órbita · Backend

API independiente en **Node.js 22.18+ y TypeScript**. Puerto predeterminado: 4000.
No necesita Next.js, React, base de datos, Docker ni dependencias de producción.
TypeScript se ejecuta con el soporte nativo de Node; `tsc` comprueba tipos.

## Arrancar solo el backend

Desde la raíz del repo:

```bash
npm --prefix backend ci
npm --prefix backend run dev
```

O desde esta carpeta:

```bash
nvm use
npm ci
cp .env.example .env  # opcional: el código ya usa estos valores por defecto
npm run dev
```

Comprobar: http://127.0.0.1:4000/api/v1/health.
Contrato servido: http://127.0.0.1:4000/api/v1/openapi.json.

`npm run dev` reinicia el proceso al cambiar código. `npm start` lo ejecuta sin
watch. No hay paso de compilación obligatorio para este entorno de desarrollo.
Se usa sintaxis TypeScript que Node puede eliminar: evitar enums, parameter
properties u otras características que necesiten transformación.

## Dónde trabajar

```text
backend/
  src/index.ts          Arranque, puerto y cierre del proceso
  src/server.ts         Adaptador HTTP de Node
  src/app.ts            Rutas y respuestas
  src/data/provider.ts  Fuente de datos; empezar la simulación aquí
  src/data/seed.json    Escenario ficticio inicial propio del backend
  tests/                Pruebas del backend
  package*.json         Dependencias y lockfile propios
```

Los seeds son independientes de los mocks del frontend. Podés cambiar cómo se
generan o procesan los datos aquí sin editar `../src/`. La forma de las respuestas
está acordada en `../contracts/`; no cambiarla unilateralmente.

Rutas de solo lectura:

- `GET /api/v1/health`
- `GET /api/v1/astronauts`
- `GET /api/v1/astronauts/:astronautId/measurements`
- `GET /api/v1/astronauts/:astronautId/mission`

Se distinguen un astronauta inexistente (404) y uno sin registros (200 con listas
vacías). Las respuestas declaran datos sintéticos y validación clínica pendiente.
Los errores usan `{ error: { code, message } }`.

La base no acepta escrituras ni persiste actividad del usuario. Los borradores de
sesiones y revisión siguen en el navegador del frontend. Agregar escritura o
persistencia requiere acordar antes las rutas y los estados con frontend.

## Dependencias y controles

Instalar siempre desde esta carpeta: `npm install <paquete>` o, desde la raíz,
`npm --prefix backend install <paquete>`. No editar el package.json raíz para el
backend. No hacen falta npm workspaces para desarrollar estas dos aplicaciones.

```bash
npm run check        # Tipos + tests del backend
```

Después de un cambio que pueda afectar las respuestas, desde la raíz:

```bash
npm ci               # instala las herramientas de contrato/frontend
npm run test:contracts
```

Este último control valida las respuestas reales del router con los esquemas que
consume el frontend y comprueba el OpenAPI versionado.

## Probar junto al frontend

El frontend usa mocks por defecto. En la raíz, configurar `.env.local`:

```dotenv
HEALTH_DATA_SOURCE=api
HEALTH_API_BASE_URL=http://127.0.0.1:4000/api/v1
```

En otra terminal ejecutar `npm run dev` desde la raíz y abrir localhost:3000.
Las consultas se hacen desde Next.js en el servidor; no hace falta añadir CORS
del navegador para este flujo.

La configuración predeterminada escucha en localhost. No se prepara en este
cambio un despliegue de producción, autenticación o almacenamiento real.

Para ramas y límites de archivos, ver [trabajo en equipo](../docs/team-workflow.md).
