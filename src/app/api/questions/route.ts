import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const subjectIdParam = searchParams.get("subjectId");

    const subjectId = subjectIdParam
      ? Number(subjectIdParam)
      : undefined;

    if (subjectIdParam && Number.isNaN(subjectId)) {
      return NextResponse.json(
        { message: "subjectId ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const questions = await prisma.question.findMany({
      where: {
        isActive: true,
        ...(subjectId !== undefined ? { subjectId } : {}),
      },
      orderBy: {
        id: "asc",
      },
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
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("GET /api/questions error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถโหลดข้อสอบได้" },
      { status: 500 }
    );
  }
}
