import "server-only";
import { getJson } from "@/lib/api/client";
import { getDataSource } from "@/lib/env";
import { createReader } from "./reader";
import { getSyntheticResearchCase } from "./research-mock";

export function getHealthDataReader(requested: string | string[] | undefined) {
  const source = getDataSource(requested);
  return source.ok
    ? ({ ok: true, reader: createReader(source.context, getJson) } as const)
    : source;
}

export async function getResearchCase(example: boolean) {
  return example ? getSyntheticResearchCase() : null;
}

export { loadDashboard } from "./reader";
