export type GameStatus = "playing" | "completed" | "backlog" | "dropped";
export type PlaytimeCategory =
  | "main_story"
  | "main_extras"
  | "completionist"
  | "speedrun"
  | "other";
export type SessionSource =
  | "timer"
  | "manual"
  | "steam"
  | "playstation"
  | "xbox"
  | "gog";

export const CATEGORY_LABELS: Record<PlaytimeCategory, string> = {
  main_story: "Main Story",
  main_extras: "Main + Extras",
  completionist: "Completionist",
  speedrun: "Speedrun",
  other: "Other",
};

export const SOURCE_LABELS: Record<SessionSource, string> = {
  timer: "Timer",
  manual: "Manual",
  steam: "Steam",
  playstation: "PlayStation",
  xbox: "Xbox",
  gog: "GOG",
};

export interface GameSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  durationSeconds: number;
  note?: string;
  category?: PlaytimeCategory;
  source?: SessionSource;
}

export interface ImportedSession {
  durationMinutes: number;
  category?: PlaytimeCategory;
  date?: string;
  note?: string;
}

export interface TrackedGame {
  id: string;
  igdbId: number;
  name: string;
  coverImageId?: string;
  status: GameStatus;
  sessions: GameSession[];
  totalTimeSeconds: number;
  completedAt?: number;
  addedAt: number;
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

export function formatShortDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
