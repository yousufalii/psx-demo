import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Clock3,
  ShieldCheck,
} from "lucide-react";

const productAreas = [
  {
    title: "Portfolio ledger",
    description: "Buy, sell, dividend, fee, and cash entries in one audit trail.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Performance clarity",
    description: "Realized and unrealized P&L with transparent average cost.",
    icon: BarChart3,
  },
  {
    title: "Data you can date",
    description: "Every valuation shows exactly when PSX prices were updated.",
    icon: Clock3,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#effcf7_0,#f7faf9_38%,#eef2f0_100%)] text-slate-950">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="PSX Portfolio home">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-950 text-sm font-black tracking-tight text-white shadow-lg shadow-emerald-950/15">
            PX
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight">PSX Portfolio</span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
              Investor workspace
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-bold text-slate-700 hover:text-emerald-800 sm:inline">Sign in</Link>
          <Link href="/register" className="rounded-xl bg-emerald-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900">Create account</Link>
        </div>
      </nav>

      <section className="mx-auto grid w-full max-w-7xl gap-14 px-6 pb-20 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:pb-28 lg:pt-24">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/65 px-3 py-2 text-xs font-semibold text-emerald-950 shadow-sm backdrop-blur">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Built for a traceable portfolio ledger
          </div>
          <h1 className="text-balance text-5xl font-black leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Know what you own.
            <span className="block text-emerald-800">Know what changed.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-slate-600 sm:text-xl">
            A focused PSX portfolio workspace for transactions, holdings, market
            history, and performance—without pretending end-of-day data is live.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-950 px-5 text-sm font-bold text-white shadow-xl shadow-emerald-950/15 transition hover:bg-emerald-900"
            >
              Create your account <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/api-status"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-900/10 bg-white/70 px-5 text-sm font-bold text-slate-800 shadow-sm backdrop-blur transition hover:bg-white"
            >
              Check API status
            </Link>
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-slate-950 p-7 text-white shadow-2xl shadow-slate-950/20 sm:p-9">
          <div className="absolute -right-24 -top-24 size-64 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              Product baseline
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight">PKR 0.00</p>
            <p className="mt-1 text-sm text-slate-400">Portfolio value before your first transaction</p>

            <div className="mt-10 space-y-3">
              {["Cash balance", "Market value", "Total P&L"].map((label) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                >
                  <span className="text-sm text-slate-300">{label}</span>
                  <span className="font-mono text-sm font-semibold text-white">—</span>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-white/10 pt-5 text-xs leading-5 text-slate-400">
              Latest market timestamp will be visible beside every valuation.
            </div>
          </div>
        </aside>
      </section>

      <section id="foundation" className="border-t border-slate-900/5 bg-white/70">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-6 py-16 md:grid-cols-3 lg:px-10">
          {productAreas.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-2xl border border-slate-900/8 bg-white p-6 shadow-sm">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-lg font-bold tracking-tight">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
