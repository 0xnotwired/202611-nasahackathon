# Roadmap de construcción para agentes

Fecha: 14 de noviembre de 2026. Para cualquier agente de IA (o persona) que continúe Órbita. Complementa [ROADMAP.md](ROADMAP.md), que define los niveles desde el producto; este documento los baja a trabajo ejecutable.

**Antes de tocar nada:** leer [../CLAUDE.md](../CLAUDE.md) y [../AGENTS.md](../AGENTS.md). Si este documento contradice a AGENTS.md o a PROPUESTA_FINAL.md, ganan ellos.

## Estado de partida (verificado el 14/11/2026)

| Existe | No existe |
|---|---|
| `demo/orbita.html`: maqueta de un archivo, datos ficticios, cubre el chequeo | Código modular del producto |
| Documentación de producto, evidencia (S, A, B) y datasets | Modelo de datos implementado |
| `scripts/check_docs.py`: consistencia entre matrices y documentos | Pruebas del producto |
| | Datos NASA cargados; los originales no están en el repo |
| | Procedimiento clínico elegido y revisado |

## Destino

Una aplicación local que permita a un astronauta completar un **episodio de cuidado** de principio a fin, con salud, adaptación y hábitat en un mismo historial, y que cambie su comportamiento según el equipo y la comunicación de la misión.

Se construye por niveles. **No se propone un MVP.** Si el tiempo se acaba, se entrega el nivel más alto que esté completo y se dice cuál es. No se reemplazan niveles sin terminar por aproximaciones.

## Decisiones técnicas propuestas

Pendientes de confirmación del usuario. Un agente no las da por aprobadas: si necesita apartarse, lo consulta.

| Decisión | Propuesta | Motivo |
|---|---|---|
| Lenguaje | HTML, CSS y JavaScript sin transpilar, módulos ES | Regla de código propio; sin build que mantener |
| Dependencias de producto | Ninguna | AGENTS.md prohíbe incorporar paquetes funcionales |
| Persistencia | IndexedDB detrás de una interfaz propia; memoria como respaldo declarado | localStorage no resuelve transacciones ni volumen |
| Pruebas | `node --test`, incluido en Node; sin instalar nada | Sin dependencias de terceros |
| Estructura | `app/` nuevo; `demo/orbita.html` queda intacto | La maqueta es referencia y respaldo de presentación |

## Modelo de datos (invariantes desde el nivel 1)

Todo registro lleva estos campos. Faltar uno es un error de validación, no un valor por defecto.

```
Registro
  id            texto; nunca numérico (se conservan ceros iniciales)
  tipo          observacion | medicion | accion | ambiente | examen
  estado        registrado | confirmado_sin_novedad | sin_registro
  valor, unidad obligatorios si tipo = medicion y estado = registrado
  metodo        instrumento o «autoinforme»
  momento       fecha y hora; para ambiente, además intervalo
  origen        sintetico | analogo_terrestre | vuelo | cultivo_celular
  fuente        dataset o «ingresado por el usuario»
  fase_mision   texto de la configuración
  sujeto        identificador; nunca se mezclan sujetos
  lugar, sensor obligatorios si tipo = ambiente

Episodio        agrupa registros: qué registraste, qué sabemos, qué falta,
                qué podés hacer, qué ocurrió, qué sigue
Procedimiento   id, version, proposito, equipo_requerido[], preparacion[],
                pasos[], fuente, estado_revision
Ejecucion       procedimiento_id + version usada, estado
                (completada | interrumpida | no_pude | bloqueada), dificultades
ConfigMision    equipo_disponible[], comunicacion (tiempo_real | diferida | sin_enlace)
```

Reglas que no se negocian:

1. `sin_registro` nunca se convierte en `confirmado_sin_novedad`, ni al mostrar ni al exportar.
2. NA no es cero. Un valor ausente no entra en promedios ni gráficos como 0.
3. Dos registros solo se comparan si coinciden sujeto, unidad y método. Si no, la pantalla dice «no comparable» y por qué.
4. `origen` se muestra en toda pantalla y en toda exportación.
5. Una `Ejecucion` guarda la versión del procedimiento que usó.

## Niveles

Cada nivel termina con: revisión adversarial propia (¿rompí un invariante de un nivel anterior?), pruebas vistas fallar antes de pasar, y la tabla de estado de este documento actualizada.

### Nivel 0 — Núcleo de datos

**Construir:** `app/nucleo/` con validación de `Registro`, almacén con interfaz propia, y exportación a texto.

**Terminado cuando:**
- [ ] Un registro sin `origen`, `metodo` o `momento` es rechazado con un mensaje que nombra el campo.
- [ ] Un identificador `007` se guarda y se recupera como `007`.
- [ ] Un valor ausente no aparece como 0 en ninguna salida.
- [ ] Guardar, cerrar y reabrir recupera lo mismo; si el almacenamiento falla, la interfaz lo dice.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar.

