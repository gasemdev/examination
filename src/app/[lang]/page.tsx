"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/auth/useAuth";
import { PortalGuard } from "@/components/layout/PortalGuard";
import { PageErrorState, PageLoadingState } from "@/components/ui/PageState";
import { useLocale, useTranslations } from "next-intl";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";
import { DashboardHero } from "@/modules/dashboard/components/DashboardHero";
import { DashboardMetrics, PassRate } from "@/modules/dashboard/components/DashboardMetrics";
import { DashboardPerformance } from "@/modules/dashboard/components/DashboardPerformance";
import type { DashboardData } from "@/modules/dashboard/types/dashboard.types";

export default function Home() {
	const { user } = useAuth();
	const locale = useLocale();
	const router = useRouter();
	const t = useTranslations("dashboard");
	const [dashboard, setDashboard] = useState<DashboardData | null>(null);
	const [dashboardError, setDashboardError] = useState(false);
	const [examFilter, setExamFilter] = useState("all");
	const [selectedExam, setSelectedExam] = useState<DashboardData["exams"][number] | null>(null);
	const [practiceMode, setPracticeMode] = useState(false);
	const [examOrder, setExamOrder] = useState<"random" | "subject">("random");
	const [examLayout, setExamLayout] = useState<"continuous" | "map">("continuous");
	const [practiceQuestionCount, setPracticeQuestionCount] = useState<number | "all">(10);
	const [practiceReveal, setPracticeReveal] = useState<"immediate" | "end">("immediate");
	const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
	const [startingPractice, setStartingPractice] = useState(false);
	const [pausedExam, setPausedExam] = useState<{ attemptId: number; title: string; count: number } | null>(() => {
		if (typeof window === "undefined") return null;
		const saved = window.localStorage.getItem("pausedExam");
		if (!saved) return null;
		try {
			return JSON.parse(saved) as { attemptId: number; title: string; count: number };
		} catch {
			window.localStorage.removeItem("pausedExam");
			return null;
		}
	});

	function discardPausedExam() {
		window.localStorage.removeItem("pausedExam");
		setPausedExam(null);
	}

	function continuePausedExam() {
		if (!pausedExam) return;
		router.push(`/${locale}/exam/${pausedExam.attemptId}?mode=practice&count=${pausedExam.count}`);
	}

	async function startPractice() {
		if (!selectedExam || !user || startingPractice) return;
		setStartingPractice(true);
		try {
			const response = await fetch("/api/attempts", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: Number(user.id), examId: selectedExam.id }),
			});
			if (!response.ok) throw new Error("ไม่สามารถเริ่มฝึกซ้อมได้");
			const attempt = (await response.json()) as { id: number };
			const count = practiceQuestionCount === "all" ? selectedExam.questionCount : practiceQuestionCount;
			router.push(`/${locale}/exam/${attempt.id}?mode=practice&count=${count}&order=${examOrder}&layout=${examLayout}&reveal=${practiceReveal}`);
		} catch (error) {
			console.error(error);
			setStartingPractice(false);
		}
	}

	useEffect(() => {
		if (!user) return;

		let cancelled = false;
		async function loadDashboard() {
			for (let attempt = 0; attempt < 3; attempt += 1) {
				try {
					const response = await fetch("/api/dashboard", { credentials: "include" });
					if (!response.ok) throw new Error(t("loadError"));
					const data = (await response.json()) as DashboardData;
					if (!cancelled) {
						setDashboard(data);
					}
					return;
				} catch (error) {
					if (attempt === 2) {
						console.error(error);
						if (!cancelled) setDashboardError(true);
					}
					else await new Promise((resolve) => setTimeout(resolve, 500));
				}
			}
		}

		void loadDashboard();
		return () => { cancelled = true; };
	}, [t, user]);

	if (!user || !dashboard) {
		if (dashboardError) {
			return <PortalGuard><PageErrorState>{t("loadError")}</PageErrorState></PortalGuard>;
		}
		return <PortalGuard><PageLoadingState>{t("loading")}</PageLoadingState></PortalGuard>;
	}

	const filteredExams = examFilter === "all" ? dashboard.exams : dashboard.exams.filter((exam) => exam.title.toLowerCase().includes(examFilter));

	return (
		<PortalGuard>
			<div className="app-shell">
				<DashboardHeader />
				<main className="mx-auto w-full max-w-[1225px] space-y-6 px-5 py-8 md:px-8 md:py-10">
					<DashboardHero name={dashboard.user.name} />
					<section className="grid gap-4 lg:grid-cols-[1.55fr_0.85fr]">
						<div className="space-y-4">{pausedExam ? <section className="flex flex-col gap-4 rounded-[18px] border-2 border-[#a83d0f] bg-[#180c0b] p-6 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-base font-bold">🏫 {t("pausedExamTitle", { title: pausedExam.title })}</p><p className="mt-2 text-sm text-[var(--muted)]">{t("pausedExamDescription")}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={discardPausedExam} className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">{t("discardPausedExam")}</button><button type="button" onClick={continuePausedExam} className="rounded-xl bg-[#f28a18] px-5 py-3 text-sm font-bold text-[#241a0a]">{t("continuePausedExam")} →</button></div></section> : null}<section className="app-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary-bright)]">Daily challenge</p><h2 className="mt-1 font-bold">{t("dailyChallenge")}</h2><p className="mt-1 text-xs text-[var(--muted)]">{t("dailyDescription")}</p></div><a href="#exams" className="shrink-0 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-center text-xs font-semibold text-white">{t("startChallenge")} →</a></section><DashboardMetrics stats={dashboard.stats} /></div>
						<PassRate accuracy={dashboard.stats.accuracy} />
					</section>
					<section className="app-panel flex flex-col gap-4 border-[rgba(126,114,255,0.55)]! bg-[linear-gradient(100deg,rgba(102,88,232,0.16),rgba(23,24,31,0.92))]! p-5 sm:flex-row sm:items-center sm:justify-between">
						<div><p className="text-xs font-semibold text-[var(--warning)]">💡 {t("recommendation")}</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">{t("recommendationDescription")}</p></div>
						<a href="#exams" className="shrink-0 text-xs font-bold text-[var(--primary-bright)]">{t("viewMore")}</a>
					</section>
					<DashboardPerformance accuracy={dashboard.stats.accuracy} subjects={dashboard.subjects} />
					<section className="grid gap-4 lg:grid-cols-2">
						<div className="app-panel p-6"><div className="mb-5 flex items-start justify-between"><div><h2 className="font-bold">{t("recentResults")}</h2><p className="mt-1 text-xs text-[var(--muted)]">{t("latestSummary")}</p></div><span className="text-xs font-semibold text-[var(--primary-bright)]">{dashboard.recentAttempts.length}</span></div>{dashboard.recentAttempts[0] ? <div className="rounded-xl bg-[var(--surface-raised)] p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold">{dashboard.recentAttempts[0].examTitle}</p><p className="mt-1 text-xs text-[var(--muted)]">{new Date(dashboard.recentAttempts[0].completedAt).toLocaleDateString(locale)} · {t("questionCount", { count: dashboard.recentAttempts[0].questionCount })}</p></div><p className="text-xl font-bold">{dashboard.recentAttempts[0].score ?? 0}<span className="text-xs font-normal text-[var(--muted)]">/100</span></p></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#0b0c10]"><div className="h-full rounded-full bg-[var(--success)]" style={{ width: `${dashboard.recentAttempts[0].score ?? 0}%` }} /></div></div> : <p className="rounded-xl bg-[var(--surface-raised)] p-5 text-sm text-[var(--muted)]">{t("noResults")}</p>}</div>
						<div className="app-panel p-6"><div className="mb-5 flex items-start justify-between"><div><h2 className="font-bold">{t("improvement")}</h2><p className="mt-1 text-xs text-[var(--muted)]">{t("orderedBy")}</p></div><a href="#exams" className="text-xs font-semibold text-[var(--primary-bright)]">{t("viewMore")}</a></div><div className="space-y-4">{[...dashboard.subjects].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3).map((subject) => <div key={subject.id}><div className="mb-1.5 flex justify-between text-xs"><span>{subject.name}</span><span className="text-[var(--warning)]">{subject.accuracy}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#0b0c10]"><div className="h-full rounded-full bg-[var(--warning)]" style={{ width: `${subject.accuracy}%` }} /></div></div>)}</div></div>
					</section>
					<section className="grid gap-4 lg:grid-cols-2">
						<div className="app-panel p-6"><div className="flex items-start justify-between"><div><h2 className="font-bold">{t("scoreTrend")}</h2><p className="mt-1 text-xs text-[var(--muted)]">{t("recentPerformance")}</p></div><span className="text-xs text-[var(--muted)]">{dashboard.scoreTrend.length}</span></div><div className="mt-8 flex h-28 items-end gap-2 border-b border-[var(--border)]">{dashboard.scoreTrend.length ? dashboard.scoreTrend.map((point, index) => <div key={`${point.completedAt}-${index}`} className="flex flex-1 items-end justify-center"><div className="w-full max-w-10 rounded-t-md bg-[var(--success)]" style={{ height: `${Math.max(point.score, 6)}%` }} /></div>) : <p className="pb-5 text-xs text-[var(--muted)]">{t("noTrend")}</p>}</div></div>
						<div className="app-panel p-6"><div className="flex items-start justify-between"><div><h2 className="font-bold">{t("nextGoal")}</h2><p className="mt-1 text-xs text-[var(--muted)]">{t("weeklyTarget")}</p></div><span className="text-xs text-[var(--muted)]">{dashboard.stats.completedThisWeek}/{dashboard.stats.weeklyGoal}</span></div><p className="mt-6 text-sm font-semibold">{t("nextGoalText", { count: dashboard.stats.weeklyGoal })}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#0b0c10]"><div className="h-full rounded-full bg-[var(--success)]" style={{ width: `${dashboard.stats.weeklyProgress}%` }} /></div><div className="mt-2 flex justify-between text-[10px] text-[var(--muted)]"><span>{t("done", { count: dashboard.stats.completedThisWeek })}</span><span>{t("target", { count: dashboard.stats.weeklyGoal })}</span></div></div>
					</section>
					<section id="activity" className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]"><div className="app-panel p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">{t("sevenDays")}</h2><p className="mt-1 text-xs text-[var(--muted)]">{t("recentPerformance")}</p></div><span className="text-sm font-semibold text-[var(--success)]">{dashboard.stats.weeklyProgress}%</span></div><div className="flex h-40 items-end gap-3 border-b border-[var(--border)]">{[35, 52, 42, 68, 58, 82, 74].map((height, index) => <div key={index} className="group flex flex-1 flex-col items-center gap-2"><div className="w-full max-w-10 rounded-t-md bg-[var(--primary)] opacity-80 transition group-hover:opacity-100" style={{ height: `${height}%` }} /><span className="text-[10px] text-[var(--muted)]">{["M", "T", "W", "Th", "F", "S", "Su"][index]}</span></div>)}</div></div><div className="app-panel p-6"><h2 className="font-bold">{t("nextGoal")}</h2><p className="mt-1 text-xs text-[var(--muted)]">{t("weeklyTarget")}</p><div className="mt-6 flex items-center gap-4"><div className="grid size-14 place-items-center rounded-full border-4 border-[var(--success)] text-xs font-bold">{dashboard.stats.completedThisWeek}/{dashboard.stats.weeklyGoal}</div><div><p className="font-semibold">{t("nextGoalText", { count: dashboard.stats.weeklyGoal })}</p><p className="mt-1 text-xs text-[var(--muted)]">{t("remaining", { count: Math.max(dashboard.stats.weeklyGoal - dashboard.stats.completedThisWeek, 0) })}</p></div></div></div></section>
					<section id="exams" className="space-y-4">
						<div><h2 className="text-2xl font-bold">📘 {t("questionBank")}</h2><p className="mt-1 text-sm text-[var(--muted)]">{t("questionBankDescription")}</p></div>
						<div className="flex flex-wrap gap-3"><button type="button" onClick={() => setExamFilter("all")} className={`rounded-2xl border px-6 py-4 text-sm font-semibold transition ${examFilter === "all" ? "border-transparent bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"}`}>🛡️ {t("administrationSets")}</button><button type="button" onClick={() => setExamFilter("หลักฐาน")} className={`rounded-2xl border px-6 py-4 text-sm font-semibold transition ${examFilter === "หลักฐาน" ? "border-transparent bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"}`}>🔬 {t("evidenceSets")}</button><button type="button" onClick={() => setExamFilter("ปราบปราม")} className={`rounded-2xl border px-6 py-4 text-sm font-semibold transition ${examFilter === "ปราบปราม" ? "border-transparent bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"}`}>⚔️ {t("operationsSets")}</button></div>
						<div className="flex flex-wrap gap-3"><button type="button" onClick={() => setExamFilter("all")} className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${examFilter === "all" ? "border-transparent bg-white text-[#202127]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"}`}>📗 {t("fullSets")}</button><button type="button" onClick={() => setExamFilter("รายวิชา")} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--muted)]">📘 {t("subjectSets")}</button><button type="button" onClick={() => setExamFilter("หัวข้อ")} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--muted)]">🏷️ {t("topicSets")}</button><button type="button" onClick={() => setExamFilter("ชื่อ")} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--muted)]">🔤 {t("nameSets")}</button></div>
						<div className="grid gap-3 md:grid-cols-3">
							{filteredExams.map((exam, index) => (
								<article key={exam.id} className="app-panel group p-5 transition hover:-translate-y-0.5 hover:border-[var(--primary)]!"><div className="flex items-start justify-between"><span className="rounded-md bg-[rgba(245,170,58,0.14)] px-2 py-1 text-[10px] font-semibold text-[var(--warning)]">{index === 0 ? t("recommended") : t("examSet")}</span><span className="text-2xl font-bold text-[#626373]">{String(index + 1).padStart(2, "0")}</span></div>
									<h3 className="mt-4 font-bold">{exam.title}</h3>
									  <p className="mt-2 text-xs leading-5 text-(--muted)">{t("questionCount", { count: exam.questionCount })}{exam.duration ? ` | ${t("minutes", { count: exam.duration })}` : ""} · {t("practiceDescription")}</p>
									  <button type="button" onClick={() => setSelectedExam(exam)} className="mt-5 block w-full rounded-lg bg-(--warning) py-2.5 text-center text-xs font-bold text-[#241a0a]">{t("selectSet")}</button>
								</article>
							))}
						</div>
					</section>
					<section className="space-y-4 pb-8">
						<div><h2 className="text-xl font-bold">🧠 {t("studyNotes")}</h2><p className="mt-1 text-sm text-[var(--muted)]">{t("studyDescription")}</p></div>
						<div className="grid gap-4 md:grid-cols-3">
							{[["abc", t("studyTitleOne"), t("studyDescriptionOne")], ["📊", t("studyTitleTwo"), t("studyDescriptionTwo")], ["📖", t("studyTitleThree"), t("studyDescriptionThree")]].map(([icon, title, description]) => (
								<article key={title} className="app-panel flex items-center gap-4 p-5 transition hover:border-[var(--primary)]!"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[rgba(102,88,232,0.22)] text-sm font-bold text-[#bdb8ff]">{icon}</span><div><h3 className="text-base font-semibold">{title}</h3><p className="mt-1 text-sm text-[var(--muted)]">{description}</p></div></article>
							))}
						</div>
					</section>
				</main>
				{selectedExam ? <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setSelectedExam(null); setPracticeMode(false); } }} className="fixed inset-0 z-50 grid items-start overflow-y-auto bg-black/75 px-3 py-3 backdrop-blur-[5px] sm:place-items-center sm:px-4 sm:py-6">
					<div role="dialog" aria-modal="true" aria-labelledby="exam-modal-title" className="my-auto w-full max-w-[600px] overflow-y-auto rounded-[22px] border border-[var(--border)] bg-[var(--surface-raised)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:max-h-[calc(100dvh-3rem)] sm:p-8">
						{practiceMode ? <>
							<div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 id="exam-modal-title" className="break-words text-base font-bold leading-tight">🎯 {t("practiceMode")} – {selectedExam.title}</h2><p className="mt-2 text-xs text-[var(--muted)]">{t("practiceSubtitle")}</p></div><button type="button" aria-label={t("closeModal")} onClick={() => { setSelectedExam(null); setPracticeMode(false); }} className="grid size-8 shrink-0 place-items-center rounded-lg text-lg text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-white">×</button></div>
							<div className="mt-4 flex gap-4 border-b border-[var(--border)] pb-2 text-[10px] font-semibold"><button type="button" className="border-b-2 border-[var(--primary-bright)] pb-2 text-[var(--primary-bright)]">{t("practiceSettings")}</button><button type="button" className="text-[var(--muted)]">{t("practiceStats")}</button></div>
							<div className="mt-4 space-y-1.5">{dashboard.subjects.slice(0, 6).map((subject) => { const checked = selectedSubjects.length === 0 || selectedSubjects.includes(subject.id); return <button type="button" key={subject.id} onClick={() => setSelectedSubjects((current) => current.length === 0 ? dashboard.subjects.slice(0, 6).filter((item) => item.id !== subject.id).map((item) => item.id) : current.includes(subject.id) ? current.filter((id) => id !== subject.id) : [...current, subject.id])} className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-left text-[10px]"><span className={`grid size-4 shrink-0 place-items-center rounded-sm text-[9px] ${checked ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] text-transparent"}`}>✓</span><span className="min-w-0 flex-1 truncate">{subject.name}</span><span className="text-[var(--muted)]">{subject.answered} {t("questionsUnit")}</span><span className={`rounded-md px-2 py-1 text-[9px] font-bold ${subject.accuracy < 60 ? "bg-[rgba(242,100,118,0.2)] text-[var(--danger)]" : "bg-[rgba(143,227,77,0.18)] text-[var(--success)]"}`}>{subject.accuracy}%</span></button>; })}</div>
							<div className="mt-4"><p className="mb-2 text-xs font-semibold">{t("practiceQuestionCount")}</p><div className="flex flex-wrap gap-2">{[10, 20, 30, 50, "all"].map((count) => <button type="button" key={count} onClick={() => setPracticeQuestionCount(count as number | "all")} className={`rounded-md px-3 py-2 text-[10px] font-bold ${practiceQuestionCount === count ? "bg-[var(--primary)] text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}>{count === "all" ? t("allQuestions") : count}</button>)}</div></div>
							<div className="mt-4"><p className="mb-2 text-xs font-semibold">{t("questionOrder")}</p><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setExamOrder("random")} className={`rounded-lg border px-3 py-2 text-[10px] font-semibold ${examOrder === "random" ? "border-transparent bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"}`}>{t("randomOrder")}</button><button type="button" onClick={() => setExamOrder("subject")} className={`rounded-lg border px-3 py-2 text-[10px] font-semibold ${examOrder === "subject" ? "border-transparent bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"}`}>{t("subjectOrder")}</button></div></div>
							<div className="mt-4"><p className="mb-2 text-xs font-semibold">{t("questionLayout")}</p><div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => setExamLayout("continuous")} className={`rounded-lg border p-3 text-left ${examLayout === "continuous" ? "border-transparent bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"}`}><span>📜</span><strong className="ml-2 text-[10px]">{t("continuousLayout")}</strong><span className="mt-1 block text-[9px] leading-4">{t("continuousDescription")}</span></button><button type="button" onClick={() => setExamLayout("map")} className={`rounded-lg border p-3 text-left ${examLayout === "map" ? "border-transparent bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"}`}><span>🗺️</span><strong className="ml-2 text-[10px]">{t("mapLayout")}</strong><span className="mt-1 block text-[9px] leading-4">{t("mapDescription")}</span></button></div></div>
							<div className="mt-4"><p className="mb-2 text-xs font-semibold">{t("revealAnswers")}</p><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setPracticeReveal("immediate")} className={`rounded-lg border px-3 py-2 text-[10px] font-semibold ${practiceReveal === "immediate" ? "border-transparent bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"}`}>⚡ {t("immediateReveal")}</button><button type="button" onClick={() => setPracticeReveal("end")} className={`rounded-lg border px-3 py-2 text-[10px] font-semibold ${practiceReveal === "end" ? "border-transparent bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"}`}>📋 {t("endReveal")}</button></div></div>
							<div className="mt-5 flex items-center justify-end gap-2 border-t border-[var(--border)] pt-4"><button type="button" onClick={() => setPracticeMode(false)} className="rounded-lg px-3 py-2 text-[10px] text-[var(--muted)]">{t("cancel")}</button><button type="button" onClick={() => void startPractice()} disabled={startingPractice} className="rounded-lg bg-[var(--warning)] px-4 py-2.5 text-[10px] font-bold text-[#241a0a] disabled:cursor-wait disabled:opacity-60">{startingPractice ? t("startingPractice") : t("startPractice", { count: practiceQuestionCount === "all" ? selectedExam.questionCount : practiceQuestionCount })}</button></div>
			</> : <>
							<div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 id="exam-modal-title" className="break-words text-xl font-bold leading-tight">{selectedExam.title}</h2><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--muted)]"><span>📝 {selectedExam.questionCount} {t("questionsUnit")}</span><span>⏱️ {selectedExam.duration ?? 180} {t("minutesUnitLong")}</span><span>🎯 {t("passingScore")}</span></div><p className="mt-2 text-xs text-[var(--muted)]">{t("notStartedYet")}</p></div><button type="button" aria-label={t("closeModal")} onClick={() => setSelectedExam(null)} className="grid size-8 shrink-0 place-items-center rounded-lg text-lg text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-white">×</button></div>
							<div className="mt-6"><p className="mb-3 text-sm font-semibold">{t("questionOrder")}</p><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setExamOrder("random")} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${examOrder === "random" ? "border-transparent bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"}`}>{t("randomOrder")}</button><button type="button" onClick={() => setExamOrder("subject")} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${examOrder === "subject" ? "border-transparent bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"}`}>{t("subjectOrder")}</button></div></div>
							<div className="mt-6"><p className="mb-3 text-sm font-semibold">{t("questionLayout")}</p><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setExamLayout("continuous")} className={`rounded-xl border p-4 text-left transition ${examLayout === "continuous" ? "border-transparent bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"}`}><span className="text-xl">📜</span><strong className="mt-2 block text-sm">{t("continuousLayout")}</strong><span className="mt-1 block text-xs leading-5">{t("continuousDescription")}</span></button><button type="button" onClick={() => setExamLayout("map")} className={`rounded-xl border p-4 text-left transition ${examLayout === "map" ? "border-transparent bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"}`}><span className="text-xl">🗺️</span><strong className="mt-2 block text-sm">{t("mapLayout")}</strong><span className="mt-1 block text-xs leading-5">{t("mapDescription")}</span></button></div></div>
							<div className="mt-7 flex flex-col gap-2 sm:flex-row sm:gap-3"><Link href={`/${locale}/exam/${selectedExam.id}`} className="flex-1 rounded-xl bg-[var(--primary)] px-3 py-3 text-center text-sm font-bold text-white transition hover:bg-[var(--primary-bright)]">🚀 {t("startForReal")}</Link><button type="button" onClick={() => setPracticeMode(true)} className="flex-1 rounded-xl bg-[var(--warning)] px-3 py-3 text-sm font-bold text-[#241a0a] transition hover:brightness-110">🎯 {t("practice")}</button><button type="button" onClick={() => setSelectedExam(null)} className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-soft)]">{t("cancel")}</button></div>
			</>}
					</div>
				</div> : null}
			</div>
		</PortalGuard>
	);
}
