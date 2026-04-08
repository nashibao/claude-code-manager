/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Default Directory - Default working directory for new Claude Code sessions */
  "defaultDirectory": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `list-sessions` command */
  export type ListSessions = ExtensionPreferences & {}
  /** Preferences accessible in the `launch-session` command */
  export type LaunchSession = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `list-sessions` command */
  export type ListSessions = {}
  /** Arguments passed to the `launch-session` command */
  export type LaunchSession = {}
}

