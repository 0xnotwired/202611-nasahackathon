# Órbita: salud, adaptación física y hábitat en un mismo producto

Fecha: 14 de noviembre de 2026. Estado: dirección de producto ampliada por el usuario para integrar salud personal, adaptación física y hábitat, con copiloto y procedimientos A bordo. La maqueta HTML y el video de la sesión ilustran principalmente el chequeo y no representan todavía todo este alcance. El diseño funcional siguiente es una propuesta; no es un producto clínico validado.

## 1. Decisión y alcance

El usuario eligió «Órbita con los procedimientos de A bordo» y pidió concretarlo como copiloto de astronauta. El recorrido confirmado es:

> Me siento distinto → registro lo que ocurre → la herramienta me ayuda a medir correctamente → veo mi evolución → entiendo el siguiente paso.

Órbita es el producto personal de salud del astronauta. Reúne el estado registrado, la adaptación de su condición física, el entorno y el plan de cuidado durante la misión. A bordo contiene procedimientos que guían las tareas. El copiloto conecta esa información con preguntas pertinentes, explicaciones y acciones accesibles. La forma conversacional es una opción de interfaz, no una obligación de usar un modelo generativo.

**DEC-001 — Integrar seguimiento y procedimientos en ese recorrido (histórica; alcance ampliado por DEC-002).** La elección inicial conectó Órbita y A bordo. La documentación trató adaptación física y ambiente como extensiones; el usuario corrigió ese alcance posteriormente. Se conserva el recorrido de registro, medición, evolución y acción.

**DEC-002 — Integrar salud, adaptación física y hábitat como alcance central.** El usuario pidió expresamente un mismo producto para usuario final, incorporando las propuestas de adaptación y hábitat y cumpliendo los objetivos del desafío aportados en la sesión. Estos dominios dejan de ser extensiones opcionales del concepto elegido. El copiloto acompaña tanto la rutina preventiva como la revisión de un cambio; su función no se limita al chat o al registro de síntomas. La selección concreta de pantallas y fuentes sigue siendo diseño propuesto. La unión de los datos depende de compatibilidad temporal, espacial y de participante, todavía no comprobada entre todas las fuentes. Se revisará la integración de cada caso si faltan datos compatibles o las pruebas de tareas muestran confusión; esto no justifica volver a presentar el concepto como un mero chequeo sin explicitar el cambio. La maqueta es reversible, pero ampliarla requiere modificar y volver a verificar las vistas y recorridos afectados. No están decididos stack definitivo, misión, dispositivos, IA generativa, operación sin conexión ni umbrales clínicos.

### 1.1. Usuario y utilidad cotidiana

El usuario principal es el astronauta. Al entrar debería comprender qué información de salud tiene disponible, qué cambió, qué mediciones o acciones le corresponden y cómo seguir su plan. Se proponen dos entradas complementarias: «Mi día» para prevención, rutina y seguimiento, y «Me siento distinto» para revisar una observación. El resumen para el equipo médico es un resultado del recorrido, no el centro del producto.

### 1.2. Dominios integrados y acciones

| Dominio | Información pertinente | Uso para el astronauta |
|---|---|---|
| Salud personal | Signos vitales, síntomas, descanso y contexto de alimentación/actividad. | Registrar, entender evolución y consultar el procedimiento aplicable. |
| Adaptación física | Masa corporal, fuerza, resistencia, capacidad aeróbica e historial óseo como variables diferentes. | Comparar pruebas compatibles, revisar ejercicio y nutrición registrados y seguir el plan asignado. |
| Hábitat | Temperatura, humedad, CO₂ y radiación cuando existan fuentes verificadas para el caso. | Revisar el entorno del lugar y momento, conocer su significado y seguir el procedimiento ambiental pertinente. |

El plan de cuidado conecta los dominios con acciones: mediciones y pruebas programadas, ejercicio y nutrición prescritos, revisión ambiental, seguimiento y consulta. Los procedimientos A bordo explican propósito, equipo, instrucciones y condiciones de atención con fuentes aplicables. El diseño debe contemplar orientación sobre prevención, mejoras y tratamientos documentados cuando corresponda, sin inventar una prescripción a partir de un gráfico.

Las frecuencias dependen del protocolo y del equipo. No convertir toda prueba en una tarea diaria: una DXA previa o posterior al vuelo puede aportar historial, pero no debe presentarse como equipo disponible a bordo sin verificarlo. Un autorreporte de ejercicio no es una medición de fuerza, y peso o masa no equivalen a densidad ósea.

