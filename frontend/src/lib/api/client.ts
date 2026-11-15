import "server-only";
import type { z } from "zod";

import { ApiError } from "./errors.ts";
export { ApiError } from "./errors.ts";

export async function getJson<T>(
  url: string,
  schema: z.ZodType<T>,
): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new ApiError(response.status);
  return schema.parse(await response.json());
}
