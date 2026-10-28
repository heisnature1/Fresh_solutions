import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administrator Sign In",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; passwordChanged?: string }>;
}) {
  const session = await getCurrentAdmin();
  const params = await searchParams;
  if (session) redirect(params.next?.startsWith("/admin") ? params.next : "/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-950 px-5">
      <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/company-logo.png" alt="Fresh Solutions" className="mx-auto h-16 w-auto rounded-lg bg-white px-2 py-1" width={581} height={276} />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-mist-500">Business Dashboard</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-navy-900/80 p-8 shadow-card-lg backdrop-blur">
          <h1 className="font-display text-xl font-bold text-white">Administrator sign in</h1>
          <p className="mt-1.5 text-sm text-mist-400">
            Authorised access only. All sign-in attempts are logged and rate-limited.
          </p>
          {params.passwordChanged === "1" ? <p role="status" className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">Password changed. Sign in with your new password.</p> : null}
          <div className="mt-6">
            <LoginForm next={params.next} />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-mist-500">
          <a href="/" className="transition-colors hover:text-white">← Back to the public website</a>
        </p>
      </div>
    </main>
  );
}
