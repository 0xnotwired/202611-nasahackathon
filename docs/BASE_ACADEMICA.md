# Base académica para una herramienta de salud de astronautas

Revisión documental dirigida para el desafío Space Apps 2026. Fecha de consulta: 14 de noviembre de 2026.

## Cómo leer esta versión consolidada

Este documento reúne la revisión inicial de libros, estándares e informes HRP y la investigación reciente de seis textos completos. La segunda parte incorpora estudios de ejercicio, hueso, sueño y CO₂, el antecedente AMOS, sus fuentes y limitaciones, y propuestas para Órbita. No representa una nueva búsqueda ni una validación clínica.

La revisión inicial se conserva con sus identificadores S01–S18; la ampliación usa A01–A06. **A05 y S15 corresponden al mismo estudio de Barger**, ahora revisado en texto completo: no son dos evidencias independientes. Las matrices complementarias son [MATRIZ_EVIDENCIA.csv](MATRIZ_EVIDENCIA.csv) y [MATRIZ_INVESTIGACION_APLICADA.csv](MATRIZ_INVESTIGACION_APLICADA.csv).

El alcance vigente integra salud, adaptación física y hábitat con procedimientos y seguimiento. La [propuesta final](PROPUESTA_FINAL.md) concreta ese alcance. Las recomendaciones iniciales centradas en el chequeo deben leerse como antecedentes, no como reducción del producto elegido.

El PDF anterior de la base académica corresponde a la revisión inicial; no incluye esta consolidación.

## 1. Conclusión y alcance

La documentación respalda una herramienta de seguimiento personal que integre mediciones, contexto de misión, evolución, instrucciones de medición y orientación trazable. La vigilancia preventiva debe contemplar nutrición, ejercicio, descanso y bienestar psicosocial además de signos vitales [S03, pp. PDF 18–21]. Nuestra recomendación de producto es combinar un chequeo guiado con un historial y una representación corporal accesible; esa combinación es una propuesta de diseño, no una solución cuya eficacia clínica haya sido demostrada por estas fuentes.

La prioridad científica es distinguir tres cosas: qué se midió, qué interpretación admite esa medición y qué acción está respaldada para esa situación. Los datos disponibles permiten demostrar seguimiento y cambios observados; no bastan para validar diagnósticos automáticos, una puntuación global de salud o tratamientos personalizados.

Se descargaron 13 PDF únicos: dos libros, los dos volúmenes de NASA-STD-3001, el HIDH y ocho informes temáticos del HRP. La lectura se dirigió a resúmenes, secciones pertinentes, requisitos y limitaciones. No se leyó íntegramente cada una de las 1.301 páginas del HIDH ni se presenta este trabajo como revisión sistemática o metaanálisis. En esa primera etapa se contrastaron además resúmenes de cuatro artículos originales indexados en PubMed, sin revisar sus métodos íntegros ni reanalizar datos. La ampliación posterior revisa secciones de seis textos completos, incluido el estudio de Barger [S15/A05], como se detalla en la segunda parte.

Las referencias a «p. PDF» cuentan desde la primera página del archivo, comenzando en 1. El libro de 2021 contiene páginas enfrentadas: una página del PDF puede corresponder a dos páginas impresas. Los identificadores de requisitos permiten localizar el texto incluso si cambia la paginación.

## 2. Cómo usar cada clase de fuente

| Clase | Qué aporta | Qué no demuestra por sí sola |
|---|---|---|
| Investigación original | Mediciones, asociaciones y resultados en una población y protocolo concretos. | Que el resultado sea causal o generalizable a cualquier astronauta y misión. |
| Libros e informes HRP | Síntesis del conocimiento, mecanismos propuestos, riesgos y lagunas. | Una validación clínica de nuestro software o de una regla nueva. |
| NASA-STD-3001 | Requisitos técnicos y criterios de operación para programas aplicables. | Que cumplir unos criterios aislados equivalga a certificar toda la aplicación. |
| HIDH | Fundamento y orientación de diseño de sistemas e interfaces. | Sustituir la revisión normativa vigente o evaluar la usabilidad de nuestra interfaz concreta. |
| Datasets de NLSP/OSDR | Material empírico con el que explorar y demostrar funciones. | Una etiqueta diagnóstica o un umbral terapéutico que el estudio no contiene. |

El informe nutricional enlazado por HRP y el libro de 2021 tienen el mismo título, autores y contenido de base. La extracción coincide exactamente, eliminando espacios, en 130 de 135 páginas. Son dos distribuciones de la misma obra; no se cuentan como corroboración independiente.

## 3. Análisis de los seis grupos de recursos solicitados

### 3.1. Human Adaptation to Spaceflight, segunda edición, 2021 [S01]

Autores: Scott M. Smith, Sara R. Zwart, Grace L. Douglas y Martina Heer. Es la síntesis principal para vincular nutrición con sistemas fisiológicos. Se revisaron pasajes sobre energía, fluidos, hueso, músculo, sistema cardiovascular, visión e inmunidad.

**Energía y masa corporal.** La obra reúne datos históricos de ingesta insuficiente y explica su relación con cambios de masa y función. También describe misiones en las que se mantuvo la ingesta y la masa: la pérdida no es un destino uniforme. Las asociaciones involucran dieta, ejercicio y adaptación fisiológica, por lo que una variación de masa aislada no identifica su causa [S01, cap. 4, pp. impresas 28–33; pp. PDF 21–23].

**Fluidos.** Se distingue la redistribución de fluidos y la reducción de volumen plasmático de una deshidratación global. La explicación simple «microgravedad produce diuresis y deshidratación» no queda confirmada por los experimentos de vuelo que revisa la obra. Esto no elimina la posibilidad de deshidratación por ingesta insuficiente o pérdidas; impide diagnosticarla automáticamente por la fase de misión [S01, cap. 5, pp. impresas 51–53; pp. PDF 32–33].

