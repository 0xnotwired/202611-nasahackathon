#!/usr/bin/env python3
"""Comprueba la consistencia de la documentación y del tablero de módulos.

Verifica, y nada más que esto:
  1. Cada matriz de investigación se lee como CSV con filas completas, y sus ids
     coinciden con los citados en su documento.
  2. docs/modulos.csv: ids únicos, estado válido, cada módulo tiene su orden de
     trabajo y cada orden pertenece a un módulo.
  3. Las rutas propias de dos módulos no se solapan.
  4. Cada dependencia existe y está en una fase anterior, o en la misma fase y
     una ola anterior.
  5. La tabla de módulos de PLAN_ORQUESTACION.md nombra los mismos ids.
  6. Los enlaces relativos de los .md apuntan a archivos que existen.

No comprueba que las cifras citadas sean correctas, que las fuentes digan lo que
se afirma, ni que un agente haya respetado sus rutas propias al escribir código.
Uso: python3 scripts/check_docs.py   (código de salida 1 si hay algún fallo)
"""
import csv
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DOCS = RAIZ / "docs"

# (matriz, documento, patrón de id)
PARES = [
    ("MATRIZ_INVESTIGACION_APLICADA.csv", "INVESTIGACION_APLICADA.md", r"\bA0\d\b"),
    ("MATRIZ_INVESTIGACION_B.csv", "INVESTIGACION_AMPLIADA_B.md", r"\bB\d\d\b"),
]
ESTADOS = {"pendiente", "en_curso", "en_revision", "integrado", "bloqueado"}


def comprobar_matriz(nombre_csv, nombre_md, patron):
    fallos = []
    ruta_csv, ruta_md = DOCS / nombre_csv, DOCS / nombre_md
    for ruta in (ruta_csv, ruta_md):
        if not ruta.is_file():
            return [f"falta el archivo {ruta.relative_to(RAIZ)}"]
    with ruta_csv.open(encoding="utf-8", newline="") as f:
        filas = list(csv.reader(f))
    if not filas:
        return [f"{nombre_csv}: vacío"]
    ancho = len(filas[0])
    for n, fila in enumerate(filas[1:], start=2):
        if len(fila) != ancho:
            fallos.append(f"{nombre_csv}: fila {n} tiene {len(fila)} columnas, se esperaban {ancho}")
    ids_csv = {fila[0] for fila in filas[1:] if fila}
    ids_md = set(re.findall(patron, ruta_md.read_text(encoding="utf-8")))
    for falta in sorted(ids_md - ids_csv):
        fallos.append(f"{falta} se cita en {nombre_md} pero no está en {nombre_csv}")
    for falta in sorted(ids_csv - ids_md):
        fallos.append(f"{falta} está en {nombre_csv} pero no se cita en {nombre_md}")
    return fallos


def se_solapan(a, b):
    """Dos rutas se solapan si son iguales o una es carpeta que contiene a la otra."""
    if a == b:
        return True
    return (a.endswith("/") and b.startswith(a)) or (b.endswith("/") and a.startswith(b))


def comprobar_modulos():
    fallos = []
    ruta = DOCS / "modulos.csv"
    if not ruta.is_file():
        return ["falta docs/modulos.csv"]
    with ruta.open(encoding="utf-8", newline="") as f:
        filas = list(csv.DictReader(f))
    por_id = {}
    for fila in filas:
        mid = fila["id"]
        if mid in por_id:
            fallos.append(f"modulos.csv: id repetido {mid}")
        por_id[mid] = fila
        if fila["estado"] not in ESTADOS:
            fallos.append(f"modulos.csv: {mid} tiene estado desconocido «{fila['estado']}»")
        if not (DOCS / fila["orden"]).is_file():
            fallos.append(f"modulos.csv: {mid} apunta a una orden que no existe: {fila['orden']}")
        if not fila["rutas"].strip():
            fallos.append(f"modulos.csv: {mid} no declara rutas propias")

    ordenes_csv = {fila["orden"] for fila in filas}
    carpeta = DOCS / "ordenes"
    if carpeta.is_dir():
        for orden in sorted(carpeta.glob("*.md")):
            relativa = f"ordenes/{orden.name}"
            if relativa not in ordenes_csv:
                fallos.append(f"{relativa} no pertenece a ningún módulo de modulos.csv")

    ids = list(por_id)
    for i, a in enumerate(ids):
        for b in ids[i + 1:]:
            for ra in por_id[a]["rutas"].split(";"):
                for rb in por_id[b]["rutas"].split(";"):
                    if se_solapan(ra.strip(), rb.strip()):
                        fallos.append(f"rutas solapadas: {a} ({ra}) y {b} ({rb})")

    for mid, fila in por_id.items():
        for dep in filter(None, fila["depende_de"].split(";")):
            if dep not in por_id:
                fallos.append(f"{mid} depende de {dep}, que no existe")
                continue
            propia = (int(fila["fase"]), int(fila["ola"]))
            ajena = (int(por_id[dep]["fase"]), int(por_id[dep]["ola"]))
            if not ajena < propia:
                fallos.append(
                    f"{mid} (fase {propia[0]}, ola {propia[1]}) depende de {dep} "
                    f"(fase {ajena[0]}, ola {ajena[1]}), que no se construye antes"
                )

    plan = DOCS / "PLAN_ORQUESTACION.md"
    if plan.is_file():
        en_plan = set(re.findall(r"^\| (M\d\d) \|", plan.read_text(encoding="utf-8"), flags=re.M))
        for falta in sorted(set(por_id) - en_plan):
            fallos.append(f"{falta} está en modulos.csv pero no en la tabla de PLAN_ORQUESTACION.md")
        for falta in sorted(en_plan - set(por_id)):
            fallos.append(f"{falta} está en PLAN_ORQUESTACION.md pero no en modulos.csv")
    else:
        fallos.append("falta docs/PLAN_ORQUESTACION.md")
    return fallos, len(por_id)


def comprobar_enlaces():
    fallos = []
    archivos = sorted(DOCS.rglob("*.md")) + sorted(RAIZ.glob("*.md"))
    for md in archivos:
        texto = md.read_text(encoding="utf-8")
        for destino in re.findall(r"\]\(([^)#\s]+)(?:#[^)]*)?\)", texto):
            if re.match(r"[a-z]+:", destino):  # http:, https:, mailto:
                continue
            if not (md.parent / destino).exists():
                fallos.append(f"{md.relative_to(RAIZ)}: enlace roto a {destino}")
    return fallos


def main():
    fallos = []
    for par in PARES:
        fallos += comprobar_matriz(*par)
    resultado = comprobar_modulos()
    if isinstance(resultado, tuple):
        fallos_modulos, cuantos = resultado
    else:
        fallos_modulos, cuantos = resultado, 0
    fallos += fallos_modulos
    fallos += comprobar_enlaces()
    if fallos:
        print("FALLA")
        for f in fallos:
            print("  -", f)
        return 1
    print(
        f"OK: {len(PARES)} matrices consistentes; {cuantos} módulos con orden, "
        "rutas sin solapes y dependencias en orden; enlaces relativos resueltos."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
