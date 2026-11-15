"use client";

import Link from "next/link";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import type { Astronaut, MeasurementsResponse } from "../schemas";
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
  measurements: MeasurementsResponse;
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
          <h1 id="contenido" tabIndex={-1}>
            {expanded ? "Evaluaciones aeróbicas" : "Seguimiento aeróbico"}
          </h1>
          <p>
            {expanded
              ? "Registro del período y detalle de cada evaluación."
              : "VO₂pico relativo · pruebas periódicas, sin criterio de desempeño configurado"}
          </p>
        </div>
        <div className="page-actions">
          <Link className="button primary" href={href("seguimiento")}>
            Preparar revisión
          </Link>
          <button
            className="button secondary"
            onClick={exportHistory}
            disabled={!evaluations.length}
          >
            <Download size={16} aria-hidden="true" />
            Exportar período
          </button>
        </div>
      </div>
      <section
        className="history-controls"
        aria-label="Filtros de evaluaciones"
      >
        <div className="period-control">
          <span id="period-label">Período del historial</span>
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
                {period ? `${period} meses` : "Todo"}
              </button>
            ))}
          </div>
        </div>
        <label htmlFor="aerobic-reference">
          Referencia
          <select
            id="aerobic-reference"
            value={context.reference}
            onChange={(event) => onContext({ reference: event.target.value })}
            disabled={!mission.evaluations.length}
          >
            {mission.evaluations.map((item) => (
              <option key={item.id} value={item.id}>
                {formatDate(item.recordedAt)}
                {item.value === null ? " · sin resultado" : ""}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="protocol-group">
          Grupo de cálculo
          <select
            id="protocol-group"
            value={context.group ?? ""}
            onChange={(event) =>
              onContext({ group: event.target.value || undefined })
            }
          >
            <option value="">Todos los protocolos</option>
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
              <span>Fechas efectivas</span>
              <strong>
                {formatDate(evaluations[0].recordedAt)} —{" "}
                {formatDate(evaluations.at(-1)!.recordedAt)}
              </strong>
            </>
          ) : (
            "Sin fechas disponibles"
          )}
          <small>Ventana anclada en la última visita registrada</small>
        </p>
      </section>
      <p className="eligibility-note" role="status">
        {included.length} pruebas en el grupo de cálculo · {excluded} fuera del
        grupo, conservadas en el registro.{" "}
        {groups.length > 1 && !context.group
          ? "Hay protocolos distintos: seleccioná un grupo para describir su evolución."
          : "Solo se comparan resultados con contexto compatible."}
      </p>
      <dl className="measurement-summary">
        <div>
          <dt>Último resultado disponible</dt>
          <dd className="summary-value">
            {latestResult
              ? numberFormat.format(latestResult.value!)
              : "Sin resultado"}
            {latestResult ? (
              <span className="unit">{latestResult.unit}</span>
            ) : null}
          </dd>
          <dd className="summary-detail">
            {latestResult
              ? `${formatTimestamp(latestResult.recordedAt)} · ${ageLabel(latestResult.recordedAt, asOf)}`
              : "Sin resultados en el período"}
          </dd>
          {latestVisit?.value === null ? (
            <dd className="summary-detail">
              Última visita: {formatDate(latestVisit.recordedAt)} · sin
              resultado
            </dd>
          ) : null}
        </div>
        <div>
          <dt>Cambio vs. referencia</dt>
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
              ? `Referencia: ${formatDate(baseline.recordedAt)}`
              : "Sin referencia"}
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
              / {included.length} pruebas
            </span>
          </dd>
          <dd className="summary-detail">
            {included.length - valid.length} pruebas sin resultado
          </dd>
          <dd className="summary-detail">
            Métodos y unidades identificados por visita
          </dd>
        </div>
      </dl>

      <div className="trajectory-layout">
        <section className="trajectory-panel">
          <div className="panel-heading chart-heading">
            <div>
              <h2>Evolución de VO₂pico</h2>
              <p>{unit || "Sin unidad disponible"} · mediciones puntuales</p>
            </div>
            <label className="scale-control" htmlFor="scale-selector">
              Escala vertical
              <select
                id="scale-selector"
                value={context.scale}
                onChange={(event) =>
                  onContext({ scale: event.target.value as ScaleMode })
                }
              >
                <option value="history">Historial completo</option>
                <option value="auto">Ajustar al período</option>
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
                Escala{" "}
                {context.scale === "history"
                  ? "del historial"
                  : "del período y referencia"}
                :{" "}
                <span data-testid="scale-domain">
                  {numberFormat.format(domain.min)}–
                  {numberFormat.format(domain.max)} {unit}
                </span>
                .{" "}
              </>
            ) : null}
            Los trazos se interrumpen ante faltantes o cambios de método.
          </p>
        </section>
        <section
          className="evaluation-inspector"
          aria-labelledby="selected-evaluation-heading"
        >
          <div className="inspector-heading">
            <h2 id="selected-evaluation-heading">Evaluación seleccionada</h2>
            <span>
              {selectedIndex < 0 ? "0" : selectedIndex + 1} /{" "}
              {evaluations.length}
            </span>
          </div>
          <label className="evaluation-select" htmlFor="evaluation-selector">
            Fecha de evaluación
            <select
              id="evaluation-selector"
              value={selected?.id ?? ""}
              onChange={(event) => select(event.target.value)}
              disabled={!evaluations.length}
            >
              {evaluations.map((item) => (
                <option key={item.id} value={item.id}>
                  {formatDate(item.recordedAt)}
                  {item.value === null ? " · sin resultado" : ""}
                </option>
              ))}
            </select>
          </label>
          <div className="selected-result" aria-live="polite">
            <strong>
              {selected?.value == null
                ? "Sin resultado"
                : numberFormat.format(selected.value)}
            </strong>
            {selected?.value != null ? (
              <span className="unit">{selected.unit}</span>
            ) : null}
            <p>
              {selected
                ? formatTimestamp(selected.recordedAt)
                : "Sin evaluación disponible"}
            </p>
          </div>
          <dl className="evaluation-facts">
            <div>
              <dt>Método</dt>
              <dd>{selected?.method ?? "No disponible"}</dd>
            </div>
            <div>
              <dt>Disponibilidad</dt>
              <dd>
                {selected?.value == null
                  ? "Resultado no registrado"
                  : "Resultado disponible"}
              </dd>
            </div>
            <div>
              <dt>Cambio vs. referencia</dt>
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
              aria-label="Evaluación anterior"
              disabled={selectedIndex <= 0}
              onClick={() => select(evaluations[selectedIndex - 1].id)}
            >
              <ChevronLeft size={16} aria-hidden="true" />
              Anterior
            </button>
            <button
              type="button"
              className="button secondary"
              aria-label="Evaluación siguiente"
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
          <h2>Resumen del período</h2>
          <p>
            <strong>
              {trend.slope === null
                ? trend.label
                : `Dirección matemática ${trend.slope > 1e-10 ? "ascendente" : trend.slope < -1e-10 ? "descendente" : "sin cambio neto"}`}
            </strong>
            {endpointComparison.difference !== null && valid.length >= 2
              ? ` · cambio entre extremos disponibles: ${signed(endpointComparison.difference)} ${unit}`
              : ""}{" "}
            · {trend.count} resultados.
          </p>
          <p>
            {trend.slope === null
              ? trend.reason
              : "La relevancia del cambio no está evaluada. La dirección matemática no determina mejoría, estabilidad ni empeoramiento clínico."}
          </p>
          <p>
            Criterio de desempeño: no configurado. Un descenso numérico no
            determina falta de aptitud ni mal desempeño.
          </p>
        </div>
        <details>
          <summary>Detalle del cálculo</summary>
          <p>
            {trend.reason} Los faltantes se excluyen sin completar valores. La
            diferencia entre extremos y el cambio contra la referencia son
            comparaciones distintas.
          </p>
        </details>
      </section>

      <div className="records-layout">
        <section className="records-panel panel">
          <div className="panel-heading inline-heading">
            <div>
              <h2>
                {expanded
                  ? "Registro de evaluaciones"
                  : "Evaluaciones recientes"}
              </h2>
              <p>
                La tabla y el gráfico comparten período, referencia y selección.
              </p>
            </div>
            {!expanded ? (
              <Link className="text-link" href={href("evolucion")}>
                Ver todas las evaluaciones
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
