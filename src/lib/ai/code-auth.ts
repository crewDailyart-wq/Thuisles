import "server-only";
import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const AI_COOKIE = "thuisles_ai_beheer";
const TWELVE_HOURS = 12 * 60 * 60;

function secret(): string {
  return process.env.AI_ADMIN_PASSWORD ?? "";
}

function signature(value: string): string {
  return createHmac("sha256", secret()).update("thuisles-code-agent:" + value).digest("hex");
}

export function configured(): boolean {
  return secret().length >= 16;
}

export function passwordMatches(password: string): boolean {
  if (!configured() || typeof password !== "string") return false;
  const a = createHash("sha256").update(password).digest();
  const b = createHash("sha256").update(secret()).digest();
  return timingSafeEqual(a, b);
}

export function createSession(): string {
  const expires = Math.floor(Date.now() / 1000) + TWELVE_HOURS;
  const body = String(expires);
  return body + "." + signature(body);
}

export async function authenticated(): Promise<boolean> {
  if (!configured()) return false;
  const token = (await cookies()).get(AI_COOKIE)?.value;
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2 || !/^\d+$/.test(parts[0]) || !/^[a-f0-9]{64}$/.test(parts[1])) return false;
  const expires = Number(parts[0]);
  if (expires < Date.now() / 1000 || expires > Date.now() / 1000 + TWELVE_HOURS) return false;
  return timingSafeEqual(Buffer.from(parts[1]), Buffer.from(signature(parts[0])));
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TWELVE_HOURS,
};
