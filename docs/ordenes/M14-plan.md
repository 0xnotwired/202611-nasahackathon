# Orden de trabajo M14 — Plan

Fase F3 · ola 1 · nivel 2 · versión de contratos 0.1

**Objetivo.** Llevar las tareas indicadas y separar lo indicado, lo realizado y lo observado después.

**Rutas propias.** `app/plan/`. Nada fuera de ellas.

**Depende de.** M01 Núcleo, M04 Almacén. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/INVESTIGACION_APLICADA.md` (A02–A03).

## Entregables

- `tareasDe`, `marcar`, `vincularResultado`.

## Terminado cuando

- [ ] Marcar una tarea como realizada no crea ni implica un resultado.
- [ ] Una tarea sin marcar sigue `pendiente`; nunca pasa sola a `no_realizada`.
- [ ] `no_realizada` admite una nota estructurada con el motivo.
- [ ] Cada tarea conserva quién la indicó.
- [ ] Un examen periódico no se programa a diario.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Generar el plan: las tareas vienen del escenario o de una persona.

**El error que más cuesta.** Cumplir el ejercicio no demuestra recuperación; unirlos en un solo dato lo afirma.

**Skills.** honest-degradation, falsifiable-testing.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
