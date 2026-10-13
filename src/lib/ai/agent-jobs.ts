import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Change } from "@/lib/ai/github-code";

const ROOT = process.env.THUISLES_DB
  ? path.join(path.dirname(process.env.THUISLES_DB), "ai-jobs")
  : "/data/ai-jobs";
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
export const MAX_STEPS = 60;
export const MAX_TOTAL_TOKENS = 180_000;

export type AgentJob = {
  id: string;
  createdAt: number;
  updatedAt: number;
  request: string;
  conversation: Record<string, unknown>[];
  changes: Change[];
  steps: number;
  totalTokens: number;
  state: "paused" | "finished" | "limit";
  reply: string;
};

const running = new Set<string>();

function location(id: string): string {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("Ongeldig opdracht-ID.");
  return path.join(ROOT, id + ".json");
}

export function createJob(request: string, conversation: Record<string, unknown>[]): AgentJob {
  const now = Date.now();
  return {
    id: randomUUID(), createdAt: now, updatedAt: now, request,
    conversation, changes: [], steps: 0, totalTokens: 0, state: "paused", reply: "",
  };
}

export async function loadJob(id: string): Promise<AgentJob> {
  const raw = await readFile(location(id), "utf8");
  const job = JSON.parse(raw) as AgentJob;
  if (Date.now() - job.createdAt > MAX_AGE) throw new Error("Deze opdracht is verlopen. Begin een nieuwe.");
  return job;
}

export async function saveJob(job: AgentJob): Promise<void> {
  await mkdir(ROOT, { recursive: true, mode: 0o700 });
  job.updatedAt = Date.now();
  const dest = location(job.id);
  const temporary = dest + ".tmp";
  await writeFile(temporary, JSON.stringify(job), { encoding: "utf8", mode: 0o600 });
  await rename(temporary, dest);
}

export function acquireJob(id: string): boolean {
  if (running.has(id)) return false;
  running.add(id);
  return true;
}
export function releaseJob(id: string): void { running.delete(id); }
