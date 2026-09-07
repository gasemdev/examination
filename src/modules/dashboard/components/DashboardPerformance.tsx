"use client";

import { useTranslations } from "next-intl";

import type { DashboardData } from "@/modules/dashboard/types/dashboard.types";

export function DashboardPerformance({ accuracy, subjects }: { accuracy: number; subjects: DashboardData["subjects"] }) {
  const t = useTranslations("dashboard");
  const strongestSubjects = [...subjects].sort((a, b) => b.accuracy - a.accuracy).slice(0, 5);

  return (
    <section className="app-panel p-6 md:p-7">
      <div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary-bright)]">Your performance</p><h2 className="mt-1 text-xl font-bold">{t("performance")}</h2></div><a href="#exams" className="text-xs font-semibold text-[var(--primary-bright)]">{t("viewMore")}</a></div>
      <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="relative mx-auto grid size-52 place-items-center">
          <div className="absolute inset-5 rotate-45 border border-[var(--border)]" />
          <div className="absolute inset-10 rotate-45 border border-[var(--border)]" />
          <div className="absolute inset-16 rotate-45 border border-[var(--border)]" />
          <div className="absolute size-36 rotate-45 bg-[rgba(102,88,232,0.28)] [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]" />
          <div className="relative text-center"><span className="block text-3xl font-bold">{accuracy}%</span><span className="text-[10px] text-[var(--muted)]">{t("overallAverage")}</span></div>
          <span className="absolute left-1/2 top-0 -translate-x-1/2 text-[9px] text-[var(--muted)]">{strongestSubjects[0]?.name ?? ""}</span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] text-[var(--muted)]">{strongestSubjects[3]?.name ?? ""}</span>
        </div>
        <div className="space-y-4">{strongestSubjects.map((subject) => <div key={subject.id}><div className="mb-1.5 flex justify-between text-xs"><span>{subject.name}</span><span className="text-[var(--muted)]">{subject.accuracy}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#0b0c10]"><div className={`h-full rounded-full ${subject.accuracy >= 75 ? "bg-[var(--success)]" : "bg-[var(--warning)]"}`} style={{ width: `${subject.accuracy}%` }} /></div></div>)}</div>
      </div>
    </section>
  );
}
