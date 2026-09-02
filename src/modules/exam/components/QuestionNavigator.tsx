import { Button, Card } from "antd";

import type { ExamQuestion } from "@/modules/exam/types/exam.types";

type QuestionNavigatorProps = {
  questions: ExamQuestion[];
  answers: Record<number, number>;
  currentIndex: number;
  onSelect: (index: number) => void;
};

export function QuestionNavigator({
  questions,
  answers,
  currentIndex,
  onSelect,
}: QuestionNavigatorProps) {
  return (
    <Card title="เลือกข้อสอบ">
      <div className="flex flex-wrap gap-2">
        {questions.map((examQuestion, index) => {
          const answered = answers[examQuestion.question.id] !== undefined;

          return (
            <Button
              key={examQuestion.question.id}
              type={index === currentIndex ? "primary" : "default"}
              onClick={() => onSelect(index)}
            >
              <span>
                {examQuestion.order}
                {answered ? " ✓" : ""}
              </span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}