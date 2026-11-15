# Rediseño del panel de seguimiento en misión

Implementación del [análisis de rediseño](mission-dashboard-redesign-analysis.md).

## Composición

El encabezado reúne identidad de la aplicación, modo de simulación y tema. La barra
siguiente identifica tripulante, misión y fecha de corte de las evaluaciones. Las
cuatro vistas son Seguimiento, Evaluaciones, Actividad y Revisión; conservan los
identificadores de ruta anteriores para mantener los enlaces existentes.

Se retiraron el banner orbital, los eslóganes, la bienvenida comercial y las llamadas
repetidas a preparar una revisión. El resumen presenta resultado, referencia y
disponibilidad. El gráfico y el inspector forman el área principal. Debajo se
muestran una única lectura descriptiva, evaluaciones recientes y una observación
vinculada a una visita.

La vista Evaluaciones ofrece el registro completo del período; Seguimiento muestra
las tres visitas más recientes. Ambas comparten selección y filtros. La actividad
conserva su alcance independiente. La configuración de escenarios y la procedencia
se encuentran en apartados secundarios del pie, con identificación persistente de
simulación en el encabezado.

## Contexto, escalas y fechas

`dashboard-state.ts` resuelve período, referencia, evaluación y escala. Su estado
se conserva mediante `period`, `reference`, `evaluation` y `scale` en la URL,
además de los parámetros existentes de vista, persona y escenario. Los enlaces
entre vistas conservan ese contexto. Una selección que queda fuera de la ventana
se resuelve a la última visita visible, sin modificar la referencia.

La escala inicial usa el historial completo de la unidad representada y permanece
igual al cambiar de ventana. La opción «Ajustar al período» incluye los resultados
visibles y la referencia de la misma unidad. Ambas muestran límites numéricos;
no son rangos clínicos. El cálculo de la tendencia no cambió.

El gráfico mantiene símbolos por método a partir del historial completo, incluido
el punto seleccionado. La tabla y el selector de fecha permiten acceder a las
visitas cuando no hay espacio suficiente para objetivos de interacción separados
en el gráfico. No se unen resultados a través de faltantes o cambios de método.

Las fechas incluyen UTC. El encabezado muestra la última visita del historial;
el resumen distingue el último resultado válido de una visita posterior sin valor.
La antigüedad se calcula respecto de la fecha de consulta generada en el servidor.
No se asignan estados de vencimiento, sincronización o conexión que la API no aporta.
Los períodos siguen anclados en la última visita registrada y explican ese alcance.

## Observaciones y copias de revisión

Una observación se guarda con el ID de la evaluación y su fecha de registro. La
visita queda fijada al empezar a escribir: cambiar la selección del gráfico no
reubica el texto. Se conserva una última observación local, sin presentar un
historial de notas que todavía no existe.

`review.ts` prepara el contenido del período, referencia, visita seleccionada,
actividad y observaciones. Una copia preparada conserva texto, fecha y alcance.
Si cambian los datos, la pregunta o el contexto, la interfaz indica la diferencia;
no sobrescribe la copia ni la borra. Actualizar la copia es una acción explícita.
La descarga incluye la fecha de preparación. No se envía al especialista.

Se mantiene la clave de almacenamiento anterior y los campos nuevos tienen valores
por defecto, de modo que los borradores válidos existentes continúan disponibles.
Las copias antiguas sin alcance se identifican como tales. Si el navegador bloquea
el almacenamiento, el borrador queda en memoria durante la visita y se indica esa
limitación. Los timestamps persistidos se validan antes de formatearlos.

## Sistema visual y accesibilidad

Se consolidaron los estilos base en `globals.css` y los estilos de seguimiento en
`aerobic.css`, retirando la superposición de reglas del diseño anterior. La paleta
usa grises y azul de selección; los métodos alternativos añaden forma y trazo.
La dirección matemática no recibe una calificación cromática de salud.

La tipografía usa rem, interlineado sin unidad y cifras tabulares. No se sobrescribe
el tamaño raíz del navegador. `text-scale` permite ampliación del sistema en
navegadores compatibles; los demás conservan su zoom habitual. Los paneles de texto
crecen con el contenido. La tabla tiene desplazamiento propio, encabezados y fila
identificadora persistentes, nombre accesible y acceso por teclado.

La aplicación usa controles HTML nativos, foco visible, navegación por enlaces,
estados de selección y una indicación de actualización. Los títulos se generan
mediante la API de metadatos de Next.js. Los temas claro y oscuro comparten tokens.
No se agregaron bibliotecas ni dependencias.

## Verificación

```bash
npm run check
npm run build
```

`tests/dashboard-context.test.ts` verifica resolución y serialización de filtros,
referencia fuera del período, selección inválida, escala, antigüedad, última visita
sin resultado y conservación de una revisión preparada ante cambios de datos o
contexto. Los tests anteriores siguen cubriendo los cálculos descriptivos y los
contratos de lectura.

La revisión visual y de interacción usa un contexto de navegador aislado, sin
modificar borradores del navegador del usuario. El alcance incluye filtros,
navegación y recarga, exportación, observaciones, revisiones, escenarios, temas,
pantallas estrechas y ampliación de texto. La validación no sustituye pruebas
con astronautas o especialistas, ni acredita certificación para operación espacial.

El backend, los contratos compartidos y las dependencias permanecen sin cambios.
