# Diseño técnico propuesto e investigación

Estado: propuesta, sin integración de los repositorios consultados. La implementación debe ser propia según ../AGENTS.md.

## Funcionalidades propias a construir

Un motor de procedimientos con pasos, condiciones, recursos requeridos, estado conservado y fuentes versionadas; un formato común de medición con unidad, tiempo, método y procedencia; conectores independientes para importar fuentes; un historial que preserve observaciones y resultados; y un plan de tareas vinculado a los procedimientos.

El diseño offline recomendado requiere persistencia, respaldo, recuperación y sincronización con reglas de conflictos explícitas. No están implementados en la demo. Guardar registros en localStorage no equivale a resolver esa arquitectura.

La escalabilidad se evaluará agregando una misión, procedimiento o fuente sin reescribir las demás funciones. Para múltiples tripulantes, separar identidad, permisos y registros. No se ha medido capacidad concurrente ni rendimiento.

## Repositorios estudiados: solo inspiración

- XState: https://github.com/statelyai/xstate — referencia conceptual para estados y transiciones; escribir el motor propio.
- LHC-Forms: https://github.com/LHNCBC/lforms — formularios definidos por datos y soporte parcial FHIR SDC; escribir formularios propios.
- Open mHealth: https://github.com/openmhealth/schemas — referencia sobre significado, metadatos y unidades; no copiar sus esquemas como código. Sueño y actividad remiten a sucesores IEEE 1752.1.
- CQL Execution: https://github.com/cqframework/cql-execution — referencia de separación entre lógica, datos y terminología; no incorpora reglas médicas aplicables automáticamente.
- Medplum: https://github.com/medplum/medplum — referencia de organización sanitaria interoperable.
- Android FHIR SDK: https://github.com/ohs-foundation/android-fhir — referencia de operación sanitaria offline en Android.
- Open MCT: https://github.com/nasa/openmct — referencia de telemetría y navegación temporal.

ThingsBoard no se selecciona como base: su README consultado declara BUSL desde 4.4, mientras versiones anteriores mantienen Apache-2.0. Además, ninguna licencia abierta sustituye la regla de código propio.

## Comparación con propuestas del track

Repositorios encontrados: https://github.com/quantum-astronauts/pulsar ; https://github.com/Yii0909/VitalOrbit ; https://github.com/mysunatislam/astrobone-space-apps-2026 . Sus autores anuncian funciones como mapas, seguimiento personal y orientación. Son declaraciones documentales, no resultados de pruebas independientes; no se inspeccionó exhaustivamente su código ni se comprobó permiso de reutilización.

La diferenciación propuesta es ejecutar procedimientos acordes al equipo de misión y conservar el resultado de cada acción, integrando salud, adaptación y ambiente con información compatible. No se afirma exclusividad frente a otros productos.

## Caso de evaluación

Demostrar el mismo episodio sintético con dos configuraciones de recursos: identificar qué se puede medir, señalar información faltante, ofrecer una ruta documentada, conservar progreso y registrar el resultado. Comparar errores de interpretación, finalización de tareas y comprensión del siguiente paso; no inventar metas numéricas ni validación clínica.