**Hueso y ejercicio.** Los resultados varían por región, persona, equipamiento y nutrición. La comparación entre iRED y ARED está confundida parcialmente por diferencias nutricionales entre cohortes. Conservar densidad mineral no equivale a demostrar normalidad de toda la microarquitectura o ausencia de riesgo de fractura [S01, cap. 6, pp. impresas 64–67; pp. PDF 39–40].

**Músculo y capacidad física.** La obra distingue pérdida de tejido y procesos de síntesis/degradación, así como contramedidas mecánicas y nutricionales. La eficacia depende del estímulo y del contexto: no se deduce un programa individual de entrenamiento con solo conocer la masa corporal [S01, cap. 7, pp. impresas 116–119; pp. PDF 65–66].

**Visión e inmunidad.** Las asociaciones nutricionales y genéticas con SANS no establecen una causa única. La sección inmunológica combina evidencia humana, terrestre y mecanística: esa heterogeneidad debe acompañar las explicaciones [S01, caps. 10–11; pp. PDF 83–85 y 93–95].

**Aplicación propuesta:** incorporar ingesta/apetito, líquidos y actividad como contexto del chequeo; distinguir peso de masa y registrar el instrumento compatible con la gravedad de la misión. Mostrar explicaciones por sistema con fuentes y fecha. Una ingesta registrada no mide directamente composición corporal, inmunidad ni salud ocular.

### 3.2. Nutritional Biochemistry of Space Flight, 2009 [S02]

Obra de Smith, Zwart, Kloeris y Heer. Su organización por nutrientes complementa el enfoque por sistemas de 2021. Reconoce extrapolaciones desde análogos y evidencia terrestre; revisa suplementos y las interacciones entre alimentación y fármacos [cap. IV, p. impresa 17 / PDF 29; caps. XI–XII, pp. impresas 123–126 / PDF 135–138].

**Valor para el proyecto:** conservar dieta, suplementos y medicación como contexto documentado; no convertir una sugerencia nutricional en una prescripción automática. Por su fecha, sirve de fundamento histórico y debe contrastarse con el estándar y la evidencia actuales. Su acceso gratuito no implica permiso irrestricto de redistribución.

### 3.3. NASA HRP Evidence Reports [S06–S13]

La colección es una síntesis viva, pero cada archivo tiene su fecha. Se seleccionaron ocho riesgos pertinentes; no se revisó todo el catálogo. Las fechas que siguen corresponden a aprobación pública en la portada, no al nombre del archivo ni a su descarga.

| Informe | Versión examinada | Resultado pertinente y límite |
|---|---|---|
| Cardiovascular [S06] | 15/12/2022 | Integra intolerancia ortostática, arritmias y otros riesgos cardiovasculares. Los datos de presión y pulso ayudan a seguir cambios, pero no sustituyen ECG, imagen ni evaluación vascular. Extrapolación limitada a misiones prolongadas fuera de LEO. |
| Músculo y capacidad aeróbica [S07] | 22/01/2023 | Destaca variabilidad individual, relación con ejercicio y diferencias de equipamiento. Las conclusiones reconocen ausencia de estudios controlados de eficacia del ejercicio en vuelo; no presentar toda la evidencia como ensayo aleatorizado. |
| Fractura y cambios óseos [S08] | 18/07/2024 | Distingue densidad, competencia biomecánica y cargas aplicadas. Señala límites para traducir un porcentaje de cambio de DXA en fragilidad individual. |
| Sueño, ritmo circadiano y carga [S09] | 11/04/2016 | Separa duración del sueño, desalineación circadiana y carga laboral. Sus evaluaciones de modelos de fatiga corresponden a 2016; no describen automáticamente su estado en 2026. |
| Inmunidad [S10] | 01/06/2022 | Documenta alteraciones en vuelo y distingue ensayos celulares, función y posibles consecuencias clínicas. Persisten lagunas sobre relevancia clínica individual y análogos apropiados. |
| Capacidad médica [S11] | 08/05/2017 | Fundamenta historia clínica, recursos a bordo, apoyo a decisiones y entrenamiento cuando el apoyo terrestre es limitado. Sus listas de tecnologías futuras son históricas. |
| SANS [S12] | 07/04/2022 | Documenta cambios oculares y mecanismos todavía investigados. El seguimiento especializado no puede reemplazarse por una foto facial ni por preguntas sobre visión. |
| Carcinogénesis por radiación [S13] | 2026 | Sintetiza dosimetría, evidencia epidemiológica, modelos animales y estimación de riesgo. Explicita incertidumbres al extrapolar entre radiaciones, tasas de dosis y poblaciones. |

**Localización del análisis:** S06, pp. PDF 8, 19–20 y 97–98; S07, pp. PDF 5–6, 37–38, 43–44 y 138; S08, pp. PDF 6–9; S09, pp. PDF 4–7; S10, pp. PDF 4–7; S11, pp. PDF 5, 32–36, 44–45 y 51–52; S12, pp. PDF 7, 42 y 50–51; S13, pp. PDF 10–11, 42–44 y 55.

**Consecuencia para el proyecto:** organizar mediciones por lo que realmente observan. Un pulso diario no permite diagnosticar arritmias o trombosis; un cuestionario no determina células inmunológicas; una tasa de dosis de sensor no es por sí sola una probabilidad personal de cáncer. El sistema puede mostrar contexto y guiar una evaluación documentada sin atribuirse estas capacidades.

### 3.4. NASA-STD-3001, volumen 1, revisión C [S03]

El PDF oficial consultado está aprobado el 15/09/2023. Su objetivo es definir requisitos de salud para los programas aplicables; no es un manual autónomo de diagnóstico para una app.

Los requisitos [V1 3003] y [V1 3004] describen vigilancia preventiva y atención adaptadas a necesidades individuales, evidencia, criterio del equipo médico, arquitectura de misión y recursos. Incluyen nutrición, capacidad física, descanso, bienestar psicosocial y ambiente [pp. PDF 18–21]. Esto permite justificar que el producto contemple más que un panel de signos vitales.

