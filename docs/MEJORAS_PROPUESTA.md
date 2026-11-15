# Órbita: qué mejorar de la propuesta original

Fecha: 14 de noviembre de 2026. Revisión de [PROPUESTA_FINAL.md](PROPUESTA_FINAL.md) contra la tercera ampliación académica ([INVESTIGACION_AMPLIADA_B.md](INVESTIGACION_AMPLIADA_B.md), fuentes B01–B18). Pedida por el usuario. Todo lo que sigue es **propuesta del asistente**; pasa a decisión cuando el usuario o el equipo lo confirmen.

## Veredicto

La propuesta original es sólida en lo que más cuesta: no inventa clínica, separa cohortes y distingue lo implementado de lo pendiente. Su punto débil es otro: describe **cómo se comporta** el producto, pero deja sin especificar cuatro cosas que un jurado o un agente que la implemente va a preguntar.

| # | Vacío en la propuesta original | Por qué importa | Mejora |
|---|---|---|---|
| 1 | «Me siento distinto» no dice qué observaciones ofrece | El ejemplo único es cansancio; no hay evidencia de qué ocurre en vuelo | Catálogo fundado en B01, B02, B04–B06 |
| 2 | «Dato ausente» es un solo estado | Mezcla «no pasó nada» con «no lo anoté» | Tres estados de registro (B03) |
| 3 | La configuración de misión solo contempla equipo | El argumento de autonomía de NASA es la comunicación diferida | Modo de comunicación (B10, B11) |
| 4 | No dice cómo evita que el copiloto induzca errores | Es la objeción más previsible a cualquier «copiloto» de salud | Reglas de presentación (B12, B13) |
| 5 | Hábitat nombra radiación sin decir contra qué se compara | Un número de dosis suelto no comunica nada | Acumulado frente a límite de programa (B15) |
| 6 | La demo de dos configuraciones no tiene procedimiento elegido | Sin procedimiento concreto no hay demo | Candidato: revisión de visión (B16) |
| 7 | La prueba con 6–8 voluntarios no tiene respaldo ni límite declarado | Un evaluador puede leerla como validación | Declarar cobertura esperable (B14) |
| 8 | No hay modelo de datos | Seis pantallas «comparten registros» sin definir el registro | Ver [ROADMAP_AGENTES.md](ROADMAP_AGENTES.md) |
| 9 | No contempla quién ve los datos ni cuánto cuesta protegerlos | Un estudio de vuelo se cerró por usabilidad de la seguridad | Privacidad de bajo costo (B03, M9) |

## Mejoras, una por una

### M1 — Catálogo de observaciones con evidencia

**Antes:** el astronauta «registra un síntoma».
**Después:** elige de un catálogo corto cuyo origen es visible: piel, congestión, dolor de cabeza, dolor de espalda, sueño, náusea o mareo, cansancio, visión, y «otra».

Cada entrada lleva la fuente que justifica su presencia. El catálogo registra **síntoma observado**, nunca diagnóstico: así opera la medicina de vuelo según B01, donde rara vez se confirma un diagnóstico a bordo.

**Límite:** B01 solo cubre categorías ligadas a inmunidad; cansancio y visión entran por S09 y S12, no por B01. La lista es de diseño, no un instrumento clínico validado.

### M2 — Tres estados de registro

**Antes:** presente o ausente.
**Después:**

| Estado | Significado | Texto en pantalla |
|---|---|---|
| Registrado | Hay un valor u observación | El valor, con método y hora |
| Confirmado sin novedad | El astronauta afirmó que no hubo | «Sin novedad, confirmado el [fecha]» |
| Sin registro | Nadie anotó nada | «Sin registro» |

Es la mejora más barata y la mejor fundada: en B03 (artículo revisado por pares, leído completo), los tripulantes registraron **49 semanas de «sin uso de medicación» confirmado**. Sin ese registro explícito, esas semanas habrían sido indistinguibles de semanas en que nadie anotó nada.

**Regla dura:** «sin registro» nunca se muestra ni se exporta como «sin novedad». Si hay duda, gana «sin registro»: el error contrario presenta como sano a alguien de quien no se sabe nada.

### M3 — Modo de comunicación en la configuración de misión

**Antes:** la misión se configura por equipo presente o ausente.
**Después:** dos ejes independientes.

- **Equipo:** qué instrumentos hay.
- **Comunicación:** tiempo real, diferida o sin enlace.

Con comunicación diferida, «Preparar resumen» produce un mensaje que se entiende sin ida y vuelta: qué pasó, qué se midió y cómo, qué falta, qué se pide. Con «sin enlace», el resumen se guarda como pendiente de envío y la pantalla lo dice.

Esto alinea a Órbita con el vocabulario de NASA (operaciones médicas independientes de la Tierra, B10) sin prometer autonomía diagnóstica. La demo de dos configuraciones gana un segundo eje sin duplicar trabajo.

**Límite:** B10 son documentos de concepto. No demuestran que un sistema así mejore resultados.

### M4 — Reglas para que el copiloto no induzca errores

