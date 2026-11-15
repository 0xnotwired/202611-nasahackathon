# CLAUDE.md — guía de sesión para agentes en Órbita

## Qué es este archivo y quién gana

- **[AGENTS.md](AGENTS.md)** es el manual del producto: alcance, reglas de evidencia, cómo se construye por módulos, invariantes del recorrido. **Si este archivo lo contradice, gana AGENTS.md.**
- El orden completo de autoridad entre archivos está al principio de AGENTS.md. Este archivo va último: no define producto.
- **CLAUDE.md** (este archivo) cubre lo que AGENTS.md no: cómo trabajar una sesión sin repetir errores que ya ocurrieron acá, y por dónde seguir.

No repite el README ni AGENTS.md. Leelos.

## Orden de lectura para una sesión nueva

1. [AGENTS.md](AGENTS.md)
2. [docs/PROPUESTA_FINAL.md](docs/PROPUESTA_FINAL.md) — qué es el producto
3. [docs/MEJORAS_PROPUESTA.md](docs/MEJORAS_PROPUESTA.md) — qué cambió y por qué
4. [docs/PLAN_ORQUESTACION.md](docs/PLAN_ORQUESTACION.md) — fases, módulos, roles y compuertas
5. [docs/CONTRATOS.md](docs/CONTRATOS.md) y tu orden en [docs/ordenes/](docs/ordenes/), si vas a construir o revisar un módulo
6. [docs/ROADMAP_AGENTES.md](docs/ROADMAP_AGENTES.md) — cuándo está terminado cada nivel, y el registro de relevos
7. [docs/DATASETS.md](docs/DATASETS.md) antes de tocar datos

Si sos constructor o revisor, tu rol y el formato de tu informe están en el plan. Si nadie te asignó un módulo, no empieces uno: preguntá.

## Mapa del repositorio

```
AGENTS.md                 manual del producto; gana sobre este archivo
CLAUDE.md                 esta guía
README.md                 presentación para personas
demo/orbita.html          maqueta de un archivo, datos ficticios; NO se modifica al construir app/
docs/PROPUESTA_FINAL.md   propuesta vigente y criterios de aceptación
docs/MEJORAS_PROPUESTA.md mejoras M1–M9 derivadas de la serie B
docs/ROADMAP.md           niveles desde el producto
docs/PLAN_ORQUESTACION.md fases, olas, módulos, roles, compuertas
docs/CONTRATOS.md         interfaces entre módulos y reglas R1–R9; solo el orquestador lo edita
docs/modulos.csv          tablero: rutas propias, dependencias y estado de cada módulo
docs/ordenes/             una orden de trabajo por módulo (M00–M24)
docs/ROADMAP_AGENTES.md   casillas de cada nivel + registro de relevos
docs/BASE_ACADEMICA.md    fuentes S01–S18 (y copia de A01–A06)
docs/INVESTIGACION_APLICADA.md    fuentes A01–A06
docs/INVESTIGACION_AMPLIADA_B.md  fuentes B01–B18, con nivel de lectura
docs/MATRIZ_*.csv         una fila por fuente o afirmación
docs/DATASETS.md          qué hay en NLSP/OSDR y sus límites de integración
scripts/check_docs.py     consistencia de matrices, tablero de módulos y enlaces
app/                      aún no existe; ahí va el producto, una carpeta por módulo
```

## La regla central

**Órbita nunca presenta como sabido algo que no se sabe.** Casi todo lo demás es consecuencia:

- «Sin registro» no es «sin novedad». NA no es cero.
- Un análogo terrestre no es un astronauta. Dos cohortes no son una persona.
- El silencio del copiloto no es «todo bien».
- Una cifra leída en un resumen no es una cifra verificada.

Las dos direcciones de error no pesan igual. Mostrar «sin evaluar» cuando había dato es molesto y se nota. Mostrar «normal» cuando no había dato es silencioso y es el error que este producto existe para evitar. **Ante la duda, mostrar menos certeza.**

## Errores que ya ocurrieron en este repo

Cada regla viene de un hecho de la sesión del 14/11/2026. Ninguna tiene imposición automática salvo donde se indica.

### 1. Atribuir autores o revistas de memoria

