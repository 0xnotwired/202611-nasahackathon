# Contrato compartido de Órbita

Esta carpeta pertenece a ambos responsables. Es el único acuerdo de estructuras
entre frontend y backend; no contiene componentes, simulación o persistencia.

- `models.ts`: tipos de transporte sin dependencia de framework. El backend
  puede comprobar tipos sin instalar las dependencias del frontend.
- `schemas.ts`: validadores Zod, compatibles con esos tipos, usados por el cliente
  del frontend y las pruebas de integración.
- `openapi.ts`: descripción de rutas y exportación de los esquemas.
- `openapi.json`: especificación OpenAPI 3.1 versionada, servida por el backend.
- `fixtures/`: ejemplos de respuestas válidas; no son el almacenamiento de la API.
- `tests/`: compatibilidad de respuestas, ejemplos y especificación.

## Cambiar el contrato

1. Acordar con la otra persona los campos o rutas que van a cambiar.
2. Actualizar tipos, validadores, descripción de rutas y ejemplos pertinentes.
3. Desde la raíz ejecutar:

```bash
npm ci
npm run contracts:export
npm run test:contracts
```

4. Incluir el código que produce y consume el cambio en una integración coordinada.

No hace falta tocar estos archivos para modificar colores, pantallas, algoritmos
de simulación o implementaciones internas. Evitar cambios incompatibles en la
versión 0.1; si son necesarios, acordar su versionado y migración.

Las relaciones entre campos —por ejemplo, que cada medición pertenezca al
astronauta solicitado— también se comprueban en integración. OpenAPI describe
estructura y rutas, no certifica validez clínica o comparabilidad de resultados.
