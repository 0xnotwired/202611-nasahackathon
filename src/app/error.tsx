"use client";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main className="standalone-state">
      <h1 id="contenido" tabIndex={-1} className="text-2xl font-semibold">
        No pudimos cargar las mediciones
      </h1>
      <p role="alert">
        La fuente de datos no está disponible o su respuesta no coincide con el
        formato esperado.
      </p>
      <button type="button" onClick={retry} className="button primary">
        Volver a intentar
      </button>
    </main>
  );
}
