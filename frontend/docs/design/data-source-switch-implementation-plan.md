# Selector de fuente: simulación local y backend

Fecha: 15 de noviembre de 2026. Rama inspeccionada: `frontend`, commit `c5f9882`.
Estado: análisis y plan de implementación; no activa el selector ni modifica código.

Seguimiento: [entrega A implementada y alcance de la verificación](data-source-switch-implementation.md).
La entrega B continúa condicionada al contrato y a la fuente real descritos en este plan.

## 1. Decisión propuesta

Convertir la etiqueta superior en un control para alternar entre **simulación local**
y **backend**, conservando la apariencia sobria actual. Mostrar **Datos reales**
únicamente cuando la respuesta validada identifique registros reales y su contexto.

La interacción solicitada es viable, pero hay tres conceptos diferentes:

| Concepto | Valores iniciales | Quién lo determina |
| --- | --- | --- |
| Fuente seleccionada | Simulación local / Backend | Usuario, dentro de la configuración permitida |
| Origen efectivo | Sintético / Análogo terrestre / Terrestre / Vuelo / Mixto / Sin determinar | Respuesta validada y registros visibles |
| Disponibilidad | Cargando / Disponible / Vacío / No configurado / Error | Resultado de la carga |

El backend de esta rama devuelve datos sintéticos desde un archivo seed. Conectarlo
no habilita por sí solo datos reales, sensores en vivo, comparaciones verificadas ni
persistencia de cambios. La etiqueta expresa evidencia, no la intención del clic.

**Entrega A:** selector mock/API completamente funcional con el contrato actual.
**Entrega B:** origen real, una vez acordada e implementada su respuesta y su lectura.
No se necesita un framework nuevo, Redux, una API dentro de Next ni un sistema de plugins.

## 2. Hallazgos del repositorio

| Archivo o área | Situación comprobada | Cambio necesario |
| --- | --- | --- |
| `components/dashboard.tsx:87` | La etiqueta es un `span`, no un botón | Control accesible y estado de fuente independiente |
| `src/lib/env.ts` | `HEALTH_DATA_SOURCE` elige `mock` o `api` globalmente | Conservarlo como valor por defecto; resolver la petición sin modificar `process.env` |
| `src/app/page.tsx:29–58` | Carga parámetros y astronautas en paralelo antes de conocer una selección de fuente | Resolver fuente primero, luego catálogo y detalle del mismo proveedor |
| `data/service.ts` | Cada función consulta configuración por su cuenta | Un único contexto/proveedor por carga de pantalla |
| `data/mission-projection.ts` | API 0.1 validada estrictamente y proyectada como demo no verificable por prueba | Mantener compatibilidad y bloqueos; adaptador separado para una futura versión |
| `contracts/models.ts`, `contracts/schemas.ts` | `dataKind` solo admite `synthetic` | Acordar un contrato nuevo antes de admitir datos reales |
| `backend/src/data/provider.ts:10–40` | Catálogo, mediciones y misión proceden de `seed.json` | Hoy solo permite la entrega A |
| `backend/src/app.ts:44–49` | `/health` informa salud técnica y versión | No usarlo como prueba de existencia de datasets reales |
| `dashboard-state.ts`, enlaces del dashboard | Conservan filtros, pero no fuente | Propagar un parámetro de fuente en toda navegación |
| `use-demo-journal.ts:46–48` | Clave `orbita-demo-journal-v1:${astronautId}` | Separar contexto de borradores y copias preparadas |
| `src/app/error.tsx` | Error genérico con reintento; desaparece el selector | Recuperación que permita volver a simulación desde errores de API |
| `/investigacion` | Lectura real ausente; ejemplo independiente y sintético | Mantener coherencia de fuente sin convertir ese ejemplo en datos del backend |
| Textos y exportaciones | Existen referencias fijas a datos ficticios y programa demo | Derivarlas del contexto antes de habilitar registros reales |

