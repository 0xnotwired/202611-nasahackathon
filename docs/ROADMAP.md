# Roadmap de Órbita: salud, adaptación física y hábitat

Estado: dirección de producto elegida por el usuario; la secuencia de implementación es una propuesta del asistente. El recorrido confirmado y el diseño funcional se registran en PRODUCTO.md. Existe una maqueta HTML con datos sintéticos para presentar el concepto (LEEME_DEMO.md); no implica integración NASA ni cierre de los niveles clínicos descritos aquí. No hay stack definitivo. La carga inicial de documentación y demo al repositorio fue solicitada por el usuario; no autoriza desplegar la aplicación. Se organiza por resultados del producto, siguiendo destination-driven-construction.

Cómo se reparte este roadmap entre agentes, en fases y módulos: [PLAN_ORQUESTACION.md](PLAN_ORQUESTACION.md).

## Destino

Una herramienta visual personal que permita al astronauta comprender su salud, adaptación física y entorno; seguir su plan de cuidado; medir, entender cambios y consultar orientación fundamentada. El mapa organiza el estado conocido, la línea temporal conserva el contexto, el plan conecta resultados con acciones y A bordo guía los procedimientos. Una misma medición y una misma regla deben tener el mismo significado en todas las pantallas. Los tres dominios son alcance central por decisión del usuario, no extensiones futuras (PRODUCTO.md, DEC-002).

El copiloto conecta el recorrido elegido: «Me siento distinto → registro lo que ocurre → la herramienta me ayuda a medir correctamente → veo mi evolución → entiendo el siguiente paso». También acompaña «Mi día»: mediciones programadas, ejercicio/nutrición prescritos, pruebas periódicas y revisión ambiental. Sus intervenciones son ayuda contextual dentro de cada nivel; no requieren un chatbot ni autorizan al sistema a generar criterios médicos nuevos.

El historial, las explicaciones y las guías deberían poder consultarse sin conexión. Esta es una recomendación arquitectónica para la propuesta, no un requisito confirmado por el usuario. La elección de tecnologías queda pendiente de una comprobación de compatibilidad y licencias.

## Preparación: concretar el caso demostrable

- Elegir una situación de misión y los indicadores que se pueden medir con el equipo disponible.
- Tomar CRF Daily Vitals como candidato inicial para pulso, presión, respiración, temperatura y peso. Comprobar unidades y protocolos antes de usar los valores.
- Concretar adaptación física con MR079G, MR080G y MR035G según la función elegida. Distinguir masa, fuerza, resistencia, capacidad aeróbica y densidad ósea; verificar qué exámenes son posibles a bordo y cuáles aportan historial previo/posterior.
- Verificar fuentes ambientales del caso, sensor, lugar y tiempo: MSD007/DTO 684 para casos históricos; investigar RadLab/EDA para series adicionales. No hay datos integrados emparejados comprobados entre todas las fuentes.
- Auditar cobertura de una campaña y separar sujeto, fase, mediciones repetidas y ausencias. La muestra de 113 filas ya revisada permite explorar el formato, pero no sustituye esta auditoría.
- Identificar fuentes específicas para cada explicación, guía de medición y orientación de atención. Revisar su aplicabilidad a una misión espacial.
- Elegir un escenario con datos reales y distinguir de forma visible la procedencia terrestre. Si hacen falta casos sintéticos, identificarlos desde su creación.
- Para demostrar los tres dominios en una misma misión ficticia, usar una simulación identificada si no hay correspondencia real. Conservar los casos NASA originales por separado para explorar su evidencia; no unir cohortes como un astronauta.
- Definir pantallas y contenido del recorrido antes de fijar librerías: Mi día, cuerpo, adaptación física, hábitat, evolución, Mi plan, procedimientos y resumen para comunicación.

Resultado de salida: un caso, sus fuentes, sus límites y criterios verificables de aceptación. No hay valores de alerta ni ventanas de referencia previamente aprobados.

## Nivel 1: comprender mi situación de misión

El astronauta consulta salud personal, adaptación física y hábitat en un caso coherente, distingue lo conocido de lo pendiente y entiende origen y contexto. Puede explorar pruebas periódicas, actividad y ambiente por tiempo, con sus limitaciones. El mapa y las vistas textuales acceden a la misma información. Las fases, unidades y métodos son visibles; un cambio estadístico no se presenta como diagnóstico. Si el caso es simulado, la interfaz lo identifica.

Desde este nivel se conservan datos originales, procedencia, unidades, ausencias y persistencia de las transformaciones necesarias. Si se adopta funcionamiento local, incluir los recursos requeridos sin depender de CDN durante el uso.

