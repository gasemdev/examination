"use client";

import { PortalGuard } from "@/components/layout/PortalGuard";
import { ExamScreen } from "@/modules/exam/components/ExamScreen";

export default function ExamPage() {
  return (
    <PortalGuard>
      <ExamScreen />
    </PortalGuard>
  );
}
