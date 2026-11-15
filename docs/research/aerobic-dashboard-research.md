# Inspiración para un panel personal de seguimiento aeróbico

Fecha de consulta: 15 de noviembre de 2026.

## Recomendación principal

Diseñar un panel longitudinal personal: **qué se midió, cómo cambió, con qué
referencia, cuántas observaciones lo sostienen y qué no sabemos todavía**.
Combinar la síntesis de Apple Health, la organización de pruebas de Polar Flow,
la revisión temporal de Intervals.icu y la trazabilidad de los visores de datasets.

«Seguimiento continuo» describe la continuidad del panel y del historial. No
significa que VO₂pico se mida continuamente. Las pruebas periódicas, las señales
de una sesión y el registro diario de actividad tienen resoluciones diferentes.
La interfaz debe conservar esa diferencia.

Esta entrega es investigación y material de diseño: no cambia la aplicación,
el backend, los mocks activos ni el contrato compartido.

## 1. Alcance y método de revisión

Se revisaron siete referencias externas de interfaz, documentación oficial,
capturas publicadas y materiales del repositorio local Research. Se distinguen
tres grupos: aplicaciones personales de entrenamiento, plataformas de investigación
con wearables y visores de datasets fisiológicos. No todos son portales de datos
abiertos ni tienen acceso público a sus paneles autenticados.

La revisión permite evaluar patrones documentados, no demostrar usabilidad,
exactitud de algoritmos comerciales o idoneidad para astronautas. No se crearon
cuentas, conectaron dispositivos ni ejecutaron pruebas médicas. Las capturas de
referencia se consultaron para inspiración; no se incorporan sus assets o código.

## 2. Referencias de frontend

### Apple Health · Cardio Fitness

**Verificado:** su documentación muestra un gráfico personal y filtros de día,
semana, mes, seis meses y año. La medida que presenta es una estimación de VO₂máx.
La estimación documentada usa determinadas actividades exteriores; no es un método
que se pueda trasladar automáticamente al interior de una nave.

**Tomar para Órbita:** una medida principal, selector de período y acceso al
historial completo. Colocar el origen medido/estimado junto al valor.

**Adaptar:** la comparación personal es más apropiada para nuestro primer panel
que copiar categorías poblacionales por edad/sexo o sus avisos de nivel bajo.

