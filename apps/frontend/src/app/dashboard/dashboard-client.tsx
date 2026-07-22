"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import type { AuthResponse } from "@/features/auth/auth-types";

export function DashboardClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiFetch<AuthResponse>("/auth/me"),
    retry: false,
  });
  const logout = useMutation({
    mutationFn: () => apiFetch<void>("/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
  });

  useEffect(() => {
    if (userQuery.error instanceof ApiError && userQuery.error.status === 401) {
      router.replace("/login");
    }
  }, [router, userQuery.error]);

  if (userQuery.isPending) {
    return <main className="grid min-h-screen place-items-center bg-slate-100 text-sm font-semibold text-slate-500">Loading your workspace…</main>;
  }

  if (userQuery.isError || !userQuery.data) {
    return <main className="grid min-h-screen place-items-center bg-slate-100 px-6 text-center text-sm text-slate-600">Unable to load your session.</main>;
  }

  const { user } = userQuery.data;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-900/8 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-950 text-sm font-black text-white">PX</span>
            <div>
              <p className="font-bold">PSX Portfolio</p>
              <p className="text-xs text-slate-500">Investor workspace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-900/10 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <p className="text-sm font-semibold text-emerald-700">Authenticated workspace</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.035em]">Welcome, {user.name}</h1>
        <p className="mt-3 text-slate-600">Your account foundation is ready. Portfolio creation is the next module.</p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {["Portfolio value", "Cash balance", "Total P&L"].map((label) => (
            <article key={label} className="rounded-2xl border border-slate-900/8 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <p className="mt-3 text-2xl font-black">PKR 0.00</p>
              <p className="mt-2 text-xs text-slate-400">Create a portfolio to begin</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
