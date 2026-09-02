import { Card, Progress, Typography } from "antd";

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
  return (
    <Card>
      <div className="space-y-3">
        <div className="flex justify-between">
          <Text strong>ความคืบหน้า</Text>
          <Text>
            {answeredCount} / {questionCount} ข้อ
          </Text>
        </div>
        <Progress percent={progressPercent} showInfo />
      </div>
    </Card>
  );
}