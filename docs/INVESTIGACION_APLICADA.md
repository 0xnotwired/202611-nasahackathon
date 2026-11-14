# Órbita: ampliación académica y propuesta diferenciadora

Fecha: 14 de noviembre de 2026. Revisión dirigida, complementaria a [BASE_ACADEMICA.md](BASE_ACADEMICA.md). No es una revisión sistemática, un metaanálisis ni una validación clínica. Las funciones siguientes son propuestas para el alcance integrado elegido por el usuario; todavía no están implementadas en la maqueta.

## Conclusión para el equipo

Recomiendo convertir el copiloto en una ayuda para **completar y dar seguimiento al cuidado con los recursos reales de la misión**. Su unidad principal sería un episodio: qué siento, qué sabemos, qué falta, qué procedimiento puedo realizar, qué ocurrió y qué queda pendiente. Salud, adaptación y hábitat aportarían información al mismo episodio y al plan cotidiano.

El diferencial defendible es la combinación de procedimientos ejecutables, comprobación de recursos y calidad de datos, y seguimiento del resultado. Es una hipótesis de valor que debemos evaluar frente a un dashboard; no una afirmación de primicia mundial. AMOS y otros proyectos NASA ya investigan asistencia autónoma y procedimientos guiados.

## 1. Método y trazabilidad

Preguntas: ¿qué problemas humanos justifican integrar los tres dominios?, ¿qué apoyo permite actuar sin conocimientos médicos completos?, ¿qué resultados y limitaciones deben mostrarse?, ¿cómo demostrar utilidad sin inventar eficacia clínica?

Se buscaron estudios humanos de vuelo, experimentos terrestres pertinentes y documentación NASA sobre apoyo a decisiones. Consultas principales: `spaceflight autonomous medical decision support`, `High intensity training during spaceflight`, `Effects of exercise countermeasures multisystem`, `Incomplete recovery bone strength astronauts`, `spaceflight sleep deficiency Barger`, `carbon dioxide cognition astronaut-like`, `AMOS autonomous medical officer support`, y criterios de evaluación Space Apps. Búsqueda por motor web, seguida de recuperación directa de textos desde PMC, Nature y NTRS.

Se recuperaron **seis textos completos**: cinco artículos científicos (ejercicio, función multisistema, hueso, sueño y CO₂) y un manuscrito AMOS depositado como preprint en NTRS. Se leyeron secciones pertinentes de métodos, resultados, discusión y limitaciones; no se reanalizaron datos individuales ni suplementos. Las respuestas descargadas, tamaños y SHA-256 están en el archivo local `scratch/spaceapps-health/research/ampliacion/downloads.json`; las descargas y extracciones se conservan en el workspace de investigación y no se incluyen en este repositorio. Recuperar un archivo no significa revisar cada frase.

La selección favorece aplicación al producto, acceso gratuito y evidencia humana. Excluye material comercial, resultados celulares como sustituto de estado clínico y afirmaciones promocionales como prueba de eficacia. Hay sesgo de selección e idioma, una sola revisión y ausencia de protocolo preregistrado o evaluación formal GRADE. No se puede afirmar exhaustividad ni que sean los últimos estudios de todos los temas.

Se conserva la disciplina de procedencia de `SKILLS/claim-provenance-discipline`: distinguir resultado observado, límite de generalización, propuesta de diseño y prueba pendiente. La evidencia previa de HRP y estándares se hereda con sus versiones y páginas desde BASE_ACADEMICA.md; no se presenta como una nueva verificación integral.

## 2. Hallazgos que cambian el diseño

### A01 — Guiar la ejecución requiere comprobar preparación y errores

**Fuente:** Ebert y colaboradores, *Autonomous Medical Officer Support (AMOS) Software Technology Demonstrations on the ISS*. NTRS 20240012964, manuscrito de 17 páginas, depositado como preprint en 2024. Localizadores: Methods/Participants/Protocol; Results/Human Factors Observations/Software Use Pattern.

