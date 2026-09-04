import { Card, Tag, Typography } from "antd";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

import type { Attempt, ExamQuestion } from "@/modules/exam/types/exam.types";

const { Title, Text } = Typography;

type ExamHeaderProps = {
  attempt: Attempt;
  currentQuestion: ExamQuestion;
  questionCount: number;
};

export function ExamHeader({
  attempt,
  currentQuestion,
  questionCount,
}: ExamHeaderProps) {
  const t = useTranslations("exam");
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Text className="!text-xs !font-semibold !uppercase !tracking-[0.14em] !text-[#7e72ff]">
            {t("inProgress")}
          </Text>
          <Title level={3} className="mb-1! mt-2! text-white!">
            {attempt.exam.title}
          </Title>
          <Text type="secondary">{attempt.exam.description}</Text>
        </div>
        <div className="flex items-center gap-3"><LanguageSwitcher /><Tag color="#6658e8" className="!rounded-md !border-0 !px-3 !py-1 !font-semibold">
          {t("question", { current: currentQuestion.order, total: questionCount })}
        </Tag></div>
      </div>
    </Card>
  );
}