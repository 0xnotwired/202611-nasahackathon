# Orden de trabajo M22 — Vista Casos NASA

Fase F5 · ola 2 · nivel 4 · versión de contratos 0.1

**Objetivo.** Explorar los casos reales en un visor separado del escenario ficticio.

**Rutas propias.** `app/ui/casos-nasa/`. Nada fuera de ellas.

**Depende de.** M06 Lecturas, M07 Interfaz base, M21 Importadores NASA. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/DATASETS.md`.

## Entregables

- Vista con carga de archivo, exploración por sujeto y fase, y ficha del estudio.

## Terminado cuando

- [ ] Ningún dato importado aparece en las vistas del astronauta sintético.
- [ ] Cada pantalla dice el estudio, que es un análogo terrestre y el sujeto.
- [ ] No se puede superponer un sujeto con otro como si fueran el mismo.
- [ ] Un archivo inválido muestra qué filas se rechazaron y por qué.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Comparar los casos con el escenario sintético.

**El error que más cuesta.** Mezclar en una misma pantalla lo real y lo ficticio.

**Skills.** resilient-ui-states, claim-provenance-discipline.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
