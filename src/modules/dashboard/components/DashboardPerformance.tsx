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
        <div className="mx-auto grid size-52 place-items-center rounded-full border border-[rgba(126,114,255,0.3)] bg-[radial-gradient(circle,rgba(102,88,232,0.25)_0,rgba(102,88,232,0.08)_44%,transparent_45%)] p-7"><div className="grid size-full place-items-center rounded-full border border-dashed border-[#7e72ff]/60 text-center"><span className="text-3xl font-bold">{accuracy}%</span><span className="text-[10px] text-[var(--muted)]">{t("overallAverage")}</span></div></div>
        <div className="space-y-4">{strongestSubjects.map((subject) => <div key={subject.id}><div className="mb-1.5 flex justify-between text-xs"><span>{subject.name}</span><span className="text-[var(--muted)]">{subject.accuracy}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#0b0c10]"><div className={`h-full rounded-full ${subject.accuracy >= 75 ? "bg-[var(--success)]" : "bg-[var(--warning)]"}`} style={{ width: `${subject.accuracy}%` }} /></div></div>)}</div>
      </div>
    </section>
  );
}
