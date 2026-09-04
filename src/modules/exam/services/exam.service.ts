import type { Attempt } from "@/modules/exam/types/exam.types";

export async function getAttempt(attemptId: number): Promise<Attempt> {
  const response = await fetch(`/api/attempts/${attemptId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("ไม่สามารถโหลดข้อสอบได้");
  }

  return response.json() as Promise<Attempt>;
}

export async function saveAnswer(
  attemptId: number,
  questionId: number,
  choiceId: number
): Promise<void> {
  const response = await fetch(`/api/attempts/${attemptId}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ questionId, choiceId }),
  });

  if (!response.ok) {
    throw new Error("ไม่สามารถบันทึกคำตอบได้");
  }
}