import { Button, Card, Typography } from "antd";

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
  return (
    <Card>
      <div className="flex items-center justify-between">
        <Button onClick={onPrevious} disabled={currentIndex === 0}>
          ← ก่อนหน้า
        </Button>
        <Text>
          {currentIndex + 1} / {questionCount}
        </Text>
        <Button
          type="primary"
          onClick={onNext}
          disabled={currentIndex === questionCount - 1}
        >
          ถัดไป →
        </Button>
      </div>
    </Card>
  );
}