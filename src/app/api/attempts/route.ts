import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const userId = Number(body.userId);
    const examId = Number(body.examId);

    if (!userId || !examId) {
      return NextResponse.json(
        {
          message: "userId และ examId จำเป็นต้องระบุ",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "ไม่พบผู้ใช้งาน",
        },
        { status: 404 }
      );
    }

    const exam = await prisma.exam.findUnique({
      where: {
        id: examId,
      },
    });

    if (!exam) {
      return NextResponse.json(
        {
          message: "ไม่พบข้อสอบ",
        },
        { status: 404 }
      );
    }

    const attempt = await prisma.examAttempt.create({
      data: {
        userId,
        examId,
      },
    });

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error("POST /api/attempts error:", error);

    return NextResponse.json(
      {
        message: "ไม่สามารถเริ่มทำข้อสอบได้",
      },
      { status: 500 }
    );
  }
}