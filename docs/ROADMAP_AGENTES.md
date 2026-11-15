# Roadmap de construcción para agentes

Fecha: 14 de noviembre de 2026. Para cualquier agente de IA (o persona) que continúe Órbita. [ROADMAP.md](ROADMAP.md) define los niveles desde el producto; este documento dice cuándo está terminado cada uno; [PLAN_ORQUESTACION.md](PLAN_ORQUESTACION.md) reparte el trabajo en fases y módulos.

**Antes de tocar nada:** leer [../CLAUDE.md](../CLAUDE.md) y [../AGENTS.md](../AGENTS.md). Si este documento contradice a AGENTS.md o a PROPUESTA_FINAL.md, ganan ellos.

## Estado de partida (verificado el 14/11/2026)

| Existe | No existe |
|---|---|
| `demo/orbita.html`: maqueta de un archivo, datos ficticios, cubre el chequeo | Código modular del producto |
| Documentación de producto, evidencia (S, A, B) y datasets | Modelo de datos implementado |
| `scripts/check_docs.py`: consistencia entre matrices y documentos | Pruebas del producto |
| | Datos NASA cargados; los originales no están en el repo |
| Plan de orquestación, contratos y 24 órdenes de trabajo, en estado de propuesta | Procedimiento clínico elegido y revisado |

## Destino

Una aplicación local que permita a un astronauta completar un **episodio de cuidado** de principio a fin, con salud, adaptación y hábitat en un mismo historial, y que cambie su comportamiento según el equipo y la comunicación de la misión.

Se construye por niveles. **No se propone un MVP.** Si el tiempo se acaba, se entrega el nivel más alto que esté completo y se dice cuál es. No se reemplazan niveles sin terminar por aproximaciones.

## Decisiones técnicas y modelo de datos

Ya no viven en este documento, para que no haya dos copias que diverjan:

- **Decisiones D1–D9** (lenguaje, dependencias, persistencia, pruebas, estructura, forma de abrir, protección de datos, historial sin edición, sincronización simulada): [PLAN_ORQUESTACION.md](PLAN_ORQUESTACION.md). Siguen pendientes de confirmación del usuario.
- **Modelo de datos, reglas R1–R9 e interfaces:** [CONTRATOS.md](CONTRATOS.md).
- **Quién construye qué:** [modulos.csv](modulos.csv) y [ordenes/](ordenes/).

Este documento conserva lo que define cada **nivel** y el registro de relevos. Las compuertas del plan remiten a estas casillas.

## Niveles

Cada nivel termina con: revisión adversarial propia (¿rompí un invariante de un nivel anterior?), pruebas vistas fallar antes de pasar, y la tabla de estado de este documento actualizada.

### Nivel 0 — Núcleo de datos

**Fase F1, compuerta G1.** Módulos M01 núcleo, M02 misión, M03 catálogos, M04 almacén y M05 escenario sintético. Antes, la fase F0 (M00) deja los contratos en código.

**Terminado cuando:**
- [ ] Un registro sin `origen`, `metodo` o `momento` es rechazado con un mensaje que nombra el campo.
- [ ] Un identificador `007` se guarda y se recupera como `007`.
- [ ] Un valor ausente no aparece como 0 en ninguna salida.
- [ ] Un registro guardado no se puede editar ni borrar; una corrección es un registro nuevo.
- [ ] El escenario sintético se genera igual con la misma semilla y todo en él dice `sintetico`.
- [ ] Guardar, cerrar y reabrir recupera lo mismo; si el almacenamiento falla, la interfaz lo dice.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar.

### Nivel 1 — Comprender mi situación

**Fase F2, compuerta G2.** Módulos M06 lecturas, M07 interfaz base y las vistas M08–M12: Mi salud, Adaptación, Hábitat, Mi evolución y Mi día, leyendo del mismo almacén. Escenario sintético rotulado. Tres estados de registro visibles (mejora M2).

**Terminado cuando:**
- [ ] El mismo registro muestra el mismo valor, unidad y origen en todas las vistas.
- [ ] «Sin registro» y «sin novedad confirmada» se distinguen por texto, no solo por color.
- [ ] Un examen antiguo aparece como «última evaluación conocida» con su fecha.
- [ ] Un dato ambiental de otro módulo no aparece como exposición personal.
- [ ] La dosis acumulada, si se muestra, lleva unidad y el rótulo de requisito de programa (M5).
- [ ] Todo el recorrido funciona con teclado.

### Nivel 2 — Completar mi plan

**Fase F3, compuerta G3.** Módulos M13 procedimientos, M14 plan y M15 vistas Mi plan y A bordo. Usa la `ConfigMision` de dos ejes (mejora M3).

**Bloqueante humano:** elegir el procedimiento de la demo y su fuente (M6). Un agente no inventa pasos médicos. Sin esa decisión, se construye el motor con un procedimiento **de demostración rotulado como tal** y sin contenido clínico.

**Terminado cuando:**
- [ ] Con el equipo ausente, el procedimiento queda bloqueado, explica el motivo y no ofrece alternativa inventada.
- [ ] Una ejecución interrumpida se retoma donde quedó y no cuenta como completada.
- [ ] «No pude completar» se guarda con la dificultad.
- [ ] Cambiar la versión de un procedimiento no altera ejecuciones anteriores.
- [ ] Plan indicado, acción realizada y resultado observado son tres cosas distintas en pantalla.

