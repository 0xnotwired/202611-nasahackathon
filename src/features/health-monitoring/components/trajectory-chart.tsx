import { useEffect, useId, useRef, useState } from "react";
import type { Evaluation } from "../mission";
import { formatDate, numberFormat } from "../mission";

export function TrajectoryChart({
  evaluations,
  selected,
  reference,
  onSelect,
}: {
  evaluations: Evaluation[];
  selected: string;
  reference?: Evaluation;
  onSelect: (id: string) => void;
}) {
  const id = useId();
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(240, entry.contentRect.width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [evaluations]);
  const valid = evaluations.filter((item) => item.value !== null);
  if (!valid.length)
    return (
      <p className="empty-state">
        No hay resultados para representar en este período.
      </p>
    );
  if (new Set(valid.map((item) => item.unit)).size > 1)
    return (
      <p className="empty-state">
        El período contiene unidades diferentes. Explorá los resultados en el
        historial; no se representan en una escala común.
      </p>
    );
  const values = valid.map((item) => item.value!);
  const min = Math.floor(
    Math.min(
      ...values,
      (reference?.unit === valid[0].unit ? reference.value : null) ?? Infinity,
    ) - 1,
  );
  const max = Math.ceil(
    Math.max(
      ...values,
      (reference?.unit === valid[0].unit ? reference.value : null) ?? -Infinity,
    ) + 1,
  );
  const start = Date.parse(evaluations[0].recordedAt);
  const span = Date.parse(evaluations.at(-1)!.recordedAt) - start || 1;
  const x = (item: Evaluation) =>
    58 + ((Date.parse(item.recordedAt) - start) / span) * (width - 96);
  const y = (value: number) => 238 - ((value - min) / (max - min)) * 190;
  const selectedPoint = evaluations.find((item) => item.id === selected);
  const ticks = Array.from(
    { length: 5 },
    (_, index) => min + ((max - min) * index) / 4,
  );
  const labelCount = Math.min(evaluations.length, width < 450 ? 3 : 5);
  const labelIndices = new Set(
    Array.from({ length: labelCount }, (_, index) =>
      Math.round(
        (index * (evaluations.length - 1)) / Math.max(1, labelCount - 1),
      ),
    ),
  );
  const labels = evaluations.filter((_, index) => labelIndices.has(index));
  return (
    <figure className="trajectory-figure">
      <div className="trajectory-canvas" ref={container}>
        <svg
          viewBox={`0 0 ${width} 300`}
          role="img"
          aria-labelledby={`${id}-title ${id}-description`}
        >
          <title id={`${id}-title`}>
            Evolución de las evaluaciones aeróbicas
          </title>
          <desc id={`${id}-description`}>
            Resultados puntuales por fecha. Los trazos unen únicamente visitas
            consecutivas del mismo método y unidad. El historial debajo contiene
            todos los valores.
          </desc>
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1="58"
                x2={width - 38}
                y1={y(tick)}
                y2={y(tick)}
                className="trajectory-grid"
              />
              <text
                x="43"
                y={y(tick) + 4}
                textAnchor="end"
                className="trajectory-label"
              >
                {numberFormat.format(tick)}
              </text>
            </g>
          ))}
          {reference?.value != null && reference.unit === valid[0].unit
            ? evaluations.map((item, index) =>
                item.method === reference.method &&
                item.unit === reference.unit ? (
                  <line
                    key={`reference-${item.id}`}
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
              previous.unit === item.unit;
            const alternate = item.method !== valid[0].method;
            return (
              <g key={item.id}>
                {item.value === null ? (
                  <>
                    <line
                      x1={x(item)}
                      x2={x(item)}
                      y1="40"
                      y2="238"
                      className="trajectory-missing"
                    />
                    <text
                      x={x(item)}
                      y="28"
                      textAnchor="middle"
                      className="trajectory-label"
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
                    className={`trajectory-line ${alternate ? "alternate" : ""}`}
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
                y1="38"
                y2="248"
                className="trajectory-selection"
              />
              <circle
                cx={x(selectedPoint)}
                cy={y(selectedPoint.value)}
                r="10"
                className="trajectory-halo"
              />
              <circle
                cx={x(selectedPoint)}
                cy={y(selectedPoint.value)}
                r="5"
                className="trajectory-selected"
              />
            </g>
          ) : null}
          {labels.map((item) => (
            <text
              key={item.id}
              x={x(item)}
              y="279"
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
        <div
          className="plot-targets"
          role="group"
          aria-label="Seleccionar una evaluación"
        >
          {evaluations.map((item) => (
            <button
              key={item.id}
              type="button"
              style={{
                left: `${(x(item) / width) * 100}%`,
                top: `${(item.value === null ? 140 : y(item.value)) / 3}%`,
              }}
              onClick={() => onSelect(item.id)}
              aria-pressed={item.id === selected}
              aria-label={`${formatDate(item.recordedAt)}: ${item.value === null ? "sin dato" : `${numberFormat.format(item.value)} ${item.unit}`}`}
              title={formatDate(item.recordedAt)}
            />
          ))}
        </div>
      </div>
      <figcaption>
        <span>
          <i className="legend-line" />
          Resultados puntuales
        </span>
        <span>
          <i className="legend-line reference" />
          Referencia seleccionada
        </span>
        {valid.some((item) => item.method !== valid[0].method) ? (
          <span>
            <i className="legend-line alternate" />
            Otro método · puntos cuadrados
          </span>
        ) : null}
        <span>Seleccioná una visita para explorarla</span>
      </figcaption>
    </figure>
  );
}
