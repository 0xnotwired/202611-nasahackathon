import Link from "next/link";
import type { Metadata } from "next";
import { getResearchCase } from "@/features/health-monitoring/data/service";
import { originLabels } from "@/features/health-monitoring/evidence";
import {
  researchCsv,
  researchVariables,
  variableOrder,
} from "@/features/health-monitoring/research-assessment";
import { numberFormat } from "@/features/health-monitoring/mission";
import { ThemeControl } from "@/features/health-monitoring/components/theme-control";
import { DownloadData } from "@/features/health-monitoring/components/download-data";

export const metadata: Metadata = { title: "Casos de investigación | Órbita" };
const technicalNumber = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 3,
});

export default async function ResearchPage({
  searchParams,
}: PageProps<"/investigacion">) {
  const params = await searchParams;
  const projection = await getResearchCase(params.example === "synthetic");
  const assessment = projection?.assessment;
  return (
    <div className="mission-app">
      <header className="mission-header">
        <div className="header-identity">
          <Link className="mission-brand" href="/">
            Órbita
          </Link>
          <span className="application-name">
            Exploración de pruebas aeróbicas
          </span>
        </div>
        <ThemeControl />
      </header>
      <div className="navigation-row">
        <nav className="mission-navigation" aria-label="Contexto de datos">
          <Link href="/">Seguimiento personal</Link>
          <Link href="/investigacion" aria-current="page">
            Investigación
          </Link>
        </nav>
      </div>
      <main className="mission-main research-workspace">
        <div className="page-heading">
          <div>
            <h1 id="contenido" tabIndex={-1}>
              Casos de investigación
            </h1>
            <p>
              Detalle de una prueba y sus etapas. Separado del historial del
              tripulante.
            </p>
          </div>
          <span className="mode-label">
            {assessment
              ? originLabels[assessment.origin]
              : "Fuente real no disponible"}
          </span>
        </div>
        <nav className="research-switch" aria-label="Fuente del caso">
          <Link
            href="/investigacion"
            aria-current={!assessment ? "page" : undefined}
          >
            Disponibilidad de MR080G
          </Link>
          <Link
            href="/investigacion?example=synthetic"
            aria-current={assessment ? "page" : undefined}
          >
            Ejemplo sintético de etapas
          </Link>
        </nav>
        {!projection || !assessment ? (
          <>
            <section
              className="panel source-availability"
              aria-labelledby="source-status"
            >
              <h2 id="source-status">
                MR080G · pendiente de fuente verificable
              </h2>
              <p>
                El análisis de main identifica una prueba de cicloergómetro de
                Campaign 3C, participante contextual 7772, con cuatro etapas y
                ocho variables por etapa. El código y el manifiesto de
                importación no contienen los originales ni restauran el perfil
                local de datos.
              </p>
              <dl className="research-facts">
                <div>
                  <dt>Mediciones reales disponibles aquí</dt>
                  <dd>0 · no se presentan valores de participantes</dd>
                </div>
                <div>
                  <dt>Agrupamiento esperado según el análisis</dt>
                  <dd>1 prueba · 4 etapas · 32 registros fuente</dd>
                </div>
                <div>
                  <dt>Base temporal reportada</dt>
                  <dd>
                    2006-05-07 · precisión de día · calendario y zona sin
                    confirmar
                  </dd>
                </div>
                <div>
                  <dt>Comparación longitudinal</dt>
                  <dd>
                    No habilitada: una prueba y base temporal sin resolver
                  </dd>
                </div>
              </dl>
              <h3>Para habilitar la lectura real</h3>
              <ol>
                <li>
                  Restaurar el original y verificar su hash con el manifiesto
                  del responsable de datos.
                </li>
                <li>
                  Agrupar las cuatro etapas en una prueba, conservando unidades,
                  identidad contextual e IDs fuente.
                </li>
                <li>
                  Acordar la respuesta versionada con backend y validar la
                  proyección antes de mostrarla.
                </li>
              </ol>
              <a
                href="https://doi.org/10.83263/w056-8t76"
                target="_blank"
                rel="noreferrer"
              >
                Referencia del dataset MR080G
              </a>
            </section>
            <p className="eligibility-note">
              El ejemplo sintético permite revisar la interfaz de etapas. Sus
              números son ficticios y no reemplazan la fuente ausente.
            </p>
          </>
        ) : (
          <>
            <section
              className="research-context panel"
              aria-label="Contexto de la prueba"
            >
              <div className="panel-heading inline-heading">
                <div>
                  <h2>Prueba de etapas · ejemplo sintético</h2>
                  <p>{assessment.protocol}</p>
                </div>
                <DownloadData
                  text={researchCsv(projection)}
                  filename="orbita-prueba-etapas-sintetica.csv"
                />
              </div>
              <dl className="research-facts">
                <div>
                  <dt>Participante contextual</dt>
                  <dd>
                    <code>{assessment.subject}</code>
                  </dd>
                </div>
                <div>
                  <dt>Fecha fuente</dt>
                  <dd>
                    {assessment.sourceTime.value} · precisión de día · sin zona
                    horaria
                  </dd>
                </div>
                <div>
                  <dt>Calendario</dt>
                  <dd>
                    Sin confirmar · sin antigüedad UTC ni alineación con misión
                  </dd>
                </div>
                <div>
                  <dt>Fase</dt>
                  <dd>{assessment.phase}</dd>
                </div>
              </dl>
            </section>
            <dl className="measurement-summary">
              <div>
                <dt>Pruebas disponibles</dt>
                <dd className="summary-value">
                  {projection.assessmentCount}
                  <span className="unit">prueba</span>
                </dd>
                <dd className="summary-detail">
                  {projection.stageCount} etapas ·{" "}
                  {projection.sourceRecordCount} registros fuente
                </dd>
              </div>
              <div>
                <dt>VO₂pico relativo reportado · simulado</dt>
                <dd className="summary-value">
                  {projection.peak
                    ? numberFormat.format(projection.peak.value!)
                    : "No disponible"}
                  <span className="unit">{projection.peak?.unit}</span>
                </dd>
                <dd className="summary-detail">
                  Selección explícita de Peak AVG; no máximo calculado
                </dd>
              </div>
              <div>
                <dt>Evolución longitudinal</dt>
                <dd className="summary-value summary-text">No evaluable</dd>
                <dd className="summary-detail">
                  Las cuatro etapas pertenecen a una sola prueba
                </dd>
              </div>
            </dl>
            <section
              className="panel research-stages"
              aria-labelledby="stage-heading"
            >
              <div className="panel-heading">
                <h2 id="stage-heading">Perfil de etapas de una prueba</h2>
                <p>
                  Orden de la fuente, sin eje de tiempo. Peak AVG no tiene una
                  potencia asignada.
                </p>
              </div>
              <div
                className="evaluation-table-region"
                role="region"
                aria-labelledby="stage-caption"
                tabIndex={0}
              >
                <table className="evaluation-table">
                  <caption id="stage-caption">
                    Datos íntegramente sintéticos · 1 prueba, 4 etapas, 32
                    registros · unidades por cantidad
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Etapa fuente</th>
                      {variableOrder.map((key) => (
                        <th scope="col" key={key}>
                          {researchVariables[key].label}
                          <br />
                          <span className="unit">
                            {researchVariables[key].unit}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assessment.stages.map((stage) => (
                      <tr key={stage.id}>
                        <th scope="row">
                          {stage.label}
                          {stage.role === "source_reported_peak" ? (
                            <span className="row-reference">
                              Pico reportado · simulado
                            </span>
                          ) : null}
                        </th>
                        {variableOrder.map((key) => {
                          const r = stage.readings.find(
                            (reading) => reading.variable === key,
                          );
                          return (
                            <td className="numeric" key={key}>
                              {r?.value == null
                                ? "No registrado"
                                : r.unitStatus === "unknown"
                                  ? `${technicalNumber.format(r.value)} · unidad desconocida`
                                  : technicalNumber.format(r.value)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="scale-note">
                FEO₂ es fracción espirada de oxígeno; no es SpO₂. FC corresponde
                a la etapa, no al reposo. RER y VE aportan contexto técnico; no
                califican automáticamente el esfuerzo.
              </p>
            </section>
            <section className="period-reading">
              <div>
                <h2>Condiciones de interpretación</h2>
                {projection.capabilities.reasons.map((reason) => (
                  <p key={reason}>{reason}</p>
                ))}
                <p>
                  Criterio de desempeño no configurado · revisión clínica
                  pendiente. No se determina aptitud, diagnóstico ni
                  tratamiento.
                </p>
              </div>
            </section>
            <section className="panel source-availability">
              <h2>Ficha de procedencia</h2>
              <dl className="research-facts">
                <div>
                  <dt>Fuente</dt>
                  <dd>{assessment.provenance.source}</dd>
                </div>
                <div>
                  <dt>Cita</dt>
                  <dd>{assessment.provenance.citation}</dd>
                </div>
                <div>
                  <dt>Verificación técnica</dt>
                  <dd>
                    Demostración escrita · sin archivo original ni hash de
                    importación
                  </dd>
                </div>
                <div>
                  <dt>Release y perfil</dt>
                  <dd>
                    {assessment.provenance.release} ·{" "}
                    {assessment.provenance.importProfile}
                  </dd>
                </div>
                <div>
                  <dt>Proyección</dt>
                  <dd>{projection.version}</dd>
                </div>
                <div>
                  <dt>Precisión de presentación</dt>
                  <dd>
                    Hasta tres decimales en la tabla y uno en el resumen; no
                    expresan incertidumbre instrumental. El CSV conserva valores
                    originales, IDs, filas, columnas y estados.
                  </dd>
                </div>
              </dl>
              <details className="evidence-details">
                <summary>Identificadores de los registros por etapa</summary>
                {assessment.stages.map((stage) => (
                  <p key={stage.id}>
                    <strong>{stage.label}</strong>
                    <br />
                    {stage.readings.map((r) => r.id).join("; ")}
                  </p>
                ))}
              </details>
            </section>
          </>
        )}
      </main>
      <footer className="mission-footer">
        <p>
          Órbita · prototipo de investigación · sin validación para uso médico u
          operativo
        </p>
      </footer>
    </div>
  );
}
