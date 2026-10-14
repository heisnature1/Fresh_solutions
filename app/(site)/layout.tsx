import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { ScrollTop } from "@/components/site/interactive";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-electric-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
