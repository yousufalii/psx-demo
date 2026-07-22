"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type { AuthResponse, AuthUser } from "@/features/auth/auth-types";
import { ApiError, apiFetch } from "@/lib/api";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolios", label: "Portfolios", icon: BriefcaseBusiness },
];

export function WorkspaceShell({
  children,
}: {
  children: (user: AuthUser) => ReactNode;
}) {
  const pathname = usePathname();
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
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 text-sm font-semibold text-slate-500">
        Loading your workspace...
      </main>
    );
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-6 text-center text-sm text-slate-600">
        Unable to load your session.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-900/8 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-950 text-sm font-black text-white">
                PX
              </span>
              <span className="hidden sm:block">
                <span className="block font-bold">PSX Portfolio</span>
                <span className="block text-xs text-slate-500">Investor workspace</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1" aria-label="Workspace navigation">
              {navigation.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold transition ${
                      active
                        ? "bg-emerald-50 text-emerald-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-900/10 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>
      {children(userQuery.data.user)}
    </main>
  );
}
