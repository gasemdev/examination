import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const current = await getSessionUser();
    if (!current) {
      return NextResponse.json({ message: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }
    const userId = current.user.id;

    const [subjects, exams, attempts] = await Promise.all([
      prisma.subject.findMany({
        orderBy: { name: "asc" },
        include: { questions: { where: { isActive: true }, select: { id: true } } },
      }),
      prisma.exam.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { questions: true } } },
      }),
      prisma.examAttempt.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        include: {
          exam: {
            include: {
              questions: {
                include: { question: { include: { subject: true } } },
              },
            },
          },
          answers: {
            include: { question: { include: { subject: true } } },
          },
        },
      }),
    ]);

    const completedAttempts = attempts.filter((attempt) => attempt.completedAt);
    const scores = completedAttempts
      .map((attempt) => attempt.score)
      .filter((score): score is number => score !== null);
    const answeredAnswers = attempts.flatMap((attempt) => attempt.answers);
    const correctAnswers = answeredAnswers.filter(
      (answer) => answer.isCorrect === true
    ).length;
    const averageScore = scores.length
      ? Number((scores.reduce((total, score) => total + score, 0) / scores.length).toFixed(2))
      : 0;
    const totalQuestionCount = attempts.reduce(
      (total, attempt) => total + attempt.exam.questions.length,
      0
    );
    const completedThisWeek = completedAttempts.filter((attempt) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return attempt.completedAt && attempt.completedAt >= weekAgo;
    }).length;

    const subjectStats = subjects.map((subject) => {
      const subjectAnswers = answeredAnswers.filter(
        (answer) => answer.question.subjectId === subject.id
      );
      const correct = subjectAnswers.filter(
        (answer) => answer.isCorrect === true
      ).length;

      return {
        id: subject.id,
        name: subject.name,
        accuracy: subjectAnswers.length
          ? Math.round((correct / subjectAnswers.length) * 100)
          : 0,
        answered: subjectAnswers.length,
        questionCount: subject.questions.length,
      };
    });

    return NextResponse.json({
      user: { id: current.user.id, name: current.user.name, email: current.user.email },
      stats: {
        completedAttempts: completedAttempts.length,
        averageScore,
        totalAnswers: answeredAnswers.length,
        accuracy: answeredAnswers.length
          ? Math.round((correctAnswers / answeredAnswers.length) * 100)
          : 0,
        completedThisWeek,
        weeklyGoal: 5,
        weeklyProgress: Math.min(Math.round((completedThisWeek / 5) * 100), 100),
        totalQuestionCount,
      },
      subjects: subjectStats,
      recentAttempts: completedAttempts.slice(0, 5).map((attempt) => ({
        id: attempt.id,
        examTitle: attempt.exam.title,
        score: attempt.score,
        completedAt: attempt.completedAt,
        questionCount: attempt.exam.questions.length,
      })),
      scoreTrend: completedAttempts
        .slice(0, 7)
        .reverse()
        .map((attempt) => ({
          score: attempt.score ?? 0,
          completedAt: attempt.completedAt,
        })),
      exams: exams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        questionCount: exam._count.questions,
      })),
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้" },
      { status: 500 }
    );
  }
}
