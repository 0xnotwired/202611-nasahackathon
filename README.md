# Órbita — Tu salud, a bordo

[Producto](docs/PRODUCTO.md) · [Diseño técnico](docs/TECNICO.md) · [Base académica](docs/BASE_ACADEMICA.md) · [Demo](demo/orbita.html)

Durante una misión espacial, el astronauta necesita comprender cómo está, qué cambió y qué acciones de cuidado puede realizar con los recursos disponibles.

**Órbita es una propuesta de aplicación personal de salud para astronautas que integra su cuerpo, su adaptación física y el ambiente de la misión para ayudarlos a realizar y dar seguimiento a las acciones de cuidado.**

> Órbita acompaña al astronauta desde lo que siente hasta lo que puede hacer: integra salud, adaptación física y hábitat con procedimientos guiados y seguimiento personal durante la misión.

Propuesta para el desafío [Create Health Monitoring Software for Astronauts on Space Missions — NASA Space Apps 2026](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/).

## La experiencia del astronauta

Al abrir la aplicación, **Mi día** reuniría la información disponible, los cambios observados y las próximas tareas. Desde ahí, el astronauta podría consultar su cuerpo, revisar su evolución, seguir su rutina o iniciar **Me siento distinto**.

| Parte | Qué puede hacer el astronauta |
|---|---|
| **Mi salud** | Registrar síntomas, signos vitales y descanso; explorar su cuerpo y entender las mediciones. |
| **Adaptación** | Revisar fuerza, resistencia, capacidad aeróbica e historial óseo, junto con ejercicio y alimentación registrados. |
| **Hábitat** | Consultar condiciones ambientales del lugar y periodo: temperatura, humedad, CO₂ o radiación, según los datos disponibles. |
| **Mi plan** | Seguir mediciones, pruebas, ejercicio, nutrición y otras acciones indicadas; registrar cumplimiento y dificultades. |
| **A bordo** | Ejecutar procedimientos guiados con propósito, equipo necesario, instrucciones y siguiente paso fundamentado. |
| **Mi evolución** | Ver cómo se relacionan en el tiempo las observaciones, las mediciones y las acciones realizadas. |

Estas partes comparten historial, contexto y seguimiento. Salud, adaptación y hábitat pertenecen al alcance central del producto.

### El papel del copiloto

El copiloto es la ayuda contextual que conecta el recorrido. Usa la información disponible y los procedimientos aplicables para explicar qué revisar, qué falta conocer y qué tarea puede realizarse con el equipo de esa misión. La interfaz conversacional y la IA generativa son opciones por definir; el concepto no depende de ellas.

### Un recorrido concreto

En un escenario de demostración con datos ficticios:

1. El astronauta registra que siente más cansancio.
2. Órbita permite revisar descanso, mediciones recientes, pruebas físicas, actividad y ambiente correspondiente, cuando existe información compatible.
3. El copiloto ayuda a completar el contexto y abre el procedimiento pertinente.
4. El astronauta realiza la tarea y registra el resultado.
5. El episodio queda disponible para seguimiento o consulta médica.

**Observar → comprender → realizar una acción → registrar el resultado → continuar el cuidado.**

Una coincidencia temporal entre ambiente y síntomas se presenta como contexto; no demuestra su causa.

## Qué buscamos diferenciar

La propuesta se concentra en completar acciones de cuidado y conservar su resultado. Los gráficos y el mapa permiten explorar información dentro de ese recorrido.

Los procedimientos considerarían los recursos disponibles. Si una prueba requiere un equipo ausente, la aplicación explicaría esa limitación y presentaría la alternativa documentada o la necesidad de apoyo. Cada examen conservaría su método y frecuencia: el historial de una DXA no implica que pueda realizarse a bordo.

Cada orientación debe conservar su fuente, versión y condiciones de aplicación. Las reglas clínicas concretas y los procedimientos de atención requieren selección y revisión; no se deducen automáticamente de los datasets.

## Probar la maqueta actual

1. Descargá [demo/orbita.html](demo/orbita.html) mediante **Download raw file** en GitHub.
2. Abrí el archivo en un navegador actual.
3. Explorá el cuerpo y los gráficos, seleccioná **Me siento distinto** y completá el chequeo con datos ficticios.
4. Consultá **Mi evolución** y prepará un resumen TXT.

No requiere instalación, servidor ni cuenta. La interfaz es autocontenida y el recorrido funciona sin internet; los enlaces externos a NASA requieren conexión. El guardado y la recuperación dependen del almacenamiento permitido por el navegador. Compartir el HTML no comparte los registros de otro navegador.

[Instrucciones y alcance de las verificaciones](docs/LEEME_DEMO.md).

### Estado real del proyecto

