"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall, useBusy, ErrorBanner, NoticeBanner } from "./client-utils";
import { Button, Input } from "@/components/ui";
import { Icon } from "@/components/icons";

export function CategoryAdder({ existing }: { existing: string[] }) {
  const router = useRouter();
  const { busy, error, notice, run } = useBusy();
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  async function add() {
    await run(() => apiCall("/api/admin/categories", "POST", { name }), {
      notice: `Category "${name.trim()}" added.`,
      onSuccess: () => { setName(""); router.refresh(); },
    });
  }

  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-electric-700">
        <Icon name="chevron-down" className={`h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`} />
        Article categories ({existing.length})
      </button>
      {open ? (
        <div className="mt-3 space-y-3">
          {existing.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {existing.map((c) => (
                <span key={c} className="rounded-full bg-mist-100 px-3 py-1 text-xs font-semibold text-mist-700">{c}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-mist-500">No categories yet — articles can also be uncategorised.</p>
          )}
          <div className="flex max-w-md gap-2.5">
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="New category name" aria-label="New category name" />
            <Button onClick={add} disabled={busy || !name.trim()} variant="outline">
              <Icon name="plus" className="h-4 w-4" /> Add
            </Button>
          </div>
          <ErrorBanner message={error} />
          <NoticeBanner message={notice} />
        </div>
      ) : null}
    </div>
  );
}