El requisito [V1 3004] incluye historia clínica electrónica con protección de datos; registro de encuentros, exámenes, signos vitales y tendencias; pruebas auxiliares; planes y resultados; comunicación privada; y capacidad de atención autónoma de Tierra [pp. PDF 20–21]. Las secciones de rendimiento diferencian sistemas y fases [pp. PDF 31–39].

**Traducción propuesta:** guardar momento, método y contexto; mostrar seguimiento; registrar acciones y resultados; permitir una comunicación médica explícita. Una puntuación única que mezcle todas las dimensiones no queda justificada aquí. Los límites numéricos del estándar son específicos de su propósito y no deben convertirse sin revisión en alarmas de consumo.

### 3.5. NASA-STD-3001, volumen 2, revisión F [S04]

Aunque el URL contiene «2025/05», la portada del archivo descargado identifica revisión F, aprobada el 14/07/2026. Esta diferencia confirma por qué debemos citar el contenido y conservar su hash.

| Requisito | Página PDF | Criterio relevante para una futura interfaz |
|---|---|---|
| [V2 10005] y [V2 10006] | 199 | Consistencia de interfaz y terminología. |
| [V2 10020] | 200 | Indicación visual de datos antiguos, ausentes, no disponibles o desconocidos. |
| [V2 10113] | 202 | Presentar información de tareas sin exigir cálculo mental, memoria o navegación repetitiva. |
| [V2 10125] | 203 | Protección de datos privados, transmisión y visualización. |
| [V2 10129] | 203 | Respaldo y restauración de información. |
| [V2 10114] y [V2 10175] | 204 | Distinción y priorización de alertas según su significado operacional. |
| [V2 10045] | 212 | Señal adicional cuando el color comunica información crítica. |
| [V2 10170] | 226 | Explicaciones, razones y consecuencias de acciones de una ayuda a la decisión. |
| [V2 10171] | 227 | Notificación cuando una situación excede las capacidades de esa ayuda. |

**Traducción propuesta:** tres estados distintos para ausencia de datos, cambio observado y atención según una regla revisada; edad de la medición; texto junto al color; siguiente paso explicable; límites de la ayuda visibles. Estos estados son nuestra propuesta, no una clasificación médica impuesta por el estándar. Distinguir «dato válido» de «persona saludable».

### 3.6. Human Integration Design Handbook, revisión 1 [S05]

La portada identifica NASA/SP-2010-3407/REV1, aprobado el 05/06/2014. Se revisaron secciones del capítulo 10 sobre interfaces, notificaciones, procedimientos electrónicos y gestión de información. Es un fundamento histórico útil; para requisitos vigentes se contrasta con S04.

Los apartados 10.1–10.2 consideran simplicidad, consistencia, legibilidad y control del usuario, y describen evaluación de usabilidad por efectividad y eficiencia [pp. impresas 900–901 / PDF 905–906].

El apartado 10.9 advierte sobre desensibilización por alertas frecuentes. El 10.10 propone integrar información relevante y estado de ejecución en los procedimientos electrónicos [pp. impresas 1045 y 1054–1055 / PDF 1050 y 1059–1060].

Los apartados 10.12.3–10.12.7 tratan operación sin apoyo terrestre, validez y disponibilidad de datos y respaldos. Una medición cuestionable o antigua debe identificarse; información de mala calidad puede perjudicar la decisión [pp. impresas 1066–1068 / PDF 1071–1073].

**Traducción propuesta:** un chequeo con instrucciones y datos en la misma vista, progreso conservado, recuperación y consulta local. El mapa corporal debe evaluarse comparándolo con una lista textual: no hay evidencia en esta revisión de que nuestra representación corporal sea superior por sí misma.

## 4. Contraste puntual con investigación original

Estas comprobaciones se basan en resúmenes públicos de artículos, no en evaluación completa de sus métodos. Su función es mostrar la población y el tipo de resultado detrás de algunas afirmaciones de las revisiones.

- **Ejercicio y hueso:** Smith et al. (2012) describen 13 tripulantes de ISS: ocho con iRED y cinco con ARED. Se midieron dieta, densitometría y marcadores bioquímicos. El resultado favorece una combinación de ejercicio y nutrición; el resumen no permite atribuir todo el efecto al dispositivo ni convertirlo en receta universal [S14].
- **Sueño:** Barger et al. (2014) realizaron un estudio observacional con actigrafía y diarios: 64 astronautas en misiones Shuttle y 21 en ISS. Hallaron sueño reducido antes y durante los vuelos. Esto justifica registrar sueño y contexto, pero no valida nuestro algoritmo personal de fatiga [S15].
- **Evaluación vascular:** Marshall-Goebel et al. (2019) estudiaron prospectivamente a 11 tripulantes de ISS mediante ecografía yugular. Los resultados documentan cambios de flujo y un evento trombótico; la muestra pequeña y el método especializado impiden inferir cribado de trombosis desde presión y pulso cotidianos [S16].
- **Actualización de sueño:** Piltch et al. (publicación anticipada 2024; volumen de revista 2025) estudiaron arquitectura del sueño durante vuelo prolongado. El trabajo refuerza que duración, distribución de fases y método de medición son dimensiones diferentes; no debemos asignar fases REM/NREM a un autorreporte de horas [S17].

Estos artículos ofrecen resultados de cohortes específicas. No se calcularon tamaños de efecto nuevos, no se combinaron estadísticamente las muestras y no se presupone independencia entre todos los conjuntos publicados.

## 5. Matriz: evidencia, indicadores y datos del proyecto

Las fuentes de datos se comprobaron en la revisión de NLSP/OSDR ya guardada. La prioridad de implementación es un juicio de diseño condicionado a la elección del usuario.

