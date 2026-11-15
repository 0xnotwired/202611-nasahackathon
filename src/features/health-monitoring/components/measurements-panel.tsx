import type { Astronaut, MeasurementsResponse } from "../schemas";

const timestamp = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" });
const number = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });
const sources = { simulator: "Simulador", sensor: "Sensor", manual: "Manual" };

export function MeasurementsPanel({ astronaut, response }: {
  astronaut: Astronaut;
  response: MeasurementsResponse;
}) {
  const records = response.data.toSorted((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt));
  return (
    <div className="min-w-0 space-y-6">
      <section>
        <p className="eyebrow">{astronaut.mission}</p>
        <h2 className="mt-2 text-2xl font-semibold">Mediciones de {astronaut.callsign}</h2>
        <p className="mt-2 text-sm text-muted">Último registro por indicador. Todas las fechas se muestran en UTC.</p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {response.metrics.map((metric) => {
            const latest = records.find((record) => record.metricCode === metric.code);
            return (
              <div key={metric.code} className="panel">
                <dt className="text-sm text-muted">{metric.label}</dt>
                <dd className="mt-3 text-3xl font-semibold tabular-nums">
                  {latest?.value != null ? <>{number.format(latest.value)} <span className="text-base font-normal text-muted">{metric.unit}</span></> : <span className="text-xl">Sin dato</span>}
                </dd>
                <dd className="mt-3 text-xs text-muted">
                  {latest ? <time dateTime={latest.recordedAt}>{timestamp.format(new Date(latest.recordedAt))} UTC</time> : "Sin registros disponibles"}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>
      <section className="panel">
        <h2 className="text-xl font-semibold">Historial de mediciones</h2>
        {records.length === 0 ? <p className="mt-4 text-muted">Este astronauta aún no tiene mediciones. Los indicadores se muestran sin datos.</p> : (
          <div className="table-wrapper mt-5" tabIndex={0} role="region" aria-labelledby="measurements-caption">
            <table>
              <caption id="measurements-caption" className="pb-4 text-left text-sm text-muted">Registros de {astronaut.callsign}, del más reciente al más antiguo.</caption>
              <thead><tr><th scope="col">Indicador</th><th scope="col">Valor</th><th scope="col">Fecha (UTC)</th><th scope="col">Origen</th></tr></thead>
              <tbody>
                {records.map((record) => {
                  const metric = response.metrics.find((item) => item.code === record.metricCode)!;
                  return (
                    <tr key={record.id}>
                      <th scope="row">{metric.label}</th>
                      <td>{record.value === null ? "Sin dato" : `${number.format(record.value)} ${metric.unit}`}</td>
                      <td><time dateTime={record.recordedAt}>{timestamp.format(new Date(record.recordedAt))}</time></td>
                      <td>{sources[record.source]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
