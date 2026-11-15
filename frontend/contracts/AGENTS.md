# Contrato compartido

- Esta carpeta es el límite entre frontend y backend; los cambios requieren
  coordinación de ambos responsables.
- `models.ts` define tipos de transporte sin dependencias de framework.
- `schemas.ts` valida las respuestas y mantiene tipos compatibles con models.ts.
- Exportar `openapi.json` con `npm run contracts:export` desde la raíz después
  de cambiar esquemas o rutas. El CI comprueba que el export esté actualizado.
- Mantener ejemplos sintéticos en fixtures/; no usarlos como almacenamiento real.
- Evitar cambios incompatibles en 0.1; acordar una nueva versión si son necesarios.