https://ntrs.nasa.gov/citations/20240012964

Dos parejas participaron en tres ocasiones; los resultados de una pareja se excluyeron por una desviación importante en la revisión inicial de instrucciones. El trabajo describe obtención autónoma de imágenes, pero también problemas de configuración y posicionamiento. Un reinicio dejó un ajuste incorrecto que no se volvió a verificar. No demuestra capacidad diagnóstica general ni eficacia de Órbita; la selección y exclusión limitan generalización.

**Incorporar:** preparación explícita, comprobación de equipo/configuración, pasos breves, pausa y reanudación, resultado «no pude completar», y revisión antes de repetir. Distinguir «instrucción leída», «paso realizado» y «medición utilizable». No incluir ecografía en el MVP sin equipo y contenido específico revisado.

**Prueba pendiente:** comparar omisiones y errores de preparación con instrucciones estáticas. Si no mejora la ejecución o agrega carga excesiva, revisar el flujo.

### A02 — Cumplir ejercicio no equivale a conservar todas las capacidades

**Fuente:** English y colaboradores, *High intensity training during spaceflight: results from the NASA Sprint Study*, 2020. DOI: 10.1038/s41526-020-00111-x. Methods/Subjects; Discussion/limitations.

https://pmc.ncbi.nlm.nih.gov/articles/PMC7434884/

Comparó Sprint (9 astronautas) con atención habitual (17). Hubo deterioro de distintas medidas en ambos grupos. Los participantes eligieron grupo; el régimen habitual cambió durante el estudio y algunas pruebas posvuelo se realizaron en días diferentes. No es un ensayo aleatorizado ni prueba de equivalencia de cualquier rutina.

**Incorporar:** separar plan indicado, actividad efectivamente realizada y respuesta física. Registrar dispositivo, duración, carga cuando corresponda y dificultades. Mostrar fuerza, resistencia y capacidad aeróbica por separado. La aplicación no prescribe por sí sola el entrenamiento del artículo.

**Prueba pendiente:** el usuario debe distinguir «completé mi tarea» de «mejoró mi capacidad»; no colorear hueso o músculo como saludable por cumplir una sesión.

### A03 — La variabilidad individual importa más que un promedio tranquilizador

**Fuente:** Scott y colaboradores, *Effects of exercise countermeasures on multisystem function in long duration spaceflight astronauts*, 2023. DOI: 10.1038/s41526-023-00256-5. Abstract; Methods; Discussion/limitations.

https://pmc.ncbi.nlm.nih.gov/articles/PMC9898566/

Cohorte de 46 astronautas: el ejercicio habitual no evitó todo el deterioro y las respuestas individuales fueron heterogéneas. No hubo control sin ejercicio; dieta, medicación y otras exposiciones no estaban plenamente controladas. Las estimaciones para futuras misiones son proyecciones, no eventos observados. Comparte periodo ISS 2011–2017 con Sprint: no sumar ambos tamaños como participantes independientes sin comprobar solapamiento.

**Incorporar:** comparaciones personales con método, fase y fecha visibles; mantener resultados por sistema, sin puntuación global inventada. Un cambio observado no demuestra enfermedad ni el efecto causal de una contramedida.

**Prueba pendiente:** ante protocolos o dispositivos incompatibles, el sistema debe advertir la diferencia en vez de calcular una tendencia aparentemente homogénea.

### A04 — La salud ósea necesita historial y límites de medición explícitos

**Fuente:** Gabel y colaboradores, *Incomplete recovery of bone strength and trabecular microarchitecture at the distal tibia 1 year after return from long duration spaceflight*, 2022. DOI: 10.1038/s41598-022-13461-1. Results; Discussion/limitations; Methods.

https://www.nature.com/articles/s41598-022-13461-1

