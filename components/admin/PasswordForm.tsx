"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiCall, useBusy, ErrorBanner, NoticeBanner } from "./client-utils";
import { Button, Input, Label } from "@/components/ui";

export function PasswordForm() {
  const router = useRouter();
  const { busy, error, notice, run, setNotice } = useBusy();
  const [f, setF] = useState({ current: "", next: "", confirm: "" });

  async function change() {
    await run(
      () =>
        apiCall("/api/admin/account/password", "POST", {
          currentPassword: f.current,
          newPassword: f.next,
        }),
      {
        onSuccess: (data) => {
          setNotice(typeof data?.message === "string" ? data.message : "Password changed.");
          setF({ current: "", next: "", confirm: "" });
        },
      },
    );
  }

  const valid = f.next.length >= 12 && f.next === f.confirm && f.current.length > 0;

  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-card sm:p-6">
      <h2 className="mb-4 font-display text-base font-bold text-navy-900">Change password</h2>
      <div className="space-y-4">
        <div><Label htmlFor="pw-cur" required>Current password</Label><Input id="pw-cur" type="password" autoComplete="current-password" value={f.current} onChange={(e) => setF((p) => ({ ...p, current: e.target.value }))} /></div>
        <div><Label htmlFor="pw-new" required>New password <span className="font-normal text-mist-500">(min 12 characters)</span></Label><Input id="pw-new" type="password" autoComplete="new-password" value={f.next} onChange={(e) => setF((p) => ({ ...p, next: e.target.value }))} /></div>
        <div><Label htmlFor="pw-conf" required>Confirm new password</Label><Input id="pw-conf" type="password" autoComplete="new-password" value={f.confirm} onChange={(e) => setF((p) => ({ ...p, confirm: e.target.value }))} /></div>
        {f.next && f.confirm && f.next !== f.confirm ? <p className="text-sm text-red-600">Passwords do not match.</p> : null}
        <div className="space-y-3 pt-2">
          <ErrorBanner message={error} />
          <NoticeBanner message={notice} />
          <Button onClick={change} disabled={busy || !valid}>{busy ? "Changing…" : "Change password"}</Button>
        </div>
        <p className="text-xs text-mist-500">Attempts are rate-limited. After changing, existing sessions in other browsers stay valid until signed out — the session list is small (single owner).</p>
      </div>
    </div>
  );
}
