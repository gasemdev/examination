import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { getTranslations } from "next-intl/server";

import { AuthProvider } from "@/auth/AuthProvider";
import { routing } from "@/i18n/routing";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<unknown>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { lang } = (await params) as { lang: string };
  if (!routing.locales.includes(lang as "th" | "en")) notFound();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>{children}</AuthProvider>
    </NextIntlClientProvider>
  );
}

export async function generateMetadata({ params }: Pick<LocaleLayoutProps, "params">) {
  const { lang } = (await params) as { lang: string };
  if (!routing.locales.includes(lang as "th" | "en")) notFound();
  const t = await getTranslations({ locale: lang, namespace: "login" });
  return { title: `${t("brand")} | Examio` };
}
