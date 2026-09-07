"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Attempt } from "@/modules/exam/types/exam.types";
import { saveAnswer } from "@/modules/exam/services/exam.service";

export function PracticeExamScreen({ attempt, count }: { attempt: Attempt; count: number }) {
  const t = useTranslations("exam");
  const router = useRouter();
  const params = useParams<{ lang?: string }>();
  const questions = attempt.exam.questions.slice(0, count);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [savingQuestion, setSavingQuestion] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [showQuestionNavigator, setShowQuestionNavigator] = useState(true);

  useEffect(() => {
    const questionElements = questions
      .map((question) => document.getElementById(`question-${question.question.id}`))
      .filter((element): element is HTMLElement => element !== null);

    if (!questionElements.length) return;

    function updateActiveQuestion() {
      const readingLine = window.innerHeight * 0.3;
      let nextIndex = questionElements.findIndex((element) => element.getBoundingClientRect().top > readingLine) - 1;

      if (nextIndex < 0) nextIndex = 0;
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) {
        nextIndex = questionElements.length - 1;
      }

      setActiveQuestionIndex(Math.min(nextIndex, questionElements.length - 1));
    }

    updateActiveQuestion();
    window.addEventListener("scroll", updateActiveQuestion, { passive: true });
    window.addEventListener("resize", updateActiveQuestion);
    return () => {
      window.removeEventListener("scroll", updateActiveQuestion);
      window.removeEventListener("resize", updateActiveQuestion);
    };
  }, [questions]);

  async function answerQuestion(questionId: number, choiceId: number) {
    setAnswers((current) => ({ ...current, [questionId]: choiceId }));
    setSavingQuestion(questionId);
    try {
      await saveAnswer(attempt.id, questionId, choiceId);
    } finally {
      setSavingQuestion(null);
    }
  }

  function leaveExam() {
    window.localStorage.setItem("pausedExam", JSON.stringify({
      attemptId: attempt.id,
      title: attempt.exam.title,
      count,
    }));
    router.push(`/${params.lang ?? "th"}`);
  }

  async function submitExam() {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(`/api/attempts/${attempt.id}/submit`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(payload?.message ?? "ไม่สามารถส่งข้อสอบได้");
      }
      window.localStorage.removeItem("pausedExam");
      router.push(`/${params.lang ?? "th"}/exam/${attempt.id}/result`);
    } catch (error) {
      console.error(error);
      setSubmitError(error instanceof Error ? error.message : "ไม่สามารถส่งข้อสอบได้");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0e12] pb-24 text-[var(--foreground)]">
      <header className="sticky top-0 z-20 border-b border-[rgba(245,170,58,0.45)] bg-[#111a37] px-4 py-3 shadow-[0_4px_18px_rgba(0,0,0,0.28)] md:px-8">
        <div className="mx-auto flex max-w-[1010px] items-center justify-between gap-3">
          <div className="min-w-0"><h1 className="truncate text-sm font-bold md:text-base">🏆 {attempt.exam.title}</h1><p className="mt-1 truncate text-[10px] text-[#aeb5cf]">{attempt.exam.description}</p></div>
          <div className="flex shrink-0 items-center gap-2"><span className="hidden rounded-lg bg-[#5c3d0e] px-3 py-2 text-[10px] font-bold text-[#ffc34f] sm:block">⚡ {t("noTimer")}</span><button type="button" onClick={() => setCancelConfirmationOpen(true)} className="rounded-lg border border-[#3c465f] px-3 py-2 text-[10px] font-semibold text-[#d7dbea]">× {t("cancel")}</button><button type="button" onClick={() => setSubmitted(true)} className="rounded-lg bg-[var(--warning)] px-3 py-2 text-[10px] font-bold text-[#241a0a]">{t("submitExam")}</button></div>
        </div>
      </header>
      <main className="mx-auto max-w-[1010px] space-y-10 px-4 py-8 md:px-8 md:py-12">
        {questions.map((examQuestion) => {
          const question = examQuestion.question;
          const answered = answers[question.id] !== undefined;
          return <article id={`question-${question.id}`} key={question.id} className="space-y-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"><div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><span>{t("question", { current: examQuestion.order, total: questions.length })}</span><span className="rounded-md bg-[var(--primary)] px-2 py-1 text-[9px] text-white sm:px-3 sm:text-[10px]">{question.subject.name}</span>{answered ? <span className="rounded-md bg-[rgba(143,227,77,0.16)] px-2 py-1 text-[9px] font-bold text-[var(--success)] sm:text-[10px]">✓ {t("answeredStatus")}</span> : null}</div><div className="flex flex-wrap gap-1 sm:gap-2"><button type="button" className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[9px] text-[var(--muted)] sm:px-3 sm:py-2 sm:text-[10px]">☆ {t("flag")}</button><button type="button" className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[9px] text-[var(--muted)] sm:px-3 sm:py-2 sm:text-[10px]">♥ {t("favorite")}</button><button type="button" className="rounded-lg border border-[rgba(242,100,118,0.4)] bg-[var(--surface)] px-2 py-1 text-[9px] text-[var(--danger)] sm:px-3 sm:py-2 sm:text-[10px]">⚑ {t("report")}</button></div></div><h2 className="text-base font-bold leading-7 md:text-lg">{question.question}</h2><div className="space-y-3">{question.choices.map((choice, choiceIndex) => { const selected = answers[question.id] === choice.id; return <button type="button" key={choice.id} onClick={() => void answerQuestion(question.id, choice.id)} aria-pressed={selected} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left text-sm transition ${selected ? "border-[#5148ff] bg-[#302d75]" : "border-[var(--border)] bg-[#1b1c22] hover:border-[var(--primary-bright)]"}`}><span className={`grid size-4 shrink-0 place-items-center rounded-full border-2 ${selected ? "border-white bg-white" : "border-white/80"}`}><span className={`size-2 rounded-full ${selected ? "bg-[#5148ff]" : "hidden"}`} /></span><strong className={`w-5 shrink-0 ${selected ? "text-[#aaa5ff]" : "text-[var(--muted)]"}`}>{String.fromCharCode(0xE01 + choiceIndex)}</strong><span>{choice.text}</span>{savingQuestion === question.id && selected ? <span className="ml-auto text-[10px] text-[var(--muted)]">{t("saving")}</span> : null}</button>; })}</div></article>;
        })}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border)] bg-[#202127] px-3 py-2"><div className="mx-auto flex max-w-[1410px] items-center justify-between gap-2"><button type="button" onClick={() => setShowQuestionNavigator((visible) => !visible)} className="shrink-0 rounded-lg border border-[var(--border)] px-2 py-2 text-[10px] text-[var(--muted)]">{showQuestionNavigator ? `▼ ${t.has("hideQuestions") ? t("hideQuestions") : "ซ่อน"}` : `▲ ${t.has("showQuestions") ? t("showQuestions") : "แสดง"}`}</button>{showQuestionNavigator ? <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">{questions.map((question, index) => { const answered = answers[question.question.id] !== undefined; const active = index === activeQuestionIndex; return <a key={question.question.id} href={`#question-${question.question.id}`} aria-label={`${t("question", { current: question.order, total: questions.length })}${answered ? ` - ${t("answeredStatus")}` : ""}`} className={`grid size-9 shrink-0 place-items-center rounded-lg border text-[11px] font-bold ${answered ? "border-[var(--success)] bg-[rgba(143,227,77,0.14)] text-[var(--success)]" : active ? "border-transparent bg-[var(--primary)] text-white" : "border-[var(--border)] text-[var(--muted)]"}`}>{answered ? <span className="flex items-center gap-0.5 leading-none"><span className="text-sm">✓</span><span>{question.order}</span></span> : question.order}</a>; })}</div> : <span className="flex-1 text-center text-[10px] text-[var(--muted)]">{t("question", { current: activeQuestionIndex + 1, total: questions.length })}</span>}<div className="flex shrink-0 items-center gap-1.5"><button type="button" onClick={() => setCancelConfirmationOpen(true)} className="hidden rounded-lg border border-[var(--border)] px-3 py-2 text-[10px] text-[var(--muted)] sm:block">× {t("cancel")}</button><button type="button" onClick={() => setSubmitted(true)} className="rounded-lg bg-[var(--warning)] px-3 py-2 text-[10px] font-bold text-[#241a0a]">{t("submitExam")}</button></div></div></nav>
      {submitted ? <div className="fixed inset-0 z-30 grid place-items-center bg-black/75 p-4 backdrop-blur-[5px]"><div role="dialog" aria-modal="true" className="w-full max-w-[440px] rounded-[18px] border border-[var(--border)] bg-[var(--surface-raised)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]"><h2 className="text-base font-bold">{t("submitConfirm")}</h2><p className="mt-3 text-xs font-semibold">{t("answeredSummary", { answered: Object.keys(answers).length, total: questions.length })}</p>{questions.length - Object.keys(answers).length > 0 ? <p className="mt-2 text-xs font-semibold text-[var(--warning)]">{t("unansweredSummary", { count: questions.length - Object.keys(answers).length })}</p> : null}{submitError ? <p role="alert" className="mt-3 rounded-lg bg-[rgba(242,100,118,0.12)] px-3 py-2 text-xs font-semibold text-[var(--danger)]">{submitError}</p> : null}<div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setSubmitted(false)} disabled={submitting} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold">{t("backToExam")}</button><button type="button" onClick={() => void submitExam()} disabled={submitting} className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-bold text-white disabled:opacity-60">{submitting ? t("submittingExam") : t("confirmSubmit")}</button></div></div></div> : null}
      {cancelConfirmationOpen ? <div className="fixed inset-0 z-30 grid place-items-center bg-black/75 p-4 backdrop-blur-[5px]"><div role="dialog" aria-modal="true" className="w-full max-w-[440px] rounded-[18px] border border-[var(--border)] bg-[var(--surface-raised)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]"><h2 className="text-base font-bold">{t("leaveExamTitle")}</h2><p className="mt-3 text-xs leading-5 text-[var(--muted)]">{t("leaveExamDescription")}</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setCancelConfirmationOpen(false)} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold">{t("continueExam")}</button><button type="button" onClick={leaveExam} className="rounded-lg bg-[var(--danger)] px-3 py-2 text-xs font-bold text-white">{t("leaveExam")}</button></div></div></div> : null}
    </div>
  );
}