| Dominio | Medición o contexto útil | Datos revisados disponibles | Límite y propuesta |
|---|---|---|---|
| Signos vitales | Pulso, presión, respiración y temperatura; método, hora y actividad. | CRF Daily Vitals. | Seguimiento y revisión contextual; no diagnóstico automático. Prioridad inicial propuesta. |
| Nutrición | Masa corporal, ingesta, apetito y cambios del patrón alimentario. | CRF incluye peso y conjuntos de comidas; calorías detalladas no verificadas. | No calcular déficit energético sin composición y cantidades suficientes. |
| Hidratación | Ingesta, pérdidas, síntomas y mediciones según protocolo. | Conjuntos CRF de agua y orina; cobertura por validar. | Balance incompleto no mide por sí solo volumen plasmático ni deshidratación clínica. |
| Sueño y bienestar | Duración, horario, descanso percibido y contexto de trabajo. | No se ha verificado una serie correspondiente en los archivos seleccionados. | Puede añadirse registro voluntario; no presentarlo como dato NASA real si no lo es. |
| Función física | Pruebas de fuerza, resistencia, VO2 y carga realizada. | MR079G y MR080G. | Respetar protocolo y esfuerzo; una frecuencia cardíaca en ejercicio no se interpreta como reposo. |
| Salud ósea | DXA, región corporal, dispositivo y fase. | MR035G; OSD-51 aporta investigación molecular distinta. | Evaluación periódica. Masa/pulso no reconstruyen densidad ósea. |
| Inmunidad | Resultados celulares y funcionales de laboratorio. | BRSMImmune; OSD-56 es cultivo celular. | No sintetizar «inmunidad 80%» a partir de signos vitales o expresión génica sin validación. |
| Visión | Síntomas y pruebas oculares documentadas. | No se verificaron imágenes diagnósticas en los datasets elegidos. | Un cuestionario orienta consulta; no identifica SANS ni sustituye OCT/fundoscopia. |
| Ambiente/radiación | Sensor, ubicación, tiempo, magnitud y unidad. | MSD007 y DTO 684; RadLab/EDA pendientes de verificar para integración. | No mezclar misiones ni dosis absorbida, equivalente y efectiva. No atribuir causalidad sin datos compatibles. |

Un baseline debe explicitar persona, periodo, fase, condiciones y método. Comparar con él puede mostrar cambio; establecer una ventana universal o un umbral de atención necesita justificación adicional. La normalidad anterior de una persona no descarta un resultado peligroso, y la ausencia de desviación no demuestra salud.

## 6. Recomendaciones de diseño y evaluación

Las siguientes son inferencias para nuestro proyecto, no resultados de ensayos sobre la futura aplicación:

1. **Separar calidad e interpretación.** Mostrar fuente, unidad, momento y disponibilidad antes de asignar significado clínico. Verificarlo con casos de falta de datos, fases distintas y unidades incompatibles. Fundamento: S04 [V2 10020] y S05 §10.12.4.
2. **Conectar indicador y acción.** Cada tarjeta debe responder qué cambió, qué se sabe, qué falta y cuál es el siguiente paso respaldado. Fundamento: S03 [V1 3003/3004], S04 [V2 10170/10171].
3. **Organizar atención preventiva.** El chequeo puede recoger nutrición, líquidos, ejercicio y descanso, respetando la carga de trabajo y la necesidad de cada medición. Fundamento: S01, S03, S07 y S09. No todos los exámenes deben hacerse diariamente.
4. **Guardar estado y contexto de misión.** Permitir retomar un procedimiento y distinguir lo pendiente de lo completado. Evaluar funcionamiento local y restauración si se adopta esa arquitectura. Fundamento: S05 §§10.10 y 10.12; S04 [V2 10129].
5. **Evaluar la interfaz con tareas.** Comparar mapa y lista por errores de interpretación, tiempo para localizar un dato, comprensión de información faltante y capacidad de identificar el siguiente paso. Fundamento: S05 §10.2. No fijar tiempos objetivo inventados antes de conocer usuarios y tareas.
6. **Versionar reglas y contenido.** Mantener condición de aplicación, fuente/página, fecha, población, limitación, acción, equipamiento y estado de revisión. Esta estructura es una propuesta de trazabilidad derivada de la heterogeneidad de las fuentes.

No se implementó software ni se ensayó una interfaz durante esta revisión. No hay valores de alerta, medicación, dosis, porcentaje global de salud ni metas de ejercicio personalizados aprobados.

## 7. Qué permite afirmar en la presentación

Una formulación defendible sería: «La propuesta se fundamenta en requisitos de seguimiento preventivo y atención médica de NASA y en informes sobre adaptación fisiológica. Presenta mediciones y evolución con su procedencia, explica sus límites y orienta el siguiente paso con contenido trazable. Los datos demostrativos revisados incluyen análogos terrestres; la eficacia clínica del sistema todavía no se ha evaluado».

No corresponde afirmar que la aplicación diagnostica SANS, predice trombosis, calcula riesgo personal de cáncer o está certificada por NASA. La selección de información NASA no constituye aprobación de la aplicación.

## 8. Límites, incertidumbres y próximos pasos académicos

- Revisión dirigida de fuentes seleccionadas, con lectura parcial y preguntas de diseño. No hay protocolo PRISMA, búsqueda exhaustiva, evaluación formal de sesgo de cada estudio ni metaanálisis.
- Los informes reutilizan bibliografía y algunas cohortes. Varias referencias concordantes no equivalen necesariamente a observaciones independientes.
- Un resultado de LEO, reposo terrestre, célula o animal no se generaliza automáticamente a gravedad parcial o misiones interplanetarias.
- Las portadas de sueño y capacidad médica son antiguas. Las afirmaciones sobre tecnologías y modelos deben actualizarse para cada función que se elija; la comprobación puntual de artículos no completa esa actualización.
- Los libros tratan evidencia y mecanismos, pero no contienen por sí solos un protocolo clínico completo para cada síntoma. Hace falta identificar guías específicas y revisar su aplicación antes de convertir orientaciones en reglas operativas.
- Los análisis anteriores de datos verificaron muestras, no integridad y cobertura de todas las campañas. Las relaciones entre sujetos y fuentes deben comprobarse.
- Un recurso gratuito para leer no es necesariamente redistribuible en su totalidad. Usar citas breves y conservar enlaces y atribuciones; no copiar los libros completos dentro del producto.

