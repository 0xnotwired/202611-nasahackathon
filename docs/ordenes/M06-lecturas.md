# Orden de trabajo M06 — Lecturas

Fase F2 · ola 1 · nivel 1 · versión de contratos 0.1

**Objetivo.** Responder las consultas que usan todas las vistas, para que el mismo dato signifique lo mismo en todas.

**Rutas propias.** `app/lecturas/`. Nada fuera de ellas.

**Depende de.** M01 Núcleo, M04 Almacén. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/MEJORAS_PROPUESTA.md` (M5, M8), `docs/INVESTIGACION_AMPLIADA_B.md` (B07, B09).

## Entregables

- `serie`, `ultimo`, `lineaDeBase`, `ambiente`, `acumulado`.

## Terminado cuando

- [ ] Un día sin dato aparece en `huecos`, no como punto en cero.
- [ ] `serie` separa en `grupos_no_comparables` lo medido con otro método o unidad.
- [ ] `ultimo` devuelve `null` y antigüedad `null` cuando no hay dato.
- [ ] `lineaDeBase` devuelve cuántas mediciones hay y su rango, sin calificarlas.
- [ ] `ambiente` de otro lugar no se devuelve como exposición del sujeto.
- [ ] `acumulado` devuelve `total: null` sin datos, y cuenta los huecos cuando hay algunos.
- [ ] No existe ninguna constante de umbral en el módulo.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Decidir qué es normal o preocupante.
- HRV a partir de un pulso diario.

**El error que más cuesta.** Un promedio que trata el hueco como cero baja el valor y parece una mejoría o un deterioro que no existe.

**Skills.** honest-degradation, falsifiable-testing.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
