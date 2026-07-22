import Link from "next/link";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export default async function ApiStatusPage() {
  let status: "online" | "offline" = "offline";

  try {
    const response = await fetch(`${apiBaseUrl}/health`, {
      cache: "no-store",
    });
    status = response.ok ? "online" : "offline";
  } catch {
    status = "offline";
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-900/10 bg-white p-8 shadow-xl shadow-slate-900/5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">System status</p>
        <div className="mt-5 flex items-center gap-3">
          <span
            className={`size-3 rounded-full ${status === "online" ? "bg-emerald-500" : "bg-rose-500"}`}
            aria-hidden="true"
          />
          <h1 className="text-2xl font-bold tracking-tight">API is {status}</h1>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Checked against <code className="rounded bg-slate-100 px-1.5 py-1">{apiBaseUrl}</code>.
        </p>
        <Link href="/" className="mt-7 inline-flex text-sm font-bold text-emerald-800 hover:text-emerald-700">
          ← Back to home
        </Link>
      </section>
    </main>
  );
}