| Disponible | Pendiente de implementación |
|---|---|
| Maqueta HTML con datos sintéticos, cuerpo interactivo y gráficos. | Integración de salud, adaptación física, hábitat y plan compartido. |
| Chequeo guiado, guardado local de demostración y resumen TXT. | Procedimientos adaptados a recursos de misión y seguimiento integrado de resultados. |
| Definición del producto, roadmap y revisión académica dirigida. | Conectores de sensores, sincronización y arquitectura definitiva de persistencia. |

La maqueta muestra principalmente el chequeo inicial. No tiene integración de sensores, datos NASA cargados, comunicación médica, modelo de IA ni protocolos clínicos validados. Usar únicamente información ficticia en la demo. La selección de fuentes NASA no implica certificación o aprobación de la herramienta.

## Funcionamiento sin conexión y escalabilidad

La recomendación arquitectónica es **operación local con sincronización cuando haya conectividad**: consultar historial y procedimientos, registrar mediciones y continuar tareas localmente; compartir registros y recibir actualizaciones cuando sea posible. La sincronización, los respaldos y la resolución de conflictos están pendientes de diseño e implementación.

Para crecer, proponemos un núcleo propio al que se puedan agregar:

- **Sensores y fuentes**, mediante conectores con procedencia, unidades y métodos explícitos.
- **Procedimientos**, con requisitos de equipo, pasos, fuentes y versiones.
- **Configuraciones de misión**, según entorno, recursos y comunicación disponibles.
- **Tripulantes**, manteniendo separados sus registros y permisos.

Esta es una dirección de diseño; todavía no existen pruebas de carga, capacidad concurrente ni escalabilidad demostrada. Ver [diseño técnico](docs/TECNICO.md).

## Fundamento científico y datos NASA

La [base académica](docs/BASE_ACADEMICA.md) reúne una revisión dirigida de libros, estándares, el Human Integration Design Handbook y ocho informes HRP. Distingue evidencia científica, requisitos normativos e inferencias de diseño. No es una revisión sistemática ni una validación clínica del software.

| Fuente candidata | Uso pertinente |
|---|---|
| **CRF Daily Vitals** | Explorar signos vitales y masa/peso registrados en un análogo terrestre de reposo en cama. |
| **MR079G / MR080G / MR035G** | Investigar fuerza, capacidad aeróbica e historial de densitometría, respectivamente. |
| **MSD007 / DTO 684** | Explorar casos históricos de ambiente de Mir y radiación en Shuttle. |

Los estudios, participantes, misiones, métodos y frecuencias se conservan por separado salvo correspondencia verificada. No se comprobó una serie real emparejada que integre todas estas variables para un mismo astronauta. Un escenario sintético identificado permite demostrar el recorrido integrado sin fabricar esa correspondencia.

[Revisión de datasets](docs/DATASETS.md) · [Matriz de evidencia](docs/MATRIZ_EVIDENCIA.csv) · [Referencias BibTeX](docs/REFERENCIAS.bib)

## Implementación propia

**Toda funcionalidad del producto debe ser escrita por el equipo. Los repositorios externos se consultan únicamente como inspiración, comparación e investigación.**

Por instrucción del usuario conforme al reglamento informado, no copiar, adaptar, portar ni incorporar código de esos repositorios, incluidos paquetes utilizados para implementar funcionalidades de Órbita. Las recomendaciones anteriores de integración quedan reemplazadas por esta regla, aunque las licencias permitan reutilización. Tampoco usar IA para reproducir o transformar ese código.

Las reglas de trabajo y procedencia están en [AGENTS.md](AGENTS.md). El uso de IA debe registrarse según las reglas aplicables del evento. La licencia del código propio sigue pendiente de decisión del equipo.

## Documentación y próximos resultados

- [Producto y decisiones de alcance](docs/PRODUCTO.md).
- [Objetivos del desafío y criterios del proyecto](docs/REQUIREMENTS.md).
- [Roadmap y criterios de cierre](docs/ROADMAP.md).
- [Fuentes gratuitas y referencias conceptuales](docs/RESOURCES.md).
- [Arquitectura propuesta e investigación de repositorios](docs/TECNICO.md).

Los siguientes resultados son comprender la situación integrada de misión, completar tareas del plan y revisar cambios con procedimientos aplicables y seguimiento. Su verificación debe cubrir datos ausentes, procedencia, consistencia entre vistas, recuperación de tareas, accesibilidad y comprensión del siguiente paso.

El repositorio contiene documentación y una maqueta. No hay un stack definitivo del producto ni comandos de build, pruebas clínicas o despliegue que puedan presentarse como disponibles. Para colaborar, seguir AGENTS.md y proponer cambios mediante ramas y pull requests.
