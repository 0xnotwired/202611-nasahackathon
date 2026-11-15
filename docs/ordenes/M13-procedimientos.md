# Orden de trabajo M13 — Procedimientos

Fase F3 · ola 1 · nivel 2 · versión de contratos 0.1

**Objetivo.** Ejecutar procedimientos guiados que respetan el equipo de la misión y conservan lo que pasó.

**Rutas propias.** `app/procedimientos/`. Nada fuera de ellas.

**Depende de.** M01 Núcleo, M02 Misión, M04 Almacén. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/INVESTIGACION_APLICADA.md` (A01), `docs/MEJORAS_PROPUESTA.md` (M6).

## Entregables

- `validarProcedimiento`, `disponibilidad`, `iniciar`, `avanzar`, `interrumpir`, `retomar`, `cerrar`.
- Máquina de estados propia y explícita.

## Terminado cuando

- [ ] Con equipo faltante la ejecución queda `bloqueada`, con la lista de faltantes.
- [ ] `alternativa_id` solo aparece si el procedimiento la declara; el motor no deduce ninguna.
- [ ] Una ejecución interrumpida se retoma en el mismo paso y no figura como completada.
- [ ] `no_pude` guarda las dificultades.
- [ ] Publicar la versión 2 de un procedimiento no cambia `procedimiento_version` de una ejecución anterior.
- [ ] Toda transición no permitida devuelve error; hay una prueba por cada una.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Escribir pasos clínicos.
- Usar o imitar XState u otra librería de estados.

**El error que más cuesta.** Contar como hecho un procedimiento que se interrumpió.

**Skills.** atomic-state-mutation, falsifiable-testing, invariant-hunting.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
