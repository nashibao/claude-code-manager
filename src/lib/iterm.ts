import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

async function runAppleScript(script: string): Promise<string> {
  const { stdout } = await execFileAsync("osascript", ["-e", script]);
  return stdout.trim();
}

export async function focusTabByTty(tty: string): Promise<void> {
  await runAppleScript(`
    tell application "iTerm2"
      activate
      repeat with w in windows
        repeat with t in tabs of w
          repeat with s in sessions of t
            if tty of s is "${tty}" then
              select w
              select t
              select s
              return
            end if
          end repeat
        end repeat
      end repeat
    end tell
  `);
}

export async function createTabWithCommand(command: string): Promise<void> {
  const escaped = command.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  await runAppleScript(`
    tell application "iTerm2"
      activate
      if (count of windows) is 0 then
        create window with default profile
        tell current session of current tab of current window
          write text "${escaped}"
        end tell
      else
        tell current window
          set newTab to (create tab with default profile)
          tell current session of newTab
            write text "${escaped}"
          end tell
        end tell
      end if
    end tell
  `);
}

export async function readSessionContents(tty: string): Promise<string> {
  return await runAppleScript(`
    tell application "iTerm2"
      repeat with w in windows
        repeat with t in tabs of w
          repeat with s in sessions of t
            if tty of s is "${tty}" then
              return contents of s
            end if
          end repeat
        end repeat
      end repeat
      return ""
    end tell
  `);
}
