import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
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

    // 1. ดึง Attempt
    const attempt = await prisma.examAttempt.findUnique({
      where: {
        id: attemptId,
      },
      include: {
        exam: {
          include: {
            questions: true,
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { message: "ไม่พบ Attempt" },
        { status: 404 }
      );
    }

    // 2. ตรวจว่าส่งข้อสอบไปแล้วหรือยัง
    if (attempt.completedAt) {
      return NextResponse.json({
        attemptId: attempt.id,
        score: attempt.score,
        completedAt: attempt.completedAt,
        alreadySubmitted: true,
      });
    }

    // 3. ดึงคำตอบที่ถูกต้องของแต่ละข้อ
    const questionIds = attempt.exam.questions.map(
      (examQuestion) => examQuestion.questionId
    );

    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: questionIds,
        },
      },
      include: {
        choices: {
          select: {
            id: true,
            isCorrect: true,
          },
        },
      },
    });

    // 4. ตรวจคำตอบ
    let correctAnswers = 0;

    const answerResults = attempt.answers.map((answer) => {
      const question = questions.find(
        (q) => q.id === answer.questionId
      );

      const selectedChoice = question?.choices.find(
        (choice) => choice.id === answer.choiceId
      );

      const isCorrect = selectedChoice?.isCorrect ?? false;

      if (isCorrect) {
        correctAnswers++;
      }

      return {
        answerId: answer.id,
        isCorrect,
      };
    });

    // 5. จำนวนข้อทั้งหมด
    const totalQuestions = attempt.exam.questions.length;

    // 6. คำนวณคะแนนเต็ม 100
    const score =
      totalQuestions > 0
        ? Number(((correctAnswers / totalQuestions) * 100).toFixed(2))
        : 0;

    const completedAt = new Date();

    // 7. บันทึกผลทั้งหมดใน Transaction
    const result = await prisma.$transaction(async (tx) => {
      for (const answerResult of answerResults) {
        await tx.answer.update({
          where: {
            id: answerResult.answerId,
          },
          data: {
            isCorrect: answerResult.isCorrect,
          },
        });
      }

      return tx.examAttempt.update({
        where: {
          id: attemptId,
        },
        data: {
          score,
          completedAt,
        },
      });
    });

    return NextResponse.json({
      attemptId: result.id,
      score: result.score,
      totalQuestions,
      answeredQuestions: attempt.answers.length,
      correctAnswers,
      incorrectAnswers:
        attempt.answers.length - correctAnswers,
      completedAt: result.completedAt,
    });
  } catch (error) {
    console.error("POST /api/attempts/:id/submit error:", error);

    return NextResponse.json(
      {
        message: "ไม่สามารถส่งข้อสอบได้",
      },
      { status: 500 }
    );
  }
}
