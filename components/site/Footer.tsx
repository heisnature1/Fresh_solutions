import Link from "next/link";
import { SERVICES } from "@/lib/constants";
import { getSettings, whatsappLink } from "@/lib/settings";
import { Icon } from "@/components/icons";
import { Container } from "@/components/ui";

const SOCIAL_META: Record<string, { label: string; icon: string }> = {
  facebook: { label: "Facebook", icon: "users" },
  instagram: { label: "Instagram", icon: "camera" },
  linkedin: { label: "LinkedIn", icon: "briefcase" },
  x: { label: "X (Twitter)", icon: "x" },
  youtube: { label: "YouTube", icon: "eye" },
  tiktok: { label: "TikTok", icon: "sparkles" },
  github: { label: "GitHub", icon: "code" },
};

export async function SiteFooter() {
  const settings = await getSettings();
  const wa = whatsappLink(settings.contactWhatsapp, "Hello Fresh Solutions");
  const year = new Date().getFullYear();
  const socials = Object.entries(settings.social).filter(([, url]) => Boolean(url));

  return (
    <footer className="bg-navy-950 text-mist-300">
      <div className="h-1 bg-gradient-to-r from-electric-600 via-electric-400 to-electric-600" aria-hidden />
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-dark.svg" alt="Fresh Solutions" className="h-11 w-auto" width={178} height={44} />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-mist-400">{settings.companyDescription}</p>
            {socials.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {socials.map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Fresh Solutions on ${SOCIAL_META[name]?.label ?? name}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-mist-300 ring-1 ring-inset ring-white/10 transition-colors hover:bg-electric-600 hover:text-white"
                  >
                    <Icon name={SOCIAL_META[name]?.icon ?? "external"} className="h-[18px] w-[18px]" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <nav aria-label="Solutions">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-mist-400">Solutions</h3>
            <ul className="space-y-2 text-sm">
              {SERVICES.slice(0, 7).map((s) => (
                <li key={s.slug}>
                  <Link href={s.isRepairService ? "/repairs" : `/solutions/${s.slug}`} className="transition-colors hover:text-white">
                    {s.shortName}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/solutions" className="font-semibold text-electric-300 transition-colors hover:text-electric-200">
                  All solutions →
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-mist-400">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/work" className="transition-colors hover:text-white">Our Work</Link></li>
              <li><Link href="/repairs" className="transition-colors hover:text-white">Repair Services</Link></li>
              <li><Link href="/resources" className="transition-colors hover:text-white">Resources</Link></li>
              <li><Link href="/careers" className="transition-colors hover:text-white">Careers</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-white">Contact</Link></li>
              <li><Link href="/start-a-project" className="font-semibold text-electric-300 transition-colors hover:text-electric-200">Start a Project →</Link></li>
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-mist-400">Contact</h3>
            <ul className="space-y-3 text-sm">
              {settings.contactEmail ? (
                <li>
                  <a href={`mailto:${settings.contactEmail}`} className="flex items-start gap-2.5 transition-colors hover:text-white">
                    <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-electric-400" />
                    {settings.contactEmail}
                  </a>
                </li>
              ) : null}
              {settings.contactPhone ? (
                <li>
                  <a href={`tel:${settings.contactPhone.replace(/[^\d+]/g, "")}`} className="flex items-start gap-2.5 transition-colors hover:text-white">
                    <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-electric-400" />
                    {settings.contactPhone}
                  </a>
                </li>
              ) : null}
              {wa ? (
                <li>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 transition-colors hover:text-white">
                    <Icon name="whatsapp" className="mt-0.5 h-4 w-4 shrink-0 text-[#25d366]" />
                    WhatsApp us
                  </a>
                </li>
              ) : null}
              {settings.contactLocation ? (
                <li className="flex items-start gap-2.5">
                  <Icon name="map-pin" className="mt-0.5 h-4 w-4 shrink-0 text-electric-400" />
                  {settings.contactLocation}
                </li>
              ) : null}
              {!settings.contactEmail && !settings.contactPhone && !wa ? (
                <li className="text-mist-500">
                  Contact details are being configured. Please use the{" "}
                  <Link href="/contact" className="text-electric-300 underline underline-offset-2">
                    contact form
                  </Link>
                  .
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-mist-500 sm:flex-row sm:items-center">
          <p>© {year} Fresh Solutions. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link href="/legal/terms" className="transition-colors hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
