"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatDuration,
  type GameStatus,
  type ImportedSession,
  type PlaytimeCategory,
  type SessionSource,
  type TrackedGame,
} from "@/types/game";
import { GameCard } from "./game-card";

interface GameListProps {
  games: TrackedGame[];
  activeSession: { gameId: string; startedAt: number } | null;
  activeElapsedSeconds: number;
  onStatusChange: (id: string, status: GameStatus) => void;
  onStart: (id: string, category?: PlaytimeCategory) => void;
  onStop: () => void;
  onRemove: (id: string) => void;
  onDeleteSession: (gameId: string, sessionId: string) => void;
  onAddManualTime: (gameId: string, seconds: number, note?: string, category?: PlaytimeCategory) => void;
  onImportSessions: (gameId: string, sessions: ImportedSession[], source: SessionSource) => void;
}

const tabs: { value: GameStatus | "all"; label: string }[] = [
  { value: "playing", label: "Playing" },
  { value: "backlog", label: "Backlog" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
  { value: "all", label: "All" },
];

function useStateWithLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        setValue(JSON.parse(raw) as T);
      } catch {
        // ignore
      }
    }
  }, [key]);

  const setStoredValue = useCallback(
    (next: T) => {
      setValue(next);
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(next));
      }
    },
    [key],
  );

  return [value, setStoredValue] as const;
}

export function GameList({
  games,
  activeSession,
  activeElapsedSeconds,
  onStatusChange,
  onStart,
  onStop,
  onRemove,
  onDeleteSession,
  onAddManualTime,
  onImportSessions,
}: GameListProps) {
  const [filter, setFilter] = useStateWithLocalStorage<GameStatus | "all">(
    "game-tracker-filter",
    "playing",
  );

  const filtered = useMemo(() => {
    if (filter === "all") return games;
    return games.filter((g) => g.status === filter);
  }, [games, filter]);

  const totalTrackedSeconds = useMemo(
    () => games.reduce((sum, g) => sum + g.totalTimeSeconds, 0),
    [games],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Total across all games:{" "}
          <span className="font-medium text-foreground">
            {formatDuration(totalTrackedSeconds)}
          </span>
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
          No games here yet. Search and add one to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isActive={activeSession?.gameId === game.id}
              activeElapsedSeconds={
                activeSession?.gameId === game.id ? activeElapsedSeconds : 0
              }
              onStatusChange={(status) => onStatusChange(game.id, status)}
              onStart={(category) => onStart(game.id, category)}
              onStop={onStop}
              onRemove={() => onRemove(game.id)}
              onDeleteSession={(sessionId) =>
                onDeleteSession(game.id, sessionId)
              }
              onAddManualTime={(seconds, note, category) =>
                onAddManualTime(game.id, seconds, note, category)
              }
              onImportSessions={(sessions, source) =>
                onImportSessions(game.id, sessions, source)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
