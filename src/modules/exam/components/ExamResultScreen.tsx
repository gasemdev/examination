"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { DashboardHeader } from "@/modules/dashboard/components/DashboardHeader";

type ResultAnswer = {
  questionId: number;
  question: string;
  explanation: string | null;
  subject: string | null;
  isCorrect: boolean | null;
  selectedChoice: { text: string } | null;
  correctChoice: { text: string } | null;
};

type ResultData = {
  exam: { title: string; description: string | null };
  result: {
    score: number | null;
    totalQuestions: number;
    answeredQuestions: number;
    unansweredQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
  };
  subjectStats: Record<string, { correct: number; total: number }>;
  answers: ResultAnswer[];
};

export function ExamResultScreen() {
  const t = useTranslations("result");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ResultData | null>(null);
  const [error, setError] = useState(false);
  const [answerFilter, setAnswerFilter] = useState<"all" | "incorrect" | "correct">("all");

  useEffect(() => {
    fetch(`/api/attempts/${params.id}/result`, { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("result");
        return response.json() as Promise<ResultData>;
      })
      .then(setData)
      .catch(() => setError(true));
  }, [params.id]);

  if (!data) {
    return <main className="grid min-h-screen place-items-center bg-[#0d0e12] text-sm text-[var(--muted)]">{error ? t("loadError") : t("loading")}</main>;
  }

  const { result } = data;
  const passed = (result.score ?? 0) >= 60;
  const answeredPercent = result.totalQuestions ? Math.round((result.answeredQuestions / result.totalQuestions) * 100) : 0;
  const subjectStats = data.subjectStats;
  const filteredAnswers = data.answers.filter((answer) => answerFilter === "all" || (answerFilter === "correct" ? answer.isCorrect : answer.isCorrect === false));

  return (
    <div className="min-h-screen bg-[#0d0e12] text-[var(--foreground)]">
      <DashboardHeader />
      <div className="mx-auto w-full max-w-[1050px] space-y-4 px-4 py-8 sm:px-6 md:py-12">
        <section className="rounded-xl border border-[#263e70] bg-[#18294e] p-6 text-center">
          <p className="text-xs text-[#aeb5cf]">{data.exam.title}</p>
          <h1 className={`mt-4 text-lg font-bold ${passed ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>{passed ? "✓" : "✕"} {passed ? t("passed") : t("failed")}</h1>
          <p className="mt-3 text-4xl font-bold">{result.score ?? 0}<span className="text-base text-[var(--muted)]">/100</span></p>
          <p className="mt-2 text-xs text-[var(--muted)]">{t("percent", { value: result.score ?? 0 })}</p>
          <p className="mt-5 text-xs text-[#d7dbea]">📖 {t("encouragement")}</p>
          <div className="mt-6 grid grid-cols-4 gap-2 border-t border-white/10 pt-5 text-center">
            <div><strong className="block text-[var(--success)]">{result.correctAnswers}</strong><span className="text-[10px] text-[var(--muted)]">{t("correct")}</span></div>
            <div><strong className="block text-[var(--danger)]">{result.incorrectAnswers}</strong><span className="text-[10px] text-[var(--muted)]">{t("incorrect")}</span></div>
            <div><strong className="block text-[var(--warning)]">{result.unansweredQuestions}</strong><span className="text-[10px] text-[var(--muted)]">{t("unanswered")}</span></div>
            <div><strong className="block">00:00</strong><span className="text-[10px] text-[var(--muted)]">{t("time")}</span></div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 text-[10px]">
            <div className="rounded-lg border border-[rgba(143,227,77,0.2)] bg-[rgba(143,227,77,0.12)] p-3">{t("answeredProgress", { answered: result.answeredQuestions, total: result.totalQuestions })}<strong className="mt-1 block text-[var(--success)]">✓ {answeredPercent}%</strong></div>
            <div className="rounded-lg border border-[rgba(242,100,118,0.2)] bg-[rgba(242,100,118,0.12)] p-3">{t("unansweredProgress", { count: result.unansweredQuestions })}<strong className="mt-1 block text-[var(--danger)]">✕ {result.unansweredQuestions ? Math.round((result.unansweredQuestions / result.totalQuestions) * 100) : 0}%</strong></div>
          </div>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-bold">🟠 {t("answerSummary")}</h2>
          <p className="mt-1 text-[10px] text-[var(--muted)]">{t("answerSummaryDescription")}</p>
          <div className="mt-5 grid items-center gap-8 sm:grid-cols-[190px_1fr]"><div className="mx-auto size-40 rounded-full" style={{ background: `conic-gradient(var(--success) 0 ${result.totalQuestions ? result.correctAnswers / result.totalQuestions * 100 : 0}%, var(--danger) ${result.totalQuestions ? result.correctAnswers / result.totalQuestions * 100 : 0}% 100%)` }} /><div className="space-y-3 text-sm"><p className="flex items-center justify-between rounded-lg bg-[var(--surface-raised)] px-4 py-3"><span><span className="mr-2 inline-block size-2 rounded-full bg-[var(--success)]" />{t("correct")}</span><strong>{result.correctAnswers} {t("questionsUnit")}</strong></p><p className="flex items-center justify-between rounded-lg bg-[var(--surface-raised)] px-4 py-3"><span><span className="mr-2 inline-block size-2 rounded-full bg-[var(--danger)]" />{t("incorrect")}</span><strong>{result.incorrectAnswers} {t("questionsUnit")}</strong></p></div></div>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-bold">📊 {t("subjectSummary")}</h2><p className="mt-1 text-[10px] text-[var(--muted)]">{t("subjectSummaryDescription")}</p>
          <div className="mt-6 space-y-4 rounded-lg bg-[linear-gradient(to_right,transparent_0%,transparent_calc(25%_-_1px),rgba(152,153,168,0.12)_25%,transparent_calc(25%_+_1px),transparent_calc(50%_-_1px),rgba(152,153,168,0.12)_50%,transparent_calc(50%_+_1px),transparent_calc(75%_-_1px),rgba(152,153,168,0.12)_75%,transparent_calc(75%_+_1px),transparent_calc(100%_-_1px),rgba(152,153,168,0.12)_100%)] pb-2">{Object.entries(subjectStats).map(([subject, stats]) => { const percent = Math.round(stats.correct / stats.total * 100); return <div key={subject} className="grid grid-cols-[100px_1fr_70px] items-center gap-3 text-xs"><span className="truncate text-right text-[var(--muted)]">{subject}</span><div className="h-2 overflow-hidden rounded-full bg-[#24252d]"><div className={`h-full rounded-full ${percent >= 60 ? "bg-[var(--success)]" : percent > 0 ? "bg-[var(--warning)]" : "bg-[var(--danger)]"}`} style={{ width: `${percent}%` }} /></div><span className="text-[var(--muted)]">{stats.correct}/{stats.total} · {percent}%</span></div>; })}<div className="ml-[103px] flex justify-between text-[10px] text-[var(--muted)]"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div></div>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-bold">🟨 {t("improvementTitle")}</h2><p className="mt-1 text-[10px] text-[var(--muted)]">{t("improvementDescription")}</p>
          <div className="mt-4 space-y-3">{Object.entries(subjectStats).map(([subject, stats]) => { const percent = Math.round(stats.correct / stats.total * 100); return <div key={subject}><div className="flex items-center gap-2 text-[10px]"><span className="min-w-0 flex-1 truncate">{subject}</span><span className="text-[var(--muted)]">{stats.correct}/{stats.total}</span><span className={percent >= 60 ? "text-[var(--success)]" : "text-[var(--danger)]"}>{percent}%</span><button type="button" className="rounded-md bg-[var(--warning)] px-2 py-1 text-[9px] font-bold text-[#241a0a]">{t("practiceMore")}</button></div><div className="mt-1 h-1.5 rounded-full bg-[#24252d]"><div className={percent >= 60 ? "h-full rounded-full bg-[var(--success)]" : "h-full rounded-full bg-[var(--danger)]"} style={{ width: `${percent}%` }} /></div></div>; })}</div>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-bold">🔍 {t("reviewTitle")}</h2><p className="mt-1 text-[10px] text-[var(--muted)]">{t("reviewDescription")}</p>
          <div className="mt-3 flex gap-2"><button type="button" onClick={() => setAnswerFilter("all")} className={`rounded-md px-3 py-2 text-[10px] font-bold ${answerFilter === "all" ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-raised)] text-[var(--muted)]"}`}>{t("allAnswers")} ({data.answers.length})</button><button type="button" onClick={() => setAnswerFilter("incorrect")} className={`rounded-md px-3 py-2 text-[10px] font-bold ${answerFilter === "incorrect" ? "bg-[var(--danger)] text-white" : "bg-[var(--surface-raised)] text-[var(--muted)]"}`}>{t("wrongAnswers")} ({result.incorrectAnswers})</button><button type="button" onClick={() => setAnswerFilter("correct")} className={`rounded-md px-3 py-2 text-[10px] font-bold ${answerFilter === "correct" ? "bg-[var(--success)] text-[#15200f]" : "bg-[var(--surface-raised)] text-[var(--muted)]"}`}>{t("correctAnswers")} ({result.correctAnswers})</button></div>
          <div className="mt-3 space-y-2">{filteredAnswers.map((answer, index) => <article key={answer.questionId} className="rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-3 text-[10px]"><div className="flex justify-between gap-2"><strong>{t("questionNumber", { number: index + 1 })} · {answer.subject ?? t("unknownSubject")}</strong><span className={answer.isCorrect ? "text-[var(--success)]" : "text-[var(--danger)]"}>{answer.isCorrect ? "✓" : "✕"}</span></div><p className="mt-2 font-semibold">{answer.question}</p>{answer.selectedChoice ? <p className={`mt-2 rounded-md border px-2 py-1 ${answer.isCorrect ? "border-[rgba(143,227,77,0.55)] bg-[rgba(143,227,77,0.1)] text-[var(--success)]" : "border-[rgba(242,100,118,0.55)] bg-[rgba(242,100,118,0.1)] text-[var(--danger)]"}`}>{answer.isCorrect ? "✓" : "✕"} {t("yourAnswer")}: {answer.selectedChoice.text}</p> : null}{answer.correctChoice ? <p className="mt-2 rounded-md border border-[rgba(143,227,77,0.55)] bg-[rgba(143,227,77,0.1)] px-2 py-1 text-[var(--success)]">✓ {t("correctAnswer")}: {answer.correctChoice.text}</p> : null}{answer.explanation ? <div className="mt-3 rounded-md border-l-2 border-[var(--warning)] bg-[rgba(92,45,15,0.35)] px-3 py-2 text-[var(--warning)]"><strong>💡 {t("explanation")}</strong><p className="mt-1 leading-5">{answer.explanation}</p></div> : null}</article>)}</div>
        </section>
        <div className="flex flex-wrap justify-center gap-3 pb-8 pt-2"><Link href={`/${locale}`} className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-raised)]">← {t("backDashboard")}</Link><Link href={`/${locale}#activity`} className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-raised)]">📋 {t("viewHistory")}</Link><Link href={`/${locale}#exams`} className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--primary-bright)]">🔄 {t("retake")}</Link></div>
      </div>
    </div>
  );
}
