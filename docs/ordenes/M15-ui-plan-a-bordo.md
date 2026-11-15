# Orden de trabajo M15 — Vistas Mi plan y A bordo

Fase F3 · ola 2 · nivel 2 · versión de contratos 0.1

**Objetivo.** Mostrar las tareas del día y guiar la ejecución de un procedimiento paso a paso.

**Rutas propias.** `app/ui/mi-plan/`, `app/ui/a-bordo/`. Nada fuera de ellas.

**Depende de.** M07 Interfaz base, M13 Procedimientos, M14 Plan. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/INVESTIGACION_APLICADA.md` (A01), `docs/PROPUESTA_FINAL.md` (Demostración propuesta).

## Entregables

- Vista Mi plan y vista A bordo, con comprobación de equipo y preparación antes de empezar.

## Terminado cuando

- [ ] Con la configuración sin equipo, el procedimiento se ve bloqueado, con el motivo y sin botón de inicio.
- [ ] Al cambiar de configuración, el mismo procedimiento cambia de comportamiento a la vista.
- [ ] Se puede interrumpir, salir, volver y retomar.
- [ ] «No pude completar» pide la dificultad y la guarda.
- [ ] Fuente, versión y estado de revisión del procedimiento están visibles; «demostración» se lee como tal.
- [ ] Plan indicado, acción realizada y resultado se ven como tres cosas.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Ofrecer una prueba «equivalente» que el procedimiento no declare.

**El error que más cuesta.** Un procedimiento de demostración que parece orientación médica.

**Skills.** resilient-ui-states, frontend-accessibility-by-construction, non-overwhelming-ux.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
