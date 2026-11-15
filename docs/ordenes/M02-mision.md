# Orden de trabajo M02 — Misión

Fase F1 · ola 1 · nivel 0 · versión de contratos 0.1

**Objetivo.** Representar la configuración de misión con sus dos ejes: equipo disponible y modo de comunicación.

**Rutas propias.** `app/mision/`. Nada fuera de ellas.

**Depende de.** M00 Fundación. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/MEJORAS_PROPUESTA.md` (M3).

## Entregables

- `validarConfig`, `tieneEquipo`, `faseEn`.

## Terminado cuando

- [ ] Una configuración sin `comunicacion` o con un valor fuera de los tres permitidos se rechaza.
- [ ] `tieneEquipo` devuelve `false` para un equipo que no figura; nunca asume que está.
- [ ] `faseEn` devuelve `null` fuera de toda fase, no la más cercana.
- [ ] Pasa la batería de contrato de `mision`.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Decidir qué procedimiento aplica: eso es de M13.

**El error que más cuesta.** Suponer que un equipo está cuando no se sabe habilita un procedimiento que no se puede hacer.

**Skills.** validate-at-the-boundary, falsifiable-testing.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
