# Análisis del frontend y dirección de rediseño para seguimiento en misión

Fecha: 15 de noviembre de 2026. Rama revisada: `frontend`.
Estado: propuesta de diseño; no modifica la aplicación ni sus cálculos.

## 1. Conclusión

La base funcional sirve para un panel longitudinal, pero su composición presenta
el seguimiento como un producto de bienestar: bienvenida, promesa, ilustración,
tarjetas y llamadas repetidas a preparar una revisión. La información de medida
aparece después de esa presentación.

La nueva dirección debe ser **una estación de seguimiento aeróbico personal**:
identificar a la persona, reconocer el alcance temporal de los datos, inspeccionar
las mediciones, comprobar comparabilidad y registrar una observación.
La identidad debe proceder de esa precisión y de una composición consistente.

Sobriedad no equivale a reducir tamaños, suprimir explicaciones o llenar la pantalla
de cifras. Tampoco basta con oscurecerla. El astronauta debe poder leerla y recuperar
el contexto con pocas acciones, incluso tras semanas sin utilizar una vista.

## 2. Alcance y evidencia

Se revisaron el shell, el explorador aeróbico, su gráfico, los cálculos descriptivos,
los estilos, el borrador local de revisión y la investigación previa. Se inspeccionó
la captura de escritorio conservada de la implementación anterior y se contrastó
con el código actual. No se realizaron nuevas pruebas con usuarios ni mediciones
físicas de un dispositivo de misión. Las observaciones de usabilidad son hipótesis
fundamentadas, pendientes de validación.

Se consultaron `frontend-design`, `ui-ux-pro-max`, `web-design-guidelines` y la guía
`respect-os-text-scale` de Modern Web Guidance. Los resultados locales sobre
legibilidad aportaron contraste e interlineado; no constituyen una guía espacial.

### Referencias de factores humanos

La ficha oficial identifica NASA-STD-3001 Vol. 2, revisión F, aprobada el 14/07/2026.
En §§10.4.2.1–10.4.2.4 aborda presentación simultánea de información crítica,
redundancia del color, unidades consistentes y legibilidad en condiciones de uso.
Son referencias para el razonamiento de diseño; esta revisión no demuestra
cumplimiento ni certifica el prototipo. Las tareas críticas y los requisitos
aplicables necesitan un análisis específico del sistema y de la misión.

