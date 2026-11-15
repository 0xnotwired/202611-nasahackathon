# Orden de trabajo M04 — Almacén

Fase F1 · ola 2 · nivel 0 · versión de contratos 0.1

**Objetivo.** Ser la única puerta a la persistencia, con dos implementaciones del mismo contrato: memoria e IndexedDB.

**Rutas propias.** `app/almacen/`. Nada fuera de ellas.

**Depende de.** M01 Núcleo. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/TECNICO.md`.

## Entregables

- `abrirAlmacen` y el objeto `Almacen` del contrato, en memoria y en IndexedDB.
- Sello `version_esquema` en todo lo guardado.

## Terminado cuando

- [ ] Las dos implementaciones pasan la misma batería de contrato (IndexedDB se comprueba en navegador y se informa como tal).
- [ ] `guardar` con un id existente falla: no sobrescribe.
- [ ] `registros` y `compartidos` rechazan `actualizarEstado`.
- [ ] `guardarLote` con un elemento inválido no guarda ninguno.
- [ ] Un objeto con `version_esquema` desconocida o mayor se rechaza con mensaje claro.
- [ ] `estado()` dice `persistente: false` y el motivo cuando es memoria.
- [ ] `listar` nunca devuelve registros de otro sujeto si se filtró por sujeto.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Sincronización, respaldo y cifrado.
- Validar registros por su cuenta: usa `nucleo`.

**El error que más cuesta.** Caer en memoria sin decirlo hace creer al astronauta que sus datos quedaron guardados.

**Skills.** honest-degradation, atomic-state-mutation, versioned-schema-evolution, falsifiable-testing.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
