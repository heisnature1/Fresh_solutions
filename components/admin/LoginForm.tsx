"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Icon } from "@/components/icons";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
      });
      const body = await res.json();
      if (res.ok && body.ok) {
        router.replace(next?.startsWith("/admin") ? next : "/admin");
        router.refresh();
        return;
      }
      setError(body.error || "Sign-in failed.");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  const darkInput =
    "w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-electric-400 focus:outline-none focus:ring-2 focus:ring-electric-600/40";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="al-email" className="mb-1.5 block text-sm font-semibold text-mist-200">Email address</label>
        <input id="al-email" name="email" type="email" required autoComplete="username" className={darkInput} placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="al-pass" className="mb-1.5 block text-sm font-semibold text-mist-200">Password</label>
        <div className="relative">
          <input
            id="al-pass"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className={`${darkInput} pr-11`}
            placeholder="••••••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-mist-400 hover:text-white"
          >
            <Icon name="eye" className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
      {error ? (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Signing in…" : "Sign in securely"}
        <Icon name="lock" className="h-4 w-4" />
      </Button>
    </form>
  );
}
