import { Icon, MenuBarExtra } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { getActiveSessions, getSessionStatus, getTtyForPid } from "./lib/claude-sessions";
import { focusTabByTty } from "./lib/iterm";
import { basename } from "path";

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const POLL_INTERVAL = 2000;
const SPINNER_INTERVAL = 200;

interface SessionState {
  pid: number;
  sessionId: string;
  cwd: string;
  firstMessage: string;
  tty: string | null;
  status: "running" | "complete";
}

export default function SessionStatus() {
  const [sessions, setSessions] = useState<SessionState[]>([]);
  const [spinnerIdx, setSpinnerIdx] = useState(0);
  const prevSessionsRef = useRef<Map<string, string>>(new Map());

  // Poll session states
  useEffect(() => {
    async function poll() {
      const active = getActiveSessions();
      const states: SessionState[] = await Promise.all(
        active.map(async (s) => {
          const tty = await getTtyForPid(s.pid);
          const status = getSessionStatus(s.cwd, s.sessionId);
          return {
            pid: s.pid,
            sessionId: s.sessionId,
            cwd: s.cwd,
            firstMessage: s.firstMessage ?? "(no preview)",
            tty,
            status,
          };
        })
      );
      setSessions(states);

      prevSessionsRef.current = new Map(states.map((s) => [s.sessionId, s.status]));
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Animate spinner
  const runningCount = sessions.filter((s) => s.status === "running").length;
  const completeCount = sessions.filter((s) => s.status === "complete").length;

  useEffect(() => {
    if (runningCount === 0) return;
    const interval = setInterval(() => {
      setSpinnerIdx((i) => (i + 1) % SPINNER_FRAMES.length);
    }, SPINNER_INTERVAL);
    return () => clearInterval(interval);
  }, [runningCount]);

  // Build title
  let title: string;
  if (sessions.length === 0) {
    title = "";
  } else if (runningCount > 0) {
    title = `${SPINNER_FRAMES[spinnerIdx]}${runningCount}(${completeCount})`;
  } else {
    title = `0(${completeCount})`;
  }

  return (
    <MenuBarExtra icon={Icon.Terminal} title={title} tooltip="Claude Code Sessions">
      {sessions.length === 0 ? (
        <MenuBarExtra.Item title="No active sessions" />
      ) : (
        <>
          {sessions.map((s) => (
            <MenuBarExtra.Item
              key={s.sessionId}
              icon={s.status === "running" ? "🔄" : undefined}
              title={`${basename(s.cwd)} — ${s.firstMessage.slice(0, 40)}`}
              subtitle={s.status}
              onAction={() => {
                if (s.tty) focusTabByTty(s.tty);
              }}
            />
          ))}
        </>
      )}
    </MenuBarExtra>
  );
}
