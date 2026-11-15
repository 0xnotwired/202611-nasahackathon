# Órbita: contratos entre módulos

Versión 0.1 · 14 de noviembre de 2026 · **propuesta**, pendiente de la compuerta G0. Solo el orquestador edita este archivo. M00 lo traduce a `app/contratos/` (definiciones JSDoc) y a pruebas de contrato en `pruebas/contrato/`. Si este documento y esos archivos discrepan, gana este documento y se corrige el código.

Plan y módulos: [PLAN_ORQUESTACION.md](PLAN_ORQUESTACION.md). Fundamento de las reglas: [MEJORAS_PROPUESTA.md](MEJORAS_PROPUESTA.md) y [AGENTS.md](../AGENTS.md).

## 1. Convenciones

- **Módulos ES**, archivos `.js`, `package.json` con `"type": "module"`. El mismo archivo corre en Node y en el navegador.
- **Una sola puerta.** Cada módulo exporta por su `index.js`. Nadie importa un archivo interno de otro módulo.
- **Resultado, no excepción.** Toda función que puede fallar por una causa prevista devuelve `{ ok: true, valor }` o `{ ok: false, error: { codigo, campo?, mensaje } }`. Las excepciones quedan para errores de programación.
- **`mensaje` nombra el problema.** «Falta el campo `origen`», no «dato inválido».
- **Tiempo.** Cadenas ISO 8601 en UTC. El dominio no lee el reloj: recibe `reloj()` por parámetro. Los identificadores se generan con una función inyectada.
- **Identificadores.** Siempre texto. `"007"` no es `7`.
- **Nombres.** Español sin tildes ni eñes en identificadores (`mision`, `anio`).
- **Asíncrono.** El almacén y todo lo que lo usa devuelven promesas.
- **Sin dependencias.** Ningún `import` apunta fuera del repo, salvo módulos `node:` en pruebas y scripts.

## 2. Reglas que ningún módulo puede romper

| # | Regla | Dónde se comprueba |
|---|---|---|
| R1 | `sin_registro` nunca se convierte en `confirmado_sin_novedad`, ni al guardar, ni al mostrar, ni al exportar | Prueba de contrato de M01; recorrido de G1 y G4 |
| R2 | Un valor ausente no es cero: no entra en promedios, sumas ni gráficos | M06 |
| R3 | Dos registros se comparan solo si coinciden sujeto, variable, unidad y método. Si no, se devuelve el motivo | M01, M06 |
| R4 | `origen` viaja con el dato hasta la pantalla y la exportación | Todos |
| R5 | Una ejecución guarda la versión del procedimiento que usó | M13 |
| R6 | Ningún módulo contiene umbrales clínicos, puntuaciones ni diagnósticos | Revisión; no hay mecanismo automático |
| R7 | Un registro guardado no se modifica ni se borra. Corregir es añadir un registro con `corrige` | M04 |
| R8 | Nada sale del dispositivo sin una acción explícita del astronauta, que queda registrada | M18, M19 |
| R9 | Los datos de un sujeto no se mezclan con los de otro, y un dato de NASA nunca se asigna al sujeto sintético | M04, M21 |

Las dos direcciones de error no pesan igual. Ante la duda, un módulo devuelve «sin evaluar» o «no comparable»: es visible y molesto. Devolver «normal» sin dato es silencioso y es el fallo que el producto existe para evitar.

## 3. Datos

Todo objeto guardado lleva `version_esquema`. Al leer una versión desconocida o más nueva, el almacén se niega y lo dice; no la interpreta como la actual.

