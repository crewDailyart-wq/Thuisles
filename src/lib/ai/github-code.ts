import "server-only";

export const REPOSITORY = "crewDailyart-wq/Thuisles";
const API_ROOT = "https://api.github.com";
const TEXT_LIMIT = 50_000;

export type Change = {
  path: string;
  content: string;
  explanation: string;
  sha: string | null;
};

export function allowedPath(path: string): boolean {
  if (typeof path !== "string" || path.length > 200 || path.includes("\\") || path.includes("//")) return false;
  if (path.split("/").some((p) => p === ".." || p === "." || !p)) return false;
  if (!/^(src\/(app|components|lib)\/|scripts\/|public\/)[\w\s().@+\-/]+\.(ts|tsx|js|jsx|mjs|css|json|md)$/.test(path)) return false;
  if (/^src\/(lib\/auth\/|lib\/ai\/|app\/api\/admin\/ai\/|app\/admin\/ai\/)/.test(path)) return false;
  if (/\.env|secrets|credentials|token|password|node_modules/i.test(path)) return false;
  return true;
}

function filename(path: string): string {
  if (!allowedPath(path)) throw new Error("Bestandspad niet toegestaan: " + path);
  return path.split("/").map(encodeURIComponent).join("/");
}

export function githubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN?.trim());
}

async function github(endpoint: string, init: RequestInit = {}): Promise<unknown> {
  const token = process.env.GITHUB_TOKEN?.trim();
  const response = await fetch(API_ROOT + endpoint, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
  });
  if (response.status === 404) throw new Error("NOT_FOUND");
  if (!response.ok) {
    const reason = await response.text();
    throw new Error("GitHub HTTP " + response.status + ": " + reason.slice(0, 250));
  }
  return response.json();
}

type FileData = { type?: string; content?: string; encoding?: string; sha?: string; size?: number };
export async function readCode(path: string, ref = "main"): Promise<{ content: string; sha: string } | null> {
  const safe = filename(path);
  let value: FileData;
  try {
    value = (await github("/repos/" + REPOSITORY + "/contents/" + safe + "?ref=" + encodeURIComponent(ref))) as FileData;
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") return null;
    throw err;
  }
  if (value.type !== "file" || value.encoding !== "base64" || !value.content || !value.sha || (value.size ?? 0) > TEXT_LIMIT) {
    throw new Error("Bestand is te groot of niet leesbaar.");
  }
  const content = Buffer.from(value.content.replace(/\s/g, ""), "base64").toString("utf8");
  if (content.length > TEXT_LIMIT) throw new Error("Bestand is te groot.");
  return { content, sha: value.sha };
}

export async function findCodeFiles(term: string): Promise<string[]> {
  const result = (await github("/repos/" + REPOSITORY + "/git/trees/main?recursive=1")) as {
    tree?: { type: string; path: string }[];
  };
  const word = String(term || "").toLowerCase().slice(0, 80);
  return (result.tree ?? [])
    .filter((entry) => entry.type === "blob" && allowedPath(entry.path))
    .map((entry) => entry.path)
    .filter((path) => !word || path.toLowerCase().includes(word))
    .slice(0, 90);
}

export async function saveAsPullRequest(changes: Change[], request: string): Promise<string> {
  if (!githubConfigured()) throw new Error("GITHUB_TOKEN ontbreekt in Railway.");
  if (!Array.isArray(changes) || changes.length === 0 || changes.length > 6) throw new Error("Ongeldig aantal bestanden.");
  const unique = new Set<string>();
  for (const change of changes) {
    filename(change.path);
    if (unique.has(change.path) || typeof change.content !== "string" || change.content.length > TEXT_LIMIT || change.content.length === 0) throw new Error("Ongeldige of dubbele wijziging.");
    if (change.sha !== null && !/^[a-f0-9]{40}$/.test(change.sha)) throw new Error("Ongeldige bestandsversie.");
    unique.add(change.path);
    const original = await readCode(change.path);
    if ((original?.sha ?? null) !== change.sha) throw new Error(change.path + " is intussen gewijzigd. Vraag DeepSeek om opnieuw te kijken.");
  }

  const ref = (await github("/repos/" + REPOSITORY + "/git/ref/heads/main")) as { object: { sha: string } };
  const branch = "deepseek/" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  await github("/repos/" + REPOSITORY + "/git/refs", {
    method: "POST", body: JSON.stringify({ ref: "refs/heads/" + branch, sha: ref.object.sha }),
  });
  for (const change of changes) {
    await github("/repos/" + REPOSITORY + "/contents/" + filename(change.path), {
      method: "PUT",
      body: JSON.stringify({
        message: "DeepSeek: " + change.path,
        content: Buffer.from(change.content, "utf8").toString("base64"),
        branch,
        ...(change.sha ? { sha: change.sha } : {}),
      }),
    });
  }
  const pr = (await github("/repos/" + REPOSITORY + "/pulls", {
    method: "POST",
    body: JSON.stringify({
      title: "DeepSeek: " + request.replace(/\s+/g, " ").slice(0, 72),
      head: branch,
      base: "main",
      body: "Voorgestelde codewijzigingen vanuit Thuisles AI Studio.\n\nOpdracht: " + request.slice(0, 1500) + "\n\nBestanden:\n" + changes.map((c) => "- `" + c.path + "`: " + c.explanation).join("\n") + "\n\nControleer de wijzigingen en tests voordat je samenvoegt.",
      draft: true,
    }),
  })) as { html_url: string };
  return pr.html_url;
}
