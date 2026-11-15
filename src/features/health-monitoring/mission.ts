import type { Evaluation } from "../../../contracts/models.ts";
export type {
  Evaluation,
  ExerciseSession,
  MissionData as DemoMission,
} from "../../../contracts/models.ts";

export function compareEvaluations(
  previous?: Evaluation,
  current?: Evaluation,
) {
  if (!previous || !current)
    return {
      difference: null,
      reason: "Se necesitan dos evaluaciones para comparar.",
    };
  if (previous.value === null || current.value === null)
    return {
      difference: null,
      reason: "Falta el resultado de una evaluación.",
    };
  if (!Number.isFinite(previous.value) || !Number.isFinite(current.value))
    return { difference: null, reason: "Uno de los resultados no es válido." };
  if (previous.unit !== current.unit)
    return {
      difference: null,
      reason: "Las unidades de las evaluaciones son diferentes.",
    };
  if (previous.method !== current.method)
    return {
      difference: null,
      reason:
        "Cambió el método de evaluación. No calculamos una diferencia entre estas pruebas.",
    };
  return {
    difference: current.value - previous.value,
    reason:
      "Misma unidad y método en el escenario simulado. El cambio es descriptivo, sin interpretación clínica.",
  };
}

export const numberFormat = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 1,
});
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatTimestamp(value: string) {
  return (
    new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "UTC",
    }).format(new Date(value)) + " UTC"
  );
}
