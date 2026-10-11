import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteEffects } from "@/components/site/smooth-scroll";
import { getDemoDisplay } from "@/lib/queries";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const demo = await getDemoDisplay();
  return (
    <div data-demo-badges={demo.badges ? "on" : "off"} className="contents">
      <SiteEffects />
      <SiteHeader />
      <main id="main" className="relative">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
