import { NextResponse } from "next/server";

import { refreshSession } from "@/lib/auth";

export async function POST() {
  const user = await refreshSession();
  if (!user) return NextResponse.json({ message: "เซสชันหมดอายุ" }, { status: 401 });
  return NextResponse.json({ user });
}