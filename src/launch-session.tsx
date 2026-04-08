import { getPreferenceValues, showHUD } from "@raycast/api";
import { createTabWithCommand } from "./lib/iterm";

interface Preferences {
  defaultDirectory: string;
}

export default async function LaunchSession() {
  const { defaultDirectory } = getPreferenceValues<Preferences>();
  const dir = defaultDirectory || "~";
  await createTabWithCommand(`cd ${dir} && claude`);
  await showHUD("Claude Code launched in iTerm2");
}
