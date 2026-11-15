# Orden de trabajo M23 — Empaquetado

Fase F6 · ola 1 · nivel - · versión de contratos 0.1

**Objetivo.** Producir un solo archivo HTML que abra con doble clic, como la maqueta actual.

**Rutas propias.** `scripts/empaquetar.mjs`. Nada fuera de ellas.

**Depende de.** M20 Vista Me siento distinto. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/PLAN_ORQUESTACION.md` (Trampas conocidas), `docs/LEEME_DEMO.md`.

## Entregables

- `scripts/empaquetar.mjs`: une los módulos de `app/` en `dist/orbita.html` con módulos `node:` únicamente.

## Terminado cuando

- [ ] `dist/orbita.html` abre desde `file://` en un navegador real y completa el episodio.
- [ ] El archivo no hace ninguna petición de red.
- [ ] Lo empaquetado se comporta igual que lo servido: el guion manual da el mismo resultado.
- [ ] Si IndexedDB no funciona desde `file://`, la aplicación lo dice en pantalla.
- [ ] `dist/` está en `.gitignore`.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Minificar, transpilar, usar un empaquetador externo.

**El error que más cuesta.** Un empaquetado que cambia el comportamiento sin que nadie lo compare.

**Skills.** pipeline-trust, falsifiable-testing.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
