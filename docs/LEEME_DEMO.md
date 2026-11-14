# Mostrar Órbita al equipo

Abrí `../demo/orbita.html` en un navegador actual. Es un único archivo con estilos, diagramas y JavaScript incorporados: no requiere instalación, servidor, cuenta ni conexión para el recorrido. Los enlaces a documentos NASA sí requieren conexión.

## Recorrido sugerido para una presentación

1. Mostrá la vista general: perfil ficticio, mapa corporal, indicadores y panel del copiloto.
2. Seleccioná un sistema y cambiá de indicador y periodo para explorar las gráficas.
3. Tocá «Me siento distinto» o «Comenzar chequeo».
4. Elegí una observación, agregá contexto e ingresá una medición ficticia y su método. El formulario pide un número positivo; no aplica límites médicos.
5. Revisá la comparación y guardá el episodio con el siguiente paso administrativo elegido.
6. Abrí «Mi evolución» y «Preparar resumen». Se descarga un TXT; no se envía a nadie.
7. Explorá «A bordo» y «Evidencia» para mostrar cómo se conectan procedimientos y fundamentos.

En pantallas pequeñas, la navegación queda arriba. Los botones y formularios admiten teclado; Escape cierra los cuadros. «Reiniciar demostración» pide confirmación antes de quitar los registros de ejemplo agregados.

## Qué representa

Es una maqueta interactiva del producto, creada para presentar el concepto. Permite navegar, completar un recorrido, cambiar gráficas, guardar registros ficticios y exportar un resumen. No es el software clínico final.

Todos los valores, la persona y la misión son ficticios. No contiene registros NASA reales, integración de sensores, IA generativa, transmisión a personal médico ni protocolos clínicos validados. Las fuentes NASA fundamentan el diseño y se enlazan en la sección Evidencia; no certifican esta herramienta.

Los registros y el borrador se conservan solo en este navegador mediante almacenamiento local cuando está disponible. Algunos navegadores restringen el almacenamiento al abrir archivos; la maqueta lo informa y conserva el recorrido en memoria mientras la página siga abierta. No ingreses información personal real. Compartir el HTML no transfiere los registros guardados en otro navegador.

El destinatario puede descargar demo/orbita.html directamente desde el repositorio.

## Verificación realizada

Se comprobó la sintaxis JavaScript, la ausencia de identificadores duplicados y de recursos externos necesarios para la interfaz. Se ejecutó el recorrido en un entorno DOM de prueba: navegación, cambio de indicadores y periodos, entradas inválidas, vuelta atrás conservando datos, guardado, recuperación, borrador, resumen y reinicio. También se comprobaron almacenamiento bloqueado o corrupto y texto con etiquetas HTML sin ejecutarse.

La comprobación automática axe-core sobre el DOM inicial no encontró infracciones en las reglas ejecutadas; se excluyó contraste de color porque requiere renderizado. Posteriormente, para grabar el video de la propuesta, se recorrió la maqueta en Chromium y se revisaron vistas del recorrido. No se hizo una prueba completa de teclado/lector de pantalla ni una auditoría de contraste. Estos resultados no equivalen a conformidad completa de accesibilidad ni validación clínica. El video se generó en la sesión de trabajo y no se incluye en esta carga de archivos de texto.
