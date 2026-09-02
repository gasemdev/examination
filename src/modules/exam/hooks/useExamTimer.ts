"use client";

import { useEffect, useState } from "react";

export function useExamTimer(
  startedAt: string | undefined,
  durationMinutes: number | null | undefined
) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!startedAt || !durationMinutes) {
      return;
    }

    const updateRemainingTime = () => {
      const durationSeconds = durationMinutes * 60;
      const elapsedSeconds = Math.floor(
        (Date.now() - new Date(startedAt).getTime()) / 1000
      );

      setRemainingSeconds(Math.max(durationSeconds - elapsedSeconds, 0));
    };

    updateRemainingTime();
    const intervalId = window.setInterval(updateRemainingTime, 1000);

    return () => window.clearInterval(intervalId);
  }, [durationMinutes, startedAt]);

  return {
    remainingSeconds,
    isExpired: remainingSeconds === 0,
  };
}