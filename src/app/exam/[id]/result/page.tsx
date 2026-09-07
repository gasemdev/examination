"use client";

import { PortalGuard } from "@/components/layout/PortalGuard";
import { ExamResultScreen } from "@/modules/exam/components/ExamResultScreen";

export default function ExamResultPage() {
  return <PortalGuard><ExamResultScreen /></PortalGuard>;
}
