# Orden de trabajo M12 — Vista Mi día

Fase F2 · ola 2 · nivel 1 · versión de contratos 0.1

**Objetivo.** Ser la pantalla de entrada: qué se sabe hoy, qué cambió y qué hay pendiente.

**Rutas propias.** `app/ui/mi-dia/`. Nada fuera de ellas.

**Depende de.** M06 Lecturas, M07 Interfaz base. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/PROPUESTA_FINAL.md`, `docs/MEJORAS_PROPUESTA.md` (M4).

## Entregables

- `modelo.js` y `vista.js` de Mi día, con acceso a «Me siento distinto» y a las demás vistas.

## Terminado cuando

- [ ] Mientras `plan` responda «no implementado», la sección de tareas dice «todavía no disponible».
- [ ] Lo que falta registrar hoy se lista como «sin registro».
- [ ] No hay puntuación global ni semáforo de salud.
- [ ] Los pendientes de un episodio aparecen agrupados en un solo aviso.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Lógica de tareas: es de M14.

**El error que más cuesta.** Un resumen optimista en la primera pantalla hace que el astronauta no mire más.

**Skills.** non-overwhelming-ux, resilient-ui-states.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
