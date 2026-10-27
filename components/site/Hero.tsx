import Link from "next/link";
import { SERVICES } from "@/lib/constants";
import { Icon } from "@/components/icons";
import { Container } from "@/components/ui";
import { getSettings } from "@/lib/settings";
import { getPricingConfig } from "@/lib/pricing-store";
import { pricingCopy } from "@/lib/pricing-config";

/**
 * Homepage hero — dark engineering aesthetic with a restrained animated
 * schematic visual (pure CSS/SVG, honours prefers-reduced-motion).
 */
export async function Hero() {
  const [settings, pricing] = await Promise.all([getSettings(), getPricingConfig()]);

  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div className="bg-grid absolute inset-0" aria-hidden />
      {/* glow orbs */}
      <div className="animate-float-slow absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-electric-600/20 blur-[130px]" aria-hidden />
      <div className="animate-float absolute bottom-0 right-0 h-80 w-80 rounded-full bg-electric-400/10 blur-[120px]" aria-hidden />

      <Container className="relative grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div>
          <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
          <p className="mb-5 inline-flex items-center gap-2.5 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-electric-200 ring-1 ring-inset ring-white/10">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-slow-pulse rounded-full bg-electric-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-electric-300" />
            </span>
            Technology · Engineering · Repairs · Consultancy
          </p>
          </div>
          <h1 className="animate-fade-up font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]" style={{ animationDelay: "140ms" }}>
            {settings.homeHeroHeadline.split(".").filter(Boolean).map((part, i, arr) => (
              <span key={i} className={i === arr.length - 1 ? "text-gradient animate-gradient-pan" : ""}>
                {part.trim()}.{i < arr.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>
          <p className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-mist-300 sm:text-lg" style={{ animationDelay: "260ms" }}>
            {settings.homeHeroSubtext}
          </p>
          <div className="animate-fade-up mt-9 flex flex-wrap items-center gap-3.5" style={{ animationDelay: "380ms" }}>
            <Link
              href="/start-a-project"
              className="btn-shine inline-flex items-center gap-2 rounded-xl bg-electric-600 px-6 py-3.5 text-base font-semibold text-white shadow-[0_10px_36px_-10px_rgb(37_99_235/0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-electric-500 hover:shadow-glow"
            >
              Start a Project
              <Icon name="arrow-right" className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/solutions"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 text-base font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15"
            >
              Explore Our Solutions
            </Link>
          </div>
          <div className="animate-fade-up mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" style={{ animationDelay: "500ms" }}>
            <Link href="/repairs/request" className="inline-flex items-center gap-2 font-medium text-electric-300 transition-colors hover:text-electric-200">
              <Icon name="tool" className="h-4 w-4" />
              Request a Repair
            </Link>
            <Link href="/pricing" className="inline-flex items-center gap-2 font-medium text-mist-400 transition-colors hover:text-white">
              <Icon name="file-text" className="h-4 w-4" />
              {pricingCopy(pricing, "pricing.homeHeroLinkLabel")}
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 font-medium text-mist-400 transition-colors hover:text-white">
              <Icon name="mail" className="h-4 w-4" />
              Contact us
            </Link>
          </div>
        </div>

        {/* Schematic visual */}
        <div className="relative mx-auto hidden w-full max-w-md lg:block" aria-hidden>
          <div className="animate-float">
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-navy-800/80 to-navy-900/90 p-6 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-electric-500/60" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist-500">fs://core</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { icon: "shield", label: "Security", sub: "assessed" },
                  { icon: "cpu", label: "AI systems", sub: "configured" },
                  { icon: "code", label: "Software", sub: "built" },
                  { icon: "tool", label: "Repairs", sub: "diagnosed" },
                ].map((c, i) => (
                  <div key={c.label} className="animate-pop-in rounded-xl border border-white/8 bg-white/[0.04] p-3.5 transition-colors hover:bg-white/[0.08]" style={{ animationDelay: `${700 + i * 120}ms` }}>
                    <Icon name={c.icon} className="h-5 w-5 text-electric-400" />
                    <p className="mt-2 text-[13px] font-semibold text-white">{c.label}</p>
                    <p className="text-[11px] text-mist-500">{c.sub}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2.5">
                {[86, 64, 92].map((w, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-electric-500/70" />
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                      <div className="bar-fill h-full rounded-full bg-gradient-to-r from-electric-600 to-electric-400" style={{ width: `${w}%`, animationDelay: `${900 + i * 220}ms` }} />
                    </div>
                    <span className="font-mono text-[10px] text-mist-500">{w}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="animate-pop-in absolute -bottom-5 -left-6 rounded-2xl border border-white/10 bg-navy-800/90 px-4 py-3 shadow-card-lg backdrop-blur" style={{ animationDelay: "1200ms" }}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-electric-600/20 text-electric-300 ring-1 ring-inset ring-electric-500/30">
                  <Icon name="check-circle" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-white">Practical solutions</p>
                  <p className="text-[11px] text-mist-500">designed around your needs</p>
                </div>
              </div>
            </div>
            <div className="animate-pop-in absolute -right-5 -top-5 rounded-2xl border border-white/10 bg-navy-800/90 px-4 py-3 shadow-card-lg backdrop-blur" style={{ animationDelay: "1050ms" }}>
              <div className="flex items-center gap-2 font-mono text-[11px] text-electric-300">
                <span className="h-1.5 w-1.5 animate-slow-pulse rounded-full bg-electric-400" />
                engineering.the.future
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* services ticker — real service names from constants, pure CSS loop */}
      <div className="ticker relative border-t border-white/10 py-4" aria-hidden>
        <div className="ticker-track gap-10 whitespace-nowrap">
          {[...SERVICES, ...SERVICES].map((s, i) => (
            <span key={`${s.slug}-${i}`} className="inline-flex items-center gap-3 text-sm font-medium text-mist-400">
              <span className="text-electric-400">✦</span>
              {s.shortName}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
