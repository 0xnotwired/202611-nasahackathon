# Orden de trabajo M10 — Vista Hábitat

Fase F2 · ola 2 · nivel 1 · versión de contratos 0.1

**Objetivo.** Mostrar las condiciones ambientales del lugar y el periodo, sin convertirlas en exposición personal.

**Rutas propias.** `app/ui/habitat/`. Nada fuera de ellas.

**Depende de.** M06 Lecturas, M07 Interfaz base. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/INVESTIGACION_APLICADA.md` (A06), `docs/MEJORAS_PROPUESTA.md` (M5), `docs/INVESTIGACION_AMPLIADA_B.md` (B15).

## Entregables

- `modelo.js` y `vista.js` de Hábitat, con lugar, sensor y cobertura de cada dato.

## Terminado cuando

- [ ] Un dato de otro módulo de la nave se rotula con su lugar y no se atribuye al astronauta.
- [ ] La radiación, si se muestra, es dosis acumulada con unidad, tipo de dosis y cobertura.
- [ ] El límite de carrera **no se muestra** mientras [V1 4030] siga sin confirmar; el código lo deja apagado por configuración.
- [ ] Ningún valor ambiental se colorea como estado de salud.
- [ ] No aparece ninguna frase causal entre ambiente y síntoma.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Probabilidad personal de cáncer.
- Mezclar dosis absorbida, equivalente y efectiva.

**El error que más cuesta.** Una coincidencia de fechas presentada como causa.

**Skills.** claim-provenance-discipline, resilient-ui-states.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
