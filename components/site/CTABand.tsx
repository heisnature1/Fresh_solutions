import Link from "next/link";

export function CTABand({
  headline = "Have a project in mind?",
  sub = "Tell us about it — we'll scope it with you and give you an honest quote.",
  ctaHref = "/start-a-project",
  ctaLabel = "Start a Project",
}: {
  headline?: string;
  sub?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-navy-950 px-8 py-14 text-center text-white shadow-card-lg">
      <div className="grid-lines absolute inset-0 opacity-40" aria-hidden />
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-electric-600/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-electric-500/15 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-2xl">
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">{headline}</h2>
        <p className="mt-3 text-base leading-relaxed text-mist-300">{sub}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href={ctaHref} className="rounded-xl bg-electric-500 px-7 py-3.5 text-sm font-bold text-white shadow-glow transition-all hover:bg-electric-400">
            {ctaLabel}
          </Link>
          <Link href="/contact" className="rounded-xl bg-white/10 px-7 py-3.5 text-sm font-bold text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/20">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
