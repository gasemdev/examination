import { Button, Card, Typography } from "antd";
import { useTranslations } from "next-intl";

const { Text } = Typography;

type ExamNavigationProps = {
  currentIndex: number;
  questionCount: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function ExamNavigation({
  currentIndex,
  questionCount,
  onPrevious,
  onNext,
}: ExamNavigationProps) {
  const t = useTranslations("exam");
  return (
    <Card>
      <div className="flex items-center justify-between">
          <Button onClick={onPrevious} disabled={currentIndex === 0}>
          ← {t("previous")}
        </Button>
        <Text className="!text-sm !font-semibold !text-white">
          {currentIndex + 1} / {questionCount}
        </Text>
        <Button
          type="primary"
          onClick={onNext}
          disabled={currentIndex === questionCount - 1}
        >
          {t("next")} →
        </Button>
      </div>
    </Card>
  );
}