import { Info } from "lucide-react";
import type { DemoMission } from "../mission";
import { compareEvaluations, formatDate, numberFormat } from "../mission";
import type { Astronaut, MeasurementsResponse } from "../schemas";
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
  measurements: MeasurementsResponse;
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
          <h1 id="contenido" tabIndex={-1}>
            Evolución física
          </h1>
          <p>Revisá tus evaluaciones con su fecha, método y unidad.</p>
        </div>
        <span className="badge">Capacidad aeróbica</span>
      </div>
      <div className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Evaluaciones a lo largo del tiempo</h2>
              <p>Escenario individual de demostración</p>
            </div>
          </div>
          <EvaluationChart evaluations={mission.evaluations} />
        </section>
        <section className="panel comparison-panel">
          <h2>Antes de comparar</h2>
          <p>Última evaluación frente a un registro anterior.</p>
          <label htmlFor="reference-evaluation">
            Evaluación de referencia
            <select
              id="reference-evaluation"
              value={reference}
              disabled={mission.evaluations.length < 2}
              onChange={(event) => onReference(event.target.value)}
            >
              {mission.evaluations.length < 2 ? (
                <option value="">Sin referencia</option>
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
                ? "Comparación no disponible"
                : `${numberFormat.format(comparison.difference)} ${latest?.unit}`}
            </strong>
            <p>{comparison.reason}</p>
          </div>
          <small>
            La comparación técnica no equivale a una evaluación clínica.
          </small>
        </section>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Historial de evaluaciones</h2>
            <p>
              Datos ficticios. Las unidades y los métodos del producto final se
              acordarán con la médica.
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
                Evaluaciones aeróbicas de {astronaut.callsign}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Resultado</th>
                  <th scope="col">Método</th>
                  <th scope="col">Respecto a la anterior</th>
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
                          ? "Sin dato"
                          : `${numberFormat.format(evaluation.value)} ${evaluation.unit}`}
                      </td>
                      <td>{evaluation.method}</td>
                      <td>
                        {index === 0
                          ? "Primera evaluación"
                          : result.difference === null
                            ? result.reason
                            : `${numberFormat.format(result.difference)} ${evaluation.unit} · cambio descriptivo`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">
            Todavía no hay evaluaciones para este astronauta.
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
