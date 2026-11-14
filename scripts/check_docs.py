#!/usr/bin/env python3
"""Comprueba la consistencia entre las matrices CSV y los documentos de investigación.

Verifica, y nada más que esto:
  1. Cada matriz se lee como CSV y todas sus filas tienen el número de columnas del encabezado.
  2. Cada id de la matriz aparece en su documento, y cada id citado en el documento está en la matriz.
  3. Los enlaces relativos a archivos .md/.csv dentro de docs/ y de los .md raíz apuntan a archivos que existen.

No comprueba que las cifras citadas sean correctas ni que las fuentes digan lo que se afirma.
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


def comprobar_enlaces():
    fallos = []
    archivos = sorted(DOCS.glob("*.md")) + sorted(RAIZ.glob("*.md"))
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
    fallos += comprobar_enlaces()
    if fallos:
        print("FALLA")
        for f in fallos:
            print("  -", f)
        return 1
    print(f"OK: {len(PARES)} matrices consistentes con sus documentos; enlaces relativos resueltos.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
