"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  BriefcaseBusiness,
  Pencil,
  Plus,
  RotateCcw,
  Settings2,
} from "lucide-react";
import { useState } from "react";
import { PortfolioForm } from "@/features/portfolios/portfolio-form";
import type {
  Portfolio,
  PortfolioInput,
  PortfolioResponse,
  PortfoliosResponse,
} from "@/features/portfolios/portfolio-types";
import { WorkspaceShell } from "@/features/workspace/workspace-shell";
import { apiFetch } from "@/lib/api";

export function PortfoliosClient() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [editing, setEditing] = useState<Portfolio | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  const portfoliosQuery = useQuery({
    queryKey: ["portfolios", { includeArchived }],
    queryFn: () =>
      apiFetch<PortfoliosResponse>(
        `/portfolios${includeArchived ? "?includeArchived=true" : ""}`,
      ),
  });

  const refreshPortfolios = () =>
    queryClient.invalidateQueries({ queryKey: ["portfolios"] });

  const createPortfolio = useMutation({
    mutationFn: (input: PortfolioInput) =>
      apiFetch<PortfolioResponse>("/portfolios", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: async () => {
      await refreshPortfolios();
      setShowCreate(false);
    },
  });
  const updatePortfolio = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PortfolioInput }) =>
      apiFetch<PortfolioResponse>(`/portfolios/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: async () => {
      await refreshPortfolios();
      setEditing(null);
    },
  });
  const archivePortfolio = useMutation({
    mutationFn: (id: string) =>
      apiFetch<PortfolioResponse>(`/portfolios/${id}/archive`, { method: "POST" }),
    onSuccess: async () => {
      await refreshPortfolios();
      setConfirmArchiveId(null);
    },
  });
  const restorePortfolio = useMutation({
    mutationFn: (id: string) =>
      apiFetch<PortfolioResponse>(`/portfolios/${id}/restore`, { method: "POST" }),
    onSuccess: refreshPortfolios,
  });

  const mutationError = (error: unknown) =>
    error instanceof Error ? error.message : "The request could not be completed";
  const portfolios = portfoliosQuery.data?.portfolios ?? [];
  const activeCount = portfolios.filter((portfolio) => !portfolio.archivedAt).length;

  return (
    <WorkspaceShell>
      {() => (
        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Portfolio management</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.035em]">Your portfolios</h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                Keep investment strategies separate while every portfolio remains in PKR.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreate((value) => !value)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-950 px-5 text-sm font-bold text-white hover:bg-emerald-900"
            >
              <Plus className="size-4" aria-hidden="true" />
              New portfolio
            </button>
          </div>

          {showCreate ? (
            <div className="mt-8 max-w-xl rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-black">Create portfolio</h2>
                <p className="mt-1 text-sm text-slate-500">Transactions and cash will be added next.</p>
              </div>
              <PortfolioForm
                submitLabel="Create portfolio"
                pending={createPortfolio.isPending}
                serverError={createPortfolio.isError ? mutationError(createPortfolio.error) : undefined}
                onCancel={() => setShowCreate(false)}
                onSubmit={async (values) => {
                  await createPortfolio.mutateAsync(values);
                }}
              />
            </div>
          ) : null}

          <div className="mt-10 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-slate-500">
              {activeCount} active {activeCount === 1 ? "portfolio" : "portfolios"}
            </p>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(event) => setIncludeArchived(event.target.checked)}
                className="size-4 accent-emerald-800"
              />
              Show archived
            </label>
          </div>

          {portfoliosQuery.isPending ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[0, 1].map((item) => (
                <div key={item} className="h-48 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : portfoliosQuery.isError ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
              {mutationError(portfoliosQuery.error)}
            </div>
          ) : portfolios.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-800">
                <BriefcaseBusiness className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-xl font-black">No portfolios yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create your first portfolio, then add cash and PSX transactions to build your ledger.
              </p>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-6 rounded-xl bg-emerald-950 px-5 py-3 text-sm font-bold text-white"
              >
                Create first portfolio
              </button>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {portfolios.map((portfolio) => (
                <article
                  key={portfolio.id}
                  className={`rounded-2xl border bg-white p-6 shadow-sm ${
                    portfolio.archivedAt ? "border-slate-200 opacity-75" : "border-slate-900/8"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
                      <BriefcaseBusiness className="size-5" aria-hidden="true" />
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      portfolio.archivedAt
                        ? "bg-slate-100 text-slate-600"
                        : "bg-emerald-50 text-emerald-800"
                    }`}>
                      {portfolio.archivedAt ? "Archived" : "Active"}
                    </span>
                  </div>
                  <h2 className="mt-5 text-xl font-black">{portfolio.name}</h2>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Currency</p>
                      <p className="mt-1 font-bold">{portfolio.baseCurrency}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Transactions</p>
                      <p className="mt-1 font-bold">{portfolio.transactionCount}</p>
                    </div>
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <Settings2 className="size-3.5" aria-hidden="true" />
                    Negative cash {portfolio.allowNegativeCash ? "allowed" : "blocked by default"}
                  </p>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    {portfolio.archivedAt ? (
                      <button
                        type="button"
                        onClick={() => restorePortfolio.mutate(portfolio.id)}
                        disabled={restorePortfolio.isPending}
                        className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 disabled:opacity-60"
                      >
                        <RotateCcw className="size-4" aria-hidden="true" /> Restore
                      </button>
                    ) : confirmArchiveId === portfolio.id ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-semibold text-slate-600">Archive this portfolio?</span>
                        <button
                          type="button"
                          onClick={() => archivePortfolio.mutate(portfolio.id)}
                          disabled={archivePortfolio.isPending}
                          className="text-xs font-bold text-rose-700 disabled:opacity-60"
                        >
                          Confirm archive
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmArchiveId(null)}
                          className="text-xs font-bold text-slate-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-5">
                        <button
                          type="button"
                          onClick={() => setEditing(portfolio)}
                          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700"
                        >
                          <Pencil className="size-4" aria-hidden="true" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmArchiveId(portfolio.id)}
                          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"
                        >
                          <Archive className="size-4" aria-hidden="true" /> Archive
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {restorePortfolio.isError ? (
            <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
              {mutationError(restorePortfolio.error)}
            </p>
          ) : null}

          {editing ? (
            <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-5" role="presentation">
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-portfolio-title"
                className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
              >
                <h2 id="edit-portfolio-title" className="text-xl font-black">Edit portfolio</h2>
                <p className="mb-5 mt-1 text-sm text-slate-500">Update its name and cash policy.</p>
                <PortfolioForm
                  key={editing.id}
                  initialValues={{
                    name: editing.name,
                    allowNegativeCash: editing.allowNegativeCash,
                  }}
                  submitLabel="Save changes"
                  pending={updatePortfolio.isPending}
                  serverError={updatePortfolio.isError ? mutationError(updatePortfolio.error) : undefined}
                  onCancel={() => setEditing(null)}
                  onSubmit={async (input) => {
                    await updatePortfolio.mutateAsync({ id: editing.id, input });
                  }}
                />
              </section>
            </div>
          ) : null}
        </section>
      )}
    </WorkspaceShell>
  );
}
