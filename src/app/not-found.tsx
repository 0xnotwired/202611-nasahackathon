import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto max-w-3xl space-y-4 p-8"><h1 id="contenido" tabIndex={-1} className="text-2xl font-semibold">Astronauta no encontrado</h1><p>El identificador no corresponde a la tripulación disponible.</p><Link href="/" className="inline-block min-h-11 py-3 text-accent underline">Volver a la tripulación</Link></main>;
}
