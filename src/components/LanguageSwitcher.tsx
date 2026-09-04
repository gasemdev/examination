"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function changeLocale(nextLocale: string) {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    const query = searchParams.toString();
    router.replace(`${segments.join("/")}${query ? `?${query}` : ""}`);
  }

  return (
    <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={(event) => changeLocale(event.target.value)}
        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-white outline-none"
      >
        {routing.locales.map((item) => (
          <option key={item} value={item}>{item.toUpperCase()}</option>
        ))}
      </select>
    </label>
  );
}