### Nivel 1 — Comprender mi situación

**Construir:** Mi día, Mi salud, Adaptación, Hábitat y Mi evolución leyendo del mismo almacén. Escenario sintético rotulado. Tres estados de registro visibles (M2).

**Terminado cuando:**
- [ ] El mismo registro muestra el mismo valor, unidad y origen en todas las vistas.
- [ ] «Sin registro» y «sin novedad confirmada» se distinguen por texto, no solo por color.
- [ ] Un examen antiguo aparece como «última evaluación conocida» con su fecha.
- [ ] Un dato ambiental de otro módulo no aparece como exposición personal.
- [ ] La dosis acumulada, si se muestra, lleva unidad y el rótulo de requisito de programa (M5).
- [ ] Todo el recorrido funciona con teclado.

### Nivel 2 — Completar mi plan

**Construir:** Mi plan, motor de procedimientos propio, `ConfigMision` con sus dos ejes (M3).

**Bloqueante humano:** elegir el procedimiento de la demo y su fuente (M6). Un agente no inventa pasos médicos. Sin esa decisión, se construye el motor con un procedimiento **de demostración rotulado como tal** y sin contenido clínico.

**Terminado cuando:**
- [ ] Con el equipo ausente, el procedimiento queda bloqueado, explica el motivo y no ofrece alternativa inventada.
- [ ] Una ejecución interrumpida se retoma donde quedó y no cuenta como completada.
- [ ] «No pude completar» se guarda con la dificultad.
- [ ] Cambiar la versión de un procedimiento no altera ejecuciones anteriores.
- [ ] Plan indicado, acción realizada y resultado observado son tres cosas distintas en pantalla.

### Nivel 3 — Revisar un cambio

**Construir:** «Me siento distinto» con el catálogo (M1), tarjeta del copiloto con las reglas M4, resumen para apoyo médico según el modo de comunicación.

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

**Construir:** importadores propios para un caso CRF y uno de adaptación (MR079G, MR080G o MR035G), en un visor separado del escenario sintético.

**Bloqueante:** los archivos originales no están en el repo. Se descargan desde las fichas de [DATASETS.md](DATASETS.md), se guardan sin modificar en `datos/originales/` y esa carpeta va a `.gitignore` hasta resolver permisos de redistribución.

**Terminado cuando:**
- [ ] Los valores mostrados coinciden con el archivo original, comprobado por una prueba.
- [ ] `Test_Phase` se conserva junto al día.
- [ ] Los comentarios clínicos libres de CRF no se importan.
- [ ] Ningún registro NASA aparece en el escenario sintético ni se une a otro sujeto.

### Cierre

Revisión adversarial integrada de los niveles alcanzados, y recién entonces la batería completa. Prueba formativa con voluntarios según M7. Actualizar README, LEEME_DEMO y este documento con lo que **realmente** se ejecutó.

## Bloqueantes que solo resuelve una persona

| Bloqueante | Quién | Afecta a |
|---|---|---|
| Confirmar las decisiones técnicas propuestas | Usuario | Nivel 0 |
| Elegir procedimiento de la demo y su fuente clínica | Usuario, con revisión competente | Nivel 2 |
| Confirmar [V1 4030] en NASA-STD-3001 vol. 1 rev. C | Cualquiera, abriendo el PDF de S03 | Nivel 1, radiación |
| Texto oficial del desafío 2026 y guía de evaluación | Usuario, desde el navegador | Presentación |
| Licencia del código | Equipo | Publicación |
| Reglas del evento sobre uso de IA | Usuario | Registro de procedencia |

## Protocolo de relevo entre agentes

Al terminar una sesión, el agente deja en este archivo:

1. La tabla de estado actualizada con lo verificado, no con lo intentado.
2. Qué casilla de qué nivel quedó a medias y por qué.
3. Qué supuso sin confirmar.

Cada agente verifica el estado real con `git status`, `git log` y las pruebas antes de creer lo que dice este documento. Un agente no asume que el paso de otro quedó bien hecho.

## Registro de relevos

| Fecha | Agente | Hecho y verificado | Pendiente |
|---|---|---|---|
| 2026-11-14 | Claude (sesión web) | Serie B de investigación, mejoras M1–M8, este roadmap, CLAUDE.md, `scripts/check_docs.py` ejecutado en verde | Nivel 0 sin empezar; ningún código de producto escrito |
| 2026-11-15 | Claude (sesión web) | B01, B03 y B06 leídos completos desde PDF del usuario; corregida la comparación de B03; mejora M9 de privacidad; `check_docs.py` en verde | Nivel 0 sin empezar; ningún código de producto escrito |
