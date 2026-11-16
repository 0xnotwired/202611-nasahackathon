import { createServer } from "node:http";
import { handleRequest } from "./app.ts";

export function createApiServer() {
  return createServer(async (request, response) => {
    try {
      const input = new Request(
        new URL(request.url ?? "/", "http://localhost"),
        { method: request.method },
      );
      const result = handleRequest(input);
      response.writeHead(result.status, Object.fromEntries(result.headers));
      response.end(Buffer.from(await result.arrayBuffer()));
    } catch {
      response.writeHead(500, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      response.end(
        JSON.stringify({
          error: {
            code: "INTERNAL_ERROR",
            message: "The request could not be processed.",
          },
        }),
      );
    }
  });
}
