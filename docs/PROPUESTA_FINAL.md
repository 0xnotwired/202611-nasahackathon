# Órbita: propuesta final de producto

Versión de propuesta: 14 de noviembre de 2026. Consolida el alcance integrado elegido por el usuario y las recomendaciones derivadas de la investigación. «Final» describe la propuesta para presentar al equipo; no significa producto implementado o clínicamente validado.

## El producto

**Órbita sería una aplicación personal de salud para astronautas que integra su cuerpo, su adaptación física y el ambiente de la misión para ayudarlos a realizar y dar seguimiento a las acciones de cuidado.**

El astronauta encontraría en **Mi día** la información disponible, los cambios observados y las tareas de su plan. Podría continuar su rutina, explorar su estado o iniciar **Me siento distinto**. El copiloto conecta información y procedimientos con el siguiente paso posible en esa misión.

> Órbita acompaña al astronauta desde lo que siente hasta lo que puede hacer: integra salud, adaptación física y hábitat con procedimientos guiados y seguimiento personal durante la misión.

## Experiencia integrada

| Parte | Función para el astronauta |
|---|---|
| Mi salud | Registrar síntomas, signos vitales y descanso; explorar el cuerpo y comprender las mediciones. |
| Adaptación | Revisar fuerza, resistencia, capacidad aeróbica e historial óseo, junto con ejercicio y alimentación registrados. |
| Hábitat | Consultar temperatura, humedad, CO₂ o radiación según datos disponibles y compatibles en lugar y tiempo. |
| Mi plan | Seguir acciones indicadas, registrar cumplimiento y dificultades y recuperar pendientes. |
| A bordo | Ejecutar procedimientos con propósito, equipo, preparación, pasos, fuente y siguiente acción fundamentada. |
| Mi evolución | Revisar observaciones, mediciones, acciones y resultados en una misma línea temporal. |

Salud, adaptación y hábitat son alcance central confirmado. El detalle de pantallas, procedimientos, sensores y arquitectura es diseño propuesto. Las secciones comparten registros: una acción se guarda una vez y aparece coherentemente en plan, episodio e historial.

## El copiloto y el episodio de cuidado

Un episodio reúne seis elementos:

1. **Qué registraste:** síntoma u observación, momento y contexto.
2. **Qué sabemos:** mediciones pertinentes con origen, método, unidad y antigüedad.
3. **Qué falta:** información, equipo o revisión necesaria.
4. **Qué podés hacer:** procedimiento aplicable a los recursos disponibles.
5. **Qué ocurrió:** resultado, dificultad, interrupción o imposibilidad de completar.
6. **Qué sigue:** seguimiento del plan o apoyo previsto por una guía revisada.

**Observar → comprender → realizar una acción → registrar el resultado → continuar el cuidado.**

El copiloto es ayuda contextual. Puede comenzar con reglas explícitas propias y contenido revisado. Chat e IA generativa son opciones pendientes; no se necesita un modelo generativo para conectar el recorrido. Ninguna fuente permite inventar diagnósticos, umbrales o tratamientos.

## Qué buscamos diferenciar

La propuesta combina procedimientos adaptados a recursos, calidad de información visible y continuidad después de registrar un resultado. Si falta un equipo, la aplicación explica la limitación y presenta solo una alternativa documentada o la necesidad de apoyo. Si una tarea se interrumpe, conserva lo realizado y lo pendiente.

No hay una primicia mundial demostrada: NASA ya ha investigado guías autónomas como AMOS. Nuestra hipótesis de valor es que esta integración ayude a completar y comprender mejor las acciones que una pantalla de métricas e instrucciones estáticas. Debe evaluarse.

## Decisiones de diseño sustentadas en investigación

| Evidencia | Propuesta que motiva | Límite que debe conservarse |
|---|---|---|
| A01: AMOS, demostración en ISS | Comprobar preparación y configuración; registrar dificultades | Estudio pequeño, con exclusión por desviación; no prueba diagnóstico autónomo |
| A02–A03: Sprint y estudio multisistema | Separar plan, ejercicio realizado y respuesta física | Autoselección/confusores; posible solapamiento de cohortes; no prescripción individual automática |
| A04: seguimiento óseo de 17 astronautas | Historial por región, método y fecha | Un año de seguimiento no demuestra irreversibilidad de por vida; DXA no equivale a HR-pQCT |
| A05: sueño en Shuttle/ISS | Distinguir descanso, autoinforme y estimación instrumental | Actigrafía no mide etapas; el estudio no midió errores operativos directamente |
| A06: ensayo terrestre de CO₂ | Vincular contexto ambiental compatible y mostrar incertidumbre | Exposición aguda terrestre no representa una misión prolongada ni demuestra causalidad individual |

Referencias, métodos y límites: [investigación aplicada](INVESTIGACION_APLICADA.md) y [matriz](MATRIZ_INVESTIGACION_APLICADA.csv). La [base académica](BASE_ACADEMICA.md) conserva estándares, libros e informes HRP previamente revisados. Son revisiones dirigidas; no constituyen validación clínica del producto.

## Demostración propuesta para el hackathon

**Caso integrado sintético:** un astronauta registra cansancio. Consulta descanso, ejercicio incompleto, una prueba física previa y ambiente del módulo. El historial óseo muestra fecha y método sin inventar un resultado actual. El copiloto identifica información faltante y abre un procedimiento de medición pertinente, cuyo contenido debe revisarse antes de presentarlo como orientación aplicable.

El astronauta confirma equipo y preparación, completa la tarea o registra una dificultad. Mi plan y Mi evolución incorporan el resultado y el seguimiento. Una segunda configuración deja ese equipo ausente: el procedimiento cambia a estado no disponible, explica el motivo y conserva lo pendiente.

**Casos NASA separados:** incorporar un caso reproducible CRF y uno de adaptación de MR079G, MR080G o MR035G según archivos verificados. Mantener sus cohortes y condición de análogos terrestres. No se ha verificado una serie real que empareje todos los dominios para un mismo astronauta. No unir datos de Mir, Shuttle, ISS y reposo en cama como una sola persona.

La contribución NASA debe ser visible en datos, contexto y fundamento de procedimientos, además de las referencias. Consultar [DATASETS.md](DATASETS.md) antes de integrar archivos. No incluir comentarios clínicos libres en la demostración pública.

## Relación con el desafío

La herramienta visual permite explorar indicadores, entender su significado y actuar con guía. Cada procedimiento debe explicar qué se mide, por qué, con qué equipo, cómo se relaciona con los riesgos de misión y qué siguiente paso corresponde. La orientación sobre cuidados y tratamientos exige procedimientos específicos revisados; guardar síntomas por sí solo no cierra ese objetivo.

La guía oficial de evaluación consultada es de **2025**: impacto, creatividad, validez, relevancia y presentación sirven aquí de referencia provisional. La guía 2026 no pudo verificarse por errores de acceso. No trasladar automáticamente requisitos de formato o elegibilidad del año anterior.

Nuestra entrega debería mostrar utilidad mediante un recorrido completo, creatividad en el manejo de restricciones, fundamento científico trazable, uso sustantivo de recursos NASA y una historia clara con funciones realmente ejecutadas.

## Criterios de aceptación propuestos

- Completar y recuperar un episodio desde la observación hasta el seguimiento.
- Mostrar salud, adaptación y hábitat conectados al mismo contexto, sin fabricar correspondencias.
- Bloquear tareas que requieren equipo ausente y explicar el motivo.
- Conservar interrupciones y dificultades sin contarlas como éxito.
- Distinguir dato actual, antiguo, ausente y no comparable; acompañar colores con texto.
- Mantener consistencia entre registro, plan, historial y exportación.
- Mostrar fuente, versión y estado de revisión de los procedimientos.
- Separar dato sintético, análogo terrestre y dato de vuelo tanto en pantallas como en exportaciones.

Proponemos una prueba formativa con 6–8 voluntarios no especialistas y casos ficticios, alternando el orden entre el recorrido guiado y una interfaz de métricas con instrucciones estáticas. Medir omisiones, errores, tiempo para encontrar el siguiente paso y comprensión de límites. El tamaño es una propuesta de usabilidad; no demuestra eficacia clínica ni representa a la población astronauta. Las pruebas todavía no se ejecutaron.

## Funcionamiento y escalabilidad propuestos

Recomendamos funcionamiento local con sincronización posterior, pendiente de elección arquitectónica. La maqueta ya permite un recorrido local, pero no implementa sincronización, respaldos ni resolución de conflictos.

El núcleo propio gestionaría mediciones, episodios, tareas y ejecuciones. Se agregarían adaptadores propios de sensores, procedimientos versionados y configuraciones de misión. Cada ejecución conserva la versión de guía utilizada. Los registros de tripulantes y sus permisos permanecen separados. Esto describe extensibilidad; no hay pruebas de carga ni escalabilidad demostrada.

Toda funcionalidad debe escribirse por el equipo. Los repositorios externos solo inspiran conceptos; no se copia, adapta ni incorpora su código o paquetes funcionales. Conservar atribuciones de fuentes y registrar uso de IA conforme a las reglas aplicables.

## Estado actual y siguiente entrega

Existe una maqueta HTML con datos sintéticos, chequeo guiado, almacenamiento local de demostración y exportación TXT. Cubre principalmente el chequeo. La integración completa, los procedimientos sensibles a recursos, los conectores y la validación clínica siguen pendientes.

La siguiente entrega recomendada es **un episodio completo que integre los tres dominios, dos configuraciones de recursos y seguimiento del resultado**, acompañado por casos NASA verificables. Antes de implementarlo deben concretarse el procedimiento, sus fuentes, el equipo y los criterios de apoyo médico. Diagnóstico generativo, puntuación global y predicción clínica desde ómicas quedan fuera de esa entrega propuesta.

Consultar [PRODUCTO.md](PRODUCTO.md) para decisiones históricas, [REQUIREMENTS.md](REQUIREMENTS.md) para el encargo y [ROADMAP.md](ROADMAP.md) para la secuencia previa. Este documento consolida la propuesta vigente sin convertir opciones técnicas en decisiones ya aprobadas.