```
Registro
  id              texto
  version_esquema número entero
  tipo            observacion | medicion | accion | ambiente | examen
  estado          registrado | confirmado_sin_novedad | sin_registro
  variable        texto del catálogo (p. ej. "pulso", "dolor_de_cabeza", "co2")
  valor, unidad   obligatorios si tipo es medicion, ambiente o examen y estado es registrado
  metodo          instrumento o "autoinforme"
  momento         ISO 8601; para ambiente, además intervalo { desde, hasta }
  origen          sintetico | analogo_terrestre | vuelo | cultivo_celular
  fuente          id del catálogo de fuentes, o "ingresado_por_el_usuario"
  fase_mision     texto
  sujeto          texto
  lugar, sensor   obligatorios si tipo es ambiente
  corrige         id de otro registro, opcional
  nota            texto estructurado corto, opcional; nunca comentario clínico libre

ConfigMision
  id, nombre
  equipo_disponible   lista de ids del catálogo de equipo
  comunicacion        tiempo_real | diferida | sin_enlace
  fases               lista de { nombre, desde, hasta }

Procedimiento
  id, version, titulo, proposito
  equipo_requerido    lista de ids de equipo
  preparacion         lista de pasos de comprobación
  pasos               lista de { id, texto, registra?: variable }
  fuente, estado_revision   borrador | demostracion | revisado
  alternativa_documentada   id de otro procedimiento, opcional; nunca se deduce

Ejecucion
  id, procedimiento_id, procedimiento_version, sujeto
  estado          bloqueada | en_curso | interrumpida | completada | no_pude
  paso_actual, iniciado, actualizado
  dificultades    lista de textos estructurados
  registros       ids de los Registro producidos

Tarea
  id, sujeto, dia, procedimiento_id?, descripcion
  indicada_por    fuente del plan
  cumplimiento    pendiente | realizada | no_realizada
  ejecucion_id?   enlace a lo que se hizo
  resultado_ids   enlaces a lo que se observó después

Episodio
  id, sujeto, abierto, cerrado?
  observacion_id      el Registro que lo inició
  ejecucion_ids, registro_ids, tarea_ids
  aviso_emitido       booleano

Compartido
  id, sujeto, momento, que (ids o "resumen:<id>"), con, medio

Envio
  id                  único; el receptor lo usa para no duplicar
  compartido_id       el Compartido que lo originó
  sujeto, que
  creado              cuándo se generó el contenido
  enviado             cuándo salió de la cola
  recibido?           cuándo lo recibió tierra; ausente si no llegó
  estado              en_cola | en_transito | recibido
```

«Indicada», «realizada» y «resultado» son tres cosas distintas: `Tarea.cumplimiento`, `Ejecucion` y `resultado_ids`. Una tarea realizada no implica un resultado.

## 4. Interfaces

### nucleo (M01)

```
ESTADOS, TIPOS, ORIGENES, VERSION_ESQUEMA
validarRegistro(dato)                    → Resultado<Registro>
crearRegistro(campos, { reloj, nuevoId }) → Resultado<Registro>
sonComparables(a, b)                     → { comparable: boolean, motivo?: texto }
```

### mision (M02)

```
validarConfig(dato)              → Resultado<ConfigMision>
tieneEquipo(config, equipoId)    → boolean
faseEn(config, momento)          → texto | null
```

### catalogos (M03)

```
observaciones()  → [{ id, etiqueta, fuente_ids }]      catálogo de «Me siento distinto»
variables()      → [{ id, etiqueta, unidad, tipo }]
equipos()        → [{ id, etiqueta }]
fuentes()        → [{ id, cita, nivel_lectura, url }]
```

Toda entrada de `observaciones()` lleva al menos una fuente. Los datos de catálogo son contenido revisable, no reglas.

### almacen (M04)

```
abrirAlmacen({ tipo: "indexeddb" | "memoria", nombre }) → Promise<Resultado<Almacen>>

Almacen
  estado()                         → { tipo, persistente: boolean, motivo?: texto }
  guardar(coleccion, objeto)       → Promise<Resultado<objeto>>     falla si el id ya existe
  obtener(coleccion, id)           → Promise<Resultado<objeto>>
  listar(coleccion, filtro)        → Promise<Resultado<objeto[]>>   filtro por igualdad y rango de momento
  guardarLote(coleccion, objetos)  → Promise<Resultado<n>>          todo o nada
  actualizarEstado(coleccion, id, cambios) → solo para Ejecucion, Tarea y Episodio
  cerrar()                         → Promise<void>
```

