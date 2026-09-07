"use client";

import { useLocale, useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { UserMenu } from "@/components/layout/UserMenu";
import { BrandMark } from "@/components/ui/BrandMark";
import { ThemeToggle } from "@/components/ThemeToggle";

export function DashboardHeader() {
  const locale = useLocale();
  const t = useTranslations("dashboard");

  return (
    <header className="app-header">
      <div className="mx-auto flex w-full max-w-[1225px] items-center justify-between px-5 py-4 md:px-8">
        <BrandMark href={`/${locale}`} />
        <nav className="hidden items-center gap-7 text-sm text-[var(--muted)] sm:flex">
          <a className="text-white" href="#overview">{t("overview")}</a>
          <a href="#exams" className="transition-colors hover:text-white">{t("exams")}</a>
          <a href="#activity" className="transition-colors hover:text-white">{t("activity")}</a>
        </nav>
        <div className="flex items-center gap-3"><LanguageSwitcher /><ThemeToggle /><UserMenu /></div>
      </div>
    </header>
  );
}
