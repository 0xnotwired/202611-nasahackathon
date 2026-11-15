"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { Evaluation } from "../mission";
import { formatDate, numberFormat } from "../mission";
import { evidenceReason } from "../evidence";

export function TrajectoryChart({
  evaluations,
  selected,
  reference,
  domain,
  methodOrder,
  onSelect,
}: {
  evaluations: Evaluation[];
  selected: string;
  reference?: Evaluation;
  domain: { min: number; max: number } | null;
  methodOrder: string[];
  onSelect: (id: string) => void;
}) {
  const id = useId();
  const container = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 304, font: 16 });
  const valid = evaluations.filter((item) => item.value !== null);
  const unit = valid[0]?.unit;
  const mixedUnits = new Set(valid.map((item) => item.unit)).size > 1;
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const font = parseFloat(getComputedStyle(element).fontSize) || 16;
      setSize({
        width: Math.max(1, entry.contentRect.width),
        height: Math.max(1, entry.contentRect.height),
        font,
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [mixedUnits, valid.length]);
  if (!valid.length || !domain)
    return (
      <div className="chart-empty">
        <h3>Sin resultados para representar</h3>
        <p>
          Las visitas sin resultado se conservan en el registro de evaluaciones.
        </p>
      </div>
    );
  if (mixedUnits)
    return (
      <div className="chart-empty">
        <h3>Unidades no comparables</h3>
        <p>
          Consultá los resultados por evaluación. No se representan unidades
          diferentes en una escala común.
        </p>
      </div>
    );
  const { width, height, font } = size;
  const left = font * 3.1,
    right = font * 1.9,
    top = font * 2.3,
    bottom = font * 3.2;
  const plotWidth = Math.max(1, width - left - right);
  const plotHeight = Math.max(1, height - top - bottom);
  const start = Date.parse(evaluations[0].recordedAt);
  const span = Date.parse(evaluations.at(-1)!.recordedAt) - start || 1;
  const x = (item: Evaluation) =>
    left + ((Date.parse(item.recordedAt) - start) / span) * plotWidth;
  const y = (value: number) =>
    top +
    plotHeight -
    ((value - domain.min) / (domain.max - domain.min)) * plotHeight;
  const tickCount = height / font < 15 ? 3 : 5;
  const ticks = Array.from(
    { length: tickCount },
    (_, index) =>
      domain.min + ((domain.max - domain.min) * index) / (tickCount - 1),
  );
  const count = Math.min(
    evaluations.length,
    width / font < 25 ? 2 : width / font < 40 ? 3 : 5,
  );
  const labelIndices = new Set(
    Array.from({ length: count }, (_, index) =>
      Math.round((index * (evaluations.length - 1)) / Math.max(1, count - 1)),
    ),
  );
  const methods = [...new Set(valid.map((item) => item.method))];
  const primaryMethod = methodOrder[0] ?? methods[0];
  const selectedPoint = evaluations.find((item) => item.id === selected);
  const canTarget = evaluations.every(
    (item, index) =>
      index === 0 ||
      Math.hypot(
        x(item) - x(evaluations[index - 1]),
        y(item.value ?? domain.min) -
          y(evaluations[index - 1].value ?? domain.min),
      ) >= 30,
  );

  return (
    <figure className="trajectory-figure">
      <div className="trajectory-canvas" ref={container}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={`${id}-title ${id}-description`}
        >
          <title id={`${id}-title`}>Evolución de VO₂pico por fecha</title>
          <desc id={`${id}-description`}>
            Valores en {unit}. Mediciones puntuales, separadas por método y con
            huecos conservados. La tabla de evaluaciones contiene los valores y
            el panel de detalle permite seleccionar cada visita.
          </desc>
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={left}
                x2={width - right}
                y1={y(tick)}
                y2={y(tick)}
                className="trajectory-grid"
              />
              <text
                x={left - font * 0.6}
                y={y(tick) + font * 0.28}
                textAnchor="end"
                className="trajectory-label"
              >
                {numberFormat.format(tick)}
              </text>
            </g>
          ))}
          {reference?.value != null && reference.unit === unit
            ? evaluations.map((item, index) =>
                item.method === reference.method &&
                item.unit === reference.unit &&
                !evidenceReason(item.evidence, reference.evidence) ? (
                  <line
                    key={`ref-${item.id}`}
                    x1={x(item)}
                    x2={
                      evaluations[index + 1]?.method === reference.method
                        ? x(evaluations[index + 1])
                        : x(item)
                    }
                    y1={y(reference.value!)}
                    y2={y(reference.value!)}
                    className="trajectory-reference"
                  />
                ) : null,
              )
            : null}
          {evaluations.map((item, index) => {
            const previous = evaluations[index - 1];
            const compatible =
              previous &&
              previous.value !== null &&
              item.value !== null &&
              previous.method === item.method &&
              previous.unit === item.unit &&
              !evidenceReason(previous.evidence, item.evidence) &&
              (previous.evidence?.assessmentId ?? previous.id) !==
                (item.evidence?.assessmentId ?? item.id);
            const alternate = item.method !== primaryMethod;
            return (
              <g key={item.id}>
                {item.value === null ? (
                  <>
                    <line
                      x1={x(item)}
                      x2={x(item)}
                      y1={top}
                      y2={top + plotHeight}
                      className="trajectory-missing"
                    />
                    <text
                      x={x(item)}
                      y={font * 1.1}
                      textAnchor="middle"
                      className="trajectory-label missing-label"
                    >
                      Sin dato
                    </text>
                  </>
                ) : null}
                {compatible ? (
                  <line
                    x1={x(previous)}
                    x2={x(item)}
                    y1={y(previous.value!)}
                    y2={y(item.value!)}
                    className={`trajectory-line${alternate ? " alternate" : ""}`}
                  />
                ) : null}
                {item.value !== null ? (
                  alternate ? (
                    <rect
                      x={x(item) - 4}
                      y={y(item.value) - 4}
                      width="8"
                      height="8"
                      className="trajectory-point alternate"
                    />
                  ) : (
                    <circle
                      cx={x(item)}
                      cy={y(item.value)}
                      r="4"
                      className="trajectory-point"
                    />
                  )
                ) : null}
              </g>
            );
          })}
          {selectedPoint?.value != null ? (
            <g>
              <line
                x1={x(selectedPoint)}
                x2={x(selectedPoint)}
                y1={top}
                y2={top + plotHeight}
                className="trajectory-selection"
              />
              {selectedPoint.method !== primaryMethod ? (
                <>
                  <rect
                    x={x(selectedPoint) - 10}
                    y={y(selectedPoint.value) - 10}
                    width="20"
                    height="20"
                    className="trajectory-selection-ring alternate"
                  />
                  <rect
                    x={x(selectedPoint) - 5}
                    y={y(selectedPoint.value) - 5}
                    width="10"
                    height="10"
                    className="trajectory-selected alternate"
                  />
                </>
              ) : (
                <>
                  <circle
                    cx={x(selectedPoint)}
                    cy={y(selectedPoint.value)}
                    r="10"
                    className="trajectory-selection-ring"
                  />
                  <circle
                    cx={x(selectedPoint)}
                    cy={y(selectedPoint.value)}
                    r="5"
                    className="trajectory-selected"
                  />
                </>
              )}
            </g>
          ) : null}
          {evaluations
            .filter((_, index) => labelIndices.has(index))
            .map((item) => (
              <text
                key={item.id}
                x={x(item)}
                y={height - font * 0.9}
                textAnchor="middle"
                className="trajectory-label"
              >
                {new Intl.DateTimeFormat("es", {
                  month: "short",
                  year: "2-digit",
                  timeZone: "UTC",
                }).format(new Date(item.recordedAt))}
              </text>
            ))}
        </svg>
        {canTarget ? (
          <div
            className="plot-targets"
            role="group"
            aria-label="Puntos del gráfico"
          >
            {evaluations.map((item) => (
              <button
                key={item.id}
                type="button"
                style={{
                  left: `${(x(item) / width) * 100}%`,
                  top: `${(y(item.value ?? (domain.min + domain.max) / 2) / height) * 100}%`,
                }}
                aria-pressed={selected === item.id}
                aria-label={`Punto del ${formatDate(item.recordedAt)}: ${item.value === null ? "sin resultado" : `${numberFormat.format(item.value)} ${item.unit}`}`}
                onClick={() => onSelect(item.id)}
              />
            ))}
          </div>
        ) : null}
      </div>
      <figcaption>
        <ul className="chart-legend" role="list">
          {methods.map((method) => (
            <li key={method}>
              <i
                className={
                  method === primaryMethod
                    ? "legend-marker"
                    : "legend-marker alternate"
                }
                aria-hidden="true"
              />
              {method}
            </li>
          ))}
          <li>
            <i className="legend-reference" aria-hidden="true" />
            Referencia seleccionada
          </li>
        </ul>
        <p>
          {canTarget
            ? "Seleccioná un punto o utilizá el panel de detalle."
            : "Utilizá el selector de fecha o las flechas del panel de detalle."}
        </p>
      </figcaption>
    </figure>
  );
}
