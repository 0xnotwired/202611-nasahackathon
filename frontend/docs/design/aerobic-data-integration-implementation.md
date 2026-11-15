# Integración aeróbica: entrega de frontend

Implementación del 15 de noviembre de 2026 sobre la rama `frontend`.
Referencia: [análisis y reparto de responsabilidades](aerobic-data-integration-analysis.md).

## Resultado disponible

El seguimiento personal conserva los seis escenarios longitudinales, navegación,
selección, referencia, notas locales y temas. Ahora permite seleccionar un protocolo
para los cálculos sin eliminar las otras pruebas de la tabla o del CSV. El resumen
indica cuántas pruebas quedan dentro y fuera del grupo. Elegir un protocolo no cambia
automáticamente la referencia: si pertenece a otro protocolo, se explica el bloqueo.

El inspector muestra cantidad, papel del resultado, identidad contextual, fuente,
registros de origen, base temporal, verificación técnica y versión de presentación.
Las diferencias y los trazos respetan la compatibilidad de contexto; una pendiente
no determina mejoría clínica ni mal desempeño. No se ha definido un criterio médico.

La ruta `/investigacion` presenta la disponibilidad de MR080G sin valores reales.
La ruta `/investigacion?example=synthetic` demuestra una prueba con cuatro etapas y
32 registros **íntegramente ficticios**, con tabla de ocho variables y procedencia.
Selecciona explícitamente el resultado de `Peak AVG`; no usa el máximo de todas las
filas como pico. Conserva la fecha de origen sin convertirla en UTC. No calcula
antigüedad ni tendencia longitudinal. No asigna una potencia a `Peak AVG`.

El ejemplo utiliza valores escritos para la interfaz, no datos del participante
7772. VO₂ relativo/absoluto y RER tienen relaciones aritméticas documentadas en el
fixture; no representan un modelo fisiológico. La masa ficticia usada para elaborar
los valores no se presenta como una medición real.

## Frontera entre frontend y backend

No se modificaron `backend/`, `contracts/`, OpenAPI ni los endpoints existentes.
No se importó código de main ni se consultó IndexedDB desde Next.js. Los componentes
obtienen datos exclusivamente a través de `data/service.ts`.

- `data/mission-projection.ts`: adapta la respuesta sintética 0.1 al contexto de
  presentación. Conserva su `meta` y distingue transporte HTTP de procedencia.
- `evidence.ts`: define contexto y bloqueos de compatibilidad de presentación.
- `research-assessment.ts`: propuesta local de modelo de lectura **no acordada como
  contrato HTTP**. Valida estados, unidades, identidad contextual, etapas, registros
  y procedencia. No sustituye M21, un repositorio de datos ni una verificación de hash.
- `data/research-mock.ts`: único caso de etapas disponible; sintético y reproducible.
- `getResearchCase(false)`: devuelve ausencia explícita hasta acordar y conectar la
  lectura real. No llama a endpoints supuestos ni devuelve mocks como fallback.

En API 0.1 no se puede verificar cantidad e identidad por evaluación: sus valores
se pueden inspeccionar, pero se bloquean diferencias, trazos comparativos y tendencia.
El contexto supuesto del catálogo demo se marca como no verificado. Para habilitar
inferencia con datos HTTP, el backend debe entregar evidencia por prueba bajo una
respuesta acordada. Un cambio de `HEALTH_DATA_SOURCE` no transforma datos sintéticos
en reales.

El parser de ingreso del frontend es estricto para esta respuesta 0.1: rechaza
campos no declarados o versiones desconocidas, en lugar de descartar procedencia y
reetiquetarla como sintética. Esto exige coordinar cualquier ampliación del payload.
El contrato compartido y los consumidores del backend mantienen sus esquemas actuales.

## Exportaciones y revisión local

CSV de seguimiento: valores sin redondeo, ausencia, cantidad, papel, identidad,
IDs, origen, fuente, verificación, calendario y versión. El CSV de investigación
añade etapa, fila, columna, unidad/estado, fecha fuente original, ámbito temporal,
cita, hash cuando exista, release y perfil de importación. Las etiquetas de texto
se neutralizan si podrían ejecutarse como fórmulas en una hoja de cálculo.

La revisión preparada incorpora un anexo de datos y procedencia, el protocolo
seleccionado y la versión. Un cambio de fuente o de versión de proyección altera
el contenido actual y permite advertir que difiere de la copia local conservada.
Preparar/exportar no envía información ni crea un expediente clínico auditado.

## Pendientes que requieren datos o acuerdo de equipo

1. Restaurar el original MR080G y comprobar hash y perfil contra el manifiesto.
2. Backend/M06: agrupar registros canónicos en pruebas; conservar sujeto contextual,
   protocolo, fase, etapa, unidades confirmadas, IDs y tiempo de origen.
3. Acordar una respuesta nueva con tipos, Zod, OpenAPI, ejemplos y pruebas de ambos
   equipos. El modelo local es una propuesta de presentación, no un cambio unilateral.
4. Conectar esa respuesta en `data/service.ts`, con errores explícitos y sin fallback.
5. Resolver calendario/identidad/protocolo y disponer de pruebas independientes
   elegibles antes de habilitar un seguimiento longitudinal real.
6. Revisión de dominio: criterio de desempeño, identificación del pico y condiciones
   de comparabilidad. No se incorporaron umbrales, diagnósticos ni prescripciones.

## Validación

Comprobaciones completadas: `npm run check`, `npm run test:contracts` y
`npm run build`. Turbopack conservaba en caché un fallo de apertura de puerto del
sandbox; el build pasó al renovar esa caché y ejecutarlo con los permisos requeridos.
No se alteró la configuración de build para evitar el error.

`tests/aerobic-evidence.test.ts` cubre procedencia no declarada, IDs duplicados,
identidades de distintos estudios, pico frente a etapa, unidades/tiempos desconocidos,
API sin evidencia verificable, contexto de protocolo, cambios de fuente en revisión,
una prueba/32 registros, selección explícita de pico, cero frente a ausencias y CSV.

La verificación en Chromium cubre selección de protocolo, registros excluidos,
persistencia de contexto entre vistas, inspector, descargas, estado de fuente ausente
y ejemplo de etapas. Se revisan anchos de 320–1440 px, texto al 200 % y tema oscuro.

El diseño conserva la paleta neutra y azul, tipografía del sistema, datos tabulares y
estados con texto. La referencia espacial orienta la claridad; no implica certificación
NASA ni habilitación para uso médico u operativo.
