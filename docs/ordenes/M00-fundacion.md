# Orden de trabajo M00 — Fundación

Fase F0 · ola 1 · nivel - · versión de contratos 0.1

**Objetivo.** Dejar el terreno listo para que los demás módulos se construyan en paralelo: contratos en código, pruebas de contrato reutilizables, marcadores de cada módulo y la forma de ejecutar y probar.

**Rutas propias.** `package.json`, `scripts/servir.mjs`, `app/contratos/`, `pruebas/contrato/`, `docs/MODELO_AMENAZAS.md`. Nada fuera de ellas. Excepción de esta orden: crea los marcadores `index.js` de los demás módulos.

**Depende de.** Nada.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/PLAN_ORQUESTACION.md`, `docs/MEJORAS_PROPUESTA.md` (M9).

## Entregables

- `docs/MODELO_AMENAZAS.md` **antes de escribir código**: quién usa el dispositivo, qué sale de él, qué entradas no son confiables (archivos importados, contenido de procedimientos) y qué no se protege (no hay cifrado).
- `package.json` con `"type": "module"`, sin dependencias, y los scripts `test` y `servir`.
- `scripts/servir.mjs`: servidor estático propio con módulos `node:`; sirve solo `app/`, solo en `127.0.0.1`.
- `app/contratos/`: definiciones JSDoc de cada tipo e interfaz de CONTRATOS.md.
- `pruebas/contrato/`: una batería por interfaz, que recibe una implementación y la comprueba; más datos de ejemplo válidos e inválidos.
- `app/<modulo>/index.js` para cada módulo M01–M22: marcador que responde `{ ok: false, error: { codigo: "no_implementado" } }` con la forma del contrato.
- `.gitignore` con `datos/originales/` y `dist/`.

## Terminado cuando

- [ ] `node --test` corre y pasa sin instalar nada.
- [ ] Cada batería de contrato **falla** contra el marcador «no implementado». Si pasa, la batería no comprueba nada.
- [ ] El servidor no entrega archivos fuera de `app/` (probar `../AGENTS.md`).
- [ ] En un navegador real: la carcasa carga por el servidor. Anotar también qué ocurre al abrir `app/index.html` con doble clic.
- [ ] CONTRATOS.md y `app/contratos/` nombran los mismos campos.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Lógica de cualquier módulo.
- Cambiar CONTRATOS.md: si algo no cierra, se informa al orquestador.

**El error que más cuesta.** Una batería de contrato débil deja pasar módulos incompatibles sin que nadie lo note. Es preferible una batería estricta que obligue a discutir el contrato.

**Skills.** secure-by-construction, validate-at-the-boundary, falsifiable-testing.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
