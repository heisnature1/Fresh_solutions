import Link from "next/link";
import { SERVICES } from "@/lib/constants";
import { Icon } from "@/components/icons";
import { Container } from "@/components/ui";
import { getSettings } from "@/lib/settings";
import { getPricingConfig } from "@/lib/pricing-store";
import { pricingCopy } from "@/lib/pricing-config";
import { HomeOrbit } from "@/components/site/HomeOrbit";

export async function Hero() {
  const [settings, pricing] = await Promise.all([getSettings(), getPricingConfig()]);
  return (
    <section className="home-hero" data-parallax-root>
      <div className="home-hero-grid" aria-hidden="true" />
      <div className="home-hero-glow" aria-hidden="true" />
      <Container className="home-hero-layout">
        <div className="home-hero-copy">
          <p className="home-kicker" data-reveal><span /> BUILT FOR WHAT'S NEXT <span className="home-kicker-line" /> FRESH SOLUTIONS</p>
          <h1 data-reveal="slide-left">{settings.homeHeroHeadline}</h1>
          <p className="home-hero-intro" data-reveal>{settings.homeHeroSubtext}</p>
          <div className="home-hero-actions" data-stagger>
            <Link href="/start-a-project" className="home-primary" data-magnetic>Start a project <Icon name="arrow-right" className="h-5 w-5" /></Link>
            <Link href="/solutions" className="home-secondary" data-magnetic>Explore solutions <span>↗</span></Link>
          </div>
          <div className="home-hero-links"><Link href="/repairs/request">Request a repair ↗</Link><Link href="/pricing">{pricingCopy(pricing, "pricing.homeHeroLinkLabel")} ↗</Link></div>
        </div>
        <HomeOrbit />
      </Container>
      <div className="home-ticker" aria-hidden="true"><div className="ticker-track">{[...SERVICES, ...SERVICES].map((s, i) => <span key={`${s.slug}-${i}`}><i>✳</i> {s.shortName}</span>)}</div></div>
    </section>
  );
}
