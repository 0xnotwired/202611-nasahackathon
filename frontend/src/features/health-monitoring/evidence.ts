// Presentation evidence, separate from the unchanged HTTP 0.1 contract.
export const projectionVersion = "aerobic-presentation/2";
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
  synthetic: "Synthetic data",
  ground_analog: "Ground analog",
  terrestrial: "Terrestrial study",
  flight: "Flight data",
};

export function evidenceReason(a?: Evidence, b?: Evidence): string | null {
  if (!a && !b) return null; // Legacy demo helpers; service always projects evidence.
  if (!a || !b) return "The provenance context of a test is missing.";
  if (a.verification === "unverified" || b.verification === "unverified")
    return "The response does not allow the identity and the quantity of each test to be verified.";
  if (
    a.subject !== b.subject ||
    a.dataset !== b.dataset ||
    a.origin !== b.origin
  )
    return "The tests belong to different people, studies or origins.";
  if (a.metric !== b.metric || a.role !== b.role)
    return "The quantities or roles of the result are different; a peak and a stage are not compared.";
  if (a.unitStatus !== "known" || b.unitStatus !== "known")
    return "The unit is not confirmed.";
  if (
    a.clock !== "utc" ||
    b.clock !== "utc" ||
    a.calendar !== "original" ||
    b.calendar !== "original" ||
    a.timeScope !== b.timeScope
  )
    return "The time basis does not allow a longitudinal comparison: calendar, zone or scope is not confirmed.";
  if (a.protocol !== b.protocol)
    return "The tests use different protocols.";
  return null;
}
