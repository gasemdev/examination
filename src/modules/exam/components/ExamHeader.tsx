import { Card, Tag, Typography } from "antd";

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
  return (
    <Card>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Title level={3} className="!mb-1">
            {attempt.exam.title}
          </Title>
          <Text type="secondary">{attempt.exam.description}</Text>
        </div>
        <Tag color="blue">
          ข้อ {currentQuestion.order} / {questionCount}
        </Tag>
      </div>
    </Card>
  );
}