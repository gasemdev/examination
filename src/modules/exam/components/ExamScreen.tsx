"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Typography } from "antd";
import { useTranslations } from "next-intl";

import { ExamHeader } from "@/modules/exam/components/ExamHeader";
import { ExamNavigation } from "@/modules/exam/components/ExamNavigation";
import { ExamProgress } from "@/modules/exam/components/ExamProgress";
import { QuestionCard } from "@/modules/exam/components/QuestionCard";
import { QuestionNavigator } from "@/modules/exam/components/QuestionNavigator";
import { PageErrorState, PageLoadingState } from "@/components/ui/PageState";
import { useExam } from "@/modules/exam/hooks/useExam";
import { useExamAnswers } from "@/modules/exam/hooks/useExamAnswers";
import {
  getAnsweredCount,
  getAttemptQuestions,
  getProgressPercent,
} from "@/modules/exam/utils/exam.utils";

const { Text } = Typography;

export function ExamScreen() {
  const t = useTranslations("exam");
  const params = useParams();
  const attemptId = Number(params.id);
  const { attempt, answers, setAnswers, loading } = useExam(attemptId);
  const questions = getAttemptQuestions(attempt);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentExamQuestion = questions[currentIndex];
  const currentQuestion = currentExamQuestion?.question;
  const { saving, handleAnswer } = useExamAnswers(
    attemptId,
    currentQuestion?.id,
    setAnswers
  );
  const answeredCount = getAnsweredCount(answers);
  const progressPercent = getProgressPercent(answeredCount, questions.length);

  if (loading) {
    return <PageLoadingState>{t("loading")}</PageLoadingState>;
  }

  if (!attempt || !currentExamQuestion || !currentQuestion) {
    return <PageErrorState><Text type="danger">{t("notFound")}</Text></PageErrorState>;
  }

  return (
    <main className="app-shell min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <ExamHeader attempt={attempt} currentQuestion={currentExamQuestion} questionCount={questions.length} />
        <ExamProgress answeredCount={answeredCount} questionCount={questions.length} progressPercent={progressPercent} />
        <QuestionCard question={currentQuestion} selectedChoiceId={answers[currentQuestion.id]} saving={saving} onAnswer={handleAnswer} />
        <ExamNavigation currentIndex={currentIndex} questionCount={questions.length} onPrevious={() => setCurrentIndex((index) => Math.max(index - 1, 0))} onNext={() => setCurrentIndex((index) => Math.min(index + 1, questions.length - 1))} />
        <QuestionNavigator questions={questions} answers={answers} currentIndex={currentIndex} onSelect={setCurrentIndex} />
      </div>
    </main>
  );
}
