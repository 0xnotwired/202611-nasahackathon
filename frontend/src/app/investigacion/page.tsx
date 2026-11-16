import Link from "next/link";
import type { Metadata } from "next";
import {
  getHealthDataReader,
  getResearchCase,
} from "@/features/health-monitoring/data/service";
import { originLabels } from "@/features/health-monitoring/evidence";
import {
  researchCsv,
  researchVariables,
  variableOrder,
} from "@/features/health-monitoring/research-assessment";
import { numberFormat } from "@/features/health-monitoring/mission";
import { ThemeControl } from "@/features/health-monitoring/components/theme-control";
import { DownloadData } from "@/features/health-monitoring/components/download-data";

import {
  sourceHref,
  switchSourceHref,
} from "@/features/health-monitoring/data/source-context";
import { DataSourceControl } from "@/features/health-monitoring/components/data-source-control";
import { SourceContent } from "@/features/health-monitoring/components/source-navigation";
import { SourceState } from "@/features/health-monitoring/components/source-state";

export const metadata: Metadata = { title: "Research cases | Órbita" };
const technicalNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
});

export default async function ResearchPage({
  searchParams,
}: PageProps<"/investigacion">) {
  const params = await searchParams;
  const source = getHealthDataReader(params.source);
  if (!source.ok)
    return (
      <SourceState
        mode={source.error.mode}
        code={source.error.code}
        params={params}
        path="/investigacion"
      />
    );
  const mode = source.reader.mode;
  if (mode === "api")
    return (
      <SourceState
        mode={mode}
        code="research_pending"
        params={params}
        path="/investigacion"
      />
    );
  const projection = await getResearchCase(params.example === "synthetic");
  const assessment = projection?.assessment;
  return (
    <div className="mission-app">
      <header className="mission-header">
        <div className="header-identity">
          <Link className="mission-brand" href={sourceHref("/", mode)}>
            Órbita
          </Link>
          <span className="application-name">
            Exploration of aerobic tests
          </span>
        </div>
        <div className="header-controls">
          <DataSourceControl
            mode={mode}
            label={
              assessment
                ? originLabels[assessment.origin]
                : "Data not available"
            }
            targetHref={switchSourceHref("/investigacion", "api", params)}
          />
          <ThemeControl />
        </div>
      </header>
      <div className="navigation-row">
        <nav className="mission-navigation" aria-label="Data context">
          <Link href={sourceHref("/", mode)}>Personal follow-up</Link>
          <Link href={sourceHref("/investigacion", mode)} aria-current="page">
            Research
          </Link>
        </nav>
      </div>
      <SourceContent className="mission-main research-workspace">
        <div className="page-heading">
          <div>
            <h1 id="content" tabIndex={-1}>
              Research cases
            </h1>
            <p>
              Detail of a test and its stages. Separate from the crew
              member&apos;s history.
            </p>
          </div>
          <span className="mode-label">
            {assessment
              ? originLabels[assessment.origin]
              : "Real source not available"}
          </span>
        </div>
        <nav className="research-switch" aria-label="Case source">
          <Link
            href={sourceHref("/investigacion", mode)}
            aria-current={!assessment ? "page" : undefined}
          >
            MR080G availability
          </Link>
          <Link
            href={sourceHref(
              "/investigacion",
              "mock",
              new URLSearchParams({ example: "synthetic" }),
            )}
            aria-current={assessment ? "page" : undefined}
          >
            Synthetic stage example
          </Link>
        </nav>
        {!projection || !assessment ? (
          <>
            <section
              className="panel source-availability"
              aria-labelledby="source-status"
            >
              <h2 id="source-status">
                MR080G · pending a verifiable source
              </h2>
              <p>
                The main analysis identifies a cycle ergometer test of
                Campaign 3C, contextual participant 7772, with four stages and
                eight variables per stage. The import code and the manifest
                do not contain the originals or restore the local data
                profile.
              </p>
              <dl className="research-facts">
                <div>
                  <dt>Real measurements available here</dt>
                  <dd>0 · no participant values are shown</dd>
                </div>
                <div>
                  <dt>Grouping expected by the analysis</dt>
                  <dd>1 test · 4 stages · 32 source records</dd>
                </div>
                <div>
                  <dt>Base temporal reportada</dt>
                  <dd>
                    2006-05-07 · day precision · calendar and zone not
                    confirmed
                  </dd>
                </div>
                <div>
                  <dt>Longitudinal comparison</dt>
                  <dd>
                    Not enabled: one test and an unresolved time basis
                  </dd>
                </div>
              </dl>
              <h3>To enable the real read</h3>
              <ol>
                <li>
                  Restore the original and verify its hash against the manifest
                  of the data owner.
                </li>
                <li>
                  Group the four stages into one test, keeping units,
                  contextual identity and source IDs.
                </li>
                <li>
                  Agree the versioned response with the backend and validate the
                  projection before showing it.
                </li>
              </ol>
              <a
                href="https://doi.org/10.83263/w056-8t76"
                target="_blank"
                rel="noreferrer"
              >
                Reference of the MR080G dataset
              </a>
            </section>
            <p className="eligibility-note">
              The synthetic example lets you review the stage interface. Its
              numbers are fictional and do not replace the missing source.
            </p>
          </>
        ) : (
          <>
            <section
              className="research-context panel"
              aria-label="Test context"
            >
              <div className="panel-heading inline-heading">
                <div>
                  <h2>Staged test · synthetic example</h2>
                  <p>{assessment.protocol}</p>
                </div>
                <DownloadData
                  text={researchCsv(projection)}
                  filename="orbita-staged-test-synthetic.csv"
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
                  <dt>Source date</dt>
                  <dd>
                    {assessment.sourceTime.value} · day precision · no time
                    zone
                  </dd>
                </div>
                <div>
                  <dt>Calendar</dt>
                  <dd>
                    Not confirmed · no UTC age or alignment with the mission
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
                  <span className="unit">test</span>
                </dd>
                <dd className="summary-detail">
                  {projection.stageCount} stages ·{" "}
                  {projection.sourceRecordCount} registros fuente
                </dd>
              </div>
              <div>
                <dt>Reported relative peak VO₂ · simulated</dt>
                <dd className="summary-value">
                  {projection.peak
                    ? numberFormat.format(projection.peak.value!)
                    : "No disponible"}
                  <span className="unit">{projection.peak?.unit}</span>
                </dd>
                <dd className="summary-detail">
                  Explicit selection of Peak AVG; not a calculated maximum
                </dd>
              </div>
              <div>
                <dt>Longitudinal evolution</dt>
                <dd className="summary-value summary-text">Not evaluable</dd>
                <dd className="summary-detail">
                  The four stages belong to a single test
                </dd>
              </div>
            </dl>
            <section
              className="panel research-stages"
              aria-labelledby="stage-heading"
            >
              <div className="panel-heading">
                <h2 id="stage-heading">Stage profile of a test</h2>
                <p>
                  Source order, no time axis. Peak AVG has no assigned
                  power.
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
                    Entirely synthetic data · 1 test, 4 stages, 32
                    records · units per quantity
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Source stage</th>
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
                              Reported peak · simulated
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
                                  ? `${technicalNumber.format(r.value)} · unit unknown`
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
                FEO₂ is the expired fraction of oxygen; it is not SpO₂. HR belongs
                to the stage, not to rest. RER and VE give technical context; they do not
                automatically rate the effort.
              </p>
            </section>
            <section className="period-reading">
              <div>
                <h2>Conditions of interpretation</h2>
                {projection.capabilities.reasons.map((reason) => (
                  <p key={reason}>{reason}</p>
                ))}
                <p>
                  Performance criterion not configured · clinical review
                  pending. No fitness, diagnosis or
                  treatment is determined.
                </p>
              </div>
            </section>
            <section className="panel source-availability">
              <h2>Provenance sheet</h2>
              <dl className="research-facts">
                <div>
                  <dt>Source</dt>
                  <dd>{assessment.provenance.source}</dd>
                </div>
                <div>
                  <dt>Cita</dt>
                  <dd>{assessment.provenance.citation}</dd>
                </div>
                <div>
                  <dt>Technical verification</dt>
                  <dd>
                    Written demonstration · no original file or import
                    hash
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
                  <dt>Projection</dt>
                  <dd>{projection.version}</dd>
                </div>
                <div>
                  <dt>Presentation precision</dt>
                  <dd>
                    Up to three decimals in the table and one in the summary; they do not
                    express instrument uncertainty. The CSV keeps the original values,
                    IDs, rows, columns and states.
                  </dd>
                </div>
              </dl>
              <details className="evidence-details">
                <summary>Record identifiers per stage</summary>
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
      </SourceContent>
      <footer className="mission-footer">
        <p>
          Órbita · research prototype · no validation for medical or
          operational use
        </p>
      </footer>
    </div>
  );
}
