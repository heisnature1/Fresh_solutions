"use client";

import { useState } from "react";

export async function apiCall(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
  formData?: FormData,
): Promise<{ ok: boolean; error?: string; data?: Record<string, unknown> }> {
  try {
    const res = await fetch(url, {
      method,
      headers: formData ? undefined : { "Content-Type": "application/json" },
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
    const json = (await res.json().catch(() => null)) as
      | { ok?: boolean; error?: string; [k: string]: unknown }
      | null;
    if (res.ok && json?.ok) {
      const { ok, error, ...rest } = json;
      return { ok: true, data: rest };
    }
    return { ok: false, error: json?.error || `Request failed (${res.status}).` };
  } catch {
    return { ok: false, error: "Network error — please try again." };
  }
}

export function useBusy(): {
  busy: boolean;
  error: string | null;
  notice: string | null;
  run: (fn: () => Promise<{ ok: boolean; error?: string; data?: Record<string, unknown> }>, opts?: {
    onSuccess?: (data?: Record<string, unknown>) => void;
    notice?: string;
  }) => Promise<boolean>;
  setError: (msg: string | null) => void;
  setNotice: (msg: string | null) => void;
} {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = async (
    fn: () => Promise<{ ok: boolean; error?: string; data?: Record<string, unknown> }>,
    opts?: { onSuccess?: (data?: Record<string, unknown>) => void; notice?: string },
  ) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await fn();
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      return false;
    }
    if (opts?.notice) setNotice(opts.notice);
    opts?.onSuccess?.(result.data);
    return true;
  };

  return { busy, error, notice, run, setError, setNotice };
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {message}
    </p>
  );
}

export function NoticeBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
      {message}
    </p>
  );
}