Seguimiento de 17 astronautas (14 hombres, 3 mujeres), con HR-pQCT, DXA y biomarcadores. Nueve no recuperaron completamente la densidad total tibial a los 12 meses según la definición del estudio. La muestra es pequeña y el seguimiento no permite demostrar irreversibilidad de por vida. Las asociaciones con ejercicio tampoco prueban una prescripción causal individual.

**Incorporar:** historial por región, método y fecha, con próxima evaluación según plan. DXA, HR-pQCT y masa corporal no son intercambiables. No dibujar una curva diaria de densidad ósea a partir de ejercicio o pulso, ni atribuir HR-pQCT al dataset MR035G, que contiene DXA.

**Prueba pendiente:** cuando solo exista examen previo al vuelo, mostrar «última evaluación conocida» y ausencia de medición actual.

### A05 — Descanso registrado y sueño estimado son cosas diferentes

**Fuente:** Barger y colaboradores, *Prevalence of sleep deficiency and use of hypnotic drugs in astronauts before, during, and after spaceflight*, 2014. DOI: 10.1016/S1474-4422(14)70122-X. Methods; Results; Discussion/limitations.

https://pmc.ncbi.nlm.nih.gov/articles/PMC4188436/

Estudio observacional con 64 astronautas Shuttle y 21 ISS; en ISS estimó 6,09 ± 0,67 horas de sueño durante vuelo. La actigrafía no mide etapas del sueño; el trabajo no midió directamente errores operativos o rendimiento cognitivo. El periodo posvuelo también puede estar influido por recuperación de sueño. La media del estudio no es una meta ni un umbral médico para Órbita.

**Incorporar:** horario destinado a descansar, duración reportada o estimada, fuente, despertares y percepción personal. Integrar descanso y tareas del plan sin convertir una mala noche en diagnóstico o incapacidad operacional.

**Prueba pendiente:** los usuarios deben reconocer qué dato reportaron y cuál proviene de un dispositivo; no recomendar hipnóticos automáticamente.

### A06 — El ambiente aporta contexto; no identifica por sí solo la causa

**Fuente principal:** Scully y colaboradores, *Effects of acute exposures to carbon dioxide on decision making and cognition in astronaut-like subjects*, 2019. DOI: 10.1038/s41526-019-0071-6. Abstract; Methods; Discussion.

https://pmc.ncbi.nlm.nih.gov/articles/PMC6584569/

Ensayo terrestre cruzado y doble ciego en 22 participantes, con cuatro concentraciones de CO₂. No encontró un patrón claro y general de dosis-respuesta en las pruebas evaluadas. Exposición aguda y análogo terrestre no prueban seguridad en misiones prolongadas. Como contraste, Law y colaboradores (2014, PMID 24806559; resumen y referencias NASA localizados, texto íntegro no revisado) informaron asociación entre CO₂ y cefaleas en ISS. Son desenlaces y diseños distintos: no es una refutación directa entre estudios.

**Incorporar:** hora, módulo, sensor, unidad, intervalo de exposición y cobertura. Presentar coincidencias y explicaciones alternativas, nunca «el CO₂ causó tu cansancio». No convertir ppm a presión parcial sin presión total compatible ni mezclar µGy y µSv.

**Prueba pendiente:** datos de otra ubicación o sin coincidencia temporal no deben aparecer como exposición personal confirmada.

## 3. Funciones prioritarias propuestas

| Función | Experiencia del astronauta | Evidencia que la motiva | Alcance demostrable |
|---|---|---|---|
| Episodio de cuidado | Reúne síntoma, contexto, acción, resultado y seguimiento | A01, A03, A05, A06 | Un recorrido completo, persistente y exportable |
| Procedimiento según recursos | Comprueba equipo, preparación y ayuda necesaria | A01; NTRS 20240004905 | Dos configuraciones de misión; una tarea disponible y otra bloqueada |
| Estado de la información | Explica qué sabemos y qué falta, con fecha y procedencia | A03–A06; STD-3001 vol. 2 en base previa | Medición actual, antigua, ausente y no comparable |
| Seguimiento de contramedidas | Distingue lo indicado, lo realizado y lo observado | A02–A04 | Ejercicio/nutrición registrados y pruebas periódicas; sin ajuste automático |
| Hábitat contextual | Sitúa el episodio en módulo y periodo compatibles | A06 | Serie ambiental sintética identificada y estado de cobertura |
| Resumen para apoyo médico | Conserva cambios, acciones, dificultades y pendientes | Necesidad operativa NASA; propuesta de diseño | Exportación revisable; no envío automático |

