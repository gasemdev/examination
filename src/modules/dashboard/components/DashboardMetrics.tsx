"use client";

import { useTranslations } from "next-intl";

import type { DashboardData } from "@/modules/dashboard/types/dashboard.types";

export function DashboardMetrics({ stats }: { stats: DashboardData["stats"] }) {
  const t = useTranslations("dashboard");
  const metrics = [
    [t("completedExams"), stats.completedAttempts, ""],
    [t("averageScore"), stats.averageScore, "/ 100"],
    [t("answeredQuestions"), stats.totalAnswers, ""],
    [t("accuracy"), stats.accuracy, "%"],
  ];

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {metrics.map(([label, value, suffix]) => (
        <div key={label} className="app-panel p-5">
          <p className="text-xs text-[var(--muted)]">{label}</p>
          <p className="mt-3 text-2xl font-bold">{value} <span className="text-xs font-normal text-[var(--muted)]">{suffix}</span></p>
        </div>
      ))}
    </section>
  );
}
