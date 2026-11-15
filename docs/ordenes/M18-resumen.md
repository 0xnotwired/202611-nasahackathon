# Orden de trabajo M18 — Resumen

Fase F4 · ola 2 · nivel 3 · versión de contratos 0.1

**Objetivo.** Generar el resumen de un episodio para apoyo médico, que se entienda sin ida y vuelta.

**Rutas propias.** `app/resumen/`. Nada fuera de ellas.

**Depende de.** M02 Misión, M16 Episodio, M19 Privacidad. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/MEJORAS_PROPUESTA.md` (M3, M9), `docs/INVESTIGACION_AMPLIADA_B.md` (B10, B11).

## Entregables

- `generar` según el contrato, en texto plano.

## Terminado cuando

- [ ] `generar` no envía ni comparte nada.
- [ ] El texto separa sintético, análogo terrestre y vuelo.
- [ ] «Sin registro» y «sin novedad confirmada» aparecen con esas palabras; una prueba falla si se confunden.
- [ ] Con comunicación diferida, el texto contiene qué pasó, qué se midió y cómo, qué falta y qué se pide.
- [ ] Con «sin enlace», `pendiente_de_envio` es verdadero.
- [ ] Cada valor del resumen coincide con el historial (prueba que compara uno por uno).
- [ ] No incluye notas libres.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Enviar por red.
- Interpretar los datos.

**El error que más cuesta.** El resumen es lo único que lee quien no ve la pantalla: un «sin novedad» de más ahí no tiene quien lo corrija.

**Skills.** honest-degradation, claim-provenance-discipline, falsifiable-testing.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