Fuente y captura oficial: [Apple Support](https://support.apple.com/en-us/108790).

### Polar Flow · Tests

**Verificado:** el manual reúne pruebas en una sección de seguimiento y permite
comparar resultados a largo plazo. Distingue tipos de pruebas y advierte que
cambios de peso/configuración afectan la comparabilidad de resultados.

**Tomar:** una visita es un objeto explorable: fecha, resultado, modalidad y
condiciones. El historial de pruebas debe ser independiente del calendario de
entrenamientos.

**Adaptar:** no convertir sus recomendaciones de entrenamiento, zonas o protocolos
para corredores en instrucciones del astronauta. El contexto de medida debe estar
confirmado para cada comparación.

Fuente y captura: [Polar, Running Performance Test](https://support.polar.com/e_manuals/vantage-v2/polar-vantage-v2-user-manual-english/running-performance-test.htm).

En la captura oficial revisada, el resultado reciente y el inicial están encima
del gráfico; debajo, una tabla permite inspeccionar las visitas. Para Órbita
mantendría esa jerarquía, pero mostraría una medida principal por vez para evitar
la densidad de varias escalas superpuestas.

### Garmin Connect · Training Status

**Verificado en documentación indexada de soporte:** relaciona tendencias de
estimación de capacidad, carga y otros datos para mostrar estados de entrenamiento.
La extracción directa de sus páginas devolvió contenido dependiente de JavaScript;
no se verificó un panel autenticado ni una captura actual de su interfaz.

**Tomar:** presentar un estado sintético acompañado de los datos que lo explican.

**Adaptar:** no copiar etiquetas como «productivo», «desentrenamiento» o sus
umbrales/algoritmos. En Órbita, el estado inicial debe describir la tendencia del
indicador y la suficiencia de datos, sin calificar globalmente la salud.

Fuente: [Garmin Support, Training Status](https://support.garmin.com/en-GB/?faq=VxKazDQ2mkAmDoQbJriEBA).

### TrainingPeaks · Athlete Home / Performance Insights

**Verificado:** la documentación presenta un resumen diario y gráficos consultables
en ventanas de 7, 30, 90 y 180 días; se puede seleccionar un día para revisar su valor.

**Tomar:** combinar una lectura de hoy con una ventana temporal explícita y acceso
al detalle. Separar actividad realizada y resultados de evaluación en paneles
relacionados.

**Adaptar:** sus métricas CTL/ATL/TSB y categorías son modelos de entrenamiento;
no son intercambiables con una medición de capacidad aeróbica. No adoptarlas como
índice de salud del astronauta.

Fuentes: [Performance Insights](https://help.trainingpeaks.com/hc/en-us/articles/41077784209165-Athlete-Home-Performance-Insights),
[Performance Management Chart](https://help.trainingpeaks.com/hc/en-us/articles/204071874-Performance-Management-Chart-PMC).

### Intervals.icu · Fitness / tablas de totales

**Verificado:** una publicación del desarrollador muestra tablas configurables,
columnas de métricas representables en gráficos, agrupación, formatos y selección
de temporadas. La documentación incluye capturas, pero su descarga devolvió 403;
la descripción se basa en el texto del desarrollador, no en una cuenta propia.

**Tomar:** gráfico y tabla como dos vistas de la misma selección; período de misión
además de calendario convencional.

**Adaptar:** el panel del astronauta debería empezar con pocas medidas elegidas.
La configuración libre de muchas curvas y fórmulas añade carga innecesaria al
primer recorrido.

Fuente: [Intervals.icu, Configurable totals tables](https://forum.intervals.icu/t/configurable-totals-tables-for-fitness-data/123932).

### Fitabase · datos de wearables para investigación

**Verificado:** su documentación separa resoluciones de segundos, minutos, horas
y días. Publica una vista de zonas de frecuencia cardíaca y documenta datos con
timestamps, actividad y eventos de sincronización. La captura de zonas publicada
es de 2020: se usa como patrón, no como garantía del diseño actual.

**Tomar:** indicar resolución, fecha de adquisición, cobertura y procedencia de
cada serie; distinguir fecha de medición de fecha de sincronización.

**Adaptar:** no mezclar una curva de FC de segundos con una evaluación mensual
como si fueran el mismo tipo de observación, ni copiar zonas por edad.

Fuentes: [Data Resolutions](https://www.fitabase.com/resources/knowledge-base/learn-about-fitbit-data/data-resolutions/),
[vista publicada de zonas](https://www.fitabase.com/blog/post/hr-zones/).

### PhysioNet · LightWAVE

**Verificado:** visor web de registros fisiológicos y anotaciones, con selección
de dataset/registro, navegación temporal, cambio de escala y tablas de detalle.

**Tomar:** seleccionar una observación y poder inspeccionar su fuente y los eventos
que la acompañan. Es una referencia especialmente útil para la vista de detalle
de una sesión o para explorar un dataset.

**Adaptar:** su densidad técnica y las escalas cortas de señales no son la estructura
principal para un historial mensual personal. No presentar ECG o formas de onda
solo como decoración del panel aeróbico.

Fuente: [documentación de LightWAVE](https://physionet.org/static/lightwave/doc/about.html).

### Research/dashboard · referencia propia del equipo

El dashboard local aporta identidad visual, filtros compartidos entre gráficos y
tablas, procedencia y explicaciones de comparabilidad. Su audiencia es el equipo
investigador. Para el astronauta conviene sustituir cohortes, histogramas y matrices
de evidencia por una historia personal, eventos y resúmenes breves.

Referencias locales: `Research/dashboard/client/src/pages/Explore.tsx`,
`components/research.tsx` y `lib/analysis.ts`. Su fuente declara «escala fuente /
unidad no confirmada» donde corresponde: esa cautela debe conservarse al reutilizar
los análisis.

## 3. Qué aporta Research a un historial simulado

Se revisaron el informe para la médica, la auditoría MR080G, los diagnósticos de
metadatos G1/G2, el protocolo longitudinal condicionado y la resolución de
comparabilidad física. No se copiaron datos individuales ni comentarios clínicos.

### Hallazgos relevantes

- MR080G es la fuente aeróbica principal entre los materiales locales. Su conjunto
  CFT70 tiene **38 PRE, 37 POST1, 36 POST2 y 34 screening**: 111 pruebas programadas
  y 34 de selección. Son registros repetidos de un análogo terrestre.
- Los **58 códigos distintos** no equivalen a 58 personas con seguimiento completo:
  20 aparecen solo en screening; 36 tienen PRE y ambos POST. Los 73 pares técnicos
  comparten referencias y no son 73 personas independientes.
- El rango global 2011–2014 reúne distintas personas. No es un seguimiento continuo
  de años de un astronauta ni justifica rellenar meses entre visitas.
- Además de VO2PK hay campos de FC, carga, duración, intercambio gaseoso, esfuerzo
  percibido y contexto. El informe médico indica que sus unidades y definiciones
  deben revisarse por columna y sesión antes de utilizarlas.
- En las tablas centrales siguen abiertas unidades exactas, protocolos por sesión
  y relación entre valor absoluto, peso y resultado relativo. Una etiqueta de
  protocolo parecida no prueba equivalencia.
- El protocolo condicionado de G2 permite diferencias PRE–POST en escala fuente
  bajo supuestos declarados. **No autoriza porcentajes, imputación, pooling entre
  estudios ni interpretación clínica**.

**Qué reutilizar:** estructura de visita, separaciones de método/rol, faltantes,
historial de evaluaciones y relación con actividad como contexto.

**Qué no hacer:** convertir VO2PK en mL/kg/min por intuición, unir personas de
distintas fuentes, transformar PRE/POST en meses nominales o usar porcentajes
históricos como tasas esperadas de recuperación.

### Apoyo externo específico de vuelo espacial

Un resumen de investigación de NASA describe pruebas pico en cicloergómetro antes,
durante y después de misiones ISS, con evaluaciones aproximadamente mensuales
durante el vuelo. Distingue VO₂pico y respuestas submáximas, y sus resultados están
modelados a nivel de grupo. Esto respalda la pertinencia de **mostrar visitas
periódicas y fases de misión**, no un protocolo para nuestro usuario ni una curva
individual que podamos copiar.

Fuente: [NASA NTRS, Peak Oxygen Uptake during and after Long-duration Space Flight](https://ntrs.nasa.gov/citations/20140003748).

Como referencia complementaria para estudiar la **estructura de una sesión**,
el registro de PhysioNet en AWS describe 992 pruebas máximas de cinta con señales
respiración a respiración. Es una población terrestre de deportistas y no un
historial mensual de astronautas. El registro declara una licencia específica de
datos de salud; no se descargaron ni redistribuyeron sus registros.

Fuente: [registro de datos de pruebas de Málaga](https://registry.opendata.aws/treadmill-exercise-cardioresp/).

## 4. Inferencia de resultados sin diagnóstico

La primera versión debería producir **resúmenes descriptivos explicables**, no
predicciones de enfermedad, aptitud operacional o respuestas automáticas al ejercicio.

| Salida | Qué describe | Qué no permite afirmar |
| --- | --- | --- |
| Último resultado y antigüedad | Una evaluación concreta, con su método y fecha | Estado fisiológico en este momento |
| Diferencia absoluta | Cambio entre evaluaciones comparables | Importancia clínica de ese cambio |
| Diferencia porcentual | Cambio relativo con unidad/escala de razón confirmadas y referencia positiva | Resolver una unidad o normalización desconocida |
| Tendencia del período | Dirección de resultados comparables a lo largo del tiempo | Causa del cambio, pronóstico o diagnóstico |
| Variación observada | Dispersión de las visitas que realmente existen | Error instrumental o intervalo normal de la persona |
| Actividad completada | Registro de las sesiones | Que esas sesiones causaron una mejora |

### Regla de comparabilidad propuesta

Antes de calcular: misma persona, indicador, unidad confirmada, método/protocolo,
tipo de resultado medido/estimado y condiciones relevantes revisadas. Separar
resultados absolutos y relativos al peso. Un cambio de dispositivo, algoritmo o
normalización requiere una decisión explícita, no solo igualdad del texto «VO₂».

Si falla la comprobación, devolver un estado y su motivo: **no comparable**, **dato
faltante** o **contexto insuficiente**. No devolver cero como diferencia bloqueada.

### Tendencia propuesta para la demostración

1. Seleccionar período y segmento compatible; ordenar por fecha real.
2. Con una observación, mostrar solo el resultado. Con dos, permitir diferencia
   pareada si son comparables; no presentarla como tendencia consolidada.
3. Con al menos tres, puede explorarse una pendiente descriptiva respecto a días
   reales. **Tres es una regla técnica propuesta para el demo, no suficiencia clínica
   ni garantía estadística**. Mostrar cantidad, fechas y dispersión.
4. Para estabilidad o estancamiento falta acordar variabilidad esperable y tolerancia.
   Una pendiente cercana a cero no demuestra ausencia de cambio relevante. Sin ese
   acuerdo, usar «variación pequeña en este período; relevancia no evaluada».
5. Si se muestran intervalos estadísticos, explicar exactamente qué estiman. No
   presentar un intervalo de regresión como incertidumbre del instrumento ni dar
   confianza alta solo por disponer de tres puntos.

Estados de interfaz iniciales: **ascendente**, **variación pequeña**, **descendente**
y **datos insuficientes/no comparables**. Las palabras «mejora», «estancamiento»
y «empeoramiento» necesitan una definición acordada para el indicador y el uso.
Evitar un indicador global que afirme «tu salud está mejor/peor».

Ejemplo de texto: «El resultado es mayor que en la referencia seleccionada.
Comparación basada en 4 evaluaciones del mismo protocolo. La importancia del cambio
no está evaluada». La cifra, el período y n deben proceder de los datos activos.

## 5. Composición propuesta del dashboard

```text
Astronauta / misión             Última evaluación: fecha / método
Período: 3 meses | 6 meses | 12 meses | Todo   Referencia: visita elegida

Último resultado  Cambio vs referencia  Tendencia y n  Cobertura / antigüedad

EVOLUCIÓN AERÓBICA · gráfico principal por fecha
Puntos reales · segmentos compatibles · huecos · eventos anotados
Seleccionar un punto → ficha de la evaluación y sus condiciones

Actividad registrada            Historial de evaluaciones
Sesiones, duración, dificultades Fecha, resultado, unidad, método, calidad

QUÉ MUESTRAN ESTOS DATOS
Resumen descriptivo + por qué se calculó / por qué se bloqueó
Registrar observación | Preparar revisión | Descargar historial
```

- Dar prioridad al gráfico longitudinal y al contexto personal. Reservar el detalle
  técnico para una ficha, sin ocultar método, fecha y carácter simulado.
- Mantener la misma ventana y selección en gráficos, KPI, tabla y resumen.
- Usar días reales en el eje X. Mostrar visitas planificadas y realizadas como
  conceptos distintos; un mes sin visita no contiene una medición implícita.
- Los puntos son observaciones. Una línea, si se usa, es una ayuda visual entre
  visitas compatibles; no representa una medición continua. No unir a través de
  faltantes o cambios de método, ni suavizar hasta esconderlos.
- Mostrar el número de visitas junto a cualquier promedio. No cambiar de media a
  último valor silenciosamente al modificar la escala temporal.
- Mostrar actividad en otro panel temporal alineado, sin segunda escala engañosa
  ni afirmaciones causales. No generar adherencia si no existe un plan asignado.
- Usar texto, forma y leyenda, además de color. Evitar verde/rojo como juicio clínico.
- En móvil: último dato y su fecha, gráfico, explicación y próxima tarea; filtros
  secundarios y tablas bajo acceso explícito. No reducir las etiquetas a texto ilegible.

## 6. Historial sintético de doce meses

Se entrega `aerobic-history-scenarios.csv`: **78 filas, seis escenarios y 13 visitas
nominales por escenario**, del 15/11/2025 al 15/11/2026. La periodicidad mensual
es una decisión de diseño para probar la navegación, no una prescripción.

Los valores fueron elegidos manualmente. No son pacientes, participantes de NASA,
remuestreo de originales ni estimaciones de respuesta al vuelo. Se usa la unidad
mL/kg/min únicamente como **unidad declarada del ejemplo ficticio**, no como unidad
resuelta del campo VO2PK de MR080G. Los métodos DEMO-A/DEMO-B son ficticios.

| Escenario | Propósito de interfaz |
| --- | --- |
| Ascenso con oscilaciones | Mostrar aumento sin inventar una mejora perfectamente lineal |
| Variación alrededor de una referencia | Evitar declarar estancamiento por dos visitas parecidas |
| Descenso con oscilaciones | Explicar una bajada del resultado sin diagnosticar ni atribuir causa |
| Descenso y recuperación | Mostrar cómo cambia el resumen al seleccionar distintas ventanas |
| Visitas sin resultado | Mostrar ausencia, cobertura y discontinuidad gráfica |
| Cambio de método | Evitar presentar un salto de protocolo como avance personal |

La figura `aerobic-history-scenarios.png` permite comparar esos casos con la misma
escala. No calcula diagnósticos ni asigna importancia clínica a las variaciones.
`generate_history_examples.py` reproduce el CSV y la figura sin leer datos privados
de Research. Requiere matplotlib; no se añade esa dependencia a la aplicación.

## 7. Datos mínimos para acordar con backend y la médica

No se modifica todavía `contracts/`. Como propuesta de ampliación, cada evaluación
debería poder expresar: persona; instante/fase; indicador; valor/unidad;
medido/estimado; protocolo y versión; modalidad; dispositivo; contexto de
normalización por masa cuando corresponda; estado de disponibilidad/calidad;
procedencia; y motivo de no comparabilidad.

Los resultados derivados deberían conservar período, referencia, IDs incluidos y
excluidos, n, método de cálculo, política de comparabilidad y motivo del estado.
Así el frontend explica el resultado y el backend puede reproducirlo.

Preguntas concretas para la médica:

1. ¿Qué resultado aeróbico se seguirá y qué significa una dirección favorable?
2. ¿Qué condiciones hacen comparables dos pruebas y qué cambios obligan a separarlas?
3. ¿Qué referencia usar y qué variación impide concluir estabilidad o cambio?
4. ¿Qué texto de seguimiento puede leer el astronauta sin inducir decisiones clínicas?
5. ¿Qué acciones debe ofrecer el panel cuando faltan datos o hay una tendencia a revisar?

## 8. Criterios para evaluar el próximo diseño

- El usuario encuentra el resultado reciente, su fecha y el método sin abrir ayuda.
- Puede localizar una visita de hace meses y comprobar el resumen con la tabla.
- Distingue «descendió esta medida» de «estoy clínicamente peor».
- Entiende por qué un cambio de método bloquea la comparación.
- No interpreta un hueco como cero o como una medición normal.
- Cambiar de 3 a 12 meses recalcula resultados y explica el período efectivo.
- Una corrección o una nueva visita no cambia silenciosamente la referencia elegida.
- La observación del usuario y el resumen se conservan sin afirmar que se enviaron.

## 9. Evidencia y límites de esta investigación

Las referencias de productos se basan en sus documentos/capturas públicas, no en
una auditoría clínica, prueba comparativa con usuarios o ingeniería inversa de sus
modelos. Garmin tiene verificación limitada al contenido indexado de soporte.
Algunas imágenes y la página directa del dataset de Málaga no fueron recuperables
por el lector web; se usa el registro del propio recurso en AWS para describirlo.

Se consultaron en Research:

- `reports/aerobic-health-medical-team-brief.md`, especialmente §§3, 5, 6 y 11.
- `research/datasets/audits/mr080g-data-audit.md`.
- `reports/descriptive/metadata-diagnostics.json`.
- `research/evidence/physical-comparison-resolution.md`.
- `analysis/config/conditional_longitudinal_protocol.json`.
- `reports/selection/selected-demo-context.json`.
- Los componentes de exploración del dashboard.

Los recuentos locales se contrastaron entre los informes y los diagnósticos
versionados; no se repitió la auditoría de archivos originales ni el pipeline
completo. No se copiaron datos personales. Los ejemplos adjuntos están separados
de los mocks activos y no prueban realismo fisiológico ni eficacia del producto.
