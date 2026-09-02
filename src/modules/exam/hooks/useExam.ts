"use client";

import { useEffect, useState } from "react";

import { getAttempt } from "@/modules/exam/services/exam.service";
import type { Attempt } from "@/modules/exam/types/exam.types";
import { getAnswersByQuestion } from "@/modules/exam/utils/exam.utils";

export function useExam(attemptId: number) {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;

    let isMounted = true;

    getAttempt(attemptId)
      .then((data) => {
        if (!isMounted) return;

        setAttempt(data);
        setAnswers(getAnswersByQuestion(data.answers));
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [attemptId]);

  return { attempt, answers, setAnswers, loading };
}