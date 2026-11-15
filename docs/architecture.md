# Base de desarrollo de Órbita

## Decisión actual: dos áreas y un contrato

Frontend Next.js en la raíz, backend Node.js/TypeScript independiente en `backend/`
y contrato compartido en `contracts/`. Cada aplicación tiene dependencias,
lockfile, entorno, tests y CI propios. No se usan workspaces ni otra infraestructura.

```text
Frontend :3000 → servicio de datos → mocks del frontend (por defecto)
                                  → HTTP + validación del contrato
                                               ↓
                               Backend :4000 → fuente de simulación propia
```

No hay imports de implementación entre frontend y backend. Los tipos puros y el
OpenAPI viven en la zona compartida. Los anteriores Route Handlers de simulación
se retiraron de `src/app/api/`: la API ahora pertenece únicamente a `backend/`.

El modo API consume también las evaluaciones y sesiones, mediante `/mission`.
Los borradores de actividad y revisión del usuario siguen en el navegador. Aún
no existe un contrato de escritura ni persistencia del servidor.

La base del backend usa HTTP nativo de Node y ejecución nativa de TypeScript para
no imponer un framework o una base de datos. Si necesita dependencias, su
responsable las instala solo dentro de `backend/`.

Distribución de archivos y ramas: [trabajo en equipo](team-workflow.md).

## Análisis de boilerHack

Referencia inspeccionada: `/home/ivansarita/projects/personal/boilerHack`.
Se revisaron README, dependencias, organización de `src`, cliente HTTP,
configuración de entorno, feature `items`, CI y estructura del backend FastAPI.
Es una base para CRUD completo; Órbita necesita primero lectura y visualización.
Se adaptaron sus patrones, sin copiar el boilerplate completo.

| Patrón | Decisión para Órbita | Motivo |
| --- | --- | --- |
| Next.js, TypeScript estricto, Tailwind | Mantener la instalación actual | Ya está preparada; no degradar versiones a las del boilerplate |
| Funcionalidades en `src/features` | Adoptar `health-monitoring` | Contrato, datos y componentes tienen un lugar claro |
| Cliente HTTP y entorno centralizados | Adoptar, solo servidor | Un punto para errores, timeout y URL del backend |
| Zod | Adoptar | Validar respuestas externas y derivar los tipos del mismo contrato |
| Scripts de tipos y CI | Adoptar | Detectar incompatibilidades antes de integrar trabajo del equipo |
| shadcn/Radix y biblioteca de componentes | Posponer | La pantalla actual se resuelve con HTML y Tailwind |
| TanStack Query y providers | Posponer | No hay polling, mutaciones ni caché de cliente que lo justifiquen |
| React Hook Form y toasts | Posponer | Los controles nativos cubren las necesidades actuales |
| FastAPI + SQLAlchemy + Alembic | Posponer | Requiere otro runtime y definir persistencia antes de validar los datos |
| Docker, múltiples bases de datos, `dev:all` | Posponer | El equipo puede arrancar con `npm ci` y `npm run dev` |
| Datos de riesgo crediticio del boilerplate | No reutilizar | No corresponden al dominio del proyecto |

## Límites entre tareas del equipo

- **Frontend:** `src/`, `public/`, tests y configuración raíz. Las pantallas
  consumen el servicio de datos; sus mocks siguen siendo propios del frontend.
- **Backend:** `backend/**`. Empezar por `src/data/provider.ts` y `src/data/seed.json`
  dentro de esa carpeta. Sus cambios de simulación no necesitan tocar pantallas.
- **Compartido:** `contracts/**`. Acordar cambios de estructuras o rutas y comprobar
  las respuestas reales del backend con `npm run test:contracts`.

La API inicial es de lectura y usa datos ficticios. No hay base de datos,
autenticación, sensores, alertas clínicas, tratamientos, sincronización offline ni IA.

## Datos provisionales

Los cuatro indicadores de demostración no representan una selección clínica
aprobada. Cada registro incluye astronauta, código de métrica, valor numérico
o `null`, instante UTC y procedencia. El catálogo contiene nombre y unidad;
no se mezclan unidades en los valores ni se inventan estados «normal/crítico».
Los códigos son extensibles para ajustar el catálogo sin cambiar su estructura.

- Vega: registros de varios indicadores y una medición histórica.
- Lyra: un valor explícitamente faltante (`null`).
- Atlas: historial vacío para desarrollar el estado sin datos.

Las muestras son fijas y reproducibles. No simulan tiempo real ni se actualizan
al recargar. `null` significa valor faltante; `0` es un valor. Se muestra el último
registro por fecha, sin sustituir uno faltante por otro antiguo.

Antes de incorporar interpretación, acordar con la médica: indicadores y unidades,
frecuencia, calidad de señal, contexto de actividad, baseline individual,
criterios de alerta y acciones permitidas. Esos acuerdos serán una tarea posterior.

## Siguientes pasos

1. Confirmar el catálogo y los escenarios con la médica.
2. Ajustar mocks y desarrollar el recorrido del astronauta sobre esta base.
3. Implementar simulación/procesamiento detrás del contrato, si queda tiempo.
4. Añadir persistencia, formularios o librerías cuando exista una necesidad concreta.
