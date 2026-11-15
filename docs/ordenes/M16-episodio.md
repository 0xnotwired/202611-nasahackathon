# Orden de trabajo M16 — Episodio

Fase F4 · ola 1 · nivel 3 · versión de contratos 0.1

**Objetivo.** Armar el episodio de cuidado con sus seis partes a partir de lo que hay en el historial.

**Rutas propias.** `app/episodio/`. Nada fuera de ellas.

**Depende de.** M01 Núcleo, M04 Almacén, M06 Lecturas, M13 Procedimientos. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/PROPUESTA_FINAL.md` (El copiloto y el episodio de cuidado).

## Entregables

- `abrir`, `situacion`, `vincular`, `cerrar`.

## Terminado cuando

- [ ] `situacion` devuelve las seis partes aunque alguna esté vacía, y la vacía dice por qué.
- [ ] `falta` incluye las variables `sin_registro` y el equipo ausente.
- [ ] `sabemos` no incluye datos de otro sujeto ni ambiente de otro lugar.
- [ ] `ocurrio` distingue completada, interrumpida y no pude.
- [ ] Cerrar y volver a abrir la aplicación recupera el episodio igual (con almacén persistente).
- [ ] `aviso_emitido` pasa a verdadero una sola vez.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Sugerencias: son de M17.
- Texto de exportación: es de M18.

**El error que más cuesta.** Una parte vacía que se omite se lee como «nada que señalar».

**Skills.** honest-degradation, falsifiable-testing.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