Fuentes: [ficha oficial](https://standards.nasa.gov/node/237),
[revisión F, pp. 207–209](https://standards.nasa.gov/system/files/tmp/NASA-STD-3001%20Vol%202%20Rev%20F.pdf).

El [Human Integration Design Handbook, §10.6](https://www.nasa.gov/wp-content/uploads/2023/03/human-integration-design-handbook-revision-1.pdf)
plantea seleccionar información a partir de las tareas y verificar la propuesta
mediante escenarios de uso. Lo aplicaría aquí separando consulta personal,
revisión del especialista y exploración del dataset.

## 3. Hallazgos priorizados

Las prioridades indican impacto esperado en el rediseño, no severidad clínica.

| Prioridad | Localización | Hallazgo | Cambio propuesto |
| --- | --- | --- | --- |
| Alta | `aerobic-overview.tsx:90` | Título y bienvenida expresivos, poco específicos de la tarea | Título «Seguimiento aeróbico» y contexto de persona/fecha |
| Alta | `aerobic-overview.tsx:112`, `aerobic.css:181` | Banner orbital, mínimo de 218 px, sin información necesaria para comparar | Retirar el banner y colocar el gráfico inmediatamente después del resumen compacto |
| Alta | `aerobic-overview.tsx:274`, `aerobic-overview.tsx:382` | La dirección se repite y recibe gran protagonismo | Una sola lectura próxima al gráfico, con período, n y alcance |
| Alta | `aerobic.ts:82` | Cualquier pendiente distinta de cero numérico tiene dirección; no existe umbral de relevancia | Separar signo matemático, magnitud y relevancia no evaluada; evitar apariencia de veredicto |
| Alta | `trajectory-chart.tsx:43` | El eje Y cambia según ventana y referencia | Escala de inspección estable por persona/indicador/unidad, con modo automático explícito |
| Alta | `aerobic-overview.tsx:59` | El período se ancla en la última visita disponible | Mostrar fecha de corte y antigüedad por separado; no sugerir actualidad por el filtro «3 meses» |
| Alta | `aerobic.css:1326` | Ejes de 11 px y unidades/notas de 11–12 px en la capa efectiva de estilos | Aumentar legibilidad y usar unidades relativas; validar al ampliar texto |
| Media | `aerobic-overview.tsx:467` | El historial está cerrado en la vista inicial | Mostrar las evaluaciones recientes y mantener acceso al registro completo |
| Media | `dashboard.tsx:200` | Las vistas inicial e historial montan el mismo explorador con diferencias pequeñas | Una navegación con tareas distintas, sin duplicar pantallas |
| Media | `aerobic-overview.tsx:56`, `dashboard.tsx:202` | Ventana y visita seleccionada son estado local; cambiar de vista remonta el explorador | Conservar período, referencia y visita en URL o estado de navegación compartido |
| Media | `dashboard.tsx:155` | El selector de escenarios comparte contexto con el selector de persona | Herramienta de demostración secundaria, separada y explícitamente identificada |
| Media | `aerobic-overview.tsx:409`, `aerobic-overview.tsx:453` | Varias invitaciones equivalentes a preparar una revisión | Una acción contextual «Preparar revisión» |
| Media | `use-demo-journal.ts:45`, `followup-view.tsx:123` | El resumen preparado es una copia guardada, que puede corresponder a datos anteriores | Mostrar fecha de preparación y contexto de esa copia; ofrecer regenerarla sin perder la pregunta |
| Media | `trajectory-chart.tsx:188` | Seleccionar un punto lo representa como círculo, aunque su método se codificó como cuadrado | Conservar forma y método al seleccionar; utilizar un anillo como énfasis adicional |
| Baja | `dashboard.tsx:112`, `dashboard.tsx:225` | Eslogan lateral y cierre de hackathon compiten con el contenido operativo | Marca pequeña; información del proyecto en «Acerca de» |

Localizaciones relativas a `src/features/health-monitoring/`:
[explorador](../../src/features/health-monitoring/components/aerobic-overview.tsx),
[shell](../../src/features/health-monitoring/components/dashboard.tsx),
[gráfico](../../src/features/health-monitoring/components/trajectory-chart.tsx),
[estilos](../../src/features/health-monitoring/components/aerobic.css),
[cálculos](../../src/features/health-monitoring/aerobic.ts),
[borrador](../../src/features/health-monitoring/components/use-demo-journal.ts),
[revisión](../../src/features/health-monitoring/components/followup-view.tsx).

### Qué conservar

- Historial individual, referencia elegida y fechas reales.
- Diferencias entre ausencia de visita y resultado faltante.
- Cortes gráficos y bloqueo de cálculos ante unidades o métodos diferentes.
- Tabla semántica, controles nativos, navegación por teclado y estados vacíos.
- Origen simulado explícito y separación de actividad y capacidad aeróbica.
- Preparación local del resumen sin afirmar que fue enviado.
- Servicio de datos como frontera y separación entre frontend, backend y contratos.

## 4. Tareas que deben organizar la interfaz

| Tarea | Pregunta del astronauta | Información necesaria |
| --- | --- | --- |
| Consulta de seguimiento | ¿Cuál es el último resultado y de cuándo es? | Valor, unidad, fecha/hora UTC y método |
| Comparación | ¿Qué cambió respecto de la visita elegida? | Referencia explícita, diferencia y motivo de comparabilidad |
| Revisión longitudinal | ¿Qué ocurrió durante varios meses? | Gráfico, visitas, huecos, segmentos y fechas |
| Inspección | ¿Qué respalda este punto o esta lectura? | Ficha de evaluación, fuente disponible e IDs incluidos |
| Registro | ¿Qué observación quiero conservar? | Nota vinculada al contexto y estado de guardado |
| Preparación de revisión | ¿Qué información voy a compartir? | Resumen fechado, alcance y estado real de exportación/envío |

La pantalla es de seguimiento periódico. Una medición mensual no describe el estado
en este instante. La comparación tampoco constituye un sistema de alarmas.

## 5. Arquitectura propuesta

Una barra compacta de identidad y contexto, navegación discreta y contenido alineado
a la izquierda. El centro de gravedad visual es el gráfico con su inspección.

```text
Órbita / Seguimiento aeróbico          Tripulante: Vega   [Simulación]
Datos hasta: fecha/hora UTC            Guardado: estado disponible

Seguimiento | Evaluaciones | Actividad | Revisión

Período [3 m] [6 m] [12 m] [Todo]       Referencia [fecha / método]
Fechas efectivas: inicio — fin         [Exportar período]

Última evaluación       Cambio vs. referencia       Resultados disponibles
valor + unidad + fecha  diferencia / no comparable   n de N visitas

Evolución de VO₂pico                     Evaluación seleccionada
[gráfico principal por fechas]          fecha / valor / unidad / método
[referencia / métodos / huecos]         [Anterior] [Siguiente]

Lectura del período: dirección, magnitud y n. Relevancia no evaluada.
[Detalle del cálculo]

Evaluaciones recientes / historial       Observación del usuario
[tabla vinculada al gráfico]             [Registrar observación]
```

Este esquema es una propuesta, no una pantalla ya implementada. «Guardado» debe
referirse al borrador local existente; el sistema aún no informa sincronización.

En escritorio, resumen y gráfico deben quedar visibles en el primer viewport de
referencia de 1440 × 900 a escala estándar. En móvil, ordenar contexto, último dato,
comparación y gráfico; detalles e historial conservan acceso explícito. No ocultar
la fecha o el método para encajar más cifras.

### Navegación

- **Seguimiento:** resumen longitudinal y lectura del período.
- **Evaluaciones:** registro, selección y detalle de una evaluación.
- **Actividad:** sesiones registradas con su propio alcance temporal.
- **Revisión:** nota, pregunta y copia preparada para exportar.

La exploración de MR080G corresponde al contexto de investigación y procedencia.
Puede quedar en una ficha técnica secundaria. Los jueces pueden acceder a esa
explicación sin que el astronauta deba recorrerla en cada consulta.

## 6. Sistema visual propuesto

Los valores siguientes son decisiones iniciales del proyecto, no colores oficiales
ni requisitos de una agencia.

| Función | Propuesta |
| --- | --- |
| Fondo de trabajo | `#eef1f4` |
| Superficie | `#ffffff` |
| Texto principal | `#1d2935` |
| Texto secundario | `#475569` |
| Divisores | `#cbd5df` |
| Selección y trayectoria principal | `#245c86` |

- Una fuente sans serif local, de formas claras y con alternativas del sistema.
  Cifras tabulares para resultados; monoespaciada solo donde facilite leer IDs.
- Cuerpo de referencia de 1 rem; etiquetas y metadatos entre 0,875 y 1 rem como
  punto de partida. Encabezados de sección de aproximadamente 1,125 rem.
  Validar en el dispositivo objetivo; no equiparar píxeles CSS con tamaño físico.
- Interlineado sin unidad. Contenedores que crezcan al ampliar texto. Tamaño raíz
  respetado; zoom disponible. Evaluar progresivamente `text-scale` con fallback
  de zoom normal en navegadores que no lo admitan.
- Radios discretos, aproximadamente 4–6 px; separadores para agrupar funciones.
  Sombras solo cuando expresen superposición. Reducir los iconos que repiten texto.
- Mantener claro/oscuro; ambos deben conservar jerarquía, contraste y símbolos.
  Un tema oscuro no acredita adecuación para misión.
- Color para selección, series y estados diferenciados. Toda condición debe tener
  texto o forma. No asignar rojo a un descenso o verde a un ascenso por defecto.
- Sin planetas decorativos, brillo, animación ambiental, gamificación ni puntaje
  agregado de salud. Una representación anatómica solo tendría sentido con una
  tarea y un dato que la justifiquen.

## 7. Lenguaje propuesto

| Actual | Propuesta |
| --- | --- |
| Mi perspectiva | Seguimiento |
| Tu capacidad, en perspectiva | Seguimiento aeróbico |
| Tu recorrido importa tanto como el último dato | Retirar el bloque |
| Tu trayectoria aeróbica | Evolución de VO₂pico |
| La lectura de tus datos | Resumen del período |
| El registro detrás de la trayectoria | Evaluaciones |
| Una revisión con perspectiva | Revisión |
| Tu historia, conectada | Retirar el eslogan |
| Explorar historial | Ver evaluaciones |

Usar verbos explícitos: seleccionar referencia, registrar observación, preparar
revisión y exportar período. El texto puede ser claro y humano sin promesas ni
motivación comercial. Mantener un vocabulario consistente en navegación, tabla,
exportación y borrador.

## 8. Lectura de datos y confianza

### Actualidad

Separar fecha de evaluación, fecha de corte de datos y fecha de preparación del
resumen. Una última visita sin resultado no debe borrar silenciosamente el último
resultado válido: presentar ambos conceptos con sus fechas.

La etiqueta de antigüedad puede expresar tiempo transcurrido. Clasificar una visita
como vencida exige disponer de un calendario acordado; no inventarlo. No mostrar
«En línea», «Sincronizado», «Nominal» o un día de misión sin datos que lo respalden.

### Comparaciones y escalas

Conservar referencia, período y evaluación al navegar y volver. Diferenciar el
cambio contra una referencia fija de la dirección del período seleccionado.
Para el gráfico, proponer una escala inicial estable basada en el historial
compatible disponible y una opción explícita de autoescala. No implica empezar
siempre en cero ni establecer un rango fisiológico normal. Una actualización que
requiera ampliar el rango debe ser perceptible.

Separar los segmentos de métodos distintos con marcas y leyenda específicas. Evitar
que la selección elimine el símbolo del método. Los objetivos táctiles cercanos
requieren comprobar solapamiento; conservar flechas y tabla como alternativas.

### Tendencias

Dar una sola lectura del período. Acompañarla de número de resultados, fechas y
método de cálculo. Evitar que una pendiente minúscula parezca un hallazgo relevante
por su tamaño tipográfico o color. No sustituirla por «Estable» usando una tolerancia
inventada. La definición de estabilidad, cambio relevante e incertidumbre requiere
acuerdo de datos y criterio médico.

### Simulación y procedencia

Mantener una identificación persistente de simulación y acceso a sus límites.
Separar el selector de escenarios del contexto de usuario. Simplificar los avisos
repetidos sin ocultar el origen ficticio. La ficha de cada resultado debe mostrar
solo la procedencia que realmente se conoce.

## 9. Implementación posterior y límites de alcance

1. Reorganizar jerarquía y textos: retirar banner, eslóganes y acciones duplicadas;
   adelantar gráfico y fecha. No requiere cambios de API.
2. Unificar tokens, tipografía y superficies. Consolidar las reglas actuales de
   `globals.css` y `aerobic.css` antes de añadir más sobrescrituras.
3. Resolver escala, selección, leyendas, conservación del contexto y acceso a tabla.
   Mantener los cálculos existentes hasta especificar un cambio separado y probarlo.
4. Diferenciar fecha de última visita, último resultado y copia de revisión.
5. Evaluar con escenarios: recuperación, variación pequeña, descenso, faltantes,
   cambio de método, historial vacío y dato antiguo.

No se necesita un cambio de stack ni añadir una biblioteca gráfica por motivos
estéticos. Next.js, Tailwind, componentes existentes y SVG permiten esta dirección.
Un componente de shadcn sería útil si resuelve una interacción concreta.

La simulación ya permite demostrar la mayor parte del rediseño. Dispositivo,
protocolo versionado, calidad, sincronización, calendario de pruebas o fecha de
inicio de misión necesitan campos acordados con backend. No incorporarlos como
campos aparentes con valores inventados para dar sensación de completitud.

Para una misión prolongada quedan pendientes requisitos reales de funcionamiento
sin conexión, persistencia, recuperación, acceso y privacidad. El borrador local
actual no demuestra esas capacidades. Deben especificarse como trabajo de producto
posterior, sin bloquear el rediseño visual del prototipo.

## 10. Criterios de aceptación del próximo diseño

- La primera pantalla de escritorio muestra persona, fecha, resultado, referencia
  y gráfico; no contiene un bloque promocional.
- Valor, unidad y fecha se leen juntos, también con zoom y tema oscuro.
- Hay un único resumen del período y un único acceso principal a preparar revisión.
- El usuario distingue «última visita sin resultado» de «último resultado válido».
- Cambiar de ventana conserva la referencia e indica qué eje está usando el gráfico.
- Volver de actividad o revisión conserva ventana y evaluación seleccionada.
- Se puede verificar la lectura con la tabla y reconocer un cambio de método sin
  depender del color.
- Una copia preparada conserva fecha/contexto y no aparenta actualizarse sola.
- En 320 CSS px y al ampliar texto, sigue disponible todo el contenido; la tabla
  puede tener desplazamiento propio cuando la estructura lo requiere.
- Se opera con teclado, los controles próximos no se bloquean entre sí y el foco
  no queda oculto por barras o paneles.
- La evaluación con usuarios registra tiempo, errores de interpretación y acciones
  necesarias para comparar visitas; no se da por aprobada solo por su apariencia.

Faltan por confirmar dispositivo, distancia de lectura, iluminación, idioma de
operación y tareas críticas. Estas variables condicionan la validación final.

## Referencias complementarias

- [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md):
  controles semánticos, foco, números tabulares y conservación del estado en URL.
- Modern Web Guidance, `respect-os-text-scale`: tipografía relativa y ampliación
  sin pérdida de información; consultado localmente, sin cambios de código.
- [Investigación previa del proyecto](../research/aerobic-dashboard-research.md).
