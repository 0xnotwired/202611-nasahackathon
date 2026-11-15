import {
  projectResearchAssessment,
  variableOrder,
} from "../research-assessment.ts";

// Entirely authored values: this is NOT the C3C/7772 MR080G participant.
// Relative VO2 and RER are arithmetically consistent with a fictional 75 kg
// mass and VCO2/VO2; no physiological calibration or clinical effort rule.
export function getSyntheticResearchCase() {
  const stageValues = [
    [16, 1.2, 0.96, 98, 0.8, 30, 18, 3],
    [24, 1.8, 1.62, 121, 0.9, 45, 17.8, 3.5],
    [32, 2.4, 2.4, 143, 1, 65, 17.5, 3.8],
    [40, 3, 3.15, 162, 1.05, 90, 17, 4],
  ];
  return projectResearchAssessment({
    id: "orbita:stage-demo:1:test-01",
    subject: "orbita:stage-demo:1:participant-01",
    dataset: "orbita:stage-demo:1",
    origin: "synthetic",
    protocol: "Cicloergómetro · prueba de etapas ficticia",
    phase: "Fase ilustrativa; sin asignación a misión real",
    sourceTime: {
      value: "2026-01-15",
      raw: "01/15/2026",
      precision: "date",
      timezone: null,
      calendar: "unknown",
      scope: "orbita:stage-demo:1:participant-01",
    },
    provenance: {
      source:
        "Valores escritos para probar la interfaz de Órbita; no son registros NASA.",
      citation:
        "Ejemplo sintético de Órbita, versión 1. Estructura inspirada en las etapas descritas en el análisis MR080G.",
      fileSha256: null,
      importProfile: "orbita-authored-stages/1",
      release: "demo-1",
      verification: "demo",
      clinicalReview: "pending",
    },
    stages: ["50 Watt Av.", "75 Watt Av.", "100 Watt Av.", "Peak AVG"].map(
      (label, index) => ({
        id: `stage-${index}`,
        label,
        role: index === 3 ? "source_reported_peak" : "stage",
        readings: variableOrder.map((variable, column) => ({
          id: `orbita:stage-demo:1:row-${index}:col-${column}`,
          variable,
          state: "recorded",
          value: stageValues[index][column],
          unit: ["mL/kg/min", "L/min", "L/min", "bpm", "1", "L/min", "%", "%"][
            column
          ],
          unitStatus: "known",
          sourceRow: `demo-${index + 1}`,
          sourceColumn: variable,
        })),
      }),
    ),
  });
}
