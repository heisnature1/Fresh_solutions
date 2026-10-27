"use client";

import { Icon } from "@/components/icons";
import { buttonStyles } from "@/components/ui";

/** Small print/save-as-PDF helper for the public pricing guide. */
export function PrintButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={buttonStyles("dark", "md", `print:hidden ${className ?? ""}`)}
    >
      <Icon name="printer" className="h-4 w-4" />
      Print price list
    </button>
  );
}
