import type { Astronaut } from "../schemas";
import type { MeasurementsView } from "../mission";
import { originLabels } from "../evidence";

const timestamp = new Intl.DateTimeFormat("en-US", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" });
const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function MeasurementsPanel({ astronaut, response }: {
  astronaut: Astronaut;
  response: MeasurementsView;
}) {
  const records = response.data.toSorted((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt));
  return (
    <div className="min-w-0 space-y-6">
      <section>
        <p className="eyebrow">{astronaut.mission}</p>
        <h2 className="mt-2 text-2xl font-semibold">Measurements of {astronaut.callsign}</h2>
        <p className="mt-2 text-sm text-muted">Latest record per indicator. All dates are shown in UTC.</p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {response.metrics.map((metric) => {
            const latest = records.find((record) => record.metricCode === metric.code);
            return (
              <div key={metric.code} className="panel">
                <dt className="text-sm text-muted">{metric.label}</dt>
                <dd className="mt-3 text-3xl font-semibold tabular-nums">
                  {latest?.value != null ? <>{number.format(latest.value)} <span className="text-base font-normal text-muted">{metric.unit}</span></> : <span className="text-xl">Not recorded</span>}
                </dd>
                <dd className="mt-3 text-xs text-muted">
                  {latest ? <time dateTime={latest.recordedAt}>{timestamp.format(new Date(latest.recordedAt))} UTC</time> : "No records available"}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>
      <section className="panel">
        <h2 className="text-xl font-semibold">Measurement history</h2>
        {records.length === 0 ? <p className="mt-4 text-muted">This astronaut has no measurements yet. The indicators are shown without data.</p> : (
          <div className="table-wrapper mt-5" tabIndex={0} role="region" aria-labelledby="measurements-caption">
            <table>
              <caption id="measurements-caption" className="pb-4 text-left text-sm text-muted">Records of {astronaut.callsign}, from the most recent to the oldest.</caption>
              <thead><tr><th scope="col">Indicator</th><th scope="col">Value</th><th scope="col">Date (UTC)</th><th scope="col">Origin and method</th></tr></thead>
              <tbody>
                {records.map((record) => {
                  const metric = response.metrics.find((item) => item.code === record.metricCode)!;
                  return (
                    <tr key={record.id}>
                      <th scope="row">{metric.label}</th>
                      <td>{record.value === null ? "Not recorded" : `${number.format(record.value)} ${metric.unit}`}</td>
                      <td><time dateTime={record.recordedAt}>{timestamp.format(new Date(record.recordedAt))}</time></td>
                      <td>{originLabels[record.origin as keyof typeof originLabels]} · {record.method}</td>
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
