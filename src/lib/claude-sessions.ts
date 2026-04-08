import { readdirSync, readFileSync, statSync } from "fs";
import { join, basename } from "path";
import { homedir } from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import type { ActiveSession, PastSession } from "./types";

const execFileAsync = promisify(execFile);

const CLAUDE_DIR = join(homedir(), ".claude");
const SESSIONS_DIR = join(CLAUDE_DIR, "sessions");
const PROJECTS_DIR = join(CLAUDE_DIR, "projects");
const STATES_DIR = join(CLAUDE_DIR, "session-states");

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function extractFirstMessage(jsonlPath: string): string {
  try {
    const content = readFileSync(jsonlPath, "utf-8");
    const lines = content.split("\n").slice(0, 15);
    for (const line of lines) {
      if (!line.trim()) continue;
      const data = JSON.parse(line);
      if (data.type === "user" && data.message?.role === "user") {
        const msg = data.message.content;
        if (typeof msg === "string") {
          return msg.slice(0, 100).replace(/\n/g, " ");
        }
      }
    }
  } catch {
    // ignore parse errors
  }
  return "(no preview)";
}

function decodeProjectDir(encoded: string): string {
  // "-Users-naoki-lab-codatum" -> "/Users/naoki/lab/codatum"
  return encoded.replace(/^-/, "/").replace(/-/g, "/");
}

export async function getTtyForPid(pid: number): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("ps", ["-o", "tty=", "-p", String(pid)]);
    const tty = stdout.trim();
    if (tty && tty !== "??") {
      return "/dev/" + tty;
    }
  } catch {
    // process may have exited
  }
  return null;
}

export function getSessionStatus(cwd: string, sessionId: string): "running" | "complete" {
  try {
    const statePath = join(STATES_DIR, sessionId);
    const content = readFileSync(statePath, "utf-8").trim();
    return content === "running" ? "running" : "complete";
  } catch {
    // No state file = not started yet = complete
    return "complete";
  }
}

export function getActiveSessions(): ActiveSession[] {
  const sessions: ActiveSession[] = [];
  try {
    const files = readdirSync(SESSIONS_DIR).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      try {
        const data = JSON.parse(readFileSync(join(SESSIONS_DIR, file), "utf-8"));
        if (!isProcessAlive(data.pid)) continue;
        if (data.kind !== "interactive") continue;

        const jsonlPath = join(PROJECTS_DIR, encodeCwd(data.cwd), `${data.sessionId}.jsonl`);
        const firstMessage = extractFirstMessage(jsonlPath);

        sessions.push({
          ...data,
          firstMessage,
        });
      } catch {
        // skip invalid files
      }
    }
  } catch {
    // sessions dir may not exist
  }
  return sessions.sort((a, b) => b.startedAt - a.startedAt);
}

function encodeCwd(cwd: string): string {
  return cwd.replace(/\//g, "-");
}

export function getPastSessions(limit = 50): PastSession[] {
  const sessions: PastSession[] = [];
  const activeIds = new Set(getActiveSessions().map((s) => s.sessionId));

  try {
    const projectDirs = readdirSync(PROJECTS_DIR);
    for (const dir of projectDirs) {
      const projectPath = join(PROJECTS_DIR, dir);
      try {
        const stat = statSync(projectPath);
        if (!stat.isDirectory()) continue;
      } catch {
        continue;
      }

      const jsonlFiles = readdirSync(projectPath).filter((f) => f.endsWith(".jsonl"));
      for (const file of jsonlFiles) {
        const sessionId = basename(file, ".jsonl");
        const filePath = join(projectPath, file);
        try {
          const stat = statSync(filePath);
          sessions.push({
            sessionId,
            projectDir: decodeProjectDir(dir),
            firstMessage: extractFirstMessage(filePath),
            lastModified: stat.mtime,
            isActive: activeIds.has(sessionId),
          });
        } catch {
          // skip
        }
      }
    }
  } catch {
    // projects dir may not exist
  }

  return sessions
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
    .slice(0, limit);
}
