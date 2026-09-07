"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function DashboardHero({ name }: { name: string | null }) {
  const t = useTranslations("dashboard");
  return (
    <section id="overview" className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
      <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-[rgba(126,114,255,0.5)] bg-[linear-gradient(135deg,var(--hero-start)_0%,var(--hero-middle)_42%,var(--hero-end)_100%)] p-7 shadow-[0_18px_45px_rgba(0,0,0,0.22)] md:p-8">
        <div className="relative z-[1] max-w-xl"><p className="mb-3 text-xs font-semibold text-[#bdb8ff]">{t("learningCenter")}</p><h1 className="max-w-lg text-3xl font-bold leading-[1.08] tracking-tight text-white md:text-4xl">{t("welcome", { name: name ?? "Student" })}<br />{t("continuePractice")}</h1><p className="mt-4 max-w-md text-sm leading-6 text-[#cbc9dd]">{t("dashboardDescription")}</p><Link href="#exams" className="mt-14 inline-flex items-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#25234c] transition hover:bg-[#e9e7ff]">{t("startExam")} <span className="ml-3">→</span></Link></div>
        <div className="absolute -right-20 -top-24 size-80 rounded-full border border-white/10 bg-white/5" />
      </div>
      <div className="grid gap-4">
        <div className="app-panel flex min-h-[208px] flex-col justify-between p-6"><div><p className="text-sm text-[var(--muted)]">{t("examCountdown")}</p><div className="mt-5 flex items-baseline gap-2"><strong className="text-5xl font-bold tracking-tight">86</strong><span className="text-sm text-[var(--muted)]">{t("days")}</span></div><p className="mt-3 text-xs text-[var(--muted)]">{t("examDate")}</p></div><div className="grid grid-cols-3 gap-2"><span className="rounded-lg bg-[var(--tile-background)] py-3 text-center text-lg font-bold">07<small className="block text-[9px] font-normal text-[var(--muted)]">{t("hoursUnit")}</small></span><span className="rounded-lg bg-[var(--tile-background)] py-3 text-center text-lg font-bold">30<small className="block text-[9px] font-normal text-[var(--muted)]">{t("minutesUnit")}</small></span><span className="rounded-lg bg-[var(--tile-background)] py-3 text-center text-lg font-bold">28<small className="block text-[9px] font-normal text-[var(--muted)]">{t("secondsUnit")}</small></span></div></div>
        <div className="grid grid-cols-[1fr_190px] gap-4"><div className="app-panel flex flex-col justify-center border-[#3d6c20]! bg-[#1e3218]! p-6"><strong className="text-2xl text-[var(--success)]">• 42</strong><span className="mt-1 text-xs text-[#b4ca9e]">{t("currentStreak")}</span></div><div className="app-panel flex flex-col items-center justify-center border-[#805921]! bg-[#352711]! p-4"><strong className="text-2xl text-[var(--warning)]">🔥 2</strong><span className="mt-1 text-xs text-[#d2ba8c]">{t("streakDays")}</span></div></div>
      </div>
    </section>
  );
}
