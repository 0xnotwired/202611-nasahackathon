import type { Evaluation } from "../mission";
import { formatDate, numberFormat } from "../mission";
import { comparisonTo } from "../aerobic";

export function EvaluationHistory({
  evaluations,
  reference,
  selected,
  onSelect,
  full = false,
}: {
  evaluations: Evaluation[];
  reference?: Evaluation;
  selected: string;
  onSelect: (id: string) => void;
  full?: boolean;
}) {
  const rows = evaluations.toReversed().slice(0, full ? undefined : 3);
  return (
    <div
      className="evaluation-table-region"
      tabIndex={0}
      role="region"
      aria-labelledby="evaluation-table-caption"
    >
      <table className="evaluation-table">
        <caption id="evaluation-table-caption">
          {full
            ? "Evaluaciones del período"
            : "Evaluaciones recientes del período"}{" "}
          · {rows.length} de {evaluations.length} visitas · fechas UTC
        </caption>
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">VO₂pico simulado</th>
            <th scope="col">Método</th>
            <th scope="col">Cambio vs. referencia</th>
            <th scope="col">Selección</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const comparison = comparisonTo(reference, item);
            return (
              <tr
                key={item.id}
                className={selected === item.id ? "selected-row" : undefined}
              >
                <th scope="row">
                  <time dateTime={item.recordedAt}>
                    {formatDate(item.recordedAt)}
                  </time>
                  {reference?.id === item.id ? (
                    <span className="row-reference">Referencia</span>
                  ) : null}
                </th>
                <td className="numeric">
                  {item.value === null ? (
                    "Sin resultado"
                  ) : (
                    <>
                      {numberFormat.format(item.value)}{" "}
                      <span className="unit">{item.unit}</span>
                    </>
                  )}
                </td>
                <td>{item.method}</td>
                <td>
                  {comparison.difference === null ? (
                    <details className="comparison-reason">
                      <summary>No comparable</summary>
                      <p>{comparison.reason}</p>
                    </details>
                  ) : (
                    <span className="numeric">
                      {comparison.difference > 0 ? "+" : ""}
                      {numberFormat.format(comparison.difference)}{" "}
                      <span className="unit">{item.unit}</span>
                    </span>
                  )}
                </td>
                <td>
                  <button
                    className="table-select"
                    type="button"
                    aria-pressed={selected === item.id}
                    aria-label={`Seleccionar evaluación del ${formatDate(item.recordedAt)}`}
                    onClick={() => onSelect(item.id)}
                  >
                    {selected === item.id ? "Seleccionada" : "Seleccionar"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!rows.length ? (
        <p className="empty-state">Sin evaluaciones en este período.</p>
      ) : null}
    </div>
  );
}