Al redactar la serie B se escribieron tres atribuciones que no estaban en ninguna fuente recuperada («Lyell 2017», «Jones 2024», «JAMA Ophthalmol 2020»). Se detectaron en revisión y se quitaron antes del commit.

**Regla:** autor, año, revista y cifra solo se escriben si están en el texto que se recuperó en esa sesión. Si no, se cita por título o URL.
**Mecanismo:** ninguno automático. Revisión manual.

### 2. Citar cifras de un resumen como si fueran del artículo

PMC devolvió una verificación de navegador en lugar del artículo en varias descargas, así que la serie B se escribió casi entera desde resúmenes. Cuando el usuario aportó los PDF de B01, B03 y B06 (15/11), la lectura completa **corrigió una afirmación**: el «diez veces más que los registros médicos» de B03 compara cohortes distintas, no a las mismas personas, y ya se había trasladado a MEJORAS_PROPUESTA.md. Hoy son TC B01, B03, B06, B07 y B09.

**Regla:** toda fuente nueva lleva nivel de lectura: `TC` (texto completo), `R` (resumen) o `S` (fragmento o fuente secundaria). Una cifra de nivel R o S no va a la presentación sin abrir el original.
**Mecanismo:** columna `nivel_lectura` en `MATRIZ_INVESTIGACION_B.csv`. El script no valida su contenido. Al subir una fuente a TC, buscar con `grep` cada afirmación que dependía de ella en los otros documentos: una corrección en un solo archivo deja la versión errónea viva en otro.

Los PDF que aporta el usuario se leen pero **no se suben al repo**: no todos tienen licencia abierta (B03 no la tiene).

### 3. Páginas de NASA que parecen vacías

`nlsp.nasa.gov` y `osdr.nasa.gov` cargan su contenido con JavaScript: una lectura simple devuelve solo el título del portal. `spaceappschallenge.org` bloquea la lectura automática.

**Regla:** «la página no tiene datos» no es una conclusión válida para estos sitios. Usar los endpoints de API anotados en DATASETS.md, o pedir el archivo al usuario. El texto oficial del desafío 2026 **no está verificado**; REQUIREMENTS.md conserva la versión del usuario.

### 4. La palabra «MVP»

Apareció en dos documentos (hallazgo A01) pese a que el proyecto se construye por niveles. Corregida el 14/11.

**Regla:** no proponer MVP, «versión rápida» ni prototipo descartable. Bajo presión de tiempo se construyen menos niveles, completos.
**Mecanismo:** `grep -rn "MVP" docs README.md` debe devolver solo las menciones que niegan el término.

### 5. Documentos duplicados

`INVESTIGACION_APLICADA.md` está copiado dentro de `BASE_ACADEMICA.md`. La corrección del punto 4 hubo que hacerla dos veces.

**Regla:** al editar una afirmación de A01–A06, buscarla en ambos archivos. No crear una tercera copia.

## Valores que son decisiones, no descuidos

| Valor | Dónde | Por qué no «normalizarlo» |
|---|---|---|
| 6–8 voluntarios | PROPUESTA_FINAL, prueba formativa | Tamaño de detección de problemas, no de validación; su límite está declarado (B14) |
| 600 mSv | MEJORAS M5 | Requisito de programa leído en un resumen técnico; **sin confirmar** en S03. No mostrar hasta confirmarlo |
| Tres estados de registro | ROADMAP_AGENTES, modelo de datos | No colapsar a dos: es la mejora M2 |
| Un aviso por episodio | MEJORAS M4 | No es un límite arbitrario; viene de B13 |

No existen umbrales clínicos en este repo. Si aparece uno en el código, es un error.

## Comandos verificados

Ejecutados el 14/11/2026 en la rama `claude`:

```bash
python3 scripts/check_docs.py
```

Un resultado `OK` prueba esto y solo esto: las matrices A y B se leen como CSV y sus ids coinciden con los de sus documentos; cada módulo de `docs/modulos.csv` tiene su orden; las rutas propias no se solapan; cada dependencia está en una fase u ola anterior; el plan nombra los mismos módulos; y los enlaces relativos entre `.md` resuelven. **No prueba** que las cifras sean correctas, que las fuentes digan lo que se afirma, ni que un agente haya respetado sus rutas al escribir código. El script se vio fallar por un enlace roto real y por seis roturas deliberadas del tablero (solape de rutas, dependencia posterior, dependencia en la misma ola, orden huérfana, estado desconocido, dependencia inexistente).

