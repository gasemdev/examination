"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalGuard } from "@/components/layout/PortalGuard";
import { useAuth } from "@/auth/useAuth";
import { useLocale, useTranslations } from "next-intl";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import { DashboardMetrics } from "@/modules/dashboard/components/DashboardMetrics";
import { DashboardPerformance } from "@/modules/dashboard/components/DashboardPerformance";
import { DashboardHero } from "@/modules/dashboard/components/DashboardHero";
import type { DashboardData } from "@/modules/dashboard/types/dashboard.types";
import { PageLoadingState } from "@/components/ui/PageState";

export default function Home() {
  const { user } = useAuth();
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/dashboard", { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error(t("loadError"));
        return response.json() as Promise<DashboardData>;
      })
      .then(setDashboard)
      .catch((error) => console.error(error));
  }, [t, user]);

  if (!user || !dashboard) {
    return (
      <PortalGuard>
        <PageLoadingState>{t("loading")}</PageLoadingState>
      </PortalGuard>
    );
  }

  const { stats } = dashboard;
  const improvementSubjects = [...dashboard.subjects].filter((subject) => subject.answered > 0).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

  return (
    <PortalGuard>
    <div className="app-shell">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-8 md:px-8 md:py-10">
        <DashboardHero name={dashboard.user.name} averageScore={stats.averageScore} completedAttempts={stats.completedAttempts} weeklyProgress={stats.weeklyProgress} />

        <DashboardMetrics stats={stats} />

        <section className="app-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary-bright)]">Daily challenge</p><h2 className="mt-1 font-bold">{t("dailyChallenge")}</h2><p className="mt-1 text-xs text-[var(--muted)]">{t("dailyDescription")}</p></div>
          <Link href="#exams" className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold transition hover:bg-[var(--primary-bright)]">{t("startChallenge")} <span className="ml-2">→</span></Link>
        </section>

        <DashboardPerformance accuracy={stats.accuracy} subjects={dashboard.subjects} />

        <section className="app-panel border-[rgba(126,114,255,0.45)]! bg-[linear-gradient(90deg,rgba(102,88,232,0.16),rgba(23,24,31,0.92))]! p-5">
          <div className="flex gap-4"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[rgba(245,170,58,0.16)] text-lg">i</span><div><h2 className="font-bold">{t("recommendation")}</h2><p className="mt-1 text-xs leading-5 text-[var(--muted)]">{t("recommendationDescription")}</p><a href="#exams" className="mt-2 inline-block text-xs font-semibold text-[var(--primary-bright)]">{t("advice")}</a></div></div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="app-panel p-6"><div className="mb-5 flex items-start justify-between"><div><h2 className="font-bold">{t("recentResults")}</h2><p className="mt-1 text-xs text-[var(--muted)]">{t("latestSummary")}</p></div><span className="text-xs font-semibold text-[var(--primary-bright)]">{dashboard.recentAttempts.length}</span></div>{dashboard.recentAttempts[0] ? <div className="rounded-xl bg-[var(--surface-raised)] p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold">{dashboard.recentAttempts[0].examTitle}</p><p className="mt-1 text-xs text-[var(--muted)]">{new Date(dashboard.recentAttempts[0].completedAt).toLocaleDateString(locale)} · {t("questionCount", { count: dashboard.recentAttempts[0].questionCount })}</p></div><p className="text-xl font-bold">{dashboard.recentAttempts[0].score ?? 0}<span className="text-xs font-normal text-[var(--muted)]">/100</span></p></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#0b0c10]"><div className="h-full rounded-full bg-[var(--success)]" style={{ width: `${dashboard.recentAttempts[0].score ?? 0}%` }} /></div></div> : <p className="rounded-xl bg-[var(--surface-raised)] p-5 text-sm text-[var(--muted)]">{t("noResults")}</p>}</div>
          <div className="app-panel p-6"><div className="mb-5 flex items-start justify-between"><div><h2 className="font-bold">{t("improvement")}</h2><p className="mt-1 text-xs text-[var(--muted)]">{t("orderedBy")}</p></div><a href="#exams" className="text-xs font-semibold text-[var(--primary-bright)]">{t("viewMore")}</a></div><div className="space-y-4">{improvementSubjects.length ? improvementSubjects.map((subject) => <div key={subject.id}><div className="mb-1.5 flex justify-between text-xs"><span>{subject.name}</span><span className="text-[var(--warning)]">{subject.accuracy}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#0b0c10]"><div className="h-full rounded-full bg-[var(--danger)]" style={{ width: `${subject.accuracy}%` }} /></div></div>) : <p className="text-sm text-[var(--muted)]">{t("noImprovement")}</p>}</div></div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="app-panel p-6"><div className="flex items-start justify-between"><div><h2 className="font-bold">{t("scoreTrend")}</h2><p className="mt-1 text-xs text-[var(--muted)]">{t("recentPerformance")}</p></div><span className="text-xs text-[var(--muted)]">{dashboard.scoreTrend.length}</span></div><div className="mt-8 flex h-24 items-end gap-2 border-b border-[var(--border)]">{dashboard.scoreTrend.length ? dashboard.scoreTrend.map((point, index) => <div key={`${point.completedAt}-${index}`} className="flex flex-1 items-end justify-center" title={`${point.score}`}><div className="w-full max-w-10 rounded-t-md bg-[var(--success)]" style={{ height: `${Math.max(point.score, 4)}%` }} /></div>) : <p className="pb-5 text-xs text-[var(--muted)]">{t("noTrend")}</p>}</div></div>
          <div className="app-panel p-6"><div className="flex items-start justify-between"><div><h2 className="font-bold">{t("nextGoal")}</h2><p className="mt-1 text-xs text-[var(--muted)]">{t("weeklyTarget")}</p></div><span className="text-xs text-[var(--muted)]">{stats.completedThisWeek}/{stats.weeklyGoal}</span></div><p className="mt-6 text-sm font-semibold">{t("nextGoalText", { count: stats.weeklyGoal })}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#0b0c10]"><div className="h-full rounded-full bg-[var(--success)]" style={{ width: `${stats.weeklyProgress}%` }} /></div><div className="mt-2 flex justify-between text-[10px] text-[var(--muted)]"><span>{t("done", { count: stats.completedThisWeek })}</span><span>{t("target", { count: stats.weeklyGoal })}</span></div></div>
        </section>

        <section id="activity" className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]"><div className="app-panel p-6"><div className="mb-5 flex justify-between"><h2 className="font-bold">{t("sevenDays")}</h2><span className="text-sm font-semibold text-[var(--success)]">{stats.weeklyProgress}%</span></div><div className="flex h-40 items-end gap-3 border-b border-[var(--border)] pb-0">{[35,52,42,68,58,82,74].map((height, index) => <div key={index} className="group flex flex-1 flex-col items-center gap-2"><div className="w-full max-w-10 rounded-t-md bg-[var(--primary)] opacity-80 transition group-hover:opacity-100" style={{height: `${height}%`}} /><span className="text-[10px] text-[var(--muted)]">{["M","T","W","Th","F","S","Su"][index]}</span></div>)}</div></div><div className="app-panel p-6"><h2 className="font-bold">{t("nextGoal")}</h2><div className="mt-6 flex items-center gap-4"><div className="grid size-14 place-items-center rounded-full border-4 border-[var(--success)] text-xs font-bold">{stats.completedThisWeek}/{stats.weeklyGoal}</div><div><p className="font-semibold">{t("nextGoalText", { count: stats.weeklyGoal })}</p><p className="mt-1 text-xs text-[var(--muted)]">{t("remaining", { count: Math.max(stats.weeklyGoal - stats.completedThisWeek, 0) })}</p></div></div></div></section>

        <section id="exams" className="space-y-5">
          <div><div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary-bright)]">Question bank</p><h2 className="mt-1 text-xl font-bold">{t("questionBank")}</h2><p className="mt-1 text-xs text-[var(--muted)]">{t("dashboardDescription")}</p></div><a href="#exams" className="text-xs font-semibold text-[var(--primary-bright)]">{t("viewMore")}</a></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white">{t("all")} ({dashboard.exams.length})</button>{dashboard.subjects.slice(0, 4).map((subject) => <button key={subject.id} type="button" className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)] transition hover:border-[var(--primary-bright)] hover:text-white">{subject.name}</button>)}</div></div>
          <div className="grid gap-3 md:grid-cols-3">{dashboard.exams.map((exam, index) => <article key={`bank-${exam.id}`} className="app-panel group p-5 transition hover:-translate-y-0.5 hover:border-[var(--primary)]"><div className="flex items-start justify-between"><span className="rounded-md bg-[rgba(245,170,58,0.14)] px-2 py-1 text-[10px] font-semibold text-[var(--warning)]">{index === 0 ? t("recommended") : t("examSet")}</span><span className="text-2xl font-bold text-[#626373]">{String(index + 1).padStart(2, "0")}</span></div><h3 className="mt-4 text-sm font-bold">{exam.title}</h3><p className="mt-2 text-xs leading-5 text-[var(--muted)]">{t("questionCount", { count: exam.questionCount })} {exam.duration ? `| ${t("minutes", { count: exam.duration })}` : ""} | {t("practiceDescription")}</p><Link href={`/${locale}/exam/${exam.id}`} className="mt-5 block rounded-lg bg-[var(--warning)] py-2.5 text-center text-xs font-bold text-[#241a0a] transition hover:brightness-110">{t("selectSet")}</Link></article>)}</div>
        </section>

        <section className="space-y-4 pb-8"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary-bright)]">Study notes</p><h2 className="mt-1 text-xl font-bold">{t("studyNotes")}</h2><p className="mt-1 text-xs text-[var(--muted)]">{t("studyDescription")}</p></div><div className="grid gap-3 md:grid-cols-3">{[["abc", t("studyTitleOne"), t("studyDescriptionOne")], ["▥", t("studyTitleTwo"), t("studyDescriptionTwo")], ["▤", t("studyTitleThree"), t("studyDescriptionThree")]].map(([icon, title, description]) => <article key={title} className="app-panel flex items-center gap-4 p-4 transition hover:border-[var(--primary)]"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[rgba(102,88,232,0.18)] text-xs font-bold text-[#bdb8ff]">{icon}</span><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-[10px] leading-4 text-[var(--muted)]">{description}</p></div></article>)}</div></section>
      </main>
    </div>
    </PortalGuard>
  );
}
