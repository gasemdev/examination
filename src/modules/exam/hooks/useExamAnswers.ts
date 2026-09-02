"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

import { saveAnswer } from "@/modules/exam/services/exam.service";

export function useExamAnswers(
  attemptId: number,
  questionId: number | undefined,
  setAnswers: Dispatch<SetStateAction<Record<number, number>>>
) {
  const [saving, setSaving] = useState(false);

  async function handleAnswer(choiceId: number) {
    if (questionId === undefined) return;

    setAnswers((previous) => ({
      ...previous,
      [questionId]: choiceId,
    }));

    try {
      setSaving(true);
      await saveAnswer(attemptId, questionId, choiceId);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  return { saving, handleAnswer };
}