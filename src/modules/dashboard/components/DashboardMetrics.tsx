"use client";

import { useTranslations } from "next-intl";

import type { DashboardData } from "@/modules/dashboard/types/dashboard.types";

export function DashboardMetrics({ stats }: { stats: DashboardData["stats"] }) {
  const t = useTranslations("dashboard");
  const metrics = [
    [t("completedExams"), stats.completedAttempts, ""],
    [t("passedExams"), stats.completedThisWeek, ""],
    [t("highestScore"), stats.averageScore, "/150"],
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {metrics.map(([label, value, suffix]) => (
        <div key={label} className="app-panel flex min-h-[96px] flex-col justify-center p-5">
          <p className="text-xs text-[var(--muted)]">{label}</p>
          <p className="mt-3 text-2xl font-bold">{value} <span className="text-xs font-normal text-[var(--muted)]">{suffix}</span></p>
        </div>
      ))}
    </section>
  );
}

export function PassRate({ accuracy }: { accuracy: number }) {
  const t = useTranslations("dashboard");

  return (
    <div className="app-panel flex min-h-[258px] items-center justify-center gap-5 p-5">
      <div className="grid size-20 place-items-center rounded-full border-[10px] border-[#8fe34d] border-l-[#f26476] border-b-[#f26476]"><strong className="text-sm">{accuracy}%</strong></div>
      <div className="space-y-2 text-xs text-[var(--muted)]"><p><span className="mr-2 inline-block size-2 rounded-full bg-[var(--success)]" />{t("passedExams")}</p><p><span className="mr-2 inline-block size-2 rounded-full bg-[var(--danger)]" />{t("failedExams")}</p></div>
    </div>
  );
}
