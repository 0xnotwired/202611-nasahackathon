# Orden de trabajo M05 — Escenario sintético

Fase F1 · ola 2 · nivel 0 · versión de contratos 0.1

**Objetivo.** Generar el caso ficticio de la demo: un astronauta, tres dominios, dos configuraciones de misión.

**Rutas propias.** `app/escenario/`. Nada fuera de ellas.

**Depende de.** M01 Núcleo, M02 Misión, M03 Catálogos. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/PROPUESTA_FINAL.md` (Demostración propuesta), `docs/DATASETS.md`.

## Entregables

- `generarEscenario({ semilla })` determinista.
- Datos con huecos, un examen óseo antiguo, un dato ambiental de otro módulo de la nave, una tarea incompleta y semanas `confirmado_sin_novedad`.
- Dos `ConfigMision`: una con el equipo del procedimiento y otra sin él; una en tiempo real y otra diferida.
- Un procedimiento con `estado_revision: "demostracion"` y pasos sin contenido clínico.

## Terminado cuando

- [ ] La misma semilla produce exactamente los mismos datos.
- [ ] Todo registro pasa `validarRegistro` y lleva `origen: "sintetico"`.
- [ ] Ningún valor sale de un dataset de NASA.
- [ ] Hay al menos un registro de cada uno de los tres estados.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Pasos médicos reales.
- Valores que parezcan umbrales.

**El error que más cuesta.** Un dato ficticio sin rótulo se puede presentar como evidencia.

**Skills.** deterministic-core, claim-provenance-discipline.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
