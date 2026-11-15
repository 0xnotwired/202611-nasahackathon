# Orden de trabajo M21 — Importadores NASA

Fase F5 · ola 1 · nivel 4 · versión de contratos 0.1

**Objetivo.** Leer archivos reales de NASA sin alterar sus valores ni mezclar sus sujetos.

**Rutas propias.** `app/importadores/`. Nada fuera de ellas.

**Depende de.** M01 Núcleo, M04 Almacén. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/DATASETS.md`, `AGENTS.md` (Evidencia e interfaz).

## Entregables

- `importarCRF` y `importarAdaptacion` para el estudio que se haya descargado.

## Terminado cuando

- [ ] Los valores importados coinciden con el archivo original, comprobado fila por fila.
- [ ] `Test_Phase` se conserva junto al día.
- [ ] Los comentarios clínicos libres no se importan y `omitidos` dice cuántos eran.
- [ ] Una celda vacía o `NA` produce `sin_registro`, nunca cero.
- [ ] Una fila mal formada va a `rechazados` con su motivo y no detiene el resto.
- [ ] Todo registro sale con `origen: "analogo_terrestre"` y el sujeto del archivo.
- [ ] Los archivos originales están en `datos/originales/`, fuera del repo.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Unir estudios distintos como una persona.
- Subir archivos de NASA al repo.

**El error que más cuesta.** Un reposo en cama mostrado como registro de un astronauta.

**Skills.** validate-at-the-boundary, data-provenance-mapping, untrusted-sample-handling, falsifiable-testing.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
