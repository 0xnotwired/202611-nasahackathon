import { Info } from "lucide-react";
import type { DemoMission } from "../mission";
import { compareEvaluations, formatDate, numberFormat } from "../mission";
import type { Astronaut } from "../schemas";
import type { MeasurementsView } from "../mission";
import { EvaluationChart } from "./evaluation-chart";
import { MeasurementsPanel } from "./measurements-panel";

export function EvolutionView({
  mission,
  astronaut,
  measurements,
  reference,
  onReference,
}: {
  mission: DemoMission;
  astronaut: Astronaut;
  measurements: MeasurementsView;
  reference: string;
  onReference: (id: string) => void;
}) {
  const latest = mission.evaluations.at(-1);
  const comparison = compareEvaluations(
    mission.evaluations.find((evaluation) => evaluation.id === reference),
    latest,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <h1 id="content" tabIndex={-1}>
            Physical evolution
          </h1>
          <p>Review your assessments with their date, method and unit.</p>
        </div>
        <span className="badge">Aerobic capacity</span>
      </div>
      <div className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Assessments over time</h2>
              <p>Individual demonstration scenario</p>
            </div>
          </div>
          <EvaluationChart evaluations={mission.evaluations} />
        </section>
        <section className="panel comparison-panel">
          <h2>Before comparing</h2>
          <p>Latest assessment against an earlier record.</p>
          <label htmlFor="reference-evaluation">
            Reference assessment
            <select
              id="reference-evaluation"
              value={reference}
              disabled={mission.evaluations.length < 2}
              onChange={(event) => onReference(event.target.value)}
            >
              {mission.evaluations.length < 2 ? (
                <option value="">No reference</option>
              ) : (
                mission.evaluations.slice(0, -1).map((evaluation) => (
                  <option value={evaluation.id} key={evaluation.id}>
                    {formatDate(evaluation.recordedAt)}
                  </option>
                ))
              )}
            </select>
          </label>
          <div className="comparison-result">
            <Info size={22} aria-hidden="true" />
            <strong>
              {comparison.difference === null
                ? "Comparison not available"
                : `${numberFormat.format(comparison.difference)} ${latest?.unit}`}
            </strong>
            <p>{comparison.reason}</p>
          </div>
          <small>
            A technical comparison is not a clinical assessment.
          </small>
        </section>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Assessment history</h2>
            <p>
              Fictional data. The units and methods of the final product will be
              agreed with the physician.
            </p>
          </div>
        </div>
        {mission.evaluations.length ? (
          <div
            className="table-wrapper"
            tabIndex={0}
            role="region"
            aria-labelledby="aerobic-caption"
          >
            <table>
              <caption id="aerobic-caption">
                Aerobic assessments of {astronaut.callsign}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Result</th>
                  <th scope="col">Method</th>
                  <th scope="col">Compared with the previous</th>
                </tr>
              </thead>
              <tbody>
                {mission.evaluations.map((evaluation, index) => {
                  const result = compareEvaluations(
                    mission.evaluations[index - 1],
                    evaluation,
                  );
                  return (
                    <tr key={evaluation.id}>
                      <th scope="row">{formatDate(evaluation.recordedAt)}</th>
                      <td>
                        {evaluation.value === null
                          ? "Not recorded"
                          : `${numberFormat.format(evaluation.value)} ${evaluation.unit}`}
                      </td>
                      <td>{evaluation.method}</td>
                      <td>
                        {index === 0
                          ? "First assessment"
                          : result.difference === null
                            ? result.reason
                            : `${numberFormat.format(result.difference)} ${evaluation.unit} · descriptive change`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">
            There are no assessments for this astronaut yet.
          </p>
        )}
      </section>
      <details className="additional-measurements">
        <summary>Otros registros simulados disponibles</summary>
        <MeasurementsPanel astronaut={astronaut} response={measurements} />
      </details>
    </>
  );
}
