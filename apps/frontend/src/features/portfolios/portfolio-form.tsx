"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { PortfolioInput } from "./portfolio-types";

const portfolioSchema = z.object({
  name: z.string().trim().min(2, "Use at least 2 characters").max(80),
  allowNegativeCash: z.boolean(),
});

type PortfolioValues = z.infer<typeof portfolioSchema>;

export function PortfolioForm({
  initialValues = { name: "", allowNegativeCash: false },
  submitLabel,
  pending,
  serverError,
  onSubmit,
  onCancel,
}: {
  initialValues?: PortfolioInput;
  submitLabel: string;
  pending: boolean;
  serverError?: string;
  onSubmit: (values: PortfolioInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PortfolioValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="portfolio-name" className="text-sm font-bold text-slate-800">
          Portfolio name
        </label>
        <input
          id="portfolio-name"
          type="text"
          autoComplete="off"
          placeholder="e.g. Long-term investments"
          className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
          {...register("name")}
        />
        {errors.name?.message ? (
          <p className="mt-2 text-sm text-rose-700" role="alert">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-emerald-800"
          {...register("allowNegativeCash")}
        />
        <span>
          <span className="block text-sm font-bold text-slate-800">Allow negative cash</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            Buys may take cash below zero. Transaction entry will still show a warning.
          </span>
        </span>
      </label>

      {serverError ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {serverError}
        </p>
      ) : null}

      <div className="flex justify-end gap-3">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-xl bg-emerald-950 px-5 text-sm font-bold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
