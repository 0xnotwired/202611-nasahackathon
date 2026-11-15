import { notFound } from "next/navigation";
import { getDataConfig } from "@/lib/env";
import { isScenario } from "@/features/health-monitoring/aerobic";
import {
  getMeasurements,
  getMission,
  listAstronauts,
} from "@/features/health-monitoring/data/service";
import {
  Dashboard,
  type DashboardView,
} from "@/features/health-monitoring/components/dashboard";

const views = new Set(["resumen", "evolucion", "ejercicio", "seguimiento"]);

export default async function Home({ searchParams }: PageProps<"/">) {
  const [params, astronauts] = await Promise.all([
    searchParams,
    listAstronauts(),
  ]);
  const requestedId = params.astronaut;
  const view = params.view ?? "resumen";
  if (typeof view !== "string" || !views.has(view)) notFound();
  if (requestedId !== undefined && typeof requestedId !== "string") notFound();
  const scenario = isScenario(params.scenario) ? params.scenario : "recovery";
  const demoControls = getDataConfig().HEALTH_DATA_SOURCE === "mock";
  const selected =
    requestedId === undefined
      ? astronauts.data[0]
      : astronauts.data.find((astronaut) => astronaut.id === requestedId);
  if (requestedId !== undefined && !selected) notFound();
  if (!selected)
    return (
      <main className="standalone-state">
        <h1 id="contenido" tabIndex={-1}>
          Sin tripulación disponible
        </h1>
        <p>Todavía no hay astronautas para mostrar.</p>
      </main>
    );
  const [measurements, mission] = await Promise.all([
    getMeasurements(selected.id),
    getMission(selected.id, scenario),
  ]);
  if (!measurements || !mission) notFound();
  const reference =
    typeof params.reference === "string" &&
    mission.evaluations.some((evaluation) => evaluation.id === params.reference)
      ? params.reference
      : (mission.evaluations[0]?.id ?? "");
  return (
    <Dashboard
      key={selected.id}
      astronauts={astronauts.data}
      astronaut={selected}
      measurements={measurements}
      mission={mission}
      view={view as DashboardView}
      reference={reference}
      scenario={scenario}
      demoControls={demoControls}
    />
  );
}
