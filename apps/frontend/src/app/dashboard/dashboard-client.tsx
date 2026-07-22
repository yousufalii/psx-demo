"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import Link from "next/link";
import type { PortfoliosResponse } from "@/features/portfolios/portfolio-types";
import { WorkspaceShell } from "@/features/workspace/workspace-shell";
import { apiFetch } from "@/lib/api";

export function DashboardClient() {
  const portfoliosQuery = useQuery({
    queryKey: ["portfolios", { includeArchived: false }],
    queryFn: () => apiFetch<PortfoliosResponse>("/portfolios"),
  });

  return (
    <WorkspaceShell>
      {(user) => {
        const portfolios = portfoliosQuery.data?.portfolios ?? [];
        return (
          <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
            <p className="text-sm font-semibold text-emerald-700">Authenticated workspace</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.035em]">Welcome, {user.name}</h1>
            <p className="mt-3 text-slate-600">
              {portfolios.length
                ? `${portfolios.length} active ${portfolios.length === 1 ? "portfolio is" : "portfolios are"} ready for transactions.`
                : "Create your first portfolio to start tracking cash and PSX transactions."}
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {["Portfolio value", "Cash balance", "Total P&L"].map((label) => (
                <article key={label} className="rounded-2xl border border-slate-900/8 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500">{label}</p>
                  <p className="mt-3 text-2xl font-black">PKR 0.00</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {portfolios.length ? "Transactions module coming next" : "Create a portfolio to begin"}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-900/10 bg-emerald-950 p-6 text-white shadow-lg shadow-emerald-950/10">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-emerald-200">
                    <BriefcaseBusiness className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-bold">{portfolios.length ? "Manage portfolios" : "Create your first portfolio"}</h2>
                    <p className="mt-1 text-sm text-slate-300">Separate strategies, archive old portfolios, and control cash policy.</p>
                  </div>
                </div>
                <Link
                  href="/portfolios"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-emerald-950"
                >
                  Open portfolios <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        );
      }}
    </WorkspaceShell>
  );
}
