# Revisión de datasets para Space Apps: salud de astronautas

Consulta realizada: 2026-11-14T15:30:14.906452+00:00

Se consultaron las ocho fichas completas de NLSP mediante la API pública usada por la web, el catálogo humano y metadatos/listados de archivos de OSD-51 y OSD-56. Se comprobaron descargas pequeñas de los ocho estudios NLSP. No se descargaron ni procesaron todos sus archivos ni los ZIP masivos de OSDR.

## Recomendación

Usar CRF Daily Vitals como primera base empírica para reproducir mediciones y visualizar cambios personales. Incorporar fuerza, capacidad aeróbica y DXA como evaluaciones periódicas. Inmunología exige laboratorio. Mantener datos ambientales y de radiación como contexto separado. OSD-51/56 permiten análisis molecular, pero no entrenan por sí solos un predictor validado de riesgo clínico diario.

## Inventario NLSP

Los conteos corresponden al árbol devuelto por la API en esta consulta; no son conteos de sujetos ni garantía de exhaustividad.

### 1. Isokinetic Muscle Function (Flight Analog) — MR079G

[Ficha NASA](https://nlsp.nasa.gov/explore/data/details/f97392b8-b9dd-5bae-af9e-dd76a33bf049?dataType=lsda_experiment) · [API de metadatos](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/f97392b8-b9dd-5bae-af9e-dd76a33bf049/full)

Programa: Ground. Estado declarado: Data preservation is complete.  All datasets are publicly available.

Árbol disponible: 11 grupos y 400 entradas de archivo.

Fuerza y resistencia de rodilla, tobillo y tronco. Muestra CSV comprobada: 12 filas; incluye Value, Units y límites de rango del archivo. Esos rangos no deben presentarse como límites médicos universales.

### 2. Case Report Form — CRF

[Ficha NASA](https://nlsp.nasa.gov/explore/data/details/eeb9bd34-bdd4-5115-b139-adf2c9927962?dataType=lsda_experiment) · [API de metadatos](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/eeb9bd34-bdd4-5115-b139-adf2c9927962/full)

Programa: Ground. Estado declarado: Data preservation is complete.  All datasets are publicly available.

Árbol disponible: 25 grupos y 301 entradas de archivo.

Mejor punto de partida para monitoreo diario. Muestra CSV comprobada: 113 filas, 17 columnas; 13 PRE_TEST, 89 IN_TEST y 11 POST_TEST. Pulso, presión sistólica/diastólica, respiración, peso y temperatura son numéricos en las 113 filas. Otros campos contienen NA. Campaign 3 Daily Vitals enumera 23 archivos; Campaign 1 enumera 4; CFT70 VITALS enumera 3. Son conteos de archivos, no un censo validado de participantes.

### 3. Bone Densitometry Assessment (Flight Analog) — MR035G

[Ficha NASA](https://nlsp.nasa.gov/explore/data/details/4469ebdc-0a65-55e8-bbff-3cf6b044c4c6?dataType=lsda_experiment) · [API de metadatos](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/4469ebdc-0a65-55e8-bbff-3cf6b044c4c6/full)

Programa: Ground. Estado declarado: Data preservation is complete.  All datasets are publicly available.

Árbol disponible: 11 grupos y 1063 entradas de archivo.

Densidad mineral ósea y composición corporal mediante DXA. CSV comprobado: 10 filas con NET_AVG_BMD y puntos temporales antes/después/seguimiento. Mediciones puntuales, no un sensor continuo. Validar unidades en documentación antes de integrar.

### 4. Bed Rest Standard Measures: General Immunity — BRSMImmune

[Ficha NASA](https://nlsp.nasa.gov/explore/data/details/e21cc209-b6c4-5b47-b33b-6e31f51b784f?dataType=lsda_experiment) · [API de metadatos](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/e21cc209-b6c4-5b47-b33b-6e31f51b784f/full)

Programa: Ground. Estado declarado: Data preservation is complete.  All datasets are publicly available.

Árbol disponible: 2 grupos y 46 entradas de archivo.

Subpoblaciones y función inmunológica. CSV comprobado: 30 filas, columna SUBJECT y momentos L-10, L-2, 28/45, 60/83, 90, R+5/14. Requiere medición de laboratorio y diccionario de unidades por analito; no inferir inmunidad a partir del pulso.

### 5. Aerobic Capacity (Flight Analog) — MR080G

[Ficha NASA](https://nlsp.nasa.gov/explore/data/details/07f12dd0-6725-582c-a4d2-618ed8b8c452?dataType=lsda_experiment) · [API de metadatos](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/07f12dd0-6725-582c-a4d2-618ed8b8c452/full)

Programa: Ground. Estado declarado: Data preservation is complete.  All datasets are publicly available.

Árbol disponible: 10 grupos y 1505 entradas de archivo.

Capacidad aeróbica, respuesta al ejercicio, HR, VO2, VCO2, RER. CSV comprobado: 4 filas por etapas de una prueba. Separar de frecuencia cardíaca en reposo.

### 6. Radiation Measurements in Shuttle Crew Compartment — DTO 684

[Ficha NASA](https://nlsp.nasa.gov/explore/data/details/b7b1eb07-f9e1-57a2-82d1-2970d49a6e94?dataType=lsda_experiment) · [API de metadatos](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/b7b1eb07-f9e1-57a2-82d1-2970d49a6e94/full)

Programa: Shuttle Program. Estado declarado: Data preservation is complete. All datasets are publicly available.

Árbol disponible: 13 grupos y 13 entradas de archivo.

Radiación en el Shuttle. Hay 13 grupos/archivos: 11 TIFF y 2 XLS. Se descargó un TIFF y ambos XLS. Tablas con dosis de neutrones y tasas de dosis según ubicación; diferenciar dosis absorbida en µGy/día de equivalente en µSv/día. Parte del texto descriptivo presenta unidades inconsistentes: preferir tablas y artículo original. No es una serie clínica individual ni radiación marciana.

### 7. The Effects of EVA and Long-Term Exposure to Microgravity on Pulmonary Function — 96-E044

[Ficha NASA](https://nlsp.nasa.gov/explore/data/details/859f904d-7c4a-5994-baf9-47f2abc3013f?dataType=lsda_experiment) · [API de metadatos](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/859f904d-7c4a-5994-baf9-47f2abc3013f/full)

Programa: International Space Station (ISS). Estado declarado: Data preservation is complete. Privacy-protected datasets are available via data request. Remaining datasets are publicly available.

Árbol disponible: 9 grupos y 9 entradas de archivo.

Función pulmonar de astronautas en ISS, antes/durante/después y relación con EVA. 9 archivos XLS públicos. Muestra Maximum Respiratory Pressures leída: tabla de medias, incertidumbres y número de mediciones; no registros individuales continuos. El estudio avisa que parte de los datos protegidos requiere solicitud.

### 8. Toxicological Assessment of Airborne Volatile Organic Compounds — MSD007

[Ficha NASA](https://nlsp.nasa.gov/explore/data/details/adbd971a-9c65-5388-acef-ac52d749a113?dataType=lsda_experiment) · [API de metadatos](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/adbd971a-9c65-5388-acef-ac52d749a113/full)

Programa: Nasa-Mir. Estado declarado: Data preservation is complete. All datasets are publicly available.

Árbol disponible: 64 grupos y 68 entradas de archivo.

Contaminantes del aire en Mir: CO2, CO, formaldehído, compuestos orgánicos e índices toxicológicos. Una muestra XLS de CO2 contiene un gráfico, no tabla numérica accesible por lectura de celdas. Se comprobó otra tabla XLS con contaminantes y T-values de cinco muestras. Son datos ambientales de otra misión, no emparejados con sujetos de bed rest.

## OSDR

### OSD-51

[Ficha NASA](https://osdr.nasa.gov/bio/repo/data/studies/OSD-51) · [Metadatos](https://osdr.nasa.gov/osdr/data/osd/meta/51) · [Archivos](https://osdr.nasa.gov/osdr/data/osd/files/51)

Woman skeletal muscle transcriptome with bed rest and countermeasures. Estudio WISE-2005, terrestre, mujeres sanas, tres grupos descritos de 8 participantes: control, nutrición y ejercicio. Expresión génica en biopsias de sóleo y vasto lateral antes/después de 60 días de reposo. Los 340 registros de muestra de los metadatos incluyen replicación técnica; no representan 340 participantes. Listado: 4 archivos no restringidos: metadatos ISA, anotación de microarray y dos ZIP de datos crudos de ~206 y ~192 MB. Se verificaron metadatos y listado, no descarga de ZIP ni calidad de matrices.

### OSD-56

[Ficha NASA](https://osdr.nasa.gov/bio/repo/data/studies/OSD-56) · [Metadatos](https://osdr.nasa.gov/osdr/data/osd/meta/56) · [Archivos](https://osdr.nasa.gov/osdr/data/osd/files/56)

Gene expression profiling of human peripheral blood lymphocytes cultured in modeled microgravity. Cultivo celular humano en biorreactor terrestre frente a control 1g. Microarray de mRNA, 10 muestras en metadatos; no implica 10 astronautas o donantes independientes. El artículo integra miRNA/mRNA y el conjunto compañero de miRNA es OSD-55. Listado: 2 archivos no restringidos, metadatos ISA y ZIP crudo de ~52.7 MB. Se verificaron metadatos y listado, no descarga del ZIP ni calidad de matrices.

## Límites de integración

- Análogo terrestre, cultivo celular, ISS, Shuttle y Mir son contextos distintos: preservarlos en cada medición y visualización.
- No unir registros de diferentes campañas o misiones como si fueran una persona. Validar identificadores, cohorte y momento de toma antes de cualquier enlace.
- Conservar Test_Phase junto con BR_Day: el número del día solo no indica de forma inequívoca antes/durante/después.
- Preservar identificadores como texto, incluidos ceros iniciales, y normalizar NA sin convertirlo en cero.
- Confirmar unidades, calibración, protocolo y replicados. No confundir número de mediciones con participantes.
- Las mediciones no incluyen por sí solas etiquetas diagnósticas ni validan umbrales clínicos o acciones terapéuticas.
- Hay comentarios clínicos libres en CRF: excluirlos de una demostración pública salvo que su uso sea necesario y revisado.
- Una comparación con baseline muestra desviación; no demuestra enfermedad ni causa.

## Evidencia local

Los JSON conservan respuestas originales. sample-downloads.json registra fuentes y resultados de las primeras descargas. CRF-sample.csv permite inspeccionar la muestra de signos vitales. SHA256SUMS.json permite comprobar integridad de los artefactos locales.


Nota de traslado: los archivos originales y muestras mencionados en Evidencia local se conservaron en el workspace de investigación y no están incluidos en esta carga al repositorio. Los URL oficiales permiten consultar las fuentes.
