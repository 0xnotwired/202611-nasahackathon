import { createApiServer } from "./server.ts";

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? "4000");
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("PORT debe ser un entero entre 1 y 65535.");
const server = createApiServer();
server.on("error", (error) => {
  console.error(`No se pudo iniciar el backend: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, host, () =>
  console.log(`Órbita backend: http://${host}:${port}/api/v1`),
);
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => server.close());
}
