import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attemptId = Number(id);

    if (Number.isNaN(attemptId)) {
      return NextResponse.json(
        { message: "attemptId ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: {
        id: attemptId,
      },
      include: {
        exam: {
          include: {
            questions: {
              orderBy: {
                order: "asc",
              },
              include: {
                question: {
                  include: {
                    choices: {
                      select: {
                        id: true,
                        text: true,
                        isCorrect: true,
                      },
                      orderBy: {
                        id: "asc",
                      },
                    },
                    subject: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                explanation: true,
              },
            },
            choice: {
              select: {
                id: true,
                text: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { message: "ไม่พบ Attempt" },
        { status: 404 }
      );
    }

    // ยังไม่ส่งข้อสอบ
    if (!attempt.completedAt) {
      return NextResponse.json(
        {
          message: "ยังไม่สามารถดูผลสอบได้ กรุณาส่งข้อสอบก่อน",
        },
        { status: 400 }
      );
    }

    const totalQuestions = attempt.exam.questions.length;
    const answeredQuestions = attempt.answers.length;

    const correctAnswers = attempt.answers.filter(
      (answer) => answer.isCorrect === true
    ).length;

    const incorrectAnswers = attempt.answers.filter(
      (answer) => answer.isCorrect === false
    ).length;

    const unansweredQuestions =
      totalQuestions - answeredQuestions;

    const subjectStats = attempt.exam.questions.reduce<Record<string, { correct: number; total: number }>>((stats, examQuestion) => {
      const subject = examQuestion.question.subject.name;
      stats[subject] ??= { correct: 0, total: 0 };
      stats[subject].total += 1;
      const answer = attempt.answers.find((item) => item.questionId === examQuestion.questionId);
      if (answer?.isCorrect) stats[subject].correct += 1;
      return stats;
    }, {});

    return NextResponse.json({
      attemptId: attempt.id,

      exam: {
        id: attempt.exam.id,
        title: attempt.exam.title,
        description: attempt.exam.description,
        duration: attempt.exam.duration,
      },

      result: {
        score: attempt.score,
        totalQuestions,
        answeredQuestions,
        unansweredQuestions,
        correctAnswers,
        incorrectAnswers,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
      },

      subjectStats,

      answers: attempt.answers.map((answer) => {
        const question = attempt.exam.questions.find(
          (examQuestion) =>
            examQuestion.questionId === answer.questionId
        );

        const correctChoice = question?.question.choices.find(
          (choice) => choice.isCorrect
        );

        return {
          questionId: answer.questionId,
          question: answer.question.question,
          explanation: answer.question.explanation,
          subject: question?.question.subject.name ?? null,

          selectedChoice: answer.choice
            ? {
                id: answer.choice.id,
                text: answer.choice.text,
              }
            : null,

          correctChoice: correctChoice
            ? {
                id: correctChoice.id,
                text: correctChoice.text,
              }
            : null,

          isCorrect: answer.isCorrect,
          answeredAt: answer.answeredAt,
        };
      }),
    });
  } catch (error) {
    console.error("GET /api/attempts/:id/result error:", error);

    return NextResponse.json(
      {
        message: "ไม่สามารถโหลดผลสอบได้",
      },
      { status: 500 }
    );
  }
}
