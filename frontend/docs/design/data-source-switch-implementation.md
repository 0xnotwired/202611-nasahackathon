# Selector de fuente: implementación

Entrega del 16 de noviembre de 2026. Referencia:
[plan de implementación](data-source-switch-implementation-plan.md).

## Función disponible

El control superior alterna entre simulación local y backend mediante
`source=mock|api`. La fuente se resuelve por petición; no modifica `process.env`
ni cambia el modo de otros usuarios. El destino HTTP permanece en el servidor.

`HEALTH_DATA_SOURCE` es el valor inicial si la URL no incluye fuente.
`HEALTH_API_BASE_URL` configura el destino del backend. Si falta o no es válida,
seleccionar API muestra un estado recuperable. `source=mock` funciona incluso
cuando el valor inicial es API y no tiene configuración válida.

El backend 0.1 sigue siendo sintético y se identifica como «Datos sintéticos» y
«Fuente: Backend». La etiqueta no se obtiene de la primera evaluación: procede
del contexto validado de la carga, también si la persona no tiene evaluaciones.
La fuente seleccionada no cambia los bloqueos de comparación del contrato 0.1.

## Archivos y responsabilidades

- `data/source-context.ts`: validación del modo/configuración, construcción de URLs
  internas y namespaces de borradores. Solo admite destinos HTTP/HTTPS configurados;
  la URL de la petición no puede suministrar el destino API.
- `data/reader.ts`: lector inmutable por petición y carga de catálogo/detalles del
  mismo proveedor. Mantiene en paralelo las lecturas independientes del detalle.
- `data/service.ts`: entrada server-only; entrega el lector a las páginas sin
  exponer configuración privada a los componentes.
- `components/data-source-control.tsx`: control nativo con acción GET y mejora de
  navegación cliente; incluye fuente visible y acción de destino accesible.
- `components/source-navigation.tsx`: transición compartida, estado anunciado y
  recuperación de foco. Durante el cambio, el contenido anterior conserva su
  etiqueta y queda inerte para impedir exportaciones/revisiones de contexto ambiguo.
- `components/source-state.tsx`: estados recuperables sin necesitar un astronauta
  válido. Permite volver explícitamente a simulación, reintentar una lectura o
  volver al catálogo de la fuente cuando no existe la persona solicitada.
- `src/app/page.tsx` y `/investigacion/page.tsx`: resolución de fuente antes de leer
  datos; control disponible en ambas rutas y en estados vacíos/error.

No se modificaron `backend/`, `contracts/`, rutas HTTP ni OpenAPI. No se añadieron
dependencias ni endpoints de Next.js para duplicar el backend.

## Contexto y navegación

El cambio de fuente conserva vista, período y escala; limpia persona, evaluación,
referencia, protocolo y escenario. Se selecciona una persona del catálogo de destino.
Los enlaces de vistas, persona, escenarios e investigación conservan la fuente.
El historial del navegador permite volver a la selección anterior.

La investigación API presenta «Lectura de investigación no integrada». El ejemplo
de etapas solo se abre con `source=mock&example=synthetic`. No se convierte en una
respuesta del backend ni reemplaza una muestra real ausente.

Los borradores mock conservan su clave histórica. Los del backend sintético usan
`orbita-api-demo-0.1-journal-v1:` y no heredan notas, marcas o revisiones de mocks.
Las claves de React incluyen fuente y persona. Esta entrega contempla un único
backend configurado; antes de incorporar varios datasets/instancias se necesita un
identificador estable de fuente acordado con el backend.

El texto de observación en edición se conserva como borrador local asociado a la
evaluación donde comenzó. Se recupera al volver y no se confirma como observación
guardada hasta la acción explícita. Las revisiones incluyen ese borrador identificado
como tal, fuente, versión y procedencia; una copia preparada conserva su contexto.
Si el navegador bloquea almacenamiento, se advierte de la pérdida al salir y se
permite exportar la revisión. No se promete persistencia remota.

Las sesiones API son de solo lectura. Las observaciones y revisiones siguen siendo
locales; no hay escrituras al backend ni envío a especialistas.

## Fallos y ausencia

Se distinguen selección inválida/duplicada, backend sin configurar, conexión
indisponible, timeout, formato incompatible, catálogo vacío y persona no encontrada.
Un fallo de una lectura requerida impide presentar el conjunto como una carga válida.
No se completa una respuesta API con fixtures. Los errores inesperados conservan
el error boundary de Next, con un enlace de regreso a simulación.

Se mantienen `no-store` y el timeout de 8 segundos. No hay polling, streaming de
sensores ni verificación de datasets mediante `/health`.

## Verificación

`tests/data-source.test.ts` verifica selección/configuración, limpieza de contexto,
conservación de preferencias, namespaces, fuentes concurrentes, ausencia de HTTP en
mocks, catálogo vacío, persona ausente, fallos, versiones de respuesta incompatibles,
mediciones de otro sujeto e IDs duplicados. Las suites previas se conservan.

Comprobaciones: `npm run check`, `npm run test:contracts` y `npm run build`.

La comprobación de navegador se realiza sobre producción local aislada, usando el
router real del backend por HTTP y respuestas controladas de fallo. Cubre:
cambio y carga, contenido anterior inerte, etiqueta sintética de API, limpieza de
identidades, borradores y copias separados, sesiones de solo lectura, errores y
reintento, timeout, vacío, persona desconocida, investigación, recarga y atrás/adelante.
Se revisan teclado, temas, anchos de 320–1440 px y texto al 200 %.

La aplicación usa JavaScript para los paneles interactivos y la navegación de Next.
La acción GET del control evita depender de una escritura o de una Server Action;
no se declara una experiencia completa de dashboard sin JavaScript.

## Entrega real pendiente

Las fases 1–5 del plan corresponden a esta entrega A. La fase 6 requiere una respuesta
versionada acordada, lector de investigación y restauración/verificación de fuentes.
El esquema 0.1 rechaza datos reales o versiones incompatibles. No se cambió ese
contrato ni se activó «Datos reales» a partir de un seed o de un ejemplo sintético.

Una integración futura debe preservar identidad contextual, cantidad/pico/etapa,
protocolo, origen, reloj, ausencia, citas e IDs fuente, con los mismos bloqueos
descritos en el análisis aeróbico. También deberá acordar el ciclo de vida de notas
reales antes de habilitar su persistencia; no heredar automáticamente localStorage demo.