Colecciones: `registros`, `ejecuciones`, `tareas`, `episodios`, `compartidos`, `config`. `registros` y `compartidos` no admiten `actualizarEstado` (R7). Si IndexedDB no está, `abrirAlmacen` con `"indexeddb"` devuelve error; quien llama decide usar `"memoria"` y lo muestra.

### escenario (M05)

```
generarEscenario({ semilla }) → { config: ConfigMision[], registros, tareas, procedimientos }
```

Determinista: la misma semilla produce los mismos datos. Todo registro lleva `origen: "sintetico"`. Incluye huecos, un examen antiguo, un dato ambiental de otro módulo y las dos configuraciones de la demo.

### lecturas (M06)

```
serie(almacen, { sujeto, variable, desde, hasta })
   → { puntos, huecos, n, grupos_no_comparables }
ultimo(almacen, { sujeto, variable }, { reloj })
   → { registro | null, antiguedad_dias | null }
lineaDeBase(almacen, { sujeto, variable, hasta })
   → { n, desde, hasta }                 cuántas mediciones hay; ningún juicio
ambiente(almacen, { lugar, intervalo })
   → { registros, cobertura: { desde, hasta, sensores } }
acumulado(almacen, { sujeto, variable, desde, hasta })
   → { total | null, unidad, n, huecos }  total es null si no hay ningún dato
```

`lecturas` no decide qué es normal. Devuelve datos y cuánto los sostiene.

### procedimientos (M13)

```
validarProcedimiento(dato)             → Resultado<Procedimiento>
disponibilidad(procedimiento, config)  → { disponible, faltantes: equipoId[], alternativa_id? }
iniciar(almacen, procedimiento, config, { sujeto, reloj, nuevoId }) → Resultado<Ejecucion>
avanzar(almacen, ejecucionId, { registro? })   → Resultado<Ejecucion>
interrumpir(almacen, ejecucionId, { motivo })  → Resultado<Ejecucion>
retomar(almacen, ejecucionId)                  → Resultado<Ejecucion>
cerrar(almacen, ejecucionId, { estado: "completada" | "no_pude", dificultades })
```

Con equipo faltante, `iniciar` devuelve una ejecución `bloqueada` con sus `faltantes`. `alternativa_id` solo aparece si el procedimiento la declara.

### plan (M14)

```
tareasDe(almacen, { sujeto, dia })                           → Resultado<Tarea[]>
marcar(almacen, tareaId, { cumplimiento, ejecucion_id?, nota? }) → Resultado<Tarea>
vincularResultado(almacen, tareaId, registroId)              → Resultado<Tarea>
```

### privacidad (M19)

```
crearSesion({ reloj })           → Sesion
Sesion.desbloquear(), .activa(), .cerrar()
registrarCompartido(almacen, { sujeto, que, con, medio }, { reloj, nuevoId }) → Resultado<Compartido>
compartidos(almacen, { sujeto }) → Resultado<Compartido[]>
```

Una sesión activa no vuelve a pedir desbloqueo. Este módulo no cifra y no debe afirmar que protege datos en disco.

### episodio (M16)

```
abrir(almacen, observacion, { reloj, nuevoId })  → Resultado<Episodio>
situacion(almacen, episodioId, config, { reloj })
   → { registraste, sabemos, falta, podes, ocurrio, sigue }
vincular(almacen, episodioId, { ejecucion_id?, registro_id?, tarea_id? })
cerrar(almacen, episodioId)
```

`situacion` arma las seis partes del episodio. `falta` incluye lo que está `sin_registro` y el equipo ausente. `podes` lista procedimientos con su `disponibilidad`.

### copiloto (M17)

```
tarjeta(situacion, config, reglas)
   → { datos, faltantes, sugerencia | null, sin_orientacion: boolean,
       no_evaluado, aviso: { texto } | null }
```

