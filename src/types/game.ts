export type GameStatus = "playing" | "completed" | "backlog" | "dropped";

export interface GameSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  durationSeconds: number;
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
