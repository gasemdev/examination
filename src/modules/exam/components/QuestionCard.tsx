import { Card, Radio, Space, Typography } from "antd";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("exam");
  return (
    <Card>
      <div className="space-y-6">
        <div>
          <Text className="!text-xs !font-semibold !uppercase !tracking-[0.12em] !text-[#7e72ff]">{question.subject.name}</Text>
          <Title level={4} className="mt-2! text-white!">
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
                className="w-full rounded-xl border p-4"
              >
                {choice.text}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
        {saving && <Text type="secondary" className="!text-xs">{t("saving")}</Text>}
      </div>
    </Card>
  );
}