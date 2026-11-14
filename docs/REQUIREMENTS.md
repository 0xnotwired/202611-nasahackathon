# Space Apps 2026 — criterios para elegir y construir la solución

Fuente: objetivos y consideraciones del desafío aportados por el usuario en esta sesión.
Desafío: https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/

Este documento conserva el encargo y distingue sus objetivos de las sugerencias opcionales. La dirección de producto elegida se registra a continuación; arquitectura y selección definitiva de datasets siguen pendientes.

## Dirección elegida por el usuario

El 14 de noviembre de 2026 el usuario eligió **Órbita con los procedimientos de A bordo**, con el recorrido «Me siento distinto → registro lo que ocurre → la herramienta me ayuda a medir correctamente → veo mi evolución → entiendo el siguiente paso», y pidió concretarlo como copiloto de astronauta.

El copiloto integra registro, medición guiada, seguimiento y orientación trazable. PRODUCTO.md desarrolla esta elección y distingue el recorrido confirmado de las pantallas, tecnologías y reglas aún propuestas. La elección no fija IA generativa, dispositivos, misión, operación sin conexión ni umbrales clínicos.

El usuario amplió después la dirección: integrar **salud personal, adaptación de músculo/hueso/capacidad física y hábitat** en un mismo producto para el astronauta. Adaptación y ambiente pasan al alcance central. El copiloto debe conectar esos dominios con procedimientos y un plan de cuidado, tanto en la rutina preventiva como al registrar un cambio. La maqueta y el video actuales muestran principalmente el chequeo y no representan todavía este alcance completo. PRODUCTO.md, DEC-002, registra la actualización.

## Objetivos centrales del desafío

- Crear una herramienta visual para que los astronautas evalúen su propia salud durante misiones espaciales.
- Proporcionar orientación sobre tratamientos y mejoras de salud.
- Presentar métricas y evaluaciones de forma clara para el usuario.
- Trabajar con datos que representen indicadores de salud; el tipo de entrada es libre.

## Preguntas que deben orientar el diseño

Para cada indicador, evaluación o acción propuesta, explicar:

1. Qué medición puede realizarse en el espacio y qué equipo o intervención requiere.
2. Por qué hace falta esa medición o examen.
3. Cómo pueden afectar los peligros del vuelo espacial al indicador.
4. Cuándo un resultado merece atención de la tripulación o de los médicos en Tierra.
5. Qué acciones pueden prevenir una condición crítica o mejorar la salud.

Los recursos de NASA Human Research Program y de otras agencias espaciales pueden fundamentar estas respuestas. No se presupone que el astronauta tenga conocimientos médicos completos.

## Opciones sugeridas, no requisitos obligatorios

- Entrada por texto, clics, cámara u otros medios.
- Uso de valores numéricos o imágenes médicas, siempre que representen indicadores de salud.
- Figura humana con regiones seleccionables y explicación de su función y estado.
- Animaciones e interactividad para comunicar información.
- Adaptación a nave, estación, rover o base lunar/planetaria.
- Recordatorios de mediciones y acciones dentro de la rutina de misión.
- Gamificación para apoyar hábitos de salud.
- Gráficos dinámicos de evolución temporal.
- Colores para facilitar la interpretación rápida del estado.
- Instrucciones sencillas sobre mediciones, indicadores y riesgos.

## Criterios de trabajo derivados para nuestro proyecto

Estos son criterios del proyecto para concretar el encargo; no se presentan como requisitos adicionales impuestos por NASA:

- El recorrido debe permitir comprender qué se observó, qué significa y cuál es el siguiente paso.
- Las mediciones, sus unidades y su contexto deben quedar claros.
- Las explicaciones y orientaciones de salud deben conservar sus fuentes y límites de evidencia.
- Identificar datos reales, simulados, de análogos terrestres, de vuelo y de cultivos celulares.
- Distinguir cambios observados, hipótesis y diagnósticos validados.
- Si faltan mediciones o contexto, mostrar esa falta al evaluar el estado.
- Si se usan colores, acompañarlos con texto o símbolos.
- Elegir funciones opcionales por su contribución a la evaluación y las acciones de salud.

## Evidencia ya revisada

Revisión de los datasets compartidos: DATASETS.md

CRF Daily Vitals es una fuente candidata para monitoreo diario con datos humanos de reposo en cama. Su recomendación previa no constituye una decisión del usuario de limitar el proyecto a ese dataset ni a un sistema corporal.

## Comprobación de una futura propuesta

Toda propuesta deberá hacer explícitos su usuario, situación de misión, indicadores, medios de medición, evaluación visual, orientación, criterios de atención médica y evidencia utilizada. Las funciones opcionales elegidas deberán contribuir a ese recorrido.

## Restricción de recursos

El usuario pide libros y repositorios gratuitos. Seleccionar textos completos accesibles sin pago ni suscripción y herramientas utilizables sin servicios comerciales obligatorios.
