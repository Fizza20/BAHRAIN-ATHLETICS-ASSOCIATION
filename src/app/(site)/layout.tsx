import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteEffects } from "@/components/site/smooth-scroll";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteEffects />
      <SiteHeader />
      <main id="main" className="relative">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
