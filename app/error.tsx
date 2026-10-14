"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center bg-mist-50 px-4 py-24">
      <Container className="text-center">
        <p className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-amber-600">Something went wrong</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-navy-900">We hit an unexpected problem</h1>
        <p className="mx-auto mt-4 max-w-md text-mist-600">
          This is on our side, not yours. Try again — if it keeps happening, let us know and we'll fix it.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-navy-800"
          >
            Try again
          </button>
          <a href="/" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy-900 ring-1 ring-inset ring-mist-300 transition-colors hover:ring-electric-400">
            Back to home
          </a>
        </div>
      </Container>
    </div>
  );
}
