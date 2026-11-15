# Orden de trabajo M19 — Privacidad

Fase F4 · ola 1 · nivel 3 · versión de contratos 0.1

**Objetivo.** Llevar la sesión y el registro de lo que el astronauta decidió compartir.

**Rutas propias.** `app/privacidad/`. Nada fuera de ellas.

**Depende de.** M01 Núcleo, M04 Almacén. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/MEJORAS_PROPUESTA.md` (M9), `docs/INVESTIGACION_AMPLIADA_B.md` (B03), `docs/MODELO_AMENAZAS.md`.

## Entregables

- `crearSesion`, `registrarCompartido`, `compartidos`.

## Terminado cuando

- [ ] Con sesión activa, ninguna operación vuelve a pedir desbloqueo.
- [ ] Cada acción de compartir deja un `Compartido` con qué, con quién y cuándo.
- [ ] El registro de compartidos no se puede editar ni borrar.
- [ ] Ningún texto del módulo dice «cifrado», «seguro» o «protegido».
- [ ] Sin sesión activa, compartir devuelve error.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Cifrado, contraseñas, autenticación real.
- Permisos entre tripulantes.

**El error que más cuesta.** Prometer una protección que no existe es peor que no prometerla.

**Skills.** secure-by-construction, zero-trust-as-a-claim, honest-degradation.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