La prioridad propuesta de CRF se reconsideraría si sus unidades, cobertura o permisos no permiten el caso elegido, o si el usuario decide priorizar otro dominio. La utilidad del mapa corporal se reconsideraría si las pruebas de tareas muestran más errores o navegación que una lista. Cada regla médica se reconsideraría ante una fuente más reciente o una revisión clínica incompatible con su supuesto.

## 9. Referencias

Los URL de PDF incluyen la versión descargada por contenido, no una garantía de que el servidor no los sustituya. `research/source-registry.json` conserva hashes, fecha de descarga, tamaño y páginas examinadas.

[S01] Smith, S. M., Zwart, S. R., Douglas, G. L., & Heer, M. (2021). *Human Adaptation to Spaceflight: The Role of Food and Nutrition* (2.ª ed.). NASA. [PDF completo](https://www.nasa.gov/wp-content/uploads/2024/08/human-adaptation-2021-final-b.pdf).

[S02] Smith, S. M., Zwart, S. R., Kloeris, V., & Heer, M. (2009). *Nutritional Biochemistry of Space Flight*. Nova Science Publishers. [PDF completo alojado por NASA](https://www.nasa.gov/wp-content/uploads/2023/03/nutritional-biochemistry-of-space-flight.pdf).

[S03] NASA. (2023). *NASA-STD-3001, Volume 1: Crew Health*, revisión C, aprobada 15 de septiembre. [PDF](https://www.nasa.gov/wp-content/uploads/2023/11/nasa-std-3001-vol-1-rev-c-with-signature.pdf).

[S04] NASA. (2026). *NASA-STD-3001, Volume 2: Human Factors, Habitability, and Environmental Health*, revisión F, aprobada 14 de julio. [PDF](https://www.nasa.gov/wp-content/uploads/2025/05/nasa-std-3001-vol-2.pdf).

[S05] NASA. (2014). *Human Integration Design Handbook*, NASA/SP-2010-3407/REV1, revisión 1, aprobada 5 de junio. [PDF](https://www.nasa.gov/wp-content/uploads/2023/03/human-integration-design-handbook-revision-1.pdf).

[S06] NASA HRP. (2022). *Risk of Cardiovascular Adaptations Contributing to Adverse Mission Performance and Health Outcomes*. Aprobado 15 de diciembre. [Informe](https://humanresearchroadmap.nasa.gov/Evidence/reports/Cardio%20Risk%20EB%202022%20FINAL_4-3-2023.pdf).

[S07] NASA HRP. (2023). *Risk of Impaired Performance due to Reduced Muscle Mass, Strength & Endurance / Risk of Reduced Physical Performance Capabilities due to Reduced Aerobic Capacity*. Aprobado 22 de enero; archivo del índice con nombre fechado en 2024. [Informe](https://humanresearchroadmap.nasa.gov/Evidence/reports/Evidence%20report%20aerobic%20and%20muscle_FINAL%204-3-2024.pdf).

[S08] NASA HRP. (2024). *Risk of Bone Fracture due to Spaceflight-induced Changes to Bone*. HRP-F07-ERFT.R2, aprobado 18 de julio. [Informe](https://humanresearchroadmap.nasa.gov/Evidence/reports/Bone%20Fracture%20Evidence%20Report_07-18-2024.pdf).

[S09] NASA HRP. (2016). *Risk of Performance Decrements and Adverse Health Outcomes Resulting from Sleep Loss, Circadian Desynchronization, and Work Overload*. Aprobado 11 de abril. [Informe](https://humanresearchroadmap.nasa.gov/Evidence/reports/Sleep.pdf).

[S10] Mehta, S., & Crucian, B. (2022). *Risk of Crew Adverse Health Event Due to Altered Immune Response*. NASA HRP, aprobado 1 de junio. [Informe](https://humanresearchroadmap.nasa.gov/Evidence/reports/IMMUNE%20EB%20Update%202021%20v02%20FINAL_6-15-22.pdf).

[S11] NASA HRP. (2017). *Risk of Adverse Health Outcomes and Decrements in Performance due to In-Flight Medical Conditions*. Aprobado 8 de mayo. [Informe](https://humanresearchroadmap.nasa.gov/Evidence/reports/Medical.pdf).

[S12] NASA HRP. (2022). *Risk of Spaceflight Associated Neuro-ocular Syndrome (SANS)*. Aprobado 7 de abril. [Informe](https://humanresearchroadmap.nasa.gov/Evidence/reports/SANS%20EB%202022%20FINAL_8-15-22.pdf).

[S13] NASA HRP. (2026). *Risk of Ionizing Radiation Carcinogenesis*. [Informe](https://humanresearchroadmap.nasa.gov/Evidence/reports/HRP-ER-CANCER-SR-20260811.pdf).

[S14] Smith, S. M., et al. (2012). Benefits for bone from resistance exercise and nutrition in long-duration spaceflight: Evidence from biochemistry and densitometry. *Journal of Bone and Mineral Research, 27*(9), 1896–1906. DOI: 10.1002/jbmr.1647. [Resumen público](https://pubmed.ncbi.nlm.nih.gov/22549960/).

[S15] Barger, L. K., et al. (2014). Prevalence of sleep deficiency and use of hypnotic drugs in astronauts before, during, and after spaceflight: An observational study. *The Lancet Neurology, 13*(9), 904–912. DOI: 10.1016/S1474-4422(14)70122-X. [Resumen público](https://pubmed.ncbi.nlm.nih.gov/25127232/).

[S16] Marshall-Goebel, K., et al. (2019). Assessment of jugular venous blood flow stasis and thrombosis during spaceflight. *JAMA Network Open, 2*(11), e1915011. DOI: 10.1001/jamanetworkopen.2019.15011. [Resumen público](https://pubmed.ncbi.nlm.nih.gov/31722025/).

[S17] Piltch, O., Flynn-Evans, E. E., Young, M., & Stickgold, R. (2025; publicación electrónica 2024). Changes to human sleep architecture during long-duration spaceflight. *Journal of Sleep Research, 34*(3), e14345. DOI: 10.1111/jsr.14345. [Resumen público](https://pubmed.ncbi.nlm.nih.gov/39523514/).

[S18] NASA HRP. (s. f.). *Human Research Roadmap: Evidence*. Índice y explicación de las categorías de evidencia. Consultado el 14 de noviembre de 2026. [Sitio oficial](https://humanresearchroadmap.nasa.gov/Evidence/).

---

## Segunda parte — Investigación reciente y aplicación al producto

Fecha: 14 de noviembre de 2026. Ampliación de la revisión inicial presentada en la primera parte de este documento. No es una revisión sistemática, un metaanálisis ni una validación clínica. Las funciones siguientes son propuestas para el alcance integrado elegido por el usuario; todavía no están implementadas en la maqueta.

### Conclusión para el equipo

Recomiendo convertir el copiloto en una ayuda para **completar y dar seguimiento al cuidado con los recursos reales de la misión**. Su unidad principal sería un episodio: qué siento, qué sabemos, qué falta, qué procedimiento puedo realizar, qué ocurrió y qué queda pendiente. Salud, adaptación y hábitat aportarían información al mismo episodio y al plan cotidiano.

El diferencial defendible es la combinación de procedimientos ejecutables, comprobación de recursos y calidad de datos, y seguimiento del resultado. Es una hipótesis de valor que debemos evaluar frente a un dashboard; no una afirmación de primicia mundial. AMOS y otros proyectos NASA ya investigan asistencia autónoma y procedimientos guiados.

### 1. Método y trazabilidad

Preguntas: ¿qué problemas humanos justifican integrar los tres dominios?, ¿qué apoyo permite actuar sin conocimientos médicos completos?, ¿qué resultados y limitaciones deben mostrarse?, ¿cómo demostrar utilidad sin inventar eficacia clínica?

Se buscaron estudios humanos de vuelo, experimentos terrestres pertinentes y documentación NASA sobre apoyo a decisiones. Consultas principales: `spaceflight autonomous medical decision support`, `High intensity training during spaceflight`, `Effects of exercise countermeasures multisystem`, `Incomplete recovery bone strength astronauts`, `spaceflight sleep deficiency Barger`, `carbon dioxide cognition astronaut-like`, `AMOS autonomous medical officer support`, y criterios de evaluación Space Apps. Búsqueda por motor web, seguida de recuperación directa de textos desde PMC, Nature y NTRS.

Se recuperaron **seis textos completos**: cinco artículos científicos (ejercicio, función multisistema, hueso, sueño y CO₂) y un manuscrito AMOS depositado como preprint en NTRS. Se leyeron secciones pertinentes de métodos, resultados, discusión y limitaciones; no se reanalizaron datos individuales ni suplementos. Las respuestas descargadas, tamaños y SHA-256 están en el archivo local `scratch/spaceapps-health/research/ampliacion/downloads.json`; las descargas y extracciones se conservan en el workspace de investigación y no se incluyen en este repositorio. Recuperar un archivo no significa revisar cada frase.

La selección favorece aplicación al producto, acceso gratuito y evidencia humana. Excluye material comercial, resultados celulares como sustituto de estado clínico y afirmaciones promocionales como prueba de eficacia. Hay sesgo de selección e idioma, una sola revisión y ausencia de protocolo preregistrado o evaluación formal GRADE. No se puede afirmar exhaustividad ni que sean los últimos estudios de todos los temas.

Se conserva la disciplina de procedencia de `SKILLS/claim-provenance-discipline`: distinguir resultado observado, límite de generalización, propuesta de diseño y prueba pendiente. La evidencia previa de HRP y estándares se hereda con sus versiones y páginas desde BASE_ACADEMICA.md; no se presenta como una nueva verificación integral.

### 2. Hallazgos que cambian el diseño

#### A01 — Guiar la ejecución requiere comprobar preparación y errores

**Fuente:** Ebert y colaboradores, *Autonomous Medical Officer Support (AMOS) Software Technology Demonstrations on the ISS*. NTRS 20240012964, manuscrito de 17 páginas, depositado como preprint en 2024. Localizadores: Methods/Participants/Protocol; Results/Human Factors Observations/Software Use Pattern.

https://ntrs.nasa.gov/citations/20240012964

Dos parejas participaron en tres ocasiones; los resultados de una pareja se excluyeron por una desviación importante en la revisión inicial de instrucciones. El trabajo describe obtención autónoma de imágenes, pero también problemas de configuración y posicionamiento. Un reinicio dejó un ajuste incorrecto que no se volvió a verificar. No demuestra capacidad diagnóstica general ni eficacia de Órbita; la selección y exclusión limitan generalización.

**Incorporar:** preparación explícita, comprobación de equipo/configuración, pasos breves, pausa y reanudación, resultado «no pude completar», y revisión antes de repetir. Distinguir «instrucción leída», «paso realizado» y «medición utilizable». No incluir ecografía en el MVP sin equipo y contenido específico revisado.

**Prueba pendiente:** comparar omisiones y errores de preparación con instrucciones estáticas. Si no mejora la ejecución o agrega carga excesiva, revisar el flujo.

#### A02 — Cumplir ejercicio no equivale a conservar todas las capacidades

**Fuente:** English y colaboradores, *High intensity training during spaceflight: results from the NASA Sprint Study*, 2020. DOI: 10.1038/s41526-020-00111-x. Methods/Subjects; Discussion/limitations.

https://pmc.ncbi.nlm.nih.gov/articles/PMC7434884/

Comparó Sprint (9 astronautas) con atención habitual (17). Hubo deterioro de distintas medidas en ambos grupos. Los participantes eligieron grupo; el régimen habitual cambió durante el estudio y algunas pruebas posvuelo se realizaron en días diferentes. No es un ensayo aleatorizado ni prueba de equivalencia de cualquier rutina.

**Incorporar:** separar plan indicado, actividad efectivamente realizada y respuesta física. Registrar dispositivo, duración, carga cuando corresponda y dificultades. Mostrar fuerza, resistencia y capacidad aeróbica por separado. La aplicación no prescribe por sí sola el entrenamiento del artículo.

**Prueba pendiente:** el usuario debe distinguir «completé mi tarea» de «mejoró mi capacidad»; no colorear hueso o músculo como saludable por cumplir una sesión.

#### A03 — La variabilidad individual importa más que un promedio tranquilizador

**Fuente:** Scott y colaboradores, *Effects of exercise countermeasures on multisystem function in long duration spaceflight astronauts*, 2023. DOI: 10.1038/s41526-023-00256-5. Abstract; Methods; Discussion/limitations.

https://pmc.ncbi.nlm.nih.gov/articles/PMC9898566/

Cohorte de 46 astronautas: el ejercicio habitual no evitó todo el deterioro y las respuestas individuales fueron heterogéneas. No hubo control sin ejercicio; dieta, medicación y otras exposiciones no estaban plenamente controladas. Las estimaciones para futuras misiones son proyecciones, no eventos observados. Comparte periodo ISS 2011–2017 con Sprint: no sumar ambos tamaños como participantes independientes sin comprobar solapamiento.

**Incorporar:** comparaciones personales con método, fase y fecha visibles; mantener resultados por sistema, sin puntuación global inventada. Un cambio observado no demuestra enfermedad ni el efecto causal de una contramedida.

**Prueba pendiente:** ante protocolos o dispositivos incompatibles, el sistema debe advertir la diferencia en vez de calcular una tendencia aparentemente homogénea.

#### A04 — La salud ósea necesita historial y límites de medición explícitos

**Fuente:** Gabel y colaboradores, *Incomplete recovery of bone strength and trabecular microarchitecture at the distal tibia 1 year after return from long duration spaceflight*, 2022. DOI: 10.1038/s41598-022-13461-1. Results; Discussion/limitations; Methods.

https://www.nature.com/articles/s41598-022-13461-1

Seguimiento de 17 astronautas (14 hombres, 3 mujeres), con HR-pQCT, DXA y biomarcadores. Nueve no recuperaron completamente la densidad total tibial a los 12 meses según la definición del estudio. La muestra es pequeña y el seguimiento no permite demostrar irreversibilidad de por vida. Las asociaciones con ejercicio tampoco prueban una prescripción causal individual.

**Incorporar:** historial por región, método y fecha, con próxima evaluación según plan. DXA, HR-pQCT y masa corporal no son intercambiables. No dibujar una curva diaria de densidad ósea a partir de ejercicio o pulso, ni atribuir HR-pQCT al dataset MR035G, que contiene DXA.

**Prueba pendiente:** cuando solo exista examen previo al vuelo, mostrar «última evaluación conocida» y ausencia de medición actual.

#### A05 — Descanso registrado y sueño estimado son cosas diferentes

**Fuente:** Barger y colaboradores, *Prevalence of sleep deficiency and use of hypnotic drugs in astronauts before, during, and after spaceflight*, 2014. DOI: 10.1016/S1474-4422(14)70122-X. Methods; Results; Discussion/limitations.

https://pmc.ncbi.nlm.nih.gov/articles/PMC4188436/

Estudio observacional con 64 astronautas Shuttle y 21 ISS; en ISS estimó 6,09 ± 0,67 horas de sueño durante vuelo. La actigrafía no mide etapas del sueño; el trabajo no midió directamente errores operativos o rendimiento cognitivo. El periodo posvuelo también puede estar influido por recuperación de sueño. La media del estudio no es una meta ni un umbral médico para Órbita.

**Incorporar:** horario destinado a descansar, duración reportada o estimada, fuente, despertares y percepción personal. Integrar descanso y tareas del plan sin convertir una mala noche en diagnóstico o incapacidad operacional.

**Prueba pendiente:** los usuarios deben reconocer qué dato reportaron y cuál proviene de un dispositivo; no recomendar hipnóticos automáticamente.

#### A06 — El ambiente aporta contexto; no identifica por sí solo la causa

**Fuente principal:** Scully y colaboradores, *Effects of acute exposures to carbon dioxide on decision making and cognition in astronaut-like subjects*, 2019. DOI: 10.1038/s41526-019-0071-6. Abstract; Methods; Discussion.

https://pmc.ncbi.nlm.nih.gov/articles/PMC6584569/

Ensayo terrestre cruzado y doble ciego en 22 participantes, con cuatro concentraciones de CO₂. No encontró un patrón claro y general de dosis-respuesta en las pruebas evaluadas. Exposición aguda y análogo terrestre no prueban seguridad en misiones prolongadas. Como contraste, Law y colaboradores (2014, PMID 24806559; resumen y referencias NASA localizados, texto íntegro no revisado) informaron asociación entre CO₂ y cefaleas en ISS. Son desenlaces y diseños distintos: no es una refutación directa entre estudios.

**Incorporar:** hora, módulo, sensor, unidad, intervalo de exposición y cobertura. Presentar coincidencias y explicaciones alternativas, nunca «el CO₂ causó tu cansancio». No convertir ppm a presión parcial sin presión total compatible ni mezclar µGy y µSv.

**Prueba pendiente:** datos de otra ubicación o sin coincidencia temporal no deben aparecer como exposición personal confirmada.

### 3. Funciones prioritarias propuestas

| Función | Experiencia del astronauta | Evidencia que la motiva | Alcance demostrable |
|---|---|---|---|
| Episodio de cuidado | Reúne síntoma, contexto, acción, resultado y seguimiento | A01, A03, A05, A06 | Un recorrido completo, persistente y exportable |
| Procedimiento según recursos | Comprueba equipo, preparación y ayuda necesaria | A01; NTRS 20240004905 | Dos configuraciones de misión; una tarea disponible y otra bloqueada |
| Estado de la información | Explica qué sabemos y qué falta, con fecha y procedencia | A03–A06; STD-3001 vol. 2 en base previa | Medición actual, antigua, ausente y no comparable |
| Seguimiento de contramedidas | Distingue lo indicado, lo realizado y lo observado | A02–A04 | Ejercicio/nutrición registrados y pruebas periódicas; sin ajuste automático |
| Hábitat contextual | Sitúa el episodio en módulo y periodo compatibles | A06 | Serie ambiental sintética identificada y estado de cobertura |
| Resumen para apoyo médico | Conserva cambios, acciones, dificultades y pendientes | Necesidad operativa NASA; propuesta de diseño | Exportación revisable; no envío automático |

Los antecedentes operativos NASA incluyen restricciones de equipos, suministros y comunicación: https://ntrs.nasa.gov/citations/20240004905 . La presentación de mercado de CDS de 2025 admite soluciones con o sin IA: https://ntrs.nasa.gov/citations/20250000388 . Se revisaron sus fichas/resúmenes públicos; no son ensayos de efectividad del producto.

#### La tarjeta central del copiloto

1. **Qué registraste:** observación del astronauta, hora y contexto.
2. **Qué sabemos:** mediciones pertinentes con método y antigüedad.
3. **Qué falta:** datos, equipo o revisión necesarios.
4. **Qué podés hacer:** procedimiento aplicable y su fundamento.
5. **Qué ocurrió:** resultado, dificultad o interrupción.
6. **Qué sigue:** pendiente del plan o comunicación prevista por una guía revisada.

La selección inicial puede implementarse con reglas explícitas escritas por el equipo. IA generativa y operación offline siguen siendo opciones de arquitectura; ninguna es condición para que este recorrido sea útil.

### 4. Demostración integrada recomendada

Caso completamente sintético y rotulado: un astronauta registra cansancio. Mi día muestra descanso registrado, una tarea de ejercicio incompleta y datos ambientales del módulo. Adaptación conserva una prueba física previa y un examen óseo anterior, sin inventar valores actuales. El copiloto solicita contexto faltante y propone una tarea de medición cuyo contenido debe estar revisado.

El astronauta confirma equipo y preparación, realiza la tarea y registra el resultado o una dificultad. El episodio actualiza Mi plan y Mi evolución. Después cambiamos la configuración de misión: falta el equipo. Órbita conserva el episodio, explica la limitación y muestra únicamente una alternativa documentada o la necesidad de apoyo. No inventa un reemplazo diagnóstico.

La escena diferenciadora es mostrar que la ayuda cambia cuando cambian los recursos o la calidad de la información, y que el cuidado continúa después de guardar una cifra.

Para demostrar uso sustantivo de NASA, agregar un caso separado y reproducible con CRF y un caso de adaptación de MR079G/MR080G/MR035G, según archivos y unidades verificados. Mostrar procedencia, fase y límites. No fusionarlos como una misma persona sin correspondencia comprobada. Un enlace bibliográfico por sí solo no equivale a integración de datos. No hay aún series clínicas y ambientales reales emparejadas verificadas para el episodio integrado.

### 5. Correspondencia con el desafío y evaluación

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

### 6. Evaluación propuesta antes de ampliar funciones

**Hipótesis:** el recorrido guiado mejora la ejecución y comprensión frente a una pantalla de métricas con instrucciones estáticas. No está probada.

Prueba formativa propuesta con 6–8 voluntarios no especialistas, casos simulados equivalentes y orden alternado entre interfaces. Ese tamaño sirve para detectar problemas de usabilidad, no para demostrar eficacia clínica o representar astronautas. Evaluar: pasos omitidos, registros correctos, tiempo para encontrar el siguiente paso, reconocimiento de datos ausentes y capacidad de explicar el límite de una interpretación. Registrar también carga percibida y solicitudes de ayuda. No recoger datos médicos personales para esta prueba.

Casos mínimos: recorrido completo; equipo ausente; dato ambiental de otro módulo; examen antiguo; unidad incompatible; procedimiento interrumpido; resultado que requiere revisión según una regla de demostración identificada. Reportar resultados reales, incluidos fallos, sin inventar metas porcentuales cumplidas. Cualquier error que presente un dato ausente como normal o una tarea imposible como disponible obliga a corregir antes de presentar.

Separar tres evaluaciones: exactitud del software, comprensión/usabilidad y revisión clínica de contenido. Ninguna sustituye las otras. Para atención real harían falta validación específica de misión y dispositivos y el marco aplicable, fuera de lo que demuestra esta hackathon.

### 7. Escalabilidad y límites de alcance

Propuesta técnica: un núcleo propio que gestione mediciones, episodios, tareas y ejecuciones de procedimientos. Incorporar configuraciones de misión con equipos y capacidades; procedimientos con identificador, versión, evidencia, prerrequisitos y estado de revisión; y adaptadores propios de datos con unidades y procedencia. Una ejecución conserva la versión utilizada aunque el procedimiento cambie después. Es diseño extensible, no rendimiento o escalabilidad ya medidos.

Todo código funcional debe escribirse por el equipo, conforme a la instrucción del usuario. AMOS y los repositorios investigados son inspiración conceptual; no se copia ni adapta su código. Acceso gratuito a artículos no autoriza redistribuir sus figuras o textos íntegros en la aplicación.

Posponer diagnósticos generativos, una puntuación universal de salud, predicción individual desde ómicas y nuevas pruebas instrumentales sin equipamiento ni validación. Esto mantiene el producto integrado y concentra el desarrollo en una experiencia comprobable.

**Estado de esta entrega:** investigación documental y propuesta, no modificación del HTML. La maqueta actual continúa cubriendo principalmente el chequeo. Los límites de acceso a las páginas 2026 y las brechas clínicas y de datos permanecen abiertos.