1. **Datos antes que sugerencia.** La tarjeta muestra primero qué se registró y qué falta; la sugerencia va después.
2. **Silencio explícito.** Si no hay regla revisada para una situación, la tarjeta dice «No hay orientación revisada para esto». El silencio del copiloto no debe leerse como «todo bien»: es el error de omisión que describe B12.
3. **Toda sugerencia declara qué no evaluó.**
4. **Un aviso por episodio.** Los pendientes se agrupan; no se repite el mismo recordatorio (B13).

**Límite:** B12 y B13 estudian clínicos en tierra. Son la mejor evidencia disponible, no evidencia en tripulaciones.

### M5 — Radiación con referencia

**Antes:** Hábitat muestra radiación «según datos disponibles».
**Después:** dosis **acumulada** de la misión, con unidad, sensor y cobertura, junto a un único valor de referencia rotulado «límite de carrera, requisito de programa NASA» (B15).

No se calcula probabilidad personal de cáncer ni se colorea el valor como estado de salud. El límite es de programa, no una regla clínica individual.

**Bloqueante antes de mostrarlo:** confirmar el requisito [V1 4030] en la revisión C de NASA-STD-3001 vol. 1 (S03). El valor de 600 mSv se leyó en un resumen técnico, no en el estándar.

### M6 — Procedimiento candidato para la demo

La propuesta original pide «un procedimiento de medición pertinente» sin elegirlo. Sin esa elección la demo no se puede construir.

**Candidato:** revisión de visión. En ISS conviven pruebas de equipamiento muy distinto (B16), así que un mismo motivo de consulta se comporta de forma visiblemente diferente según el equipo.

**Segundo candidato, más simple:** medición de signos vitales con el equipo de presión y ECG, cuyo dato de demostración ya existe en CRF Daily Vitals.

**Lo que no puede decidir el equipo:** qué prueba es alternativa documentada de cuál. Una prueba simple no equivale a OCT (S12). Hasta tener una fuente clínica revisada, el procedimiento sin equipo se muestra como **bloqueado con motivo**, sin alternativa.

### M7 — Evaluación con sus límites declarados

Mantener la prueba formativa de 6–8 voluntarios y agregar una línea: con grupos de ese tamaño puede quedar sin detectar una fracción apreciable de problemas (B14). Preferir dos rondas chicas con corrección entre medio.

Agregar un caso de prueba que la propuesta original no tenía: **el usuario debe distinguir «sin registro» de «sin novedad»**.

### M9 — Privacidad que no cuesta un paso por registro

**Origen:** lectura completa de B03 el 15/11/2026. Es la lección de diseño más directa de la serie, y la propuesta original no la tenía.

Dose Tracker se terminó antes de tiempo por problemas de usabilidad, y la queja principal fueron los varios PIN e identificadores para entrar. A la vez, la privacidad era condición para participar: los datos no llegaban a quienes deciden asignaciones de vuelo.

**Después:**
- El astronauta decide quién ve cada parte de su historial. Compartir con apoyo médico es una acción explícita, con registro de qué se compartió y cuándo.
- Se desbloquea una vez por sesión, no por anotación.
- Un registro admite motivos que el producto no previó (protocolo de otro experimento, prueba de tolerancia) mediante una nota estructurada; no se habilita un campo clínico libre.

**Límite:** un solo estudio de seis personas, y su software tenía otros problemas además de la seguridad. Es un antecedente, no una medición de cuánto cuesta cada paso.

### M8 — Autopruebas repetidas

Si se incorpora alguna prueba que el astronauta repite, la pantalla advierte que mejorar con la práctica es esperable (B07, B08). No se usa ningún desvío estadístico como alarma.

## Correcciones a la documentación existente

Hallazgos de la lectura, independientes de la serie B:

- **La palabra «MVP» aparece en INVESTIGACION_APLICADA.md y en BASE_ACADEMICA.md** (hallazgo A01: «No incluir ecografía en el MVP»). El proyecto se construye por niveles, sin MVP. Corregido en esta entrega a «en la entrega».
- **INVESTIGACION_APLICADA.md está duplicado** dentro de la segunda parte de BASE_ACADEMICA.md. Dos copias divergen con el tiempo. No se borró nada: queda señalado para que el equipo decida cuál es la fuente.
- **REFERENCIAS.bib no incluye A01–A06 ni B01–B18.** Pendiente; las matrices CSV sí los tienen.
- **El texto oficial del desafío sigue sin verificarse.** El sitio bloquea la lectura automática. REQUIREMENTS.md conserva la versión aportada por el usuario.

## Qué no cambia

- Sin umbrales, diagnósticos, tratamientos ni puntuación global.
- Sin unir cohortes ni presentar análogos terrestres como astronautas.
- Código propio; ninguna dependencia funcional de terceros.
- Salud, adaptación y hábitat siguen siendo alcance central.

## Nivel de evidencia de este documento

B01, B03, B06, B07 y B09 se leyeron en texto completo; el resto son resúmenes o fragmentos. Las mejoras M1–M8 son decisiones de diseño razonadas a partir de esa evidencia; ninguna fue probada con usuarios ni revisada por personal clínico.