### 1.3. Un mismo historial de misión

La evolución debe permitir revisar salud, pruebas físicas, actividad/contramedidas y eventos ambientales en el periodo pertinente. Conservar fuente, unidad, método, sujeto, fase y, para ambiente, lugar/sensor y tiempo. Un dato se comparte entre vistas cuando su correspondencia esté verificada; una coincidencia temporal no demuestra causa. Si los datasets reales no pueden emparejarse, mantener los estudios separados y usar una simulación identificada para mostrar el recorrido integrado.

## 2. Qué hace el copiloto en cada paso

| Momento | Acción del astronauta | Acompañamiento del copiloto | Resultado conservado |
|---|---|---|---|
| Me siento distinto | Inicia una observación o elige una molestia. | Formula preguntas breves sobre inicio, evolución y contexto según el procedimiento disponible. | Observación autorreportada, hora y datos todavía desconocidos. |
| Registro lo que ocurre | Completa la información que puede aportar. | Distingue síntomas, mediciones y contexto; permite omitir lo que no sabe. | Registro editable con procedencia y campos ausentes explícitos. |
| Mido correctamente | Abre un procedimiento y registra una lectura. | Explica propósito, equipo, pasos y unidad desde una fuente aplicable. | Medición vinculada al procedimiento y al episodio. |
| Veo mi evolución | Consulta el historial del indicador. | Explica comparaciones usando únicamente valores presentes, con periodo, método y fase visibles. | Tendencia y contexto; no un diagnóstico derivado automáticamente. |
| Entiendo el siguiente paso | Consulta o realiza una acción respaldada. | Presenta instrucciones y condiciones de aplicación con su fuente; señala los límites del apoyo disponible. | Acción elegida, pendiente o realizada y seguimiento. |

Si falta un procedimiento aplicable, conservar la observación y mostrar que no hay orientación específica disponible. No generar pasos médicos para rellenar ese vacío. El acceso a comunicación médica y a los procedimientos de urgencia disponibles debe ser directo; completar el formulario no debe ser un requisito para acceder a ellos. Las condiciones clínicas de activación todavía necesitan fuentes específicas.

## 3. Ejemplo narrativo propuesto

Situación ficticia de interfaz, sin valores inventados atribuidos a NASA ni conclusión clínica:

1. El astronauta elige «Me siento distinto» y registra «Hoy me siento más cansado».
2. El copiloto pregunta desde cuándo, qué actividad realizó y cómo fue su descanso. Lo desconocido queda sin completar.
3. Se ofrece un procedimiento de medición que deberá seleccionarse y documentarse para el equipo de misión. El astronauta consulta sus instrucciones e introduce una lectura.
4. Órbita muestra la lectura junto con las anteriores compatibles. Si faltan registros comparables, lo dice. Si hay un cambio, describe su magnitud y periodo sin deducir su causa.
5. A bordo presenta el siguiente paso permitido por el procedimiento revisado, o permite preparar una consulta cuando no hay orientación aplicable.
6. El astronauta puede guardar la acción y generar un resumen para comunicación médica. Generar o exportar no equivale a enviarlo automáticamente.

Ejemplos de microtexto de diseño: «¿Desde cuándo lo notás?», «Este dato todavía no está registrado», «Ver cómo medir», «Ver registros comparables», «Consultar el procedimiento», «Preparar resumen». No son recomendaciones clínicas.

## 4. Organización visual propuesta

- **Inicio:** acceso a «Me siento distinto», tareas pendientes y último registro, con su fecha.
- **Mi cuerpo:** navegación por sistemas hacia mediciones, contexto y procedimientos relacionados. Ofrecer también una lista textual. El mapa organiza información y no localiza diagnósticos.
- **Medición guiada:** propósito, equipo, pasos, entrada y revisión del registro en un mismo recorrido.
- **Mi evolución:** gráficas, unidades, fase y procedencia; separar observaciones personales de mediciones.
- **Siguiente paso:** acción explicada, fuente, estado de revisión, seguimiento y preparación de resumen.

La arquitectura de pantallas propuesta se amplía con **Adaptación física**, **Hábitat** y **Mi plan**. Inicio debe reunir las próximas acciones y cambios relevantes de los tres dominios. Mi evolución debe permitir ver su contexto temporal y procedencia. El detalle de una prueba debe enlazar al plan y al procedimiento aplicable.

