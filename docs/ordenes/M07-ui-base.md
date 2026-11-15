# Orden de trabajo M07 — Interfaz base

Fase F2 · ola 1 · nivel 1 · versión de contratos 0.1

**Objetivo.** Construir la carcasa, la navegación y los componentes comunes que hacen que un dato se vea igual en todas las vistas.

**Rutas propias.** `app/index.html`, `app/ui/base/`. Nada fuera de ellas.

**Depende de.** M00 Fundación. Deben estar integrados antes de empezar.

**Leer antes.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRATOS.md`, `docs/CONTRATOS.md §5`, `demo/orbita.html` (referencia visual; es código del equipo), `docs/BASE_ACADEMICA.md` (S04, S05).

## Entregables

- Carcasa con navegación a todas las vistas previstas, cada una apuntando a su carpeta.
- `etiquetaEstado`, `etiquetaOrigen`, `datoConContexto`, `tablaAccesible`, `graficoDeLinea`.
- Armado de `servicios` y selector de configuración de misión.
- Aviso visible cuando el almacén no es persistente.

## Terminado cuando

- [ ] Una vista sin implementar muestra «todavía no disponible» y no rompe la navegación.
- [ ] Los tres estados de registro se distinguen leyendo solo el texto.
- [ ] El gráfico muestra los huecos como huecos y ofrece la misma información en tabla.
- [ ] Toda la navegación se recorre con teclado y el foco es visible.
- [ ] Los modelos de los componentes se prueban en Node; el dibujo se comprueba con el guion manual.
- [ ] Cada prueba se vio fallar con el código roto antes de pasar, y el informe dice cómo.
- [ ] `git diff --stat` contra la rama de integración solo muestra rutas propias.

## Fuera de alcance

- Contenido de cada vista.
- Librerías de interfaz o de gráficos.

**El error que más cuesta.** Si cada vista dibuja el estado a su manera, «sin registro» termina pareciendo «sin novedad» en alguna.

**Skills.** frontend-accessibility-by-construction, resilient-ui-states, non-overwhelming-ux, frontend-component-boundaries.

Informe de entrega y ciclo de revisión: [PLAN_ORQUESTACION.md](../PLAN_ORQUESTACION.md). Interfaces: [CONTRATOS.md](../CONTRATOS.md).
