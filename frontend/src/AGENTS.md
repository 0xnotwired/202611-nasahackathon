# Frontend de Órbita

- `src/` pertenece al frontend. La API independiente vive en `../backend/`.
- Acceder a datos a través de `features/health-monitoring/data/service.ts`.
- Los mocks de esta carpeta permiten desarrollar sin iniciar el backend.
- No importar código, seeds ni configuración de `../backend/`.
- `../contracts/` es compartido. Coordinar cualquier cambio de estructura con backend.
- La integración se activa con `.env.local`, sin cambiar pantallas.
