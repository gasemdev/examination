import type { Answer, Attempt } from "@/modules/exam/types/exam.types";

export function getAnswersByQuestion(
  answers: Answer[]
): Record<number, number> {
  return answers.reduce<Record<number, number>>((result, answer) => {
    if (answer.choiceId !== null) {
      result[answer.questionId] = answer.choiceId;
    }

    return result;
  }, {});
}

export function getAnsweredCount(answers: Record<number, number>): number {
  return Object.keys(answers).length;
}

export function getProgressPercent(
  answeredCount: number,
  questionCount: number
): number {
  return questionCount > 0
    ? Math.round((answeredCount / questionCount) * 100)
    : 0;
}

export function getAttemptQuestions(attempt: Attempt | null) {
  return attempt?.exam.questions ?? [];
}