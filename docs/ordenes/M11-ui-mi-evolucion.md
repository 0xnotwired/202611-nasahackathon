# Orden de trabajo M11 — Vista Mi evolución

Fase F2 · ola 2 · nivel 1 · versión de contratos 0.1

**Objetivo.** Reunir observaciones, mediciones, acciones y resultados en una línea de tiempo.

**Rutas propias.** `app/ui/mi-evolucion/`. Nada fuera de ellas.

**Depende de.** M06 Lecturas, M07 Interfaz base. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/MEJORAS_PROPUESTA.md` (M3, M8).

## Entregables

- `modelo.js` y `vista.js` de Mi evolución, con la fase de misión como contexto.

## Terminado cuando

- [ ] El mismo registro muestra el mismo valor, unidad y origen que en las otras vistas (prueba cruzada de modelos).
- [ ] Cada comparación con la línea de base dice cuántas mediciones la sostienen.
- [ ] La fase de misión se muestra como contexto y nunca con texto tranquilizador.
- [ ] Una corrección se ve junto al registro que corrige; el original no desaparece.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Tendencias calculadas con huecos rellenados.

**El error que más cuesta.** Una línea continua sobre días sin dato inventa una evolución.

**Skills.** resilient-ui-states, non-overwhelming-ux.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
