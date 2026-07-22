import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/auth-shell";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Start with a secure account. Your first portfolio comes next."
      alternateText="Already have an account?"
      alternateHref="/login"
      alternateLabel="Sign in"
    >
      <RegisterForm />
    </AuthShell>
  );
}
