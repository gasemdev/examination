import Link from "next/link";

export default function LocaleNotFound() {
  return (
    <main className="app-shell grid min-h-screen place-items-center p-6">
      <div className="app-panel max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Page not found</h1>
        <Link className="mt-5 inline-block text-sm text-[var(--primary-bright)]" href="/th">Back to home</Link>
      </div>
    </main>
  );
}
