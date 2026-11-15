# API de simulación · contrato 0.1

Backend independiente en `backend/`. Base local:
`http://127.0.0.1:4000/api/v1`. Solo lectura, datos sintéticos y sin base de datos.

El contrato compartido está en [contracts/](../contracts/README.md): modelos de
transporte, validadores, ejemplos y [OpenAPI](../contracts/openapi.json).
Los cambios de contrato se coordinan entre frontend y backend.

| Método | Ruta relativa a `/api/v1`       | Respuesta                                                                    |
| ------ | ------------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/health`                       | Estado técnico, servicio y versión; no evaluación médica                     |
| GET    | `/astronauts`                   | `{ data: Astronaut[], meta }`                                                |
| GET    | `/astronauts/{id}/measurements` | `{ data: Measurement[], metrics: Metric[], meta }`                           |
| GET    | `/astronauts/{id}/mission`      | `{ data: { evaluations: Evaluation[], sessions: ExerciseSession[] }, meta }` |
| GET    | `/openapi.json`                 | Especificación OpenAPI versionada                                            |

Las respuestas de datos incluyen:

```json
{
  "contractVersion": "0.1",
  "dataKind": "synthetic",
  "clinicalValidation": "pending"
}
```

Este objeto se llama `meta`. Los ejemplos completos están en
`contracts/fixtures/astronauts.json`, `measurements.json` y `mission.json`.

## Semántica

- `value` es un número finito o `null`. No sustituir valores faltantes por cero.
- Fechas de mediciones y evaluaciones en ISO 8601 UTC, con sufijo `Z`.
- Todas las mediciones pertenecen al astronauta solicitado; su `metricCode`
  debe existir en el catálogo `metrics`. Se ordenan por fecha descendente.
- Evaluaciones de misión en orden cronológico ascendente. Método y unidad no
  confirman por sí solos validez clínica; son campos del escenario de demostración.
- IDs únicos dentro de cada colección. No mezclar personas o unidades.
- Astronauta existente sin registros: 200 con listas vacías; para mediciones
  se conserva el catálogo disponible.
- Astronauta inexistente: 404 y
  `{ "error": { "code": "ASTRONAUT_NOT_FOUND", "message": "Astronauta no encontrado." } }`.
- Métodos de escritura: 405 y cabecera `Allow: GET, HEAD`. No hay persistencia.
- Las respuestas de datos no se cachean. Los errores no se sustituyen por mocks.

## Desarrollo e integración

Terminal backend, desde la raíz:

```bash
npm --prefix backend ci
npm --prefix backend run dev
```

El frontend funciona con mocks por defecto. Para integrarlo, poner en `.env.local`
raíz y reiniciar Next.js:

```dotenv
HEALTH_DATA_SOURCE=api
HEALTH_API_BASE_URL=http://127.0.0.1:4000/api/v1
```

Next.js consulta la API desde el servidor. No se requiere CORS del navegador.
El cliente tiene un timeout de 8 segundos y valida las respuestas con los esquemas
compartidos. Si falla la integración, muestra el estado de error con reintento.

En modo API, las cuatro vistas reciben mediciones, evaluaciones y sesiones del
backend. Las modificaciones de actividad y los resúmenes del usuario siguen siendo
borradores locales del navegador. No hay envío a profesionales ni endpoints de
escritura: se acordarán como una ampliación separada cuando hagan falta.

## Verificar el contrato

```bash
npm run test:contracts
```

Después de acordar una modificación del contrato:

```bash
npm run contracts:export
npm run test:contracts
```

El CI valida ejemplos, vigencia del JSON OpenAPI y respuestas reales del router
del backend frente a lo que acepta el frontend.

## Comprobación HTTP manual

```bash
curl http://127.0.0.1:4000/api/v1/health
curl http://127.0.0.1:4000/api/v1/astronauts
curl http://127.0.0.1:4000/api/v1/astronauts/astro-01/mission
curl http://127.0.0.1:4000/api/v1/astronauts/astro-03/measurements
curl -i http://127.0.0.1:4000/api/v1/astronauts/inexistente/mission
```

Preparación del compañero y flujo de ramas: [trabajo en equipo](team-workflow.md).
