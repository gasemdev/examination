import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const scryptAsync = promisify(scrypt);
const sessionCookie = "examio_session";
const sessionDurationMs = 1000 * 60 * 60 * 24 * 7;

export const authCookieName = sessionCookie;

export type AuthUser = {
  id: number;
  email: string;
  username: string | null;
  name: string;
  roles: string[];
};

export function toAuthUser(user: {
  id: number;
  email: string;
  username: string | null;
  name: string | null;
  role: string;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name ?? user.username ?? user.email,
    roles: [user.role],
  };
}

export async function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedKey = Buffer.from(key, "hex");
  return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: {
      id: randomBytes(16).toString("hex"),
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + sessionDurationMs),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionDurationMs / 1000,
  });
}

export async function getSessionUser() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return { session, user: toAuthUser(session.user) };
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookieStore.set(sessionCookie, "", { httpOnly: true, expires: new Date(0), path: "/" });
}

export async function refreshSession() {
  const current = await getSessionUser();
  if (!current) return null;
  await clearSession();
  await createSession(current.user.id);
  return current.user;
}