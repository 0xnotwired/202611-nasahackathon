# Orden de trabajo M17 — Copiloto

Fase F4 · ola 2 · nivel 3 · versión de contratos 0.1

**Objetivo.** Convertir la situación de un episodio en una tarjeta que muestra datos antes que sugerencias y admite no saber.

**Rutas propias.** `app/copiloto/`. Nada fuera de ellas.

**Depende de.** M02 Misión, M06 Lecturas, M16 Episodio. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/MEJORAS_PROPUESTA.md` (M4), `docs/INVESTIGACION_AMPLIADA_B.md` (B12, B13).

## Entregables

- `tarjeta(situacion, config, reglas)` como función pura.
- Formato de regla: condición explícita, texto, fuente, versión, estado de revisión.

## Terminado cuando

- [ ] Sin regla aplicable: `sugerencia` es `null` y `sin_orientacion` es `true`.
- [ ] `datos` y `faltantes` se devuelven siempre, haya o no sugerencia.
- [ ] Toda sugerencia lleva fuente, versión y estado de revisión, y `no_evaluado` dice qué no se miró.
- [ ] Una regla sin fuente se rechaza al cargar.
- [ ] Si el episodio ya emitió aviso, `aviso` es `null`.
- [ ] El módulo no contiene ninguna regla: las pruebas usan reglas de juguete rotuladas.
- [ ] No hay llamadas de red ni modelo de lenguaje.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Reglas clínicas, umbrales, diagnósticos.
- IA generativa.

**El error que más cuesta.** El silencio del copiloto leído como «todo bien» es el error de omisión que describe B12.

**Skills.** llm-out-of-the-loop, deterministic-core, falsifiable-testing.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
