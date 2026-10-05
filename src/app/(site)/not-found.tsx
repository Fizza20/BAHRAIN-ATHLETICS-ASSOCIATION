import { ButtonLink } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <section className="section-y flex min-h-[60svh] items-center bg-bone">
      <div className="container-x">
        <p className="text-eyebrow text-brand-700">{t("notFound.eyebrow")}</p>
        <h1 className="text-h1 mt-4 text-ink-950">{t("notFound.title")}</h1>
        <p className="mt-4 max-w-lg text-lg text-ink-600">{t("notFound.body")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/">{t("notFound.home")}</ButtonLink>
          <ButtonLink href="/athletes" variant="secondary">{t("notFound.athletes")}</ButtonLink>
          <ButtonLink href="/news" variant="secondary">{t("notFound.news")}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