Los antecedentes operativos NASA incluyen restricciones de equipos, suministros y comunicación: https://ntrs.nasa.gov/citations/20240004905 . La presentación de mercado de CDS de 2025 admite soluciones con o sin IA: https://ntrs.nasa.gov/citations/20250000388 . Se revisaron sus fichas/resúmenes públicos; no son ensayos de efectividad del producto.

### La tarjeta central del copiloto

1. **Qué registraste:** observación del astronauta, hora y contexto.
2. **Qué sabemos:** mediciones pertinentes con método y antigüedad.
3. **Qué falta:** datos, equipo o revisión necesarios.
4. **Qué podés hacer:** procedimiento aplicable y su fundamento.
5. **Qué ocurrió:** resultado, dificultad o interrupción.
6. **Qué sigue:** pendiente del plan o comunicación prevista por una guía revisada.

La selección inicial puede implementarse con reglas explícitas escritas por el equipo. IA generativa y operación offline siguen siendo opciones de arquitectura; ninguna es condición para que este recorrido sea útil.

## 4. Demostración integrada recomendada

Caso completamente sintético y rotulado: un astronauta registra cansancio. Mi día muestra descanso registrado, una tarea de ejercicio incompleta y datos ambientales del módulo. Adaptación conserva una prueba física previa y un examen óseo anterior, sin inventar valores actuales. El copiloto solicita contexto faltante y propone una tarea de medición cuyo contenido debe estar revisado.

El astronauta confirma equipo y preparación, realiza la tarea y registra el resultado o una dificultad. El episodio actualiza Mi plan y Mi evolución. Después cambiamos la configuración de misión: falta el equipo. Órbita conserva el episodio, explica la limitación y muestra únicamente una alternativa documentada o la necesidad de apoyo. No inventa un reemplazo diagnóstico.

La escena diferenciadora es mostrar que la ayuda cambia cuando cambian los recursos o la calidad de la información, y que el cuidado continúa después de guardar una cifra.

Para demostrar uso sustantivo de NASA, agregar un caso separado y reproducible con CRF y un caso de adaptación de MR079G/MR080G/MR035G, según archivos y unidades verificados. Mostrar procedencia, fase y límites. No fusionarlos como una misma persona sin correspondencia comprobada. Un enlace bibliográfico por sí solo no equivale a integración de datos. No hay aún series clínicas y ambientales reales emparejadas verificadas para el episodio integrado.

## 5. Correspondencia con el desafío y evaluación

Los objetivos del desafío proceden del texto aportado por el usuario y conservado en REQUIREMENTS.md. La página 2026 y su guía de evaluación devolvieron errores 502/503 durante esta revisión. Se pudo abrir la guía oficial **2025**, que contempla impacto, creatividad, validez, relevancia y presentación. Se usa como referencia provisional, **sin atribuir a 2026 sus requisitos de formato, duración, elegibilidad ni ponderaciones**.

Guía consultada: https://spaceapps-v2-staging.s3.amazonaws.com/media/documents/Final_Space_Apps_2025_Judging_Guidelines_for_web.pdf