### Nivel 3 — Revisar un cambio

**Fase F4, compuerta G4.** Módulos M16 episodio, M17 copiloto, M18 resumen, M19 privacidad y M20 vista Me siento distinto, con el catálogo (mejora M1), las reglas del copiloto (M4) y el resumen según el modo de comunicación.

**Terminado cuando:**
- [ ] El episodio se completa de observación a seguimiento y se recupera tras cerrar.
- [ ] La tarjeta muestra datos antes que sugerencia.
- [ ] Sin regla aplicable, dice «No hay orientación revisada para esto».
- [ ] Un episodio genera un solo aviso.
- [ ] El resumen exportado coincide con el historial y separa sintético, análogo y vuelo.
- [ ] Con comunicación diferida, el resumen se entiende sin contexto adicional.
- [ ] Generar el resumen no envía nada.
- [ ] Compartir con apoyo médico es una acción explícita que queda registrada (M9).
- [ ] Registrar una observación no pide desbloquear de nuevo dentro de la misma sesión (M9).

### Nivel 4 — Casos NASA reales, separados

**Fase F5, compuerta G5.** Módulos M21 importadores y M22 vista Casos NASA: un caso CRF y uno de adaptación (MR079G, MR080G o MR035G), en un visor separado del escenario sintético. Es un carril independiente de F3 y F4.

**Bloqueante:** los archivos originales no están en el repo. Se descargan desde las fichas de [DATASETS.md](DATASETS.md), se guardan sin modificar en `datos/originales/` y esa carpeta va a `.gitignore` hasta resolver permisos de redistribución.

**Terminado cuando:**
- [ ] Los valores mostrados coinciden con el archivo original, comprobado por una prueba.
- [ ] `Test_Phase` se conserva junto al día.
- [ ] Los comentarios clínicos libres de CRF no se importan.
- [ ] Ningún registro NASA aparece en el escenario sintético ni se une a otro sujeto.

### Cierre

**Fase F6, compuerta G6.** Módulo M23 empaquetado, si hay tiempo. Revisión adversarial integrada de los niveles alcanzados, y recién entonces la batería completa. Prueba formativa con voluntarios según M7. Actualizar README, LEEME_DEMO y este documento con lo que **realmente** se ejecutó.

## Bloqueantes que solo resuelve una persona

| Bloqueante | Quién | Afecta a |
|---|---|---|
| Confirmar las decisiones técnicas D1–D9 (compuerta G0) | Usuario | Todo el código |
| Elegir procedimiento de la demo y su fuente clínica | Usuario, con revisión competente | Nivel 2 |
| Confirmar [V1 4030] en NASA-STD-3001 vol. 1 rev. C | Cualquiera, abriendo el PDF de S03 | Nivel 1, radiación |
| Texto oficial del desafío 2026 y guía de evaluación | Usuario, desde el navegador | Presentación |
| Licencia del código | Equipo | Publicación |
| Reglas del evento sobre uso de IA | Usuario | Registro de procedencia |

## Protocolo de relevo entre agentes

Al terminar una sesión, el agente deja en este archivo:

1. La tabla de estado actualizada con lo verificado, no con lo intentado, y el `estado` de su módulo en [modulos.csv](modulos.csv) si el orquestador se lo pidió.
2. Qué casilla de qué nivel quedó a medias y por qué.
3. Qué supuso sin confirmar.

Cada agente verifica el estado real con `git status`, `git log` y las pruebas antes de creer lo que dice este documento. Un agente no asume que el paso de otro quedó bien hecho.

## Registro de relevos

| Fecha | Agente | Hecho y verificado | Pendiente |
|---|---|---|---|
| 2026-11-14 | Claude (sesión web) | Serie B de investigación, mejoras M1–M8, este roadmap, CLAUDE.md, `scripts/check_docs.py` ejecutado en verde | Nivel 0 sin empezar; ningún código de producto escrito |
| 2026-11-15 | Claude (sesión web) | B01, B03 y B06 leídos completos desde PDF del usuario; corregida la comparación de B03; mejora M9 de privacidad; `check_docs.py` en verde | Nivel 0 sin empezar; ningún código de producto escrito |
| 2026-11-14 | Claude (orquestador, sesión web) | Plan de orquestación, contratos v0.1, tablero y 24 órdenes; AGENTS.md, README, TECNICO y CLAUDE.md actualizados; `check_docs.py` ampliado y visto fallar de seis maneras; comprobado que `node --test` corre un módulo ES en Node 22 | Compuerta G0 sin aprobar: D1–D8 sin confirmar. Ningún módulo empezado. Nada comprobado en navegador |
| 2026-11-15 | Claude (orquestador, sesión web) | Decisión D9: envío a tierra con sincronización simulada (opción C simulada), elegida por el usuario; módulo M24 en F4 ola 3, contratos v0.2 con forma `Envio` e interfaz `sincronizacion`. Servidor real queda como nivel posterior | D1–D8 siguen sin confirmar. Ningún módulo empezado |
