import spec from "../../contracts/openapi.json" with { type: "json" };
import {
  getMeasurements,
  getMission,
  listAstronauts,
} from "./data/provider.ts";

function json(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extraHeaders },
  });
}
function error(status: number, code: string, message: string) {
  return json({ error: { code, message } }, status);
}

// Deliberately small read-only router. It needs neither Next.js nor runtime dependencies.
export function handleRequest(request: Request): Response {
  const path = new URL(request.url).pathname;
  const known =
    path === "/api/v1/health" ||
    path === "/api/v1/openapi.json" ||
    path === "/api/v1/astronauts" ||
    /^\/api\/v1\/astronauts\/[^/]+\/(measurements|mission)$/.test(path);
  if (!known) return error(404, "ROUTE_NOT_FOUND", "Route not found.");
  if (request.method !== "GET" && request.method !== "HEAD") {
    return json(
      {
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: "The initial API is read-only.",
        },
      },
      405,
      { Allow: "GET, HEAD" },
    );
  }
  let result: Response;
  if (path === "/api/v1/health")
    result = json({
      status: "ok",
      service: "orbita-backend",
      contractVersion: "0.2",
    });
  else if (path === "/api/v1/openapi.json") result = json(spec);
  else if (path === "/api/v1/astronauts") result = json(listAstronauts());
  else {
    const match = path.match(
      /^\/api\/v1\/astronauts\/([^/]+)\/(measurements|mission)$/,
    )!;
    let id: string;
    try {
      id = decodeURIComponent(match[1]);
    } catch {
      return error(400, "INVALID_ID", "Invalid identifier.");
    }
    const data =
      match[2] === "measurements" ? getMeasurements(id) : getMission(id);
    result = data
      ? json(data)
      : error(404, "ASTRONAUT_NOT_FOUND", "Astronaut not found.");
  }
  return request.method === "HEAD"
    ? new Response(null, { status: result.status, headers: result.headers })
    : result;
}
