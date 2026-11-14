# Base académica para una herramienta de salud de astronautas

Revisión documental dirigida para el desafío Space Apps 2026. Fecha de consulta: 14 de noviembre de 2026.

## 1. Conclusión y alcance

La documentación respalda una herramienta de seguimiento personal que integre mediciones, contexto de misión, evolución, instrucciones de medición y orientación trazable. La vigilancia preventiva debe contemplar nutrición, ejercicio, descanso y bienestar psicosocial además de signos vitales [S03, pp. PDF 18–21]. Nuestra recomendación de producto es combinar un chequeo guiado con un historial y una representación corporal accesible; esa combinación es una propuesta de diseño, no una solución cuya eficacia clínica haya sido demostrada por estas fuentes.

La prioridad científica es distinguir tres cosas: qué se midió, qué interpretación admite esa medición y qué acción está respaldada para esa situación. Los datos disponibles permiten demostrar seguimiento y cambios observados; no bastan para validar diagnósticos automáticos, una puntuación global de salud o tratamientos personalizados.

Se descargaron 13 PDF únicos: dos libros, los dos volúmenes de NASA-STD-3001, el HIDH y ocho informes temáticos del HRP. La lectura se dirigió a resúmenes, secciones pertinentes, requisitos y limitaciones. No se leyó íntegramente cada una de las 1.301 páginas del HIDH ni se presenta este trabajo como revisión sistemática o metaanálisis. Se contrastaron además resúmenes de cuatro artículos originales indexados en PubMed; no se verificaron íntegramente sus métodos ni se reanalizaron sus datos.

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
