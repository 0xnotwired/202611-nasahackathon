# Orden de trabajo M01 — Núcleo

Fase F1 · ola 1 · nivel 0 · versión de contratos 0.1

**Objetivo.** Definir qué es un registro válido y cuándo dos registros se pueden comparar.

**Rutas propias.** `app/nucleo/`. Nada fuera de ellas.

**Depende de.** M00 Fundación. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/MEJORAS_PROPUESTA.md` (M2), `docs/DATASETS.md` (límites de integración).

## Entregables

- `validarRegistro`, `crearRegistro`, `sonComparables` y las constantes del contrato.
- Validación campo por campo con mensajes que nombran el campo.

## Terminado cuando

- [ ] Un registro sin `origen`, `metodo`, `momento` o `sujeto` se rechaza nombrando el campo.
- [ ] Una medición `registrado` sin `valor` o sin `unidad` se rechaza.
- [ ] Un registro `sin_registro` con `valor` se rechaza: la ausencia no lleva número.
- [ ] El id `"007"` se conserva como texto; un id numérico se rechaza.
- [ ] `sonComparables` devuelve el motivo cuando difieren unidad, método, variable o sujeto.
- [ ] Ninguna función convierte un estado en otro.
- [ ] Pasa la batería de contrato de `nucleo`.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Persistencia.
- Cualquier juicio sobre si un valor es normal.

**El error que más cuesta.** Aceptar de más es el error grave: un registro mal formado que entra contamina todas las vistas. Ante un campo dudoso, rechazar.

**Skills.** validate-at-the-boundary, honest-degradation, falsifiable-testing.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