El copiloto aparece como ayuda contextual en estas vistas: indica qué falta medir, explica cambios con límites, vincula información compatible y abre la siguiente tarea fundamentada. Una interfaz inicial con preguntas y botones permite ejecutar tareas sin exigir texto libre ni conversación. Voz, avatar y chat abierto siguen siendo posibilidades posteriores, no funciones confirmadas.

Separar disponibilidad del dato de interpretación clínica: «sin medición», «registrado» y «procedimiento pendiente» son estados de información o tarea. Cualquier estado de atención clínica necesita una regla específica revisada. Acompañar siempre los colores con texto o símbolos.

## 5. Papel de la IA y de las reglas

El concepto de copiloto no requiere IA generativa. Como recomendación de diseño, las operaciones de guardar, validar formato/unidad, seleccionar datos comparables y ejecutar condiciones explícitas deben ser deterministas y trazables. Un eventual modelo de lenguaje podría ayudar a localizar o explicar contenido revisado, mostrando sus fuentes. No debe inventar mediciones, tratamientos, umbrales ni referencias, ni cambiar silenciosamente una regla aprobada.

No hay todavía reglas clínicas, ventanas de comparación o valores de alerta definidos para el producto. La revisión académica no sustituye el desarrollo de esos contenidos específicos.

## 6. Base empírica y académica

CRF Daily Vitals es la primera fuente candidata para demostrar historial de pulso, presión, respiración, temperatura y peso. Es un análogo terrestre de reposo en cama; conservar esa identificación. Su selección definitiva depende de verificar unidades, cobertura y permisos del caso. No atribuir autorreportes ficticios de sueño o cansancio a los sujetos originales.

MR079G, MR080G y MR035G son candidatos para fuerza, capacidad aeróbica e historial de densitometría, respectivamente. Mantener separados estudios y sujetos hasta verificar su correspondencia. MSD007 y DTO 684 aportan casos ambientales históricos de Mir y Shuttle; RadLab y EDA son candidatos para investigar series adicionales. No se ha verificado una serie emparejada que integre todas estas variables para un astronauta. OSD-51/56 aportan investigación molecular distinta y no reemplazan pruebas funcionales o dosimetría.

Para presentar el caso en una misión ficticia, separar visiblemente la simulación del visor de datos NASA reales. No fabricar un historial personal uniendo cohortes. Mantener originales intactos y excluir los comentarios clínicos libres de CRF de la demostración pública por defecto.

Fundamentos y localizadores, desarrollados en BASE_ACADEMICA.md:

- Seguimiento preventivo y continuidad de atención: S03, volumen 1, requisitos V1 3003/3004, páginas PDF 18–21.
- Datos ausentes o antiguos y explicabilidad: S04, volumen 2, V2 10020 y V2 10170/10171, páginas PDF 200 y 226–227.
- Procedimientos integrados y gestión de información: S05, HIDH, apartados 10.10 y 10.12.
- Contexto de nutrición y adaptación: S01; sueño y capacidad médica: S09/S11, con sus fechas y límites.

## 7. Resultado demostrable y comprobaciones

La entrega objetivo debe mostrar un astronauta que comprende su situación, consulta adaptación y ambiente, sigue su plan y completa el recorrido de observación, medición, interpretación y acción. La primera maqueta y su video solo cubren una parte. La implementación integrada y su stack definitivo siguen pendientes. El roadmap organiza resultados completos, sin presentar botones sin funcionamiento como capacidades realizadas.

Comprobar frente al desafío: evaluación visual comprensible, medios de medición realizables, explicación de peligros y riesgos, orientación sobre prevención/mejoras/tratamientos aplicables, condiciones de atención y seguimiento. Son los objetivos y consideraciones compartidos por el usuario; no se ha comprobado una rúbrica oficial adicional de puntuación.

Comprobar cuando se implemente: guardado y recuperación; edición de un dato; unidad incompatible; información ausente; historial insuficiente; separación de sujetos/fases; procedimiento no disponible; navegación por teclado; consistencia entre mapa, detalle y resumen; fuentes visibles y ausencia de envíos automáticos. La comparación con una lista y la comprensión del siguiente paso requieren evaluación con tareas; no se han ejecutado todavía.

Documentos relacionados: REQUIREMENTS.md, ROADMAP.md, BASE_ACADEMICA.md y DATASETS.md.