Función pura. `datos` y `faltantes` van primero. Si ninguna regla aplica, `sugerencia` es `null` y `sin_orientacion` es `true`. Toda sugerencia lleva `fuente`, `version` y `estado_revision`. `aviso` es `null` si el episodio ya emitió uno. Las `reglas` son datos; el módulo no trae ninguna regla clínica.

### resumen (M18)

```
generar(almacen, episodioId, config, { reloj })
   → Resultado<{ id, texto, origenes, pendiente_de_envio: boolean }>
```

`generar` no envía nada. El texto separa lo sintético, lo análogo y lo de vuelo, y distingue los tres estados de registro. Con `comunicacion: "diferida"` el texto se entiende solo: qué pasó, qué se midió y cómo, qué falta, qué se pide. Compartir pasa por `privacidad.registrarCompartido`.

### importadores (M21)

```
importarCRF(texto)        → Resultado<{ registros, rechazados, omitidos }>
importarAdaptacion(texto, { estudio }) → Resultado<{ registros, rechazados, omitidos }>
```

El texto importado es una entrada no confiable: se valida fila por fila. Los registros salen con `origen: "analogo_terrestre"`, el `sujeto` del archivo y `Test_Phase` en `fase_mision`. Los comentarios clínicos libres no se importan; `omitidos` dice cuántos.

### sincronizacion (M24)

```
crearEnlace({ reloj, modo, demora_ms })        → Enlace     modo: tiempo_real | demora | sin_enlace
Enlace.cambiarModo(modo, demora_ms?)
encolar(almacen, compartidoId, { reloj, nuevoId }) → Resultado<Envio>
avanzar(almacen, enlace, { reloj })             → Resultado<Envio[]>   entrega lo que corresponde según el modo
recibidos(almacen, { sujeto? })                → Resultado<Envio[]>   lo que ve el panel en tierra
```

Simulado: no hay red ni servidor. Solo se encola lo que ya pasó por `privacidad.registrarCompartido`; nada sale sin esa acción. Un envío entregado dos veces se recibe una vez (por `id`). `recibidos` no incluye a quien no envió nada, y la vista de tierra muestra «sin envíos» en lugar de un estado inventado. La interfaz de usuario rotula «sincronización simulada». Un servidor real implementará estas mismas funciones.

## 5. Interfaz de usuario

Cada vista es una carpeta con dos piezas:

```
modelo.js   modelo(servicios, parametros) → Promise<ModeloVista>   sin DOM; se prueba en Node
vista.js    montar(elemento, modeloVista, acciones)                 solo DOM
```

`ModeloVista.estado` es uno de `cargando`, `vacio`, `error`, `listo`. `vacio` dice por qué está vacío; `error` nombra el fallo. Una vista sin implementar muestra «todavía no disponible».

M07 entrega los componentes que todas las vistas usan, para que el mismo dato se vea igual en todas:

- `etiquetaEstado(registro)`: registrado, sin novedad confirmada o sin registro, **con texto**.
- `etiquetaOrigen(origen)`: sintético, análogo terrestre o vuelo.
- `datoConContexto(registro)`: valor, unidad, método, momento y antigüedad.
- `tablaAccesible`, `graficoDeLinea` (SVG propio, con huecos visibles y tabla equivalente).

Todo se usa con teclado. Ningún estado se comunica solo con color. Las vistas reciben `servicios` por parámetro y no importan `almacen`.

## 6. Cambiar un contrato

1. El constructor describe el cambio en su informe y no lo aplica.
2. El orquestador decide, edita este archivo y sube la versión.
3. Anota el cambio abajo y avisa a los módulos afectados.

| Versión | Fecha | Cambio | Módulos afectados |
|---|---|---|---|
| 0.1 | 2026-11-14 | Versión inicial | Todos |
| 0.2 | 2026-11-15 | Forma `Envio` e interfaz `sincronizacion` (D9, opción C simulada) | M24; M19 y M18 solo como proveedores |
