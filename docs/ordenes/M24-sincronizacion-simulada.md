# Orden de trabajo M24 — Sincronización simulada y panel en tierra

Fase F4 · ola 3 · nivel 3 · versión de contratos 0.2

**Objetivo.** Mostrar el camino de la tablet al equipo médico (decisión D9, opción C simulada): el astronauta elige qué enviar, el envío espera en cola si no hay enlace, viaja con demora simulada y llega a un panel en tierra con su hora de envío y de recepción.

**Rutas propias.** `app/sincronizacion/`, `app/ui/tierra/`. Nada fuera de ellas.

**Depende de.** M07 Interfaz base, M18 Resumen, M19 Privacidad. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md` (sección `sincronizacion` y forma `Envio`), `docs/PLAN_ORQUESTACION.md` (D9), `docs/INVESTIGACION_AMPLIADA_B.md` (B03, B10, B11), `docs/MODELO_AMENAZAS.md`.

## Entregables

- `crearEnlace`, `encolar`, `avanzar`, `recibidos`.
- Vista `app/ui/tierra/` (`modelo.js` y `vista.js`) con el panel del equipo médico y el control de enlace: tiempo real, demora, sin enlace.

## Terminado cuando

- [ ] Solo se puede encolar algo que tiene un `Compartido` registrado por M19.
- [ ] Con `sin_enlace`, la tablet sigue funcionando y los envíos quedan `en_cola`; no se pierde ninguno.
- [ ] Con `demora`, un envío pasa por `en_transito` y llega después del tiempo configurado, medido con el reloj inyectado.
- [ ] Un mismo envío entregado dos veces aparece una sola vez en `recibidos`.
- [ ] El panel muestra hora de creación, de envío y de recepción, y la antigüedad del dato.
- [ ] Un tripulante que no envió nada aparece como «sin envíos», nunca como «sin novedad».
- [ ] Los estados de registro y el origen viajan intactos: un «sin registro» llega como «sin registro».
- [ ] La interfaz dice «sincronización simulada» y no muestra usuarios, contraseñas ni cifrado.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Servidor, red, autenticación o cifrado reales: son un nivel posterior que reabre D7.
- Envío de tierra a la nave (cambios de plan): introduce conflictos y queda para ese nivel.

**El error que más cuesta.** Que el panel en tierra parezca un sistema real, o que muestre «todo bien» para quien no envió nada.

**Skills.** honest-degradation, secure-by-construction, validate-at-the-boundary, falsifiable-testing.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
