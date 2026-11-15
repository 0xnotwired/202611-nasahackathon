# Orden de trabajo M08 — Vista Mi salud

Fase F2 · ola 2 · nivel 1 · versión de contratos 0.1

**Objetivo.** Mostrar síntomas, signos vitales y descanso del astronauta con su contexto.

**Rutas propias.** `app/ui/mi-salud/`. Nada fuera de ellas.

**Depende de.** M06 Lecturas, M07 Interfaz base. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/PROPUESTA_FINAL.md`, `docs/INVESTIGACION_APLICADA.md` (A05).

## Entregables

- `modelo.js` y `vista.js` de Mi salud, con registro de una medición o de «sin novedad».

## Terminado cuando

- [ ] Descanso programado, autoinforme de sueño y sueño estimado aparecen como tres cosas distintas.
- [ ] Una variable sin dato dice «sin registro», no un guion ni un cero.
- [ ] Registrar «sin novedad» crea un registro `confirmado_sin_novedad`.
- [ ] Cada dato muestra método, momento y origen con los componentes de M07.
- [ ] El modelo se prueba en Node con el escenario sintético.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Interpretar valores.
- Mapa corporal con colores de estado de salud.

**El error que más cuesta.** Una zona del cuerpo sin medición que se ve «en verde» comunica salud que nadie midió.

**Skills.** resilient-ui-states, frontend-accessibility-by-construction.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