No hay build, lint ni pruebas de producto: no existe código de producto todavía. La maqueta se abre en un navegador. No inventar otros comandos.

`node --test` será el comando de pruebas cuando M00 cree `package.json`. Se comprobó el 14/11 que corre un módulo ES con su prueba en Node 22 sin instalar nada. Nada se comprobó en un navegador.

## Git

Aplica la disciplina de `git-discipline`: etiqueta de restauración antes de cada sesión (`git tag -a pre-session-<fecha>`), solo operaciones que agregan historia (`commit`, `merge`, `revert`), nunca `rebase`, `squash` ni `push --force`, y verificar con `git status` y `git log` antes de afirmar un estado.

- **Nadie hace commit directo a la rama por defecto**: ni el dueño, ni el equipo, ni un agente. AGENTS.md lo exige porque es un repo de equipo. Se trabaja en ramas y se propone por PR.
- **Tener acceso de escritura no es permiso para `git commit` ni `git push`.** Cada commit y cada push necesita una instrucción del usuario para esa tarea. Una autorización vale para esa acción, no para el resto de la sesión.
- La rama `claude` se creó y se subió el 14/11/2026 por instrucción explícita del usuario. Es la rama de integración.
- Las ramas de módulo se llaman `mod/mNN-nombre`. **No `claude/...`**: Git responde `cannot lock ref` mientras exista la rama `claude`. Comprobado el 14/11.
- Los commits de un agente llevan el prefijo `docs(agent):`, `feat(agent):` o `fix(agent):` para poder filtrarlos, y la línea de coautoría que indique la sesión.
- Todo archivo desechable de prueba entra a `.gitignore` en la misma acción que lo crea.

## Skills de Anna

El usuario pide aplicar siempre las skills de `github.com/annatchijova/SKILLS`. No están instaladas en este repo: se leen desde un clon. Las que más pesan acá:

| Skill | Dónde se aplica |
|---|---|
| `destination-driven-construction` | Niveles del roadmap; sin MVP |
| `claim-provenance-discipline` | Toda afirmación científica; niveles de lectura |
| `honest-degradation` | Tres estados de registro; almacenamiento que falla a la vista |
| `validate-at-the-boundary` | Validación de `Registro` al entrar |
| `falsifiable-testing` | Ver cada prueba fallar antes de confiar en ella |
| `secure-by-construction` | Datos de salud: modelo de amenaza antes del código |
| `surgical-patcher` | Editar por anclas; no reescribir archivos enteros |
| `llm-out-of-the-loop` | El copiloto decide con reglas explícitas; un modelo, si lo hubiera, solo narra |
| `readme-architecture`, `honest-technical-oratory` | README y presentación |

`terminal-first` y `working-on-main` son preferencias personales de su autora y **no** se aplican acá: este repo exige ramas.

## Antes de dar algo por terminado

- [ ] Ninguna pantalla ni exportación muestra «sin registro» como «sin novedad», ni NA como cero. *(Regla central)*
- [ ] Todo dato muestra su origen: sintético, análogo terrestre o vuelo. *(Regla central; AGENTS.md)*
- [ ] Toda fuente nueva tiene nivel de lectura, y ningún autor, año o cifra salió de memoria. *(Errores 1 y 2)*
- [ ] Si se tocó A01–A06, el cambio está en los dos archivos. *(Error 5)*
- [ ] `grep -rn "MVP"` no encontró propuestas de MVP. *(Error 4)*
- [ ] No se añadió ningún umbral clínico ni se «normalizó» un valor de la tabla de decisiones.
- [ ] `python3 scripts/check_docs.py` da `OK`, y el informe dice qué prueba eso y qué no. *(Comandos verificados)*
- [ ] `git status` y `git log` consultados antes de informar el estado. *(Git)*
- [ ] Commit y push solo con autorización para esta tarea, en una rama. *(Git)*
- [ ] Si construiste un módulo: `git diff --stat` solo muestra tus rutas propias y no tocaste `docs/CONTRATOS.md`. *(AGENTS.md, Construcción por módulos)*
- [ ] El registro de relevos de `docs/ROADMAP_AGENTES.md` refleja lo verificado, no lo intentado.
