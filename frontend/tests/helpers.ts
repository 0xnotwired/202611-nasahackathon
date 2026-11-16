import { getMockMission } from "../src/features/health-monitoring/data/mission-mock.ts";
import { projectMission } from "../src/features/health-monitoring/data/mission-projection.ts";

// The mock mission as the screens receive it: records and tasks projected into evaluations and sessions.
export const meta = {
  contractVersion: "0.2",
  dataKind: "synthetic",
  clinicalValidation: "pending",
} as const;
export const mission = (
  id: string,
  scenario?: Parameters<typeof getMockMission>[1],
) => projectMission(getMockMission(id, scenario), id, "mock", meta);
