"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  FlaskConical,
  Info,
  Layers,
  ScanLine,
} from "lucide-react";
import type { Astronaut, MeasurementsResponse } from "../schemas";
import type { DemoMission } from "../mission";
import { formatDate, numberFormat } from "../mission";
import {
  comparisonTo,
  describePeriod,
  historyCsv,
  periodEvaluations,
} from "../aerobic";
import type { DemoJournal } from "./use-demo-journal";
import { TrajectoryChart } from "./trajectory-chart";
import { MeasurementsPanel } from "./measurements-panel";

const signed = (value: number) =>
  `${value > 0 ? "+" : ""}${numberFormat.format(value)}`;

export function AerobicOverview({
  astronaut,
  mission,
  journal,
  measurements,
  reference,
  onReference,
  href,
  expanded = false,
}: {
  astronaut: Astronaut;
  mission: DemoMission;
  journal: DemoJournal;
  measurements: MeasurementsResponse;
  reference: string;
  onReference: (id: string) => void;
  href: (view: string) => string;
  expanded?: boolean;
}) {
  const [months, setMonths] = useState(12);
  const [selection, setSelection] = useState("");
  const [historyOpen, setHistoryOpen] = useState(expanded);
  const evaluations = periodEvaluations(mission.evaluations, months);
  const current = evaluations.at(-1);
  const baseline = mission.evaluations.find((item) => item.id === reference);
  const selected = evaluations.find((item) => item.id === selection) ?? current;
  const selectedIndex = evaluations.findIndex(
    (item) => item.id === selected?.id,
  );
  const result = comparisonTo(baseline, current);
  const trend = describePeriod(evaluations);
  const valid = evaluations.filter((item) => item.value !== null);
  const completed = mission.sessions.filter(
    (item) => journal.completed[item.id] ?? item.completed,
  );
  const minutes = completed.reduce(
    (total, item) => total + item.durationMinutes,
    0,
  );
  const exportHistory = () => {
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", historyCsv(evaluations)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `orbita-${astronaut.callsign}-${months || "todo"}m.csv`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="aerobic-overview">
      <div className="overview-heading">
        <div>
          <p className="welcome-line">
            Tu espacio de seguimiento, {astronaut.callsign}
          </p>
          <h1 id="contenido" tabIndex={-1}>
            {expanded
              ? "Cada evaluación, en contexto."
              : "Tu capacidad, en perspectiva."}
          </h1>
          <p>Una historia personal de tu evolución aeróbica a bordo.</p>
        </div>
        <button
          className="button secondary export-button"
          onClick={exportHistory}
          disabled={!evaluations.length}
        >
          <Download size={16} aria-hidden="true" />
          Exportar período
        </button>
      </div>

      <section className="mission-ribbon">
        <div className="mission-ribbon-copy">
          <span className="ribbon-label">
            <ScanLine size={15} aria-hidden="true" />
            Seguimiento aeróbico personal
          </span>
          <h2>
            Tu recorrido importa
            <br />
            tanto como el último dato.
          </h2>
          <p>
            Volvé a cada evaluación. Observá los cambios.
            <br className="desktop-break" /> Llegá a tu próxima revisión con más
            contexto.
          </p>
          <Link href={href("seguimiento")}>
            Preparar mi revisión <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="orbital-illustration" aria-hidden="true">
          <svg viewBox="0 0 400 210">
            <defs>
              <radialGradient id="planet-glow">
                <stop stopColor="#3e8091" />
                <stop offset="1" stopColor="#1b3d57" />
              </radialGradient>
              <linearGradient id="orbit-trail">
                <stop stopColor="#54718a" stopOpacity="0" />
                <stop offset="1" stopColor="#a8e8d9" />
              </linearGradient>
            </defs>
            <circle cx="215" cy="105" r="70" fill="url(#planet-glow)" />
            <ellipse
              cx="215"
              cy="105"
              rx="146"
              ry="54"
              transform="rotate(-26 215 105)"
              fill="none"
              stroke="#728da1"
              strokeOpacity=".35"
            />
            <ellipse
              cx="215"
              cy="105"
              rx="107"
              ry="93"
              transform="rotate(-26 215 105)"
              fill="none"
              stroke="#728da1"
              strokeOpacity=".2"
            />
            <path
              d="M88 162 Q164 178 295 68"
              fill="none"
              stroke="url(#orbit-trail)"
              strokeWidth="2"
            />
            <circle cx="294" cy="68" r="6" fill="#b6eee0" />
            <circle
              cx="294"
              cy="68"
              r="13"
              fill="none"
              stroke="#b6eee0"
              strokeOpacity=".3"
            />
            <circle cx="97" cy="43" r="2" fill="#9aacbf" />
            <circle cx="344" cy="158" r="2" fill="#9aacbf" />
            <path
              d="M202 52 Q171 103 226 161 M165 78 Q219 61 268 98 M156 116 Q216 95 278 133"
              fill="none"
              stroke="#78a5ac"
              strokeOpacity=".25"
            />
          </svg>
          <span>Observación → contexto → seguimiento</span>
        </div>
        <div className="ribbon-meta">
          <span className="signal-pill">
            <span />
            Datos simulados
          </span>
          <p>{astronaut.mission}</p>
          <small>Sin interpretación diagnóstica</small>
        </div>
      </section>

      <div className="observation-toolbar">
        <div
          className="period-buttons"
          role="group"
          aria-label="Período del historial"
        >
          {[
            [3, "3 meses"],
            [6, "6 meses"],
            [12, "12 meses"],
            [0, "Todo"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              aria-pressed={months === value}
              onClick={() => {
                setMonths(Number(value));
                setSelection("");
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="period-dates">
          <CalendarDays size={15} aria-hidden="true" />
          {evaluations.length
            ? `${formatDate(evaluations[0].recordedAt)} — ${formatDate(current!.recordedAt)}`
            : "Sin evaluaciones"}
        </span>
      </div>

      <dl className="aerobic-stats">
        <div>
          <dt>
            <Activity size={16} aria-hidden="true" />
            Última visita del período
          </dt>
          <dd>
            {current?.value == null
              ? "Sin dato"
              : numberFormat.format(current.value)}
            <small>{current?.value != null ? current.unit : ""}</small>
          </dd>
          <span>
            {current
              ? formatDate(current.recordedAt)
              : "Sin visitas disponibles"}
          </span>
        </div>
        <div>
          <dt>
            <ArrowUpRight size={16} aria-hidden="true" />
            Cambio vs. referencia
          </dt>
          <dd>
            {result.difference === null
              ? "No comparable"
              : signed(result.difference)}
            <small>{result.difference !== null ? current?.unit : ""}</small>
          </dd>
          <span>
            {baseline
              ? `Referencia: ${formatDate(baseline.recordedAt)}`
              : "Elegí una referencia"}
          </span>
        </div>
        <div>
          <dt>
            <ScanLine size={16} aria-hidden="true" />
            Lectura del período
          </dt>
          <dd className="stat-direction">{trend.label}</dd>
          <span>{trend.count} resultados · dirección descriptiva</span>
        </div>
        <div>
          <dt>
            <Layers size={16} aria-hidden="true" />
            Disponibilidad de resultados
          </dt>
          <dd>
            {valid.length}
            <small>/ {evaluations.length} visitas</small>
          </dd>
          <span>
            {evaluations.length - valid.length
              ? `${evaluations.length - valid.length} visitas sin resultado`
              : "Todas las visitas tienen resultado"}
          </span>
        </div>
      </dl>

      <div className="trajectory-layout">
        <section className="trajectory-panel">
          <div className="trajectory-heading">
            <div>
              <h2>Tu trayectoria aeróbica</h2>
              <p>
                VO₂pico simulado <span>·</span>{" "}
                {current?.unit ?? "Sin unidad disponible"}
              </p>
            </div>
            <span className="soft-tag">Evaluaciones periódicas</span>
          </div>
          <label className="reference-control" htmlFor="aerobic-reference">
            Comparar con
            <select
              id="aerobic-reference"
              value={reference}
              onChange={(event) => onReference(event.target.value)}
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
          <TrajectoryChart
            evaluations={evaluations}
            selected={selected?.id ?? ""}
            reference={baseline}
            onSelect={setSelection}
          />
          <div className="visit-inspector" aria-live="polite">
            <div className="visit-icon">
              <ScanLine size={21} aria-hidden="true" />
            </div>
            <div>
              <span>Evaluación seleccionada</span>
              <strong>
                {selected ? formatDate(selected.recordedAt) : "Sin evaluación"}
              </strong>
              <small>
                {selected?.method ?? "No hay registros para explorar"}
              </small>
            </div>
            <div className="visit-value">
              <strong>
                {selected?.value == null
                  ? "Sin dato"
                  : numberFormat.format(selected.value)}
              </strong>
              <small>
                {selected?.value != null
                  ? selected.unit
                  : "Resultado no registrado"}
              </small>
            </div>
            <div className="visit-arrows">
              <button
                type="button"
                aria-label="Evaluación anterior"
                disabled={selectedIndex <= 0}
                onClick={() => setSelection(evaluations[selectedIndex - 1].id)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Evaluación siguiente"
                disabled={
                  selectedIndex < 0 || selectedIndex >= evaluations.length - 1
                }
                onClick={() => setSelection(evaluations[selectedIndex + 1].id)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>
        <aside className="trajectory-insight">
          <div className="insight-heading">
            <span className="insight-symbol">
              <Activity size={21} aria-hidden="true" />
            </span>
            <span>La lectura de tus datos</span>
          </div>
          <h2>{trend.label}</h2>
          <p>{trend.reason}</p>
          <div className="insight-evidence">
            <span>En este período</span>
            <strong>{trend.count} resultados disponibles</strong>
            <small>
              {evaluations.length - trend.count} visitas sin resultado · sin
              completar valores
            </small>
          </div>
          <div className="insight-reference">
            <span>Respecto de tu referencia</span>
            <p>
              {result.difference === null
                ? result.reason
                : `${signed(result.difference)} ${current?.unit}. ${result.reason}`}
            </p>
          </div>
          <details>
            <summary>Cómo se obtiene esta lectura</summary>
            <p>
              Se ajusta una recta a las fechas reales de los resultados del
              período. Solo se calcula si hay al menos tres resultados con la
              misma unidad y método. No determina estabilidad clínica ni explica
              la causa de los cambios.
            </p>
          </details>
          <Link href={href("seguimiento")}>
            Llevar a mi revisión <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </aside>
      </div>

      <div className="context-grid">
        <section className="activity-context">
          <div>
            <span className="context-symbol">
              <Activity size={20} aria-hidden="true" />
            </span>
            <h2>Actividad que acompaña tu recorrido</h2>
            <p>
              Registro disponible de sesiones. Independiente del período de
              evaluaciones.
            </p>
          </div>
          <div className="activity-totals">
            <strong>
              {minutes}
              <small>min registrados</small>
            </strong>
            <strong>
              {completed.length}
              <small>sesiones completadas</small>
            </strong>
            <Link
              href={href("ejercicio")}
              aria-label="Ver registro de actividad"
            >
              <ArrowUpRight size={22} aria-hidden="true" />
            </Link>
          </div>
          <p className="context-footnote">
            La actividad aporta contexto; no demuestra que haya causado un
            cambio en la capacidad aeróbica.
          </p>
        </section>
        <section className="review-context">
          <span className="context-symbol">
            <CalendarDays size={20} aria-hidden="true" />
          </span>
          <div>
            <h2>Una revisión con perspectiva</h2>
            <p>
              {journal.prepared
                ? "Tu resumen está preparado en este navegador."
                : "Reuní tu historial y las preguntas que querés revisar."}
            </p>
            <Link href={href("seguimiento")}>
              {journal.prepared ? "Ver mi resumen" : "Preparar seguimiento"}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>

      <section className="history-panel">
        <div className="history-heading">
          <div>
            <h2 id="history-title">El registro detrás de la trayectoria</h2>
            <p>
              {evaluations.length} visitas en el período seleccionado. Cada
              resultado conserva su contexto.
            </p>
          </div>
          <button
            className="button secondary"
            onClick={() => setHistoryOpen(!historyOpen)}
            aria-expanded={historyOpen}
            aria-controls="aerobic-history"
          >
            {historyOpen ? "Ocultar historial" : "Explorar historial"}
            <Layers size={16} aria-hidden="true" />
          </button>
        </div>
        <div id="aerobic-history" hidden={!historyOpen}>
          {evaluations.length ? (
            <div
              className="aerobic-table-scroll"
              role="region"
              aria-labelledby="history-title"
              tabIndex={0}
            >
              <table className="aerobic-table">
                <caption className="sr-only">
                  Evaluaciones aeróbicas simuladas del período seleccionado
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Evaluación</th>
                    <th scope="col">VO₂pico simulado</th>
                    <th scope="col">Método</th>
                    <th scope="col">Vs. referencia</th>
                    <th scope="col">Explorar</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.toReversed().map((item) => {
                    const delta = comparisonTo(baseline, item);
                    return (
                      <tr
                        key={item.id}
                        className={
                          item.id === selected?.id ? "selected-row" : ""
                        }
                      >
                        <th scope="row">
                          {formatDate(item.recordedAt)}
                          {item.id === reference ? (
                            <span className="table-reference">Referencia</span>
                          ) : null}
                        </th>
                        <td>
                          {item.value == null ? (
                            <span className="missing-tag">Sin resultado</span>
                          ) : (
                            <>
                              <strong>{numberFormat.format(item.value)}</strong>{" "}
                              <small>{item.unit}</small>
                            </>
                          )}
                        </td>
                        <td>{item.method}</td>
                        <td>
                          {delta.difference === null ? (
                            <details className="comparison-reason">
                              <summary>No comparable</summary>
                              <p>{delta.reason}</p>
                            </details>
                          ) : (
                            <span className="delta-value">
                              {delta.difference > 0 ? (
                                <ArrowUpRight size={14} aria-hidden="true" />
                              ) : delta.difference < 0 ? (
                                <ArrowDownRight size={14} aria-hidden="true" />
                              ) : (
                                <Check size={14} aria-hidden="true" />
                              )}
                              {signed(delta.difference)}
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            className="table-visit-button"
                            aria-label={`Ver visita del ${formatDate(item.recordedAt)}`}
                            onClick={() => setSelection(item.id)}
                            aria-pressed={item.id === selected?.id}
                          >
                            Ver visita
                            <ArrowUpRight size={14} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">
              Todavía no hay evaluaciones para este tripulante.
            </p>
          )}
        </div>
      </section>

      <details className="dataset-disclosure">
        <summary>
          <span>
            <Database size={18} aria-hidden="true" />
            Del dataset a tu historia
          </span>
          <span className="dataset-summary-hint">
            Origen y límites de la demostración
          </span>
        </summary>
        <div className="dataset-content">
          <div>
            <FlaskConical size={22} aria-hidden="true" />
            <h3>Investigación como estructura</h3>
            <p>
              Research aporta el modelo de visitas, métodos y comparaciones
              PRE/POST. MR080G reúne 111 pruebas programadas y 34 de selección;
              no es un historial mensual individual.
            </p>
            <a
              href="https://ntrs.nasa.gov/citations/20140003748"
              target="_blank"
              rel="noreferrer"
            >
              Consultar investigación de NASA{" "}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
          <div>
            <Layers size={22} aria-hidden="true" />
            <h3>Una historia enteramente ficticia</h3>
            <p>
              Los escenarios de demostración usan trece visitas mensuales
              nominales. Valores y protocolos son ilustrativos: no son registros
              de NASA ni una simulación fisiológica validada.
            </p>
          </div>
          <div>
            <Info size={22} aria-hidden="true" />
            <h3>Inferencias con límites visibles</h3>
            <p>
              La dirección describe valores comparables. La unidad del demo no
              resuelve las unidades pendientes del dataset original. La
              relevancia del cambio requiere revisión médica.
            </p>
          </div>
        </div>
      </details>
      {expanded ? (
        <details className="additional-measurements">
          <summary>Otros registros simulados disponibles</summary>
          <MeasurementsPanel astronaut={astronaut} response={measurements} />
        </details>
      ) : null}
      <p className="aerobic-disclaimer">
        <Info size={14} aria-hidden="true" />
        Resultados ficticios y validación médica pendiente. Este panel describe
        observaciones; no realiza diagnósticos.
      </p>
    </div>
  );
}
