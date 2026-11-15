import type { Evaluation } from "../mission";
import { originLabels } from "../evidence";

export function EvaluationEvidence({ evaluation }: { evaluation: Evaluation }) {
  const evidence = evaluation.evidence;
  return (
    <details className="evidence-details">
      <summary>Procedencia y límites de esta prueba</summary>
      <dl className="evaluation-facts">
        <div>
          <dt>Cantidad</dt>
          <dd>
            VO₂pico relativo · resultado de pico{" "}
            {evidence?.origin === "synthetic"
              ? "simulado"
              : "sin verificación de fuente"}
          </dd>
        </div>
        <div>
          <dt>Valor sin redondeo</dt>
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
              : "Sin procedencia verificable"}
          </dd>
        </div>
        <div>
          <dt>Fuente</dt>
          <dd>{evidence?.source ?? "No disponible"}</dd>
        </div>
        <div>
          <dt>Identidad contextual</dt>
          <dd>
            <code>{evidence?.subject ?? "No verificada"}</code>
          </dd>
        </div>
        <div>
          <dt>Prueba y registros fuente</dt>
          <dd>
            <code>{evidence?.assessmentId ?? evaluation.id}</code>
            <br />
            {evidence?.sourceRecordIds.join("; ") ??
              "Sin identificadores fuente"}
          </dd>
        </div>
        <div>
          <dt>Base temporal</dt>
          <dd>
            UTC · precisión de segundo ·{" "}
            {evidence?.verification === "demo"
              ? "calendario definido por el escenario"
              : "fecha del contrato 0.1; contexto de origen sin verificar"}
          </dd>
        </div>
        <div>
          <dt>Verificación técnica</dt>
          <dd>
            {evidence?.verification === "demo"
              ? "Escenario reproducible; sin validación fisiológica"
              : "Procedencia por prueba no verificable en la API 0.1"}
          </dd>
        </div>
        <div>
          <dt>Revisión clínica</dt>
          <dd>Pendiente · criterio de desempeño no configurado</dd>
        </div>
        <div>
          <dt>Proyección</dt>
          <dd>
            <code>{evidence?.derivationVersion ?? "Sin versión"}</code>
          </dd>
        </div>
      </dl>
      <p>
        La presentación redondea a un decimal; eso no expresa la incertidumbre
        del instrumento.
      </p>
    </details>
  );
}
