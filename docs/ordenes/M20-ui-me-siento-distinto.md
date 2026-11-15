# Orden de trabajo M20 — Vista Me siento distinto

Fase F4 · ola 3 · nivel 3 · versión de contratos 0.1

**Objetivo.** Llevar al astronauta desde una observación hasta el seguimiento, en un episodio completo.

**Rutas propias.** `app/ui/me-siento-distinto/`. Nada fuera de ellas.

**Depende de.** M03 Catálogos, M07 Interfaz base, M16 Episodio, M17 Copiloto, M18 Resumen. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/PROPUESTA_FINAL.md` (Demostración propuesta), `docs/MEJORAS_PROPUESTA.md` (M1, M4, M9).

## Entregables

- Vista del episodio: catálogo, tarjeta del copiloto, acceso al procedimiento, resultado, resumen y compartir.

## Terminado cuando

- [ ] El episodio se completa de la observación al seguimiento y se recupera tras cerrar.
- [ ] En la tarjeta, los datos y los faltantes están antes que la sugerencia, también en el orden de lectura de pantalla.
- [ ] Sin orientación, se lee «No hay orientación revisada para esto».
- [ ] Generar el resumen y compartirlo son dos acciones distintas; compartir pide confirmación.
- [ ] Se puede pedir ayuda sin completar el cuestionario.
- [ ] Las dos configuraciones de la demo producen dos recorridos visiblemente distintos.
- [ ] Todo el recorrido funciona con teclado.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Campo de texto clínico libre.
- Chat.

**El error que más cuesta.** Poner la sugerencia primero invita a seguirla sin mirar los datos.

**Skills.** resilient-ui-states, frontend-accessibility-by-construction, non-overwhelming-ux.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
