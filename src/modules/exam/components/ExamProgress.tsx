import { Card, Progress, Typography } from "antd";
import { useTranslations } from "next-intl";

const { Text } = Typography;

type ExamProgressProps = {
  answeredCount: number;
  questionCount: number;
  progressPercent: number;
};

export function ExamProgress({
  answeredCount,
  questionCount,
  progressPercent,
}: ExamProgressProps) {
  const t = useTranslations("exam");
  return (
    <Card>
      <div className="space-y-3">
        <div className="flex justify-between">
          <Text strong className="!text-white">{t("progress")}</Text>
          <Text>
            {t("answered", { count: answeredCount, total: questionCount })}
          </Text>
        </div>
        <Progress percent={progressPercent} showInfo />
      </div>
    </Card>
  );
}