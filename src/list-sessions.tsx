import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { getActiveSessions, getSessionStatus, getPastSessions, getTtyForPid } from "./lib/claude-sessions";
import { focusTabByTty, createTabWithCommand } from "./lib/iterm";
import { basename } from "path";

function timeAgo(date: Date | number): string {
  const now = Date.now();
  const ts = typeof date === "number" ? date : date.getTime();
  const diff = Math.floor((now - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ListSessions() {
  const { data: activeSessions, isLoading: loadingActive } = usePromise(async () => {
    const sessions = getActiveSessions();
    const withStatus = await Promise.all(
      sessions.map(async (s) => {
        const tty = (await getTtyForPid(s.pid)) ?? undefined;
        const status = getSessionStatus(s.cwd, s.sessionId);
        return { ...s, tty, status };
      })
    );
    return withStatus;
  });

  const { data: pastSessions, isLoading: loadingPast } = usePromise(async () => {
    return getPastSessions(50);
  });

  const activeIds = new Set(activeSessions?.map((s) => s.sessionId) ?? []);

  return (
    <List isLoading={loadingActive || loadingPast} searchBarPlaceholder="Search Claude sessions...">
      <List.Section title="Active Sessions">
        {activeSessions?.map((session) => {
          const isRunning = session.status === "running";
          return (
            <List.Item
              key={session.sessionId}
              icon={{ source: Icon.Terminal, tintColor: isRunning ? Color.Green : Color.SecondaryText }}
              title={session.firstMessage ?? "(no preview)"}
              subtitle={basename(session.cwd)}
              accessories={[
                { text: timeAgo(session.startedAt) },
                isRunning
                  ? { tag: { value: "running", color: Color.Green } }
                  : { tag: { value: "complete", color: Color.SecondaryText } },
              ]}
              actions={
                <ActionPanel>
                  {session.tty && (
                    <Action
                      title="Switch to Tab"
                      icon={Icon.ArrowRight}
                      onAction={() => focusTabByTty(session.tty!)}
                    />
                  )}
                  <Action
                    title="Resume in New Tab"
                    icon={Icon.Plus}
                    onAction={() =>
                      createTabWithCommand(`cd ${session.cwd} && claude --resume ${session.sessionId}`)
                    }
                  />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
      <List.Section title="Past Sessions">
        {pastSessions
          ?.filter((s) => !activeIds.has(s.sessionId))
          .map((session) => (
            <List.Item
              key={session.sessionId}
              icon={{ source: Icon.Document, tintColor: Color.SecondaryText }}
              title={session.firstMessage}
              subtitle={basename(session.projectDir)}
              accessories={[{ text: timeAgo(session.lastModified) }]}
              actions={
                <ActionPanel>
                  <Action
                    title="Resume Session"
                    icon={Icon.RotateAntiClockwise}
                    onAction={() =>
                      createTabWithCommand(
                        `cd ${session.projectDir} && claude --resume ${session.sessionId}`
                      )
                    }
                  />
                </ActionPanel>
              }
            />
          ))}
      </List.Section>
    </List>
  );
}
