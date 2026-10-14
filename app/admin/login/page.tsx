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
  searchParams: Promise<{ next?: string }>;
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
          <img src="/brand/logo-dark.svg" alt="Fresh Solutions" className="mx-auto h-12 w-auto" width={194} height={48} />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-mist-500">Business Dashboard</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-navy-900/80 p-8 shadow-card-lg backdrop-blur">
          <h1 className="font-display text-xl font-bold text-white">Administrator sign in</h1>
          <p className="mt-1.5 text-sm text-mist-400">
            Authorised access only. All sign-in attempts are logged and rate-limited.
          </p>
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
