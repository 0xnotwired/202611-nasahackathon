import type { Evaluation } from "../mission";
import { numberFormat } from "../mission";

const chartDate = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function EvaluationChart({
  evaluations,
}: {
  evaluations: Evaluation[];
}) {
  const points = evaluations.filter((evaluation) => evaluation.value !== null);
  if (!points.length)
    return (
      <div className="empty-state">
        Todavía no hay evaluaciones para representar.
      </div>
    );
  const values = points.map((evaluation) => evaluation.value!);
  const min = Math.floor(Math.min(...values) - 3);
  const max = Math.ceil(Math.max(...values) + 3);
  const start = Math.min(
    ...evaluations.map((evaluation) => Date.parse(evaluation.recordedAt)),
  );
  const span =
    Math.max(
      ...evaluations.map((evaluation) => Date.parse(evaluation.recordedAt)),
    ) - start || 1;
  const x = (evaluation: Evaluation) =>
    64 + ((Date.parse(evaluation.recordedAt) - start) / span) * 452;
  const y = (value: number) => 190 - ((value - min) / (max - min)) * 135;

  return (
    <figure className="evaluation-figure">
      <svg
        viewBox="0 0 580 255"
        role="img"
        aria-label="Evaluaciones aeróbicas simuladas por fecha. Los valores y métodos se detallan en la tabla de esta vista."
      >
        {[min, (min + max) / 2, max].map((tick) => (
          <g key={tick}>
            <line
              x1="52"
              x2="535"
              y1={y(tick)}
              y2={y(tick)}
              className="chart-grid"
            />
            <text
              x="40"
              y={y(tick) + 4}
              textAnchor="end"
              className="chart-tick"
            >
              {numberFormat.format(tick)}
            </text>
          </g>
        ))}
        <text x="52" y="22" className="chart-unit">
          {points[0].unit}
        </text>
        {evaluations.map((evaluation, index) => (
          <g key={evaluation.id}>
            <text
              x={x(evaluation)}
              y="223"
              textAnchor="middle"
              className="chart-tick"
            >
              {chartDate.format(new Date(evaluation.recordedAt))}
            </text>
            {evaluation.value !== null ? (
              <>
                {index === 2 ? (
                  <rect
                    x={x(evaluation) - 7}
                    y={y(evaluation.value) - 7}
                    width="14"
                    height="14"
                    rx="2"
                    className="chart-point alternate"
                  />
                ) : (
                  <circle
                    cx={x(evaluation)}
                    cy={y(evaluation.value)}
                    r="7"
                    className="chart-point"
                  />
                )}
                <text
                  x={x(evaluation)}
                  y={y(evaluation.value) - 18}
                  textAnchor="middle"
                  className="chart-value"
                >
                  {numberFormat.format(evaluation.value)}
                </text>
              </>
            ) : (
              <text
                x={x(evaluation)}
                y="100"
                textAnchor="middle"
                className="chart-tick"
              >
                Sin dato
              </text>
            )}
          </g>
        ))}
      </svg>
      <figcaption>
        Mediciones puntuales simuladas, sin interpolación. Un cambio de método
        impide comparar directamente los resultados.
      </figcaption>
      <div className="chart-legend">
        <span>
          <i className="legend-dot" />
          Cicloergómetro · demo A
        </span>
        <span>
          <i className="legend-dot alternate" />
          Cinta · demo B
        </span>
      </div>
    </figure>
  );
}
