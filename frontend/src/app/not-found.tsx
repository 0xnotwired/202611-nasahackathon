import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto max-w-3xl space-y-4 p-8"><h1 id="content" tabIndex={-1} className="text-2xl font-semibold">Astronaut not found</h1><p>The identifier does not match the available crew.</p><Link href="/" className="inline-block min-h-11 py-3 text-accent underline">Back to the crew</Link></main>;
}