`getJson` ya utiliza `cache: "no-store"`, un timeout de 8 segundos y validación Zod.
Las cargas de mediciones y misión ya se hacen en paralelo después de seleccionar
persona. Esos patrones se conservan.

El árbol estaba limpio al comenzar este análisis. No se hizo fetch, cambio de rama,
lectura de originales, prueba de disponibilidad de un backend en ejecución ni
modificación de `backend/` o `contracts/`.

## 3. Comportamiento del control superior

### 3.1 Control de acción, no interruptor de verdad científica

Mantenerlo arriba a la derecha, junto al tema. Utilizar un `button type="button"`
estilizado con los tokens existentes. Al activarlo se solicita la otra fuente.
Un switch ARIA representa encendido/apagado; aquí existe una navegación asíncrona
que puede fallar, y el origen no es binario. No utilizar `role="switch"` ni cambiar
`aria-checked` para declarar que los datos ya son reales.

El contenido debe permitir distinguir dos fuentes aunque ambas sean sintéticas:

```text
Datos sintéticos                 Datos sintéticos
Fuente: Simulación local         Fuente: Backend

Tras la integración real:
Datos reales · análogo terrestre
Fuente: Backend
```

El texto auxiliar puede colocarse debajo o al lado según el espacio disponible.
Debe ser perceptible, no existir solo en un tooltip. El nombre accesible incluirá
el texto visible y la acción de destino, por ejemplo: «Datos sintéticos. Fuente:
Simulación local. Cambiar a backend». No usar `aria-pressed` con una etiqueta cuyo
significado cambia entre fuente y origen.

La parte «Datos reales» puede conservar la denominación pedida, acompañada del origen
específico. No debe sugerir datos de un astronauta en vuelo si se trata de un análogo
terrestre. El esquema futuro debe permitir procedencia mixta: si solo una sección
es real, no rotular todo el panel como real.

### 3.2 Estados y transiciones

| Estado | Presentación | Acción permitida |
| --- | --- | --- |
| Simulación cargada | Datos sintéticos · Simulación local | Solicitar backend |
| Backend sin URL válida | Estado «Backend no configurado» al intentar conectar; sin números atribuidos a esa fuente | Volver a simulación |
| Transición hacia API | «Conectando con backend…» anunciado como estado | Evitar dobles activaciones mientras se resuelve |
| API 0.1 cargada | Datos sintéticos · Backend | Volver a simulación |
| API real futura validada | Datos reales + origen específico · Backend | Volver a simulación |
| API válida sin registros | Fuente Backend · Sin registros; origen solo si lo declara el envelope válido | Cambiar persona si hay catálogo; volver a simulación |
| API inaccesible o timeout | Backend no disponible; sin etiqueta de datos reales | Reintentar / Usar simulación local |
| Respuesta incompatible | Formato de datos no compatible; sin números de esa respuesta | Reintentar / Usar simulación local |
| Catálogo o secciones de procedencia distinta | Origen mixto o contexto incompatible según contrato | Inspeccionar secciones; bloquear mezclas no acordadas |

Durante la transición, la pantalla anterior puede seguir visible como contenido
anterior en actualización, pero conserva su etiqueta original y bloquea exportar o
preparar revisiones hasta resolver la carga. No renombrar los mocks como reales.
Tras un fallo no mostrar un historial anterior como si perteneciera al backend.
El error conserva acceso explícito a simulación. No hay fallback automático.

