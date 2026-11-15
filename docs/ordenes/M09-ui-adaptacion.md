# Orden de trabajo M09 — Vista Adaptación

Fase F2 · ola 2 · nivel 1 · versión de contratos 0.1

**Objetivo.** Mostrar fuerza, capacidad aeróbica e historial óseo junto con el ejercicio registrado.

**Rutas propias.** `app/ui/adaptacion/`. Nada fuera de ellas.

**Depende de.** M06 Lecturas, M07 Interfaz base. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/INVESTIGACION_APLICADA.md` (A02–A04).

## Entregables

- `modelo.js` y `vista.js` de Adaptación.

## Terminado cuando

- [ ] Un examen óseo antiguo aparece como «última evaluación conocida» con fecha y método.
- [ ] Resultados de métodos distintos no se trazan en la misma línea.
- [ ] Ejercicio realizado y resultado de una prueba física están en secciones separadas.
- [ ] No se sugiere repetir un examen que requiere equipo terrestre.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Prescribir ejercicio.
- Estimar un valor óseo actual.

**El error que más cuesta.** Mostrar un examen viejo como estado actual.

**Skills.** resilient-ui-states, honest-degradation.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
