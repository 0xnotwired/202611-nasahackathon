// Presentation evidence, separate from the unchanged HTTP 0.1 contract.
export const projectionVersion = "aerobic-presentation/1";
export type Evidence = {
  subject: string;
  assessmentId: string;
  metric: "vo2_peak_relative" | "vo2_peak_absolute" | "vo2_stage_relative";
  role: "peak" | "stage";
  origin: "synthetic" | "ground_analog" | "terrestrial" | "flight";
  dataset: string;
  protocol: string;
  unitStatus: "known" | "unknown";
  clock: "utc" | "source_date";
  calendar: "original" | "shifted" | "unknown";
  timeScope: string;
  sourceRecordIds: string[];
  source: string;
  verification: "demo" | "unverified" | "verified_import";
  clinicalReview: "pending";
  derivationVersion: string;
};

export const originLabels: Record<Evidence["origin"], string> = {
  synthetic: "Datos sintéticos",
  ground_analog: "Análogo terrestre",
  terrestrial: "Estudio terrestre",
  flight: "Datos de vuelo",
};

export function evidenceReason(a?: Evidence, b?: Evidence): string | null {
  if (!a && !b) return null; // Legacy demo helpers; service always projects evidence.
  if (!a || !b) return "Falta el contexto de procedencia de una prueba.";
  if (a.verification === "unverified" || b.verification === "unverified")
    return "La respuesta 0.1 no permite verificar la identidad y la cantidad por prueba.";
  if (
    a.subject !== b.subject ||
    a.dataset !== b.dataset ||
    a.origin !== b.origin
  )
    return "Las pruebas pertenecen a personas, estudios u orígenes distintos.";
  if (a.metric !== b.metric || a.role !== b.role)
    return "Las cantidades o papeles del resultado son diferentes; pico y etapa no se comparan.";
  if (a.unitStatus !== "known" || b.unitStatus !== "known")
    return "La unidad no está confirmada.";
  if (
    a.clock !== "utc" ||
    b.clock !== "utc" ||
    a.calendar !== "original" ||
    b.calendar !== "original" ||
    a.timeScope !== b.timeScope
  )
    return "La base temporal no permite una comparación longitudinal: calendario, zona o ámbito sin confirmar.";
  if (a.protocol !== b.protocol)
    return "Las pruebas utilizan protocolos diferentes.";
  return null;
}
