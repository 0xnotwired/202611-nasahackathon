import type { Evaluation } from "../mission";
import { originLabels } from "../evidence";

export function EvaluationEvidence({ evaluation }: { evaluation: Evaluation }) {
  const evidence = evaluation.evidence;
  return (
    <details className="evidence-details">
      <summary>Provenance and limits of this test</summary>
      <dl className="evaluation-facts">
        <div>
          <dt>Quantity</dt>
          <dd>
            Relative peak VO₂ · peak result{" "}
            {evidence?.origin === "synthetic"
              ? "simulated"
              : "without source verification"}
          </dd>
        </div>
        <div>
          <dt>Unrounded value</dt>
          <dd>
            {evaluation.value === null
              ? "No registrado"
              : `${evaluation.value} ${evaluation.unit}`}
          </dd>
        </div>
        <div>
          <dt>Origen</dt>
          <dd>
            {evidence
              ? originLabels[evidence.origin]
              : "No verifiable provenance"}
          </dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{evidence?.source ?? "No disponible"}</dd>
        </div>
        <div>
          <dt>Identidad contextual</dt>
          <dd>
            <code>{evidence?.subject ?? "No verificada"}</code>
          </dd>
        </div>
        <div>
          <dt>Test and source records</dt>
          <dd>
            <code>{evidence?.assessmentId ?? evaluation.id}</code>
            <br />
            {evidence?.sourceRecordIds.join("; ") ??
              "No source identifiers"}
          </dd>
        </div>
        <div>
          <dt>Time basis</dt>
          <dd>
            UTC · second precision ·{" "}
            {evidence?.verification === "demo"
              ? "calendar defined by the scenario"
              : "time and calendar as stated by the record; source context not verified"}
          </dd>
        </div>
        <div>
          <dt>Technical verification</dt>
          <dd>
            {evidence?.verification === "demo"
              ? "Reproducible scenario; no physiological validation"
              : "Provenance of the record is not verified"}
          </dd>
        </div>
        <div>
          <dt>Clinical review</dt>
          <dd>Pending · performance criterion not configured</dd>
        </div>
        <div>
          <dt>Projection</dt>
          <dd>
            <code>{evidence?.derivationVersion ?? "No version"}</code>
          </dd>
        </div>
      </dl>
      <p>
        The presentation rounds to one decimal; that does not express the
        instrument&apos;s uncertainty.
      </p>
    </details>
  );
}
