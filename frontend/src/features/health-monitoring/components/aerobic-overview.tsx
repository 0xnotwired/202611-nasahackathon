"use client";

import Link from "next/link";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import type { Astronaut } from "../schemas";
import type { MeasurementsView } from "../mission";
import type { DemoMission } from "../mission";
import { formatDate, formatTimestamp, numberFormat } from "../mission";
import {
  comparisonTo,
  describePeriod,
  historyCsv,
  periodEvaluations,
} from "../aerobic";
import {
  ageLabel,
  latestValid,
  scaleDomain,
  type HistoryContext,
  type HistoryPeriod,
  type ScaleMode,
} from "../dashboard-state";
import type { DemoJournal } from "./use-demo-journal";
import { TrajectoryChart } from "./trajectory-chart";
import { EvaluationHistory } from "./evaluation-history";
import { ObservationPanel } from "./observation-panel";
import { MeasurementsPanel } from "./measurements-panel";
import { EvaluationEvidence } from "./evaluation-evidence";

const signed = (value: number) =>
  `${value > 0 ? "+" : ""}${numberFormat.format(value)}`;

export function AerobicOverview({
  astronaut,
  mission,
  journal,
  update,
  measurements,
  context,
  onContext,
  href,
  expanded = false,
  asOf,
  memoryOnly = false,
}: {
  astronaut: Astronaut;
  mission: DemoMission;
  journal: DemoJournal;
  update: (patch: Partial<DemoJournal>) => void;
  measurements: MeasurementsView;
  context: HistoryContext;
  onContext: (patch: Partial<HistoryContext>) => void;
  href: (view: string) => string;
  expanded?: boolean;
  asOf: string;
  memoryOnly?: boolean;
}) {
  const evaluations = periodEvaluations(mission.evaluations, context.period);
  const groups = [...new Set(mission.evaluations.map((item) => item.method))];
  const included = evaluations.filter(
    (item) => !context.group || item.method === context.group,
  );
  const excluded = evaluations.length - included.length;
  const latestVisit = included.at(-1);
  const latestResult = latestValid(included);
  const baseline = mission.evaluations.find(
    (item) => item.id === context.reference,
  );
  const selected =
    evaluations.find((item) => item.id === context.evaluation) ??
    evaluations.at(-1);
  const selectedIndex = evaluations.findIndex(
    (item) => item.id === selected?.id,
  );
  const comparison = comparisonTo(baseline, latestVisit);
  const selectedComparison = comparisonTo(baseline, selected);
  const trend = describePeriod(included);
  const endpointComparison = comparisonTo(
    included.find((item) => item.value !== null),
    latestResult,
  );
  const valid = included.filter((item) => item.value !== null);
  const unit = valid[0]?.unit ?? baseline?.unit ?? "";
  const domain = scaleDomain(
    context.scale === "history"
      ? mission.evaluations.filter(
          (item) => !context.group || item.method === context.group,
        )
      : [
          ...included,
          ...(baseline && (!context.group || baseline.method === context.group)
            ? [baseline]
            : []),
        ],
    unit,
  );
  const select = (id: string) => onContext({ evaluation: id });
  const exportHistory = () => {
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", historyCsv(evaluations)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `orbita-${astronaut.callsign}-${context.period || "todo"}m.csv`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="aerobic-workspace">
      <div className="page-heading">
        <div>
          <h1 id="content" tabIndex={-1}>
            {expanded ? "Aerobic assessments" : "Aerobic follow-up"}
          </h1>
          <p>
            {expanded
              ? "Record of the period and detail of each assessment."
              : "Relative peak VO₂ · periodic tests, no performance criterion configured"}
          </p>
        </div>
        <div className="page-actions">
          <Link className="button primary" href={href("followup")}>
            Prepare review
          </Link>
          <button
            className="button secondary"
            onClick={exportHistory}
            disabled={!evaluations.length}
          >
            <Download size={16} aria-hidden="true" />
            Export period
          </button>
        </div>
      </div>
      <section
        className="history-controls"
        aria-label="Assessment filters"
      >
        <div className="period-control">
          <span id="period-label">History period</span>
          <div
            className="period-buttons"
            role="group"
            aria-labelledby="period-label"
          >
            {([3, 6, 12, 0] as HistoryPeriod[]).map((period) => (
              <button
                key={period}
                type="button"
                aria-pressed={period === context.period}
                onClick={() => onContext({ period, evaluation: "" })}
              >
                {period ? `${period} months` : "All"}
              </button>
            ))}
          </div>
        </div>
        <label htmlFor="aerobic-reference">
          Reference
          <select
            id="aerobic-reference"
            value={context.reference}
            onChange={(event) => onContext({ reference: event.target.value })}
            disabled={!mission.evaluations.length}
          >
            {mission.evaluations.map((item) => (
              <option key={item.id} value={item.id}>
                {formatDate(item.recordedAt)}
                {item.value === null ? " · no result" : ""}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="protocol-group">
          Calculation group
          <select
            id="protocol-group"
            value={context.group ?? ""}
            onChange={(event) =>
              onContext({ group: event.target.value || undefined })
            }
          >
            <option value="">All protocols</option>
            {groups.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </label>
        <p className="effective-period">
          {evaluations.length ? (
            <>
              <span>Effective dates</span>
              <strong>
                {formatDate(evaluations[0].recordedAt)} —{" "}
                {formatDate(evaluations.at(-1)!.recordedAt)}
              </strong>
            </>
          ) : (
            "No dates available"
          )}
          <small>Window anchored to the latest recorded visit</small>
        </p>
      </section>
      <p className="eligibility-note" role="status">
        {included.length} tests in the calculation group · {excluded} outside the
        group, kept in the record.{" "}
        {groups.length > 1 && !context.group
          ? "There are different protocols: select a group to describe its evolution."
          : "Only results with a compatible context are compared."}
      </p>
      <dl className="measurement-summary">
        <div>
          <dt>Latest available result</dt>
          <dd className="summary-value">
            {latestResult
              ? numberFormat.format(latestResult.value!)
              : "No result"}
            {latestResult ? (
              <span className="unit">{latestResult.unit}</span>
            ) : null}
          </dd>
          <dd className="summary-detail">
            {latestResult
              ? `${formatTimestamp(latestResult.recordedAt)} · ${ageLabel(latestResult.recordedAt, asOf)}`
              : "No results in the period"}
          </dd>
          {latestVisit?.value === null ? (
            <dd className="summary-detail">
              Latest visit: {formatDate(latestVisit.recordedAt)} · no
              result
            </dd>
          ) : null}
        </div>
        <div>
          <dt>Change vs. reference</dt>
          <dd
            className={`summary-value ${comparison.difference === null ? "summary-text" : ""}`}
          >
            {comparison.difference === null
              ? "No comparable"
              : signed(comparison.difference)}
            {comparison.difference !== null ? (
              <span className="unit">{latestVisit?.unit}</span>
            ) : null}
          </dd>
          <dd className="summary-detail">
            {baseline
              ? `Reference: ${formatDate(baseline.recordedAt)}`
              : "No reference"}
          </dd>
          {comparison.difference === null ? (
            <dd className="summary-detail">{comparison.reason}</dd>
          ) : null}
        </div>
        <div>
          <dt>Resultados disponibles</dt>
          <dd className="summary-value">
            {valid.length}
            <span className="summary-denominator">
              / {included.length} tests
            </span>
          </dd>
          <dd className="summary-detail">
            {included.length - valid.length} tests without a result
          </dd>
          <dd className="summary-detail">
            Methods and units identified per visit
          </dd>
        </div>
      </dl>

      <div className="trajectory-layout">
        <section className="trajectory-panel">
          <div className="panel-heading chart-heading">
            <div>
              <h2>Evolution of peak VO₂</h2>
              <p>{unit || "No unit available"} · point measurements</p>
            </div>
            <label className="scale-control" htmlFor="scale-selector">
              Vertical scale
              <select
                id="scale-selector"
                value={context.scale}
                onChange={(event) =>
                  onContext({ scale: event.target.value as ScaleMode })
                }
              >
                <option value="history">Full history</option>
                <option value="auto">Fit to the period</option>
              </select>
            </label>
          </div>
          <TrajectoryChart
            evaluations={included}
            selected={selected?.id ?? ""}
            reference={baseline}
            domain={domain}
            methodOrder={[
              ...new Set(mission.evaluations.map((item) => item.method)),
            ]}
            onSelect={select}
          />
          <p className="scale-note">
            {domain ? (
              <>
                Scale{" "}
                {context.scale === "history"
                  ? "of the history"
                  : "of the period and reference"}
                :{" "}
                <span data-testid="scale-domain">
                  {numberFormat.format(domain.min)}–
                  {numberFormat.format(domain.max)} {unit}
                </span>
                .{" "}
              </>
            ) : null}
            The lines break at gaps or changes of method.
          </p>
        </section>
        <section
          className="evaluation-inspector"
          aria-labelledby="selected-evaluation-heading"
        >
          <div className="inspector-heading">
            <h2 id="selected-evaluation-heading">Selected assessment</h2>
            <span>
              {selectedIndex < 0 ? "0" : selectedIndex + 1} /{" "}
              {evaluations.length}
            </span>
          </div>
          <label className="evaluation-select" htmlFor="evaluation-selector">
            Assessment date
            <select
              id="evaluation-selector"
              value={selected?.id ?? ""}
              onChange={(event) => select(event.target.value)}
              disabled={!evaluations.length}
            >
              {evaluations.map((item) => (
                <option key={item.id} value={item.id}>
                  {formatDate(item.recordedAt)}
                  {item.value === null ? " · no result" : ""}
                </option>
              ))}
            </select>
          </label>
          <div className="selected-result" aria-live="polite">
            <strong>
              {selected?.value == null
                ? "No result"
                : numberFormat.format(selected.value)}
            </strong>
            {selected?.value != null ? (
              <span className="unit">{selected.unit}</span>
            ) : null}
            <p>
              {selected
                ? formatTimestamp(selected.recordedAt)
                : "No assessment available"}
            </p>
          </div>
          <dl className="evaluation-facts">
            <div>
              <dt>Method</dt>
              <dd>{selected?.method ?? "No disponible"}</dd>
            </div>
            <div>
              <dt>Disponibilidad</dt>
              <dd>
                {selected?.value == null
                  ? "Result not recorded"
                  : "Result available"}
              </dd>
            </div>
            <div>
              <dt>Change vs. reference</dt>
              <dd>
                {selectedComparison.difference === null
                  ? selectedComparison.reason
                  : `${signed(selectedComparison.difference)} ${selected?.unit}`}
              </dd>
            </div>
            {selected ? (
              <div>
                <dt>Identificador</dt>
                <dd>
                  <code>{selected.id}</code>
                </dd>
              </div>
            ) : null}
          </dl>
          {selected ? <EvaluationEvidence evaluation={selected} /> : null}
          <div className="visit-arrows">
            <button
              type="button"
              className="button secondary"
              aria-label="Previous assessment"
              disabled={selectedIndex <= 0}
              onClick={() => select(evaluations[selectedIndex - 1].id)}
            >
              <ChevronLeft size={16} aria-hidden="true" />
              Anterior
            </button>
            <button
              type="button"
              className="button secondary"
              aria-label="Next assessment"
              disabled={
                selectedIndex < 0 || selectedIndex >= evaluations.length - 1
              }
              onClick={() => select(evaluations[selectedIndex + 1].id)}
            >
              Siguiente
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>

      <section className="period-reading">
        <div>
          <h2>Summary of the period</h2>
          <p>
            <strong>
              {trend.slope === null
                ? trend.label
                : `Mathematical direction: ${trend.slope > 1e-10 ? "ascending" : trend.slope < -1e-10 ? "descending" : "no net change"}`}
            </strong>
            {endpointComparison.difference !== null && valid.length >= 2
              ? ` · change between available endpoints: ${signed(endpointComparison.difference)} ${unit}`
              : ""}{" "}
            · {trend.count} results.
          </p>
          <p>
            {trend.slope === null
              ? trend.reason
              : "The relevance of the change is not assessed. The mathematical direction does not determine clinical improvement, stability or worsening."}
          </p>
          <p>
            Performance criterion: not configured. A numerical decline does not
            determine lack of fitness or poor performance.
          </p>
        </div>
        <details>
          <summary>Calculation detail</summary>
          <p>
            {trend.reason} Missing values are excluded without filling them in. The
            difference between endpoints and the change against the reference are
            different comparisons.
          </p>
        </details>
      </section>

      <div className="records-layout">
        <section className="records-panel panel">
          <div className="panel-heading inline-heading">
            <div>
              <h2>
                {expanded
                  ? "Assessment record"
                  : "Recent assessments"}
              </h2>
              <p>
                The table and the chart share period, reference and selection.
              </p>
            </div>
            {!expanded ? (
              <Link className="text-link" href={href("evolution")}>
                View all assessments
              </Link>
            ) : (
              <span className="count-label">{evaluations.length} visitas</span>
            )}
          </div>
          <EvaluationHistory
            evaluations={evaluations}
            reference={baseline}
            selected={selected?.id ?? ""}
            onSelect={select}
            full={expanded}
            group={context.group}
          />
        </section>
        <ObservationPanel
          key={`${astronaut.id}-${mission.evaluations[0]?.id ?? "empty"}`}
          evaluation={selected}
          evaluations={mission.evaluations}
          journal={journal}
          update={update}
          memoryOnly={memoryOnly}
        />
      </div>
      {expanded ? (
        <details className="additional-measurements">
          <summary>Otros registros disponibles</summary>
          <MeasurementsPanel astronaut={astronaut} response={measurements} />
        </details>
      ) : null}
    </div>
  );
}
