import { writeFileSync } from "node:fs";
import { buildOpenApi } from "./openapi.ts";

writeFileSync(
  new URL("./openapi.json", import.meta.url),
  JSON.stringify(buildOpenApi(), null, 2) + "\n",
);
console.log("Actualizado contracts/openapi.json");