Fuentes de accesibilidad: [MDN, semántica de switch](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/switch_role)
y Modern Web Guidance `forms`, apartados 1, 2, 5 y 7. La navegación programática se
contrasta con [Next.js useRouter](https://nextjs.org/docs/app/api-reference/functions/use-router)
y con la documentación de la versión instalada.

## 4. Arquitectura de selección

### 4.1 URL como estado de navegación

Propuesta: `source=mock|api`. Son identificadores de transporte internos, no
conclusiones científicas. No usar `source=real` para la API sintética actual.

Ejemplos de navegación, no endpoints nuevos:

```text
/?source=mock&view=resumen&scenario=recovery
/?source=api&view=resumen
/investigacion?source=mock&example=synthetic
/investigacion?source=api
```

Sin parámetro: utilizar `HEALTH_DATA_SOURCE`, por defecto `mock`. Validar la selección
en servidor con una lista cerrada. Rechazar parámetros duplicados/arrays o valores
desconocidos con un estado de solicitud inválida y recuperación a simulación; no
normalizarlos silenciosamente a un modo distinto. El cliente no puede enviar una
URL de backend, un nombre de archivo o una ruta de dataset como fuente.

La URL permite recargar y utilizar atrás/adelante. No almacenar el modo únicamente
en React ni en localStorage, ni escribir variables de entorno desde el botón.
Solo la fuente y filtros de navegación forman parte de este mecanismo; no añadir
notas, valores de salud ni credenciales a los parámetros.

### 4.2 Configuración privada del servidor

Conservar `HEALTH_DATA_SOURCE` como selección inicial y `HEALTH_API_BASE_URL` como
destino HTTP configurado por el equipo. Tener una URL configura un destino, no
demuestra que esté conectado o que tenga datos reales. No añadir `NEXT_PUBLIC_`
a esa URL ni exponerla en los mensajes del navegador.

Separar lectura/validación de configuración y disponibilidad del modo solicitado.
Si falta la URL y se solicita API, devolver `not_configured`; la simulación debe
seguir siendo accesible, incluso si el valor inicial de entorno era `api`.
No efectuar fetch cuando la configuración no sea válida. Evitar que el fallo de
configuración de API inutilice también la salida a mocks.

No hace falta un endpoint de capabilities en la entrega A. Si el equipo lo acuerda
para la entrega B, será un contrato nuevo: no asumir que existe ni utilizar `/health`
para inferir procedencia, permisos o existencia de pruebas.

### 4.3 Un proveedor por petición

Crear un contexto de lectura una vez, después de validar la fuente. Pasarlo
explícitamente a todas las llamadas o capturarlo en una factoría **server-only**.
La siguiente firma es una propuesta nueva; no existe actualmente:

```ts
type DataSourceMode = "mock" | "api";
// createHealthDataReader(validatedContext) => {
//   listAstronauts(), getMeasurements(id), getMission(id, scenario?)
// }
```

Conservar `data/service.ts` como entrada para las páginas. Ni componentes ni backend
importan fixtures del otro lado. No introducir `src/app/api/` para duplicar la API.

Secuencia de carga:

1. Leer `searchParams` y configuración; resolver la fuente de esta petición.
2. Si está indisponible por configuración, devolver el estado recuperable.
3. Cargar el catálogo del proveedor seleccionado.
4. Resolver la persona exclusivamente dentro de ese catálogo.
5. Solicitar mediciones y misión en paralelo al mismo proveedor.
6. Validar respuestas y coherencia de identidad, versión y procedencia declarada.
7. Construir el contexto de pantalla y las capacidades de cálculo.
8. Renderizar fuente efectiva, datos y controles juntos.

No mezclar catálogo API con misión mock, ni completar una sección ausente de la API
con fixtures. En entrega A, un fallo de cualquiera de las lecturas requeridas
produce el estado de error de la carga; no hace falta un sistema de fallos parciales.
Una respuesta vacía válida se representa como vacío. Un 404 de persona se distingue
de error de red o de formato. Las fuentes parciales futuras necesitan una regla
explícita por sección, no una mezcla implícita.

## 5. Navegación, identidad y borradores

### 5.1 Cambio de fuente

Al alternar, conservar `view`, `period` y `scale`, que describen preferencias de
visualización. Eliminar `astronaut`, `reference`, `evaluation`, `group` y `scenario`:
esas selecciones pertenecen al catálogo/historial de origen. Elegir la persona
inicial desde el nuevo catálogo y anunciar la selección resultante.

No asociar Vega con un participante real por compartir código o posición en una
lista. Una URL antigua con persona que no existe en la fuente conserva el estado
«persona no disponible en esta fuente», con selector o regreso a su catálogo.

Usar una función común para construir URLs internas con `URLSearchParams`. Copiar
los patrones existentes de `historyQuery`, pero añadir la fuente en todos los caminos:
navegación principal, marca, persona, filtros, escenario, investigación y regreso.
Se propone `router.push` para cambiar fuente y permitir volver con atrás;
`router.replace` sigue siendo adecuado para filtros. No añadir `refresh()` después
de cada navegación: la nueva URL ya provoca la lectura de servidor.

En investigación, `source` y `example` no pueden contradecirse. Un enlace al ejemplo
sintético solicita explícitamente `source=mock`; con API seleccionada y sin lector
real, mostrar «Lectura de investigación no integrada». No usar el ejemplo como fallback.
El control de fuente debe seguir disponible también en esa ruta y en estados vacíos.

### 5.2 Aislamiento de estado local

La clave de React ya no puede ser solo `selected.id`: debe incluir un identificador
de contexto de datos y persona. Esto reinicia selección y borradores en memoria al
pasar de mocks a API aunque ambas utilicen `astro-01`.

Para la entrega A, conservar la clave actual de los mocks para no perder notas
existentes y asignar un namespace diferente al backend sintético. Al usar un único
backend configurado, basta un contexto explícito `api-demo-0.1` separado de `mock`.
Antes de admitir varios backends o datasets, el contrato/configuración acordados
deberán proporcionar un identificador estable de fuente, sin exponer su URL privada.
No migrar automáticamente notas mock a ese contexto.

Una copia preparada incluye modo, origen, identidad contextual, versión y fuentes.
Su exportación conserva el contexto con el que fue preparada. Cambiar de fuente no
la transforma ni la sobrescribe con otro sujeto. Los borradores sin guardar deben
guardarse en su contexto o advertir de forma accesible que se perderán antes de una
salida que los descarte; aplicar la misma regla que a un cambio de persona.

En entrega B no heredar automáticamente la persistencia demo en localStorage para
datos reales. Hasta acordar almacenamiento y ciclo de vida con el equipo, proponer
vista real de solo lectura con revisión/exportación explícita y sin persistencia
automática de notas reales en el navegador. Si se autoriza edición local, su memoria
y retención se diseñan como parte de esa entrega, separadas de la demo.

Las marcas de actividad demo son cambios locales. La API actual solo admite GET/HEAD:
no aparentar que un checkbox actualiza una sesión del servidor. En modo API, mostrar
el estado recibido como lectura, o etiquetar una anotación local si se acuerda esa
función. No inventar un endpoint de guardado.

## 6. Tratamiento de errores y carga

Representar los fallos esperados como resultados de carga serializables, por ejemplo:
`not_configured`, `unavailable`, `timeout`, `invalid_response`, `subject_not_found`.
Son nombres propuestos para frontend, no códigos ya definidos en la API.

La página debe poder presentar un shell mínimo con selector, fuente solicitada,
explicación y acciones de recuperación aunque falle el catálogo. El proveedor no
puede depender de tener un astronauta válido para ofrecer «Usar simulación local».
Mantener `error.tsx` como último recurso para excepciones inesperadas y añadir una
salida explícita a `source=mock`. La versión instalada documenta `retry()`; no
sustituirlo por APIs recordadas de otra versión sin revisar la documentación.

Reutilizar timeout y `no-store`. No añadir polling ni prometer tiempo real.
Una acción «Reintentar» o «Actualizar datos» hace una lectura explícita; mostrar
la fecha de consulta separada de la fecha de medida. Volver atrás puede recuperar
una vista del router: no describirla como sincronización continua.

Evitar resultados cruzados ante clics rápidos: bloquear cambios repetidos durante
la transición y verificar que la pantalla comprometida corresponda a su URL/contexto.
Mantener una única región `role="status"` para carga y resultado, `aria-busy` en el
área de datos y foco recuperable tras carga/error. No anunciar el panel entero.

## 7. Entrega B: requisitos para mostrar datos reales

Se coordina con el responsable de backend. No modificar unilateralmente `contracts/`
ni ampliar el literal `synthetic` y asumir que el resto de la respuesta es suficiente.

La respuesta acordada debe expresar, al menos:

- Identidad contextual de fuente/dataset, sujeto y prueba.
- Origen por conjunto y por registro/sección cuando pueda variar.
- Cantidad, unidad confirmada/desconocida, pico frente a etapa y protocolo.
- Estado de disponibilidad: cero, ausencia y ningún registro no son equivalentes.
- Tiempo UTC o fecha fuente, precisión, zona, calendario y ámbito temporal.
- IDs fuente, cita, release, perfil de importación y evidencia de custodia aplicable.
- Verificación técnica, revisión clínica y versión de proyección, como estados distintos.
- Capacidades y motivos de bloqueo; siempre consistentes con los registros.

Reutilizar el análisis aeróbico y el modelo de lectura local como punto de discusión,
no como contrato ya aprobado. La versión nueva requiere modelos, schemas, OpenAPI,
fixtures y tests de compatibilidad. Mantener el adaptador 0.1 separado mientras se
necesite, sin transformar una respuesta real en una demo antigua.

Un análogo terrestre de una única prueba puede habilitar inspección real y mantener
bloqueada la tendencia. La ausencia de calendario o unidades no se resuelve al cambiar
de fuente. Datos reales no significa validación clínica ni aptitud para misión.

La etiqueta global se deriva del contexto validado, incluido el caso vacío. No tomar
la primera evaluación como prueba del origen de todo el panel. Un conjunto mixto se
identifica como tal y conserva procedencia por sección/registro.

Revisar antes de activar esta entrega: `review.ts`, `historyCsv`, inspector, actividad,
`about-system`, footer, mediciones adicionales y copias descargadas. Actualmente hay
textos demo y supuestos UTC que son correctos para 0.1 pero no para toda fuente real.

## 8. Plan por fases

### Fase 0 — Descubrimiento y decisiones de diseño

Entrega de este documento, con verificación de configuración, rutas, schemas,
persistencia y APIs del Next instalado. Se realizó una revisión documental delegada
del backend; la síntesis y el plan se confeccionaron sobre esos archivos.

Referencias permitidas: `AGENTS.md`, `contracts/AGENTS.md`, `backend/AGENTS.md`,
`docs/team-workflow.md`, `docs/api.md`, documentación Next indicada en §11.
APIs comprobadas: GET/HEAD `/api/v1/astronauts`, `/{id}/measurements` y `/{id}/mission`
bajo ese catálogo; `/api/v1/health` y `/api/v1/openapi.json` son auxiliares.

Aceptación: queda explícito qué permite 0.1 y qué requiere el acuerdo futuro.
No se da por existente un endpoint de fuentes, de investigación o de escritura.

### Fase 1 — Resolver fuente por petición y centralizar navegación

Archivos previstos: nuevo `data/source-context.ts` o equivalente puro,
`src/lib/env.ts`, `dashboard-state.ts`, `.env.example` y tests de contexto.

Copiar las validaciones enum de `env.ts` y la serialización de `historyQuery`.
Implementar resolución explícita, configuración privada y construcción de URLs.
No incluir la fuente en `HistoryContext` si eso mezcla identidad del proveedor con
filtros de evaluación: un contexto superior puede contener ambos de forma explícita.

Verificar: modos válido/ausente/inválido/duplicado, default de entorno, API sin URL,
limpieza de IDs al cambiar de fuente y conservación del modo al cambiar de vista.
Guardas: no mutar variables de entorno ni aceptar una URL del usuario como backend.

### Fase 2 — Proveedor de lectura y resultado de carga coherente

Archivos previstos: `data/service.ts`, `src/app/page.tsx`, `data/mission-projection.ts`,
helper de carga si mejora legibilidad y tests de proveedor.

Copiar el patrón `getJson` + schema de `service.ts` y el `Promise.all` del detalle.
Resolver fuente antes de cargar catálogo y usarla en todas las lecturas. Incorporar
resultado recuperable de errores esperados y contexto efectivo de presentación.

Verificar: ninguna petición API en modo mock; las tres lecturas usan el mismo modo;
API 0.1 sigue siendo sintética; 404, vacío, timeout y formato incompatible son distintos.
Guardas: sin fallback silencioso ni inferencias de procedencia desde `/health`.

### Fase 3 — Control accesible y estados de pantalla

Archivos previstos: nuevo `components/data-source-control.tsx`, `dashboard.tsx`,
`aerobic.css`, `page.tsx`, `loading.tsx` y `error.tsx` según el shell elegido.

Copiar botones nativos y `useTransition` existentes, utilizando `router.push` de
`next/navigation`. Añadir el cambio explícito de fuente y feedback de carga.
Mantener el origen anterior hasta tener resultado validado; representar fallos con
acceso a simulación. Foco visible, texto redundante y área activable de 3rem mínimo.

Verificar: teclado Enter/Espacio, foco tras cambio/error, sin duplicar anuncios,
sin mezclar datos antiguos y etiqueta nueva, control usable sin registros o catálogo.
Guardas: no fabricar estados ARIA de switch ni bloquear la recuperación de errores.

### Fase 4 — Aislamiento de borradores y cobertura de todas las rutas

Archivos previstos: `use-demo-journal.ts`, `observation-panel.tsx`, `exercise-view.tsx`,
`followup-view.tsx`, `review.ts`, `dashboard.tsx`, `/investigacion/page.tsx` y pruebas.

Reutilizar la separación actual de observación/preparación y el snapshot inmutable.
Añadir scope a claves de React y de estado local; conservar borradores mock antiguos.
Propagar fuente en todos los enlaces y resolver `example` explícitamente.
Representar sesiones API como lectura y mantener contexto en exportaciones.

Verificar: mismo `astro-01` en ambas fuentes no comparte notas ni copias; las notas
mock siguen disponibles al volver; ninguna revisión se atribuye al contexto nuevo;
investigación API sin integración no muestra el ejemplo como fuente real.
Guardas: sin migración de notas entre fuentes ni aparentar escrituras remotas.

### Fase 5 — Verificación y entrega A

Ejecutar `npm run check`, `npm run test:contracts`, `npm run build` y comprobaciones
en navegador. Con backend disponible, validar su API sintética; para errores usar
respuestas controladas y casos de prueba. Consultar `docs/api.md` y tests backend
como referencia, sin modificar su implementación para hacer pasar el frontend.

Actualizar `docs/team-workflow.md`, `docs/api.md` y `.env.example` con la selección
por URL, valor por defecto, configuración privada y comportamiento sin backend.
Registrar que el selector está operativo pero no hay fuente real conectada.

Guardas: no dar por pasada una integración con backend real a partir de un fixture
de prueba; no publicar datos ni introducir nuevas dependencias por este control.

### Fase 6 — Contrato acordado e integración real, entrega B

Responsabilidad compartida: backend entrega lectura verificable; ambos acuerdan
`contracts/`; frontend incorpora adaptador y presentación. Referencias: análisis e
implementación aeróbicos existentes y requisitos de §7.

Verificar con muestra restaurada y custodia comprobada: agrupación de pruebas,
identidad contextual, ausencia/unidades/reloj, origen y límites en pantalla y CSV.
Si el original o endpoint aún no existen, conservar disponibilidad pendiente, sin
declarar completada esta fase ni activar «Datos reales» con un ejemplo sintético.

## 9. Matriz de aceptación

| Caso | Resultado requerido |
| --- | --- |
| Inicio sin entorno ni backend | Demo plenamente funcional |
| Click con backend sin configurar | Estado explicativo y regreso a mocks; ninguna petición a URL inventada |
| API 0.1 conectada | Datos sintéticos · Fuente Backend |
| Respuesta real en parser 0.1 | Rechazo de versión/formato; sin degradación a mock |
| API futura con origen real validado | Etiqueta real + tipo de origen; capacidades según evidencia |
| API vacía con meta sintética | Sin registros, sigue siendo Backend/sintético |
| API caída, timeout o JSON inválido | Error recuperable; no aparece historial mock como respuesta API |
| Persona conocida sin evaluaciones | Estado vacío válido; fuente y selector disponibles |
| Persona inexistente en esa fuente | Estado de persona no disponible; sin reasignación a Vega |
| Dos usuarios concurrentes eligen fuentes distintas | Ningún cambio global ni contaminación entre peticiones |
| IDs iguales en mocks y API | Selecciones, notas, sesiones y revisiones separadas |
| Copia preparada antes de cambiar | Mantiene fuente y contenido originales |
| Navegación por filtros, persona y vistas | Conserva source; no vuelve al default por omisión |
| Cambiar de fuente | Conserva preferencias; limpia identidades y protocolos del origen anterior |
| Recarga y atrás/adelante | URL y fuente efectiva coherentes |
| Clics rápidos y cargas demoradas | Último contexto comprometido consistente; sin relabel de contenido anterior |
| Investigación API sin lector real | Estado pendiente; no fallback al ejemplo |
| Una prueba real con cuatro etapas | Una prueba; tendencia bloqueada; no cuatro visitas |
| Origen desconocido o mixto | Sin etiqueta global «Datos reales» injustificada |
| Fuente cambiada durante exportación/revisión | Acción bloqueada mientras carga; snapshot ligado a fuente efectiva |
| 320–1440 px, texto 200 %, temas | Control legible y sin desbordamiento de página |
| Teclado y lector de pantalla | Acción y destino claros; estado anunciado sin depender del color |

## 10. Reparto y secuencia de cambios revisables

Frontend puede completar fases 1–5 con la API 0.1 actual. Backend mantiene su proveedor
y contrato sin cambios. El responsable de backend puede continuar en su rama sin
editar componentes ni lockfile raíz. La fase 6 se integra después de acordar la
respuesta; no exige mezclar ramas completas ni importar el store de navegador de main.

Commits propuestos para la entrega A:

1. Contexto de fuente por petición, navegación y tests puros.
2. Proveedor coherente y errores recuperables.
3. Control superior, carga y navegación accesible.
4. Aislamiento de borradores, investigación y revisiones.
5. Comprobación de integración y documentación de uso.

Cada commit debe dejar tipos y pruebas coherentes; estos bloques pueden agruparse
si separarlos produce un estado que no compila. No se incluyen cambios especulativos
de contrato en esos commits.

## 11. Documentación técnica para ejecutar el plan

Leer las versiones locales antes de implementar, como exige `AGENTS.md`:

- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`:
  `searchParams` asíncronos y lectura en servidor.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md`:
  `push`, `replace`, `refresh` y construcción segura de URLs internas.
- `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`:
  resultados para errores esperados frente a excepciones inesperadas.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`:
  recuperación con `retry()` de la versión instalada.
- `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`:
  configuración privada; no convertir el destino API en una variable pública.
- `src/lib/api/client.ts`, `data/service.ts`, `dashboard-state.ts` y
  `tests/aerobic-evidence.test.ts`: patrones reales del repositorio.
- [Preparación aeróbica](aerobic-data-integration-analysis.md) y
  [entrega previa](aerobic-data-integration-implementation.md): límites de origen,
  tiempo, comparabilidad y lectura real pendiente.

La documentación consultada orienta el plan; en esta entrega no se ejecutaron tests
de aplicación porque solo se añadió este documento. La verificación completa forma
parte de las fases de implementación, no de una afirmación sobre código aún inexistente.
