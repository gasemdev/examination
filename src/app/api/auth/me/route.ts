import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const current = await getSessionUser();
  if (!current) return NextResponse.json({ message: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  return NextResponse.json({ user: current.user });
}