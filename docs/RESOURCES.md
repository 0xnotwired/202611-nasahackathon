> Restricción vigente: estos repositorios son solo inspiración. No incorporar, adaptar ni instalar su código como funcionalidad del producto. Las recomendaciones históricas de integración quedan reemplazadas por la instrucción de implementación propia en ../AGENTS.md.

# Bibliografía y repositorios para el desafío de salud espacial

Selección consultada el 14 de noviembre de 2026. Se revisaron fichas editoriales, documentación oficial y README de los repositorios. Las propuestas de uso y prioridades son recomendaciones para este proyecto. No se instalaron ni ejecutaron estas bibliotecas.

El análisis posterior de los libros, estándares, manual y ocho informes HRP está en [BASE_ACADEMICA.md](BASE_ACADEMICA.md), citas por página, matriz de evidencia y bibliografía. Es una revisión dirigida de secciones pertinentes, no una lectura íntegra de todos los documentos ni una revisión sistemática.

## Libros completos gratuitos

Criterio del usuario: seleccionar únicamente recursos gratuitos. Se excluyen los dos títulos comerciales de la selección anterior.

### Human Adaptation to Spaceflight: The Role of Food and Nutrition — 2.ª edición, 2021

Página oficial: https://www.nasa.gov/directorates/esdmd/hhp/human-adaptation-to-spaceflight-the-role-of-food-and-nutrition/

PDF completo: https://www.nasa.gov/wp-content/uploads/2024/08/human-adaptation-2021-final-b.pdf

NASA ofrece la descarga gratuita de esta edición. Organiza la adaptación y nutrición por sistemas fisiológicos, incluyendo hueso, músculo y salud ocular, y trata datos de ISS y análogos terrestres. Primera lectura recomendada entre los libros completos gratuitos localizados. Se descargó el PDF completo de 135 páginas, con páginas impresas enfrentadas, y se analizaron secciones de energía, fluidos, hueso, músculo, sistema cardiovascular, visión e inmunidad; véase BASE_ACADEMICA.md para las citas y los límites.

### Nutritional Biochemistry of Space Flight — Smith, Zwart, Kloeris y Heer, 2009

PDF completo alojado por NASA: https://www.nasa.gov/wp-content/uploads/2023/03/nutritional-biochemistry-of-space-flight.pdf

Se comprobó el PDF completo, de 220 páginas. Trata requisitos nutricionales, energía, vitaminas, minerales, actividad extravehicular e interacciones entre nutrientes y medicamentos. Lectura complementaria de fundamentos; por su fecha, contrastar afirmaciones operativas con evidencia más reciente.

Ambos títulos están disponibles gratuitamente para lectura; no se asume una licencia abierta de reutilización de todo su contenido.

## Manuales e informes públicos

### NASA Human Research Program — Evidence Reports

https://humanresearchroadmap.nasa.gov/Evidence/

Colección pública de informes y artículos de evidencia por riesgo. Sirve para justificar la selección de indicadores y distinguir evidencia, incertidumbre y lagunas. Registrar el informe concreto y su fecha al extraer una afirmación. La colección también refiere a un Evidence Book histórico de 2009; preferir los informes más recientes disponibles para la pregunta concreta.

### NASA-STD-3001, volumen 1: Crew Health

https://www.nasa.gov/reference/nasa-std-3001v1/

Estándar público sobre salud de la tripulación antes, durante y después de la misión. Útil para fundamentar qué necesidades médicas debe cubrir una solución. No convierte automáticamente una regla experimental del proyecto en un criterio médico validado.

### NASA-STD-3001, volumen 2: Human Factors, Habitability, and Environmental Health

https://www.nasa.gov/reference/nasa-std-3001v2/

Estándar público para sistemas con los que interactúa la tripulación. Fuente para investigar interfaces, factores humanos y condiciones ambientales. Consultar la revisión vigente desde la página oficial antes de fijar requisitos específicos.

### Human Integration Design Handbook — NASA

https://www.nasa.gov/human-integration-design-handbook/

Manual público complementario del volumen 2. La página ofrece la revisión 1 y documentos relacionados. Útil para el fundamento de decisiones de interfaz y ergonomía; contrastar requisitos normativos con el estándar vigente.

## Repositorios

### nasa/OSDR_Tutorials — datos y documentación

https://github.com/nasa/OSDR_Tutorials

Documentación: https://osdr-tutorials.readthedocs.io/en/latest/

Prioridad alta para explorar OSDR, acceso a archivos y APIs. Es un repositorio de documentación y ejemplos, no una aplicación de monitoreo ni un cliente específico para NLSP.

Dos guías particularmente útiles:

- Ambiente: https://github.com/nasa/OSDR_Tutorials/blob/main/source/pages/guides/environmental_data_application.md
- Radiación: https://github.com/nasa/OSDR_Tutorials/blob/main/source/pages/guides/radlab_portal.md

La guía EDA describe temperatura, humedad y CO2 de cabina ISS, controles terrestres y radiación vinculados a campañas Rodent Research. Eso describe el contexto de colección, no datos clínicos humanos. RadLab describe series de sensores con tiempo, nave y módulo, y exportación CSV/TSV/JSON. Es una vía prometedora para investigar series ambientales adicionales a los archivos históricos ya revisados; no se comprobó aquí la descarga de esas APIs.

### ebi-gene-expression-group/anatomogram — figura corporal interactiva

https://github.com/ebi-gene-expression-group/anatomogram

Componente React/SVG de Expression Atlas, EMBL-EBI, con selección, resaltado y eventos de clic por tejido. Es un candidato directo para explorar el cuerpo humano por regiones. Su propósito original es mostrar expresión génica, por lo que habría que adaptar el significado de los estados a nuestros indicadores.

El README declara código Apache-2.0 e imágenes CC BY 4.0. Conservar atribución de los recursos gráficos. No se verificó compatibilidad del paquete con una futura versión de React; se pueden evaluar los SVG por separado.

### plotly/plotly.js — evolución de indicadores

https://github.com/plotly/plotly.js

Biblioteca JavaScript independiente para gráficos interactivos. Candidata para mostrar mediciones, tendencias y anotaciones de cambios de fase de CRF. README declara licencia MIT. Para funcionamiento sin conexión se requiere incluir los recursos en la aplicación y evitar dependencias de CDN en ejecución.

### dexie/Dexie.js — persistencia local

https://github.com/dexie/Dexie.js

Capa sobre IndexedDB para almacenar registros en el navegador. Útil si se elige una aplicación web con operación local. Licencia Apache-2.0 comprobada. Guardar datos localmente no resuelve por sí solo caché de la aplicación, cifrado, respaldo ni recuperación; esos aspectos dependen de la arquitectura elegida.

### neuropsychology/NeuroKit — procesamiento de señales fisiológicas

https://github.com/neuropsychology/NeuroKit

Paquete Python NeuroKit2 para procesar ECG, respiración, actividad electrodérmica y otras señales; incluye ejemplos y simulación. README declara licencia MIT. Incorporarlo si se obtienen señales con resolución temporal adecuada. Un pulso diario de CRF no basta para calcular variabilidad entre latidos ni equivale a un ECG.

### MIT-LCP/wfdb-python — lectura de señales y anotaciones

https://github.com/MIT-LCP/wfdb-python

Herramientas Python para leer, escribir y analizar señales y anotaciones en formato WFDB. Incluye notebook de demostración. Licencia MIT comprobada. Candidato si se decide explorar datos de PhysioNet; su formato y población deben preservarse y no etiquetarse como datos de astronautas.

### OHIF/Viewers — imágenes médicas

https://github.com/OHIF/Viewers

Visor web extensible con soporte DICOMweb, visualización y anotación de imágenes médicas. README declara licencia MIT. Candidato si la propuesta incorpora imágenes DICOM; no es un requisito para presentar CSV ni implica que nuestros datasets contengan imágenes diagnósticas. La rama master se describe como desarrollo/beta; evaluar una publicación estable para integrar.

## Orden de exploración recomendado

1. Evidence Reports y NASA-STD-3001 para fundamentar qué monitorear y cómo comunicarlo.
2. Human Adaptation to Spaceflight (2021) para comprender los sistemas fisiológicos y la nutrición.
3. CRF y sus diccionarios/protocolos para concretar el formato de nuestras mediciones.
4. Anatomogram y Plotly para probar el recorrido visual.
5. Dexie si se elige persistencia local en navegador.
6. NeuroKit/WFDB si se incorporan señales; OHIF si se incorporan imágenes.
7. Nutritional Biochemistry of Space Flight como referencia complementaria histórica y los informes públicos de NASA para investigar los casos elegidos.

Esta lista propone recursos según los objetivos del desafío; no constituye una selección definitiva del stack ni de las funciones del producto.
