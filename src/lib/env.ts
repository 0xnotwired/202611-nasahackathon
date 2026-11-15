import "server-only";
import { z } from "zod";

const schema = z.object({
  HEALTH_DATA_SOURCE: z.enum(["mock", "api"]).default("mock"),
  HEALTH_API_BASE_URL: z.url().optional(),
}).superRefine((env, context) => {
  if (env.HEALTH_DATA_SOURCE === "api" && !env.HEALTH_API_BASE_URL) {
    context.addIssue({
      code: "custom",
      path: ["HEALTH_API_BASE_URL"],
      message: "El modo api requiere HEALTH_API_BASE_URL.",
    });
  }
});

export function getDataConfig() {
  return schema.parse({
    HEALTH_DATA_SOURCE: process.env.HEALTH_DATA_SOURCE,
    HEALTH_API_BASE_URL: process.env.HEALTH_API_BASE_URL,
  });
}
