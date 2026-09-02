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
        answers: true,
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { message: "ไม่พบ Attempt" },
        { status: 404 }
      );
    }

    return NextResponse.json(attempt);
  } catch (error) {
    console.error("GET /api/attempts/:id error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถโหลดข้อมูลการทำข้อสอบได้" },
      { status: 500 }
    );
  }
}
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

    const body = await request.json();

    const questionId = Number(body.questionId);
    const choiceId = Number(body.choiceId);

    if (!questionId || !choiceId) {
      return NextResponse.json(
        {
          message: "questionId และ choiceId จำเป็นต้องระบุ",
        },
        { status: 400 }
      );
    }

    // ตรวจว่า Attempt มีอยู่จริง
    const attempt = await prisma.examAttempt.findUnique({
      where: {
        id: attemptId,
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { message: "ไม่พบ Attempt" },
        { status: 404 }
      );
    }

    // ตรวจว่าข้อนี้อยู่ในข้อสอบของ Attempt จริง
    const examQuestion = await prisma.examQuestion.findUnique({
      where: {
        examId_questionId: {
          examId: attempt.examId,
          questionId,
        },
      },
    });

    if (!examQuestion) {
      return NextResponse.json(
        {
          message: "คำถามนี้ไม่ได้อยู่ในข้อสอบ",
        },
        { status: 400 }
      );
    }

    // ตรวจว่า Choice เป็นของ Question นี้จริง
    const choice = await prisma.choice.findFirst({
      where: {
        id: choiceId,
        questionId,
      },
    });

    if (!choice) {
      return NextResponse.json(
        {
          message: "ตัวเลือกนี้ไม่ตรงกับคำถาม",
        },
        { status: 400 }
      );
    }

    // บันทึกคำตอบ
    const answer = await prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      update: {
        choiceId,
        answeredAt: new Date(),
      },
      create: {
        attemptId,
        questionId,
        choiceId,
      },
    });

    return NextResponse.json(answer, { status: 201 });
  } catch (error) {
    console.error("POST /api/attempts/:id error:", error);

    return NextResponse.json(
      {
        message: "ไม่สามารถบันทึกคำตอบได้",
      },
      { status: 500 }
    );
  }
}
