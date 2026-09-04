import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createSession, toAuthUser, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!identifier || !password) {
      return NextResponse.json({ message: "กรุณากรอกอีเมล/ชื่อผู้ใช้และรหัสผ่าน" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier.toLowerCase() }, { username: identifier }] },
    });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ message: "อีเมล/ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json({ user: toAuthUser(user) });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ message: "ไม่สามารถเข้าสู่ระบบได้" }, { status: 500 });
  }
}