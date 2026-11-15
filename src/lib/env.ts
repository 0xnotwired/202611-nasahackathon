import "server-only";
import { resolveDataSource } from "../features/health-monitoring/data/source-context";

export function getDataSource(requested: string | string[] | undefined) {
  return resolveDataSource(requested, {
    defaultSource: process.env.HEALTH_DATA_SOURCE,
    apiBaseUrl: process.env.HEALTH_API_BASE_URL,
  });
}
