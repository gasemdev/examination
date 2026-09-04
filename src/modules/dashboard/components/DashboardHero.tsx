"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function DashboardHero({ name, averageScore, completedAttempts, weeklyProgress }: { name: string | null; averageScore: number; completedAttempts: number; weeklyProgress: number }) {
  const t = useTranslations("dashboard");
  return (
    <section id="overview" className="grid gap-4 lg:grid-cols-2">
      <div className="relative overflow-hidden rounded-2xl border border-[rgba(126,114,255,0.35)] bg-gradient-to-br from-[#393373] via-[#25244b] to-[var(--surface)] p-7 shadow-[0_18px_45px_rgba(0,0,0,0.22)] md:p-10">
        <div className="relative z-[1] max-w-xl"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#bdb8ff]">{t("learningCenter")}</p><h1 className="max-w-lg text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl">{t("welcome", { name: name ?? "Student" })}<br />{t("continuePractice")}</h1><p className="mt-4 max-w-md text-sm leading-6 text-[#cbc9dd]">{t("dashboardDescription")}</p><Link href="#exams" className="mt-8 inline-flex items-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#25234c] transition hover:bg-[#e9e7ff]">{t("startExam")} <span className="ml-3">→</span></Link></div>
        <div className="absolute -right-16 -top-20 size-64 rounded-full border border-white/10 bg-white/5" />
      </div>
      <div className="app-panel flex flex-col justify-between p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-[var(--muted)]">{t("averageScore")}</p><p className="mt-3 text-5xl font-bold tracking-tight">{averageScore}</p></div><span className="rounded-lg bg-[rgba(143,227,77,0.14)] px-3 py-1 text-xs font-semibold text-[var(--success)]">{completedAttempts} {t("completedExams")}</span></div><div><div className="mb-2 flex justify-between text-xs text-[var(--muted)]"><span>{t("weeklyGoal")}</span><span>{weeklyProgress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#0c0d11]"><div className="h-full rounded-full bg-[var(--success)]" style={{ width: `${weeklyProgress}%` }} /></div></div></div>
    </section>
  );
}