| Objetivo o dimensión provisional | Cómo lo abordaríamos | Evidencia de entrega necesaria |
|---|---|---|
| Autoevaluación visual | Información corporal, adaptación y ambiente comprensibles | Usuario identifica cambio, ausencia y siguiente paso |
| Orientación sobre cuidados y mejoras | Procedimiento fundamentado y seguimiento de plan indicado | Fuente, versión, alcance y revisión visibles; no basta guardar síntomas |
| Impacto | Ayuda a completar tareas bajo restricciones | Medición de errores, omisiones y tiempo; sin prometer beneficios clínicos |
| Creatividad | Ayuda sensible a recursos y calidad, con continuidad del episodio | Mostrar cambios reales de comportamiento en dos escenarios |
| Validez | Evidencia, límites y factibilidad | Datos reproducibles, controles de unidades y revisión de contenido |
| Relevancia | Datos NASA y preguntas del desafío integrados en el recorrido | Caso NASA verificable y explicación de su contribución |
| Presentación | Una historia de principio a seguimiento | Demostración de funciones ejecutadas, con simulación identificada |

Punto pendiente sustancial: los artículos justifican necesidades y diseño, pero no entregan automáticamente protocolos clínicos operativos completos. Para cubrir orientación de tratamientos de forma responsable necesitamos seleccionar procedimientos concretos, revisar su aplicabilidad y fijar criterios de apoyo médico con una persona competente. Un dashboard con citas no resuelve ese requisito.

## 6. Evaluación propuesta antes de ampliar funciones

**Hipótesis:** el recorrido guiado mejora la ejecución y comprensión frente a una pantalla de métricas con instrucciones estáticas. No está probada.

Prueba formativa propuesta con 6–8 voluntarios no especialistas, casos simulados equivalentes y orden alternado entre interfaces. Ese tamaño sirve para detectar problemas de usabilidad, no para demostrar eficacia clínica o representar astronautas. Evaluar: pasos omitidos, registros correctos, tiempo para encontrar el siguiente paso, reconocimiento de datos ausentes y capacidad de explicar el límite de una interpretación. Registrar también carga percibida y solicitudes de ayuda. No recoger datos médicos personales para esta prueba.

Casos mínimos: recorrido completo; equipo ausente; dato ambiental de otro módulo; examen antiguo; unidad incompatible; procedimiento interrumpido; resultado que requiere revisión según una regla de demostración identificada. Reportar resultados reales, incluidos fallos, sin inventar metas porcentuales cumplidas. Cualquier error que presente un dato ausente como normal o una tarea imposible como disponible obliga a corregir antes de presentar.

Separar tres evaluaciones: exactitud del software, comprensión/usabilidad y revisión clínica de contenido. Ninguna sustituye las otras. Para atención real harían falta validación específica de misión y dispositivos y el marco aplicable, fuera de lo que demuestra esta hackathon.

## 7. Escalabilidad y límites de alcance

Propuesta técnica: un núcleo propio que gestione mediciones, episodios, tareas y ejecuciones de procedimientos. Incorporar configuraciones de misión con equipos y capacidades; procedimientos con identificador, versión, evidencia, prerrequisitos y estado de revisión; y adaptadores propios de datos con unidades y procedencia. Una ejecución conserva la versión utilizada aunque el procedimiento cambie después. Es diseño extensible, no rendimiento o escalabilidad ya medidos.

Todo código funcional debe escribirse por el equipo, conforme a la instrucción del usuario. AMOS y los repositorios investigados son inspiración conceptual; no se copia ni adapta su código. Acceso gratuito a artículos no autoriza redistribuir sus figuras o textos íntegros en la aplicación.

Posponer diagnósticos generativos, una puntuación universal de salud, predicción individual desde ómicas y nuevas pruebas instrumentales sin equipamiento ni validación. Esto mantiene el producto integrado y concentra el desarrollo en una experiencia comprobable.

**Estado de esta entrega:** investigación documental y propuesta, no modificación del HTML. La maqueta actual continúa cubriendo principalmente el chequeo. Los límites de acceso a las páginas 2026 y las brechas clínicas y de datos permanecen abiertos.
