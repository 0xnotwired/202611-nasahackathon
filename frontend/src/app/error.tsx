"use client";
import Link from "next/link";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main className="standalone-state">
      <h1 id="content" tabIndex={-1} className="text-2xl font-semibold">
        We could not load the measurements
      </h1>
      <p role="alert">
        The data source is not available or its response does not match the
        expected format.
      </p>
      <button type="button" onClick={retry} className="button primary">
        Try again
      </button>
      <Link className="button secondary" href="/?source=mock">
        Use local simulation
      </Link>
    </main>
  );
}
