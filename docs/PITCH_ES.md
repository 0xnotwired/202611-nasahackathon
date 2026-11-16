# Órbita — guion del pitch en español

[README del proyecto](../README.md) · [English script](PITCH.md)

Duración objetivo: aproximadamente tres minutos, incluyendo transiciones breves. Los tiempos son una guía para ensayar, no una duración medida. Las indicaciones de pantalla no se leen. Usar únicamente la demo ficticia; preparar las pantallas y el episodio antes de presentar. No mostrar perfiles personales ni comentarios clínicos originales.

## 0:00–0:25 — El problema

**Mostrar:** nombre del proyecto y después My health.

> Imaginá que estás lejos de la Tierra y te sentís más cansado de lo habitual. Tenés algunas mediciones, un plan de tareas y equipamiento limitado. ¿Qué te dicen esos números? ¿Qué información falta? ¿Qué podés hacer ahora?
>
> Construimos Órbita para conectar esas preguntas en una herramienta visual de salud para astronautas.

## 0:25–1:00 — La solución

**Mostrar:** My health y después My progress. Señalar una fecha, un método y un hueco del gráfico.

> Órbita reúne indicadores de salud, evaluaciones físicas y contexto ambiental. Cada medición conserva su origen, su método y su fecha. Un dato que falta sigue faltando: no se convierte en cero ni en una señal de que todo está bien.
>
> Buscamos que la persona entienda la información disponible y pueda conectarla con una acción y un resultado que después pueda revisar.

## 1:00–1:45 — La demostración

**Mostrar:** abrir un episodio de Fatigue en I feel different. Después mostrar On board y My plan.

> En este ejemplo registramos fatiga con datos ficticios. Órbita organiza lo que se reportó, la información disponible y lo que falta antes de mostrar una sugerencia.
>
> Los procedimientos comprueban la preparación y el equipamiento. Si cambiamos la configuración de misión, la aplicación señala qué procedimiento no está disponible. Cuando completamos una tarea, el resultado se registra por separado: hacer una actividad no demuestra una recuperación.
>
> La regla de esta demo es ficticia. La orientación real necesita contenido revisado, con fuente y versión; el programa no diagnostica ni prescribe tratamientos.

## 1:45–2:15 — El seguimiento y la distancia

**Mostrar:** resumen del episodio, Review and export y panel de Tierra simulado.

> El episodio permite preparar un resumen estructurado y exportar registros conservando su procedencia. Preparar el resumen no lo envía: compartir es una decisión aparte.
>
> La aplicación principal funciona localmente y se puede entregar en un único archivo HTML. El panel de Tierra demuestra la comunicación mediante una simulación identificada en pantalla; todavía no es una conexión con un equipo médico.

## 2:15–2:40 — Qué construimos y qué aporta

**Mostrar:** diagrama de arquitectura o vista general de la aplicación.

> Construimos once vistas conectadas con JavaScript, almacenamiento del navegador y gráficos SVG, sin dependencias de ejecución en la aplicación principal. La investigación de NASA orientó el diseño; las importaciones mantienen los casos de investigación separados de los registros personales.
>
> Nuestro aporte es conectar la calidad de la información, los recursos disponibles y el seguimiento. Quedan pendientes los estudios con usuarios y la validación clínica.

## 2:40–3:00 — Cierre

**Mostrar:** nombre de Órbita y recorrido: Observar → Revisar → Actuar → Registrar → Dar seguimiento.

> Órbita ayuda a ver qué sabemos, reconocer qué falta y conservar un registro de la próxima acción y su resultado.
>
> Tu salud, a bordo.

## Preguntas del jurado

| Pregunta | Respuesta |
|---|---|
| ¿Diagnostica o recomienda tratamientos? | No incluye un motor diagnóstico ni de tratamientos validado. El mecanismo admite reglas con fuente y versión; el contenido clínico real necesita revisión calificada. |
| ¿El copiloto es una IA generativa? | No. Usa reglas explícitas cargadas como datos. Usamos asistencia de IA durante el desarrollo, no como motor de decisiones clínicas. |
| ¿Los datos de la demo son de un astronauta? | No. La demo integrada es ficticia. Los archivos de investigación se importan por separado y conservan su origen real. |
| ¿Se comunica con la Tierra? | El transporte actual es una simulación local identificada como tal. |
| ¿Qué hardware necesita? | Una computadora con navegador para la demo. No integramos dispositivos médicos. |
| ¿Lo validaron con astronautas o pacientes? | No. Hay verificaciones de software y recorridos en Chromium; no hay validación humana ni clínica establecida. |
| ¿Los datos locales están cifrados? | La aplicación no los cifra. Es una limitación declarada, no una solución lista para despliegue clínico. |
| ¿Mejora la salud durante una misión? | Todavía no lo sabemos: hace falta un estudio. Lo demostrado es el funcionamiento del recorrido de información, acciones y seguimiento. |

Fuentes y alcance: [guía técnica](TECHNICAL_README.md), [auditoría](AUDIT.md) y [pendientes](HANDOFF.md). Mantener las referencias científicas y atribuciones de datasets en la entrega: el pitch oral no reemplaza las citas.

Esta versión en español se incorpora por pedido explícito del usuario; la documentación general y la interfaz del repositorio permanecen en inglés.
