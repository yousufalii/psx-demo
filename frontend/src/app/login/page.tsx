import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/auth-shell";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to review your PSX portfolios and transaction ledger."
      alternateText="New to PSX Portfolio?"
      alternateHref="/register"
      alternateLabel="Create an account"
    >
      <LoginForm />
    </AuthShell>
  );
}
