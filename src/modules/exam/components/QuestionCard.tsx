import { Card, Radio, Space, Typography } from "antd";

import type { Question } from "@/modules/exam/types/exam.types";

const { Title, Text } = Typography;

type QuestionCardProps = {
  question: Question;
  selectedChoiceId: number | undefined;
  saving: boolean;
  onAnswer: (choiceId: number) => void;
};

export function QuestionCard({
  question,
  selectedChoiceId,
  saving,
  onAnswer,
}: QuestionCardProps) {
  return (
    <Card>
      <div className="space-y-6">
        <div>
          <Text type="secondary">{question.subject.name}</Text>
          <Title level={4} className="!mt-2">
            {question.question}
          </Title>
        </div>
        <Radio.Group
          value={selectedChoiceId}
          onChange={(event) => onAnswer(event.target.value)}
          className="w-full"
        >
          <Space orientation="vertical" size="middle" className="w-full">
            {question.choices.map((choice) => (
              <Radio
                key={choice.id}
                value={choice.id}
                className="w-full rounded-lg border border-slate-200 p-4"
              >
                {choice.text}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
        {saving && <Text type="secondary">กำลังบันทึกคำตอบ...</Text>}
      </div>
    </Card>
  );
}