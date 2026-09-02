export type Choice = {
  id: number;
  text: string;
};

export type Question = {
  id: number;
  question: string;
  choices: Choice[];
  subject: {
    id: number;
    name: string;
  };
};

export type ExamQuestion = {
  order: number;
  question: Question;
};

export type Answer = {
  id: number;
  attemptId: number;
  questionId: number;
  choiceId: number | null;
};

export type Attempt = {
  id: number;
  examId: number;
  score: number | null;
  startedAt: string;
  completedAt: string | null;

  exam: {
    id: number;
    title: string;
    description: string | null;
    duration: number | null;
    questions: ExamQuestion[];
  };

  answers: Answer[];
};
