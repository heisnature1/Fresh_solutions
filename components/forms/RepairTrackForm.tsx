"use client";

import { useState } from "react";
import { Button, FieldError, Input, Label, Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { classNames, formatDateTime } from "@/lib/utils";

interface RepairStatus {
  reference: string;
  status: string;
  statusLabel: string;
  applianceType: string;
  brand: string | null;
  createdAt: string;
  completedAt: string | null;
  history: Array<{ status: string; at: string }>;
}

export function RepairTrackForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [result, setResult] = useState<RepairStatus | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    setResult(null);
    const data = new FormData(e.currentTarget);
    const reference = String(data.get("reference") ?? "").trim().toUpperCase();
    const code = String(data.get("code") ?? "").trim().toUpperCase();
    if (!/^REP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(reference)) {
      setFieldError("Enter the full reference, e.g. REP-XXXX-XXXX-XXXX.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/repairs/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, code }),
      });
      const body = await res.json();
      if (res.ok && body.ok) {
        setResult(body.repair as RepairStatus);
      } else {
        setError(body.error || "Lookup failed. Please try again.");
      }
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="rt-ref" required>Repair reference</Label>
          <Input id="rt-ref" name="reference" required placeholder="REP-XXXX-XXXX-XXXX" maxLength={19} autoComplete="off" className="font-mono uppercase" />
          <FieldError>{fieldError}</FieldError>
        </div>
        <div>
          <Label htmlFor="rt-code" required>Access code</Label>
          <Input id="rt-code" name="code" required placeholder="The code shown after you submitted the request" maxLength={12} autoComplete="off" className="font-mono uppercase" />
          <p className="mt-1.5 text-xs text-mist-500">
            For your privacy, a reference alone is never enough — both are required.
          </p>
        </div>
        {error ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Checking…" : "Check status"}
          <Icon name="search" className="h-4 w-4" />
        </Button>
      </form>

      {result ? (
        <div className="mt-8 rounded-2xl border border-mist-200 bg-white p-6 shadow-card" role="status">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-mist-500">Repair {result.reference}</p>
              <h2 className="mt-1 font-display text-xl font-bold text-navy-900">
                {result.applianceType}
                {result.brand ? ` · ${result.brand}` : ""}
              </h2>
            </div>
            <Badge tone="blue" className="text-sm">{result.statusLabel}</Badge>
          </div>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-mist-500">Received</dt><dd className="font-medium text-navy-900">{formatDateTime(result.createdAt)}</dd></div>
            {result.completedAt ? (
              <div><dt className="text-mist-500">Completed</dt><dd className="font-medium text-navy-900">{formatDateTime(result.completedAt)}</dd></div>
            ) : null}
          </dl>
          {result.history.length > 0 ? (
            <ol className="mt-6 space-y-0 border-l-2 border-mist-200 pl-5">
              {result.history.map((h, i) => (
                <li key={i} className="relative pb-5 last:pb-0">
                  <span className={classNames("absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white", i === result.history.length - 1 ? "bg-electric-600" : "bg-mist-300")} aria-hidden />
                  <p className="text-sm font-semibold text-navy-900">{h.status}</p>
                  <p className="text-xs text-mist-500">{formatDateTime(h.at)}</p>
                </li>
              ))}
            </ol>
          ) : null}
          <p className="mt-5 rounded-xl bg-mist-50 px-4 py-3 text-xs leading-relaxed text-mist-600">
            Questions about this repair? Contact us and quote your reference {result.reference}.
          </p>
        </div>
      ) : null}
    </div>
  );
}
