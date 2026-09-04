export type DashboardData = {
  user: { name: string | null; email: string };
  stats: {
    completedAttempts: number;
    averageScore: number;
    totalAnswers: number;
    accuracy: number;
    completedThisWeek: number;
    weeklyGoal: number;
    weeklyProgress: number;
  };
  subjects: {
    id: number;
    name: string;
    accuracy: number;
    answered: number;
    questionCount: number;
  }[];
  recentAttempts: {
    id: number;
    examTitle: string;
    score: number | null;
    completedAt: string;
    questionCount: number;
  }[];
  scoreTrend: { score: number; completedAt: string | null }[];
  exams: {
    id: number;
    title: string;
    description: string | null;
    duration: number | null;
    questionCount: number;
  }[];
};
