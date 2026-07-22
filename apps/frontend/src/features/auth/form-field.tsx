import type { InputHTMLAttributes } from "react";

export function FormField({
  label,
  error,
  ...inputProps
}: Readonly<
  { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>
>) {
  const errorId = error ? `${inputProps.id}-error` : undefined;

  return (
    <label className="block" htmlFor={inputProps.id}>
      <span className="mb-2 block text-sm font-bold text-slate-800">{label}</span>
      <input
        {...inputProps}
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 aria-invalid:border-rose-500 aria-invalid:focus:ring-rose-500/10"
      />
      {error ? (
        <span id={errorId} className="mt-1.5 block text-sm text-rose-700">
          {error}
        </span>
      ) : null}
    </label>
  );
}