Terminado cuando las gráficas coinciden con los datos del caso; la exploración real NASA coincide con archivos comprobados; y se distinguen fases, métodos, contexto ambiental, errores de importación, datos simulados y falta de información. Los exámenes ausentes no aparecen como resultados saludables.

## Nivel 2: completar mi rutina y seguir mi plan

El astronauta consulta qué acciones le corresponden según el plan asignado y sus frecuencias: mediciones, ejercicio, nutrición, pruebas físicas y revisión del entorno. A bordo explica propósito, equipo e instrucciones de cada tarea sustentada. Registra valor, unidad, contexto y ejecución, corrige entradas inválidas y recupera el seguimiento. El copiloto presenta preguntas y procedimientos documentados; la información desconocida permanece explícita. Cada tipo de examen conserva su frecuencia real; no se programa una DXA diaria ni se supone equipo a bordo sin verificarlo.

Cada resultado tiene una explicación y un siguiente paso fundamentado: completar contexto, repetir bajo un procedimiento documentado, seguir una guía revisada o preparar una consulta médica, según el caso y la evidencia. Las reglas experimentales se identifican y no se presentan como criterios médicos de vuelo validados.

Terminado cuando puede completarse y recuperarse una tarea del plan, ver su efecto en el historial y entender lo pendiente. Deben distinguirse plan prescrito, actividad registrada y resultado observado. No se inventan valores cuando una medición falta.

## Nivel 3: revisar un cambio y continuar el cuidado

El astronauta inicia «Me siento distinto» y el copiloto vincula observación, mediciones, pruebas físicas, cumplimiento del plan y ambiente del lugar/momento cuando hay correspondencia. Explica cambios y límites, identifica información faltante y abre un procedimiento aplicable. La presentación de datos juntos no demuestra causalidad. Se accede también a comunicación o ayuda disponible sin obligar a completar el cuestionario.

El usuario puede revisar acciones pendientes, registrar seguimiento y exportar un resumen con indicadores, evolución, datos faltantes y fuentes pertinentes para comunicar una preocupación. Los comentarios clínicos libres de CRF no se incluyen en la demostración por defecto.

Terminado cuando mapa, historial, chequeo y exportación muestran resultados consistentes y el recorrido completo es utilizable mediante teclado, con texto adicional a cualquier color de estado.

Este recorrido integrado es el objetivo recomendado para la entrega. La maqueta y el video actuales muestran solo el chequeo y no cierran este nivel ni todo el alcance elegido. Si el tiempo se agota, explicitar el nivel alcanzado y el alcance pendiente sin presentar el chequeo aislado como cumplimiento de la integración completa.

## Cierre de la entrega del hackathon

Revisar adversarialmente cada nivel al construirlo y comprobar que mantiene las propiedades anteriores. Ejecutar comprobaciones locales exigidas por cada afirmación o cambio en el momento correspondiente. Al alcanzar el horizonte de entrega, realizar una revisión integrada y luego las pruebas integradas pertinentes; no dejar la corrección de datos o la revisión de contenido médico para este cierre.

Comprobar el recorrido completo con:

- Datos presentes y ausentes; archivo o entrada inválidos; unidades y fechas ambiguas.
- Identificadores con ceros iniciales y separación de campañas y fases.
- Distinción entre cambio observado, regla experimental y diagnóstico.
- Persistencia y, si se adopta, uso sin conexión de extremo a extremo.
- Consistencia del mapa, las gráficas, los registros y el resumen exportado.
- Integración de salud, pruebas físicas, contramedidas y ambiente sin duplicar o cambiar el significado del mismo registro.
- Distinción de mediciones diarias, evaluaciones periódicas e historial de exámenes que requieren equipo terrestre.
- Accesibilidad y comprensión del siguiente paso por alguien sin conocimientos médicos completos.

Preparar una presentación con problema, recorrido de uso, contribución concreta de NASA, evidencia y limitaciones. Mostrar funciones que realmente se ejecutan. Registrar fuentes, licencias y uso de IA según las reglas del evento. La publicación requiere una instrucción aplicable del usuario.

## Condiciones de una demostración coherente

La presentación debe mostrar la utilidad para el astronauta: comprender su situación, realizar una tarea, consultar adaptación y hábitat y entender una acción. Las fuentes NASA aportan evidencia y datos con sus contextos originales; un caso sintético integra la experiencia cuando no hay datos reales emparejados. El estado de los procedimientos y reglas debe estar visible. Salud, adaptación y hábitat comparten historial y plan; añadir tres paneles independientes no demuestra esa integración.

Reservar tiempo para revisión y presentación. Ajustar el número de recorridos implementados al tiempo disponible, sin rebajar integridad ni eliminar silenciosamente dominios del producto elegido. No hay una estimación de jornadas validada sin conocer el equipo, el tiempo y el caso clínico/ambiental.
