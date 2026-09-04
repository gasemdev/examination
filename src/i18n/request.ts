import { getRequestConfig } from "next-intl/server";

import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale: "th" | "en" = routing.locales.includes(
    requestedLocale as "th" | "en"
  )
    ? (requestedLocale as "th" | "en")
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`@/core/dictionary/${locale}.json`)).default,
  };
});
