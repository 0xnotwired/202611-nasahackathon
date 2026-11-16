import type { Evaluation } from "../mission";
import { formatDate, numberFormat } from "../mission";
import { comparisonTo } from "../aerobic";

export function EvaluationHistory({
  evaluations,
  reference,
  selected,
  onSelect,
  full = false,
  group,
}: {
  evaluations: Evaluation[];
  reference?: Evaluation;
  selected: string;
  onSelect: (id: string) => void;
  full?: boolean;
  group?: string;
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
            ? "Assessments of the period"
            : "Recent assessments of the period"}{" "}
          · {rows.length} of {evaluations.length} visits · UTC dates
        </caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Relative peak VO₂</th>
            <th scope="col">Method</th>
            <th scope="col">Change vs. reference</th>
            <th scope="col">Selection</th>
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
                    <span className="row-reference">Reference</span>
                  ) : null}
                </th>
                <td className="numeric">
                  {item.value === null ? (
                    "No result"
                  ) : (
                    <>
                      {numberFormat.format(item.value)}{" "}
                      <span className="unit">{item.unit}</span>
                    </>
                  )}
                </td>
                <td>
                  {item.method}
                  {group && group !== item.method ? (
                    <span className="row-reference">
                      Outside the calculation group
                    </span>
                  ) : null}
                </td>
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
                    aria-label={`Select the assessment of ${formatDate(item.recordedAt)}`}
                    onClick={() => onSelect(item.id)}
                  >
                    {selected === item.id ? "Selected" : "Select"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!rows.length ? (
        <p className="empty-state">No assessments in this period.</p>
      ) : null}
    </div>
  );
}
