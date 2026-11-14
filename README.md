# Órbita — Tu salud, a bordo

Durante una misión, el astronauta necesita comprender cómo está, qué cambió y qué acción de cuidado puede realizar con los recursos disponibles. Órbita propone conectar salud personal, adaptación física y hábitat con procedimientos guiados y seguimiento.

**Observar → medir → comprender → actuar → registrar el resultado → continuar el cuidado.**

## El producto

- **Mi salud:** signos vitales, síntomas, descanso y mapa corporal.
- **Adaptación:** fuerza, resistencia, capacidad aeróbica, masa e historial óseo como variables distintas.
- **Hábitat:** condiciones ambientales con lugar, tiempo, sensor y unidades.
- **Mi plan:** mediciones, pruebas y contramedidas indicadas, con registro de tareas y resultados.
- **A bordo:** procedimientos con propósito, equipo, pasos, fuente y límites de aplicación.
- **Copiloto:** ayuda contextual que conecta esas partes, identifica información faltante y abre el procedimiento aplicable.

El astronauta puede comenzar por su rutina o por «Me siento distinto». Un episodio de cansancio permite revisar registros personales, pruebas físicas y ambiente compatible; completar información; seguir un procedimiento revisado y conservar la acción para seguimiento. Mostrar datos juntos no demuestra causalidad.

## Probar lo que existe

Descargá [demo/orbita.html](demo/orbita.html) y abrilo en un navegador. Es un archivo autocontenido; no requiere instalación. Permite explorar el cuerpo y gráficas, completar un chequeo con datos ficticios, guardar registros cuando el navegador permite almacenamiento local y preparar un resumen TXT.

**La maqueta muestra principalmente el chequeo inicial.** Adaptación, hábitat y plan compartido son alcance central pendiente de implementación. No hay sensores conectados, sincronización con Tierra, modelo de IA ni protocolos clínicos validados. No introducir datos personales reales.

[Instrucciones y verificaciones de la demo](docs/LEEME_DEMO.md).

## Diferenciación propuesta

Construir procedimientos que consideren los recursos de misión, conecten cuerpo y ambiente con datos compatibles y conserven el resultado de cada acción. La utilidad debe demostrarse completando tareas y comprendiendo el siguiente paso; un mapa corporal o un chatbot por sí solos no acreditan esa utilidad.

## Sin conexión y crecimiento

Se recomienda operación local con sincronización posterior. La demo funciona sin internet salvo enlaces externos; la arquitectura de sincronización todavía está por construir. El diseño modular propuesto permitiría agregar configuraciones de misión, sensores y procedimientos sin rehacer la experiencia del astronauta. No hay pruebas de escalabilidad realizadas.

## Implementación propia

**Toda funcionalidad debe ser escrita por el equipo. Los repositorios externos se usan únicamente como inspiración.** No copiar, adaptar, portar ni incorporar su código o paquetes para implementar funciones de Órbita. Esta regla del proyecto fue indicada por el usuario conforme al reglamento informado. Las propuestas previas de integrar librerías se reemplazan por implementaciones propias. Consultar [AGENTS.md](AGENTS.md).

## Documentación para el equipo

- [Producto y decisiones de alcance](docs/PRODUCTO.md).
- [Objetivos del desafío](docs/REQUIREMENTS.md).
- [Roadmap y criterios de cierre](docs/ROADMAP.md).
- [Base académica: revisión dirigida y referencias](docs/BASE_ACADEMICA.md).
- [Revisión de datasets NASA y sus límites](docs/DATASETS.md).
- [Fuentes gratuitas y repositorios de referencia](docs/RESOURCES.md).
- [Matriz de evidencia](docs/MATRIZ_EVIDENCIA.csv) y [bibliografía BibTeX](docs/REFERENCIAS.bib).
- [Arquitectura propuesta e investigación de referencias](docs/TECNICO.md).

## Relación con el desafío

La propuesta busca cubrir evaluación visual, instrucciones de medición, explicación de peligros y riesgos, orientación fundamentada y seguimiento. La revisión de fuentes NASA no certifica el producto. No hay una rúbrica adicional de puntuación verificada en este repositorio.

Desafío: https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/

Licencia del código propio: pendiente de decisión del equipo. El acceso gratuito a fuentes no implica permiso para redistribuirlas completas. Se enlazan documentos originales en lugar de copiar libros o datasets clínicos.
