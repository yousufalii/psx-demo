import Link from "next/link";

export function AuthShell({
  title,
  description,
  alternateText,
  alternateHref,
  alternateLabel,
  children,
}: Readonly<{
  title: string;
  description: string;
  alternateText: string;
  alternateHref: string;
  alternateLabel: string;
  children: React.ReactNode;
}>) {
  return (
    <main className="grid min-h-screen bg-slate-100 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden overflow-hidden bg-emerald-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-sm font-black text-emerald-950">PX</span>
          PSX Portfolio
        </Link>
        <div className="max-w-lg">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Investor workspace</p>
          <p className="mt-5 text-4xl font-black leading-tight tracking-[-0.035em]">
            A portfolio should explain its numbers—not just display them.
          </p>
          <p className="mt-5 leading-7 text-emerald-100/70">
            Transactions, average cost, cash, and dated PSX valuations in one traceable ledger.
          </p>
        </div>
        <p className="text-xs text-emerald-100/50">End-of-day market data · PKR portfolios</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 font-bold text-emerald-950 lg:hidden">
            <span className="grid size-9 place-items-center rounded-lg bg-emerald-950 text-xs font-black text-white">PX</span>
            PSX Portfolio
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Secure access</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.035em] text-slate-950">{title}</h1>
          <p className="mt-3 leading-7 text-slate-600">{description}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-7 text-center text-sm text-slate-600">
            {alternateText}{" "}
            <Link href={alternateHref} className="font-bold text-emerald-800 hover:text-emerald-700">
              {alternateLabel}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
