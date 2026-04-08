export interface ActiveSession {
  pid: number;
  sessionId: string;
  cwd: string;
  startedAt: number;
  kind: string;
  entrypoint: string;
  firstMessage?: string;
  tty?: string;
}

export interface PastSession {
  sessionId: string;
  projectDir: string;
  firstMessage: string;
  lastModified: Date;
  isActive: boolean;
}

export interface ITermTab {
  windowIndex: number;
  tabIndex: number;
  sessionId: string;
  tty: string;
  name: string;
}
