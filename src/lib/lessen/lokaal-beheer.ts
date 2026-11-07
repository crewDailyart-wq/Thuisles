import "server-only";
import { cookies, headers } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// Lokale beheerstand, geen vervanging voor de toekomstige persoonlijke beheerlogin.
const COOKIE = "thuisles_lokaal_lesbeheer";
const DUUR = 8 * 60 * 60;
const sleutelPad = path.join(process.cwd(), ".next/cache/lescontrole-beheer.key");

export function isLokaleLaptop(host: string, userAgent: string, productie: boolean): boolean {
  return !productie && /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host) && !/Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(userAgent);
}

export async function lokaleLaptop(): Promise<boolean> {
  const kop = await headers();
  return isLokaleLaptop(kop.get("host") ?? "", kop.get("user-agent") ?? "", process.env.NODE_ENV === "production");
}

function handtekening(verloopt: string): string {
  return createHmac("sha256", readFileSync(sleutelPad)).update(`lesbeheer:${verloopt}`).digest("hex");
}

export async function lesbeheerActief(): Promise<boolean> {
  if (!(await lokaleLaptop()) || !existsSync(sleutelPad)) return false;
  const token = (await cookies()).get(COOKIE)?.value ?? "";
  const [verloopt, hand] = token.split(".");
  if (!/^\d+$/.test(verloopt ?? "") || !/^[a-f0-9]{64}$/.test(hand ?? "")) return false;
  const nu = Math.floor(Date.now() / 1000);
  if (Number(verloopt) <= nu || Number(verloopt) > nu + DUUR) return false;
  return timingSafeEqual(Buffer.from(hand), Buffer.from(handtekening(verloopt)));
}

export async function zetLesbeheer(aan: boolean): Promise<void> {
  if (!(await lokaleLaptop())) throw new Error("De beheerstand is alleen beschikbaar op de lokale laptop.");
  const pot = await cookies();
  if (!aan) { pot.delete(COOKIE); return; }
  if (!existsSync(sleutelPad)) {
    mkdirSync(path.dirname(sleutelPad), { recursive: true });
    writeFileSync(sleutelPad, randomBytes(32), { flag: "wx", mode: 0o600 });
  }
  const verloopt = String(Math.floor(Date.now() / 1000) + DUUR);
  pot.set(COOKIE, `${verloopt}.${handtekening(verloopt)}`, { httpOnly: true, sameSite: "strict", secure: false, path: "/", maxAge: DUUR });
}

export async function vereisLesbeheer(): Promise<void> {
  if (!(await lesbeheerActief())) throw new Error("Open eerst de beheerstand op je laptop via het beginschermenoverzicht.");
}
