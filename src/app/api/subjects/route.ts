import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("GET /api/subjects error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถโหลดวิชาได้" },
      { status: 500 }
    );
  }
}