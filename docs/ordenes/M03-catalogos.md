# Orden de trabajo M03 — Catálogos

Fase F1 · ola 1 · nivel 0 · versión de contratos 0.1

**Objetivo.** Reunir los datos de referencia: observaciones de «Me siento distinto», variables, equipo y fuentes.

**Rutas propias.** `app/catalogos/`. Nada fuera de ellas.

**Depende de.** M00 Fundación. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/MEJORAS_PROPUESTA.md` (M1), `docs/INVESTIGACION_AMPLIADA_B.md` (B01–B06), `docs/MATRIZ_INVESTIGACION_B.csv`.

## Entregables

- `observaciones()`, `variables()`, `equipos()`, `fuentes()`.
- Catálogo de observaciones: piel, congestión, dolor de cabeza, dolor de espalda, sueño, náusea o mareo, cansancio, visión y «otra».
- Cada fuente con su `nivel_lectura` tomado de la matriz.

## Terminado cuando

- [ ] Toda observación tiene al menos una fuente que existe en `fuentes()`.
- [ ] Cansancio y visión citan S09 y S12, no B01.
- [ ] Ninguna entrada nombra un diagnóstico ni trae un rango de valores normales.
- [ ] Una prueba recorre el catálogo y falla si aparece una fuente inexistente.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Inventar fuentes, autores o cifras: solo lo que ya está en `docs/`.
- Reglas del copiloto.

**El error que más cuesta.** Un catálogo sin fuente parece un instrumento clínico validado y no lo es.

**Skills.** claim-provenance-discipline, falsifiable-testing.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
