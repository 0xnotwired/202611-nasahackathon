# Backend de Órbita

- Este proyecto usa Node.js/TypeScript, no Next.js. Las reglas específicas de
  Next.js del AGENTS raíz corresponden al frontend.
- Esta carpeta pertenece al trabajo de backend: código, datos de simulación,
  dependencias, configuración y tests propios.
- No importar ni editar `../src/`, `../public/`, los mocks del frontend o su lockfile
  para implementar lógica del backend.
- La interfaz compartida está en `../contracts/`. No modificar campos o rutas
  unilateralmente: acordar primero el cambio con la persona de frontend.
- El punto de extensión inicial es `src/data/provider.ts`; no añadir capas,
  infraestructura o frameworks antes de necesitarlo.
- Usar solo datos ficticios; no añadir interpretación ni prescripciones clínicas.
- Verificar con `npm run check` desde esta carpeta. Los cambios de contrato también
  requieren `npm run test:contracts` desde la raíz, con dependencias raíz instaladas.
- Instalar dependencias aquí (`npm install ...`), nunca en el package.json raíz.
