# Dashboard aeróbico de Órbita

Implementación basada en [la investigación de interfaces](aerobic-dashboard-research.md).

## Dirección de diseño

El panel organiza el seguimiento como una bitácora personal. La trayectoria es el
contenido principal; la ilustración orbital da identidad sin representar un estado
médico. Azul profundo `#17354b`, fondo `#f3f6fa`, superficies `#ffffff`, texto
secundario `#52677d`, trayectoria `#217b70` y divisores `#dce4ed`.
La versión oscura conserva contraste y diferencia los protocolos por forma y trazo.
No hay animaciones continuas, ECG decorativos ni puntuación global de salud.

## Recorrido disponible

- Mi perspectiva: resumen, evolución interactiva, ficha de visita y lectura explicada.
- Historial aeróbico: mismo explorador con el registro abierto y acceso a otros datos.
- Ejercicio y seguimiento: registro de actividad y preparación local de una revisión.
- Filtros de 3, 6 y 12 meses o historial completo, anclados en la última visita del
  historial disponible. Un límite de tres meses incluye ambos extremos: puede haber
  cuatro visitas mensuales. El período efectivo siempre se muestra con fechas.
- Referencia elegida explícitamente, conservada al cambiar el período, aunque quede
  fuera de la ventana. Puede seleccionarse la visita más reciente.
- Exportación CSV limitada al período; incluye unidad, método, origen sintético y
  validación pendiente. No exporta un diagnóstico ni una tendencia clínica.
- Tabla accesible con encabezados, desplazamiento por teclado y explicación
  desplegable de las comparaciones bloqueadas.

## Datos e integración

Los componentes reciben datos de `data/service.ts`. El servicio activa los seis
escenarios únicamente en modo mock. En modo API se oculta el selector y se consumen
las respuestas existentes sin sustituirlas silenciosamente por fixtures.
No se modifica `backend/`, `contracts/` ni el conjunto de dependencias.

El escenario inicial es descenso y recuperación: trece visitas de noviembre de 2025
hasta noviembre de 2026. Los seis perfiles reproducen las series de diseño del CSV;
Lyra usa un desplazamiento ficticio de dos unidades para distinguir personas.
Atlas conserva el estado vacío para comprobar ausencia de datos.

Los valores son inventados; la unidad mL/kg/min y los protocolos A/B son del demo.
No resuelven las unidades o condiciones pendientes de MR080G. El apartado
«Del dataset a tu historia» explica esa separación dentro del propio panel.

## Cálculos y representación

La tendencia es la pendiente de una recta ajustada a días reales. Se exige un mínimo
exploratorio de tres resultados y coincidencia de unidad y método. No es una prueba
de significación, diagnóstico, umbral de estabilidad ni predicción. Una pendiente
minúscula puede tener dirección matemática sin relevancia clínica; el panel no la
llama mejoría o empeoramiento.

Los faltantes siguen ocupando su visita, se excluyen del ajuste y nunca se vuelven
cero. Los trazos se interrumpen en faltantes y cambios de método/unidad. Métodos
nuevos usan otro símbolo y trazo. Unidades diferentes no comparten el gráfico.
La referencia visual solo se dibuja en segmentos del mismo método y unidad.
La actividad se presenta separada y conserva su propio alcance temporal.

## Verificación reproducible

```bash
npm run check
npm run build
```

`tests/aerobic.test.ts` cubre períodos por fecha, recuperación con cambio de dirección,
faltantes, métodos y unidades incompatibles, fechas repetidas y exportación.

En este entorno Turbopack encontró una restricción al abrir un puerto de su proceso
interno. Se verificó la compilación alternativa con `npm run build -- --webpack`;
no se cambió el bundler configurado para el desarrollo.
