"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getIGDBCoverUrl } from "@/lib/igdb";
import {
  formatDuration,
  formatShortDuration,
  type GameStatus,
  type TrackedGame,
} from "@/types/game";
import { SessionList } from "./session-list";

interface GameCardProps {
  game: TrackedGame;
  isActive: boolean;
  activeElapsedSeconds: number;
  onStatusChange: (status: GameStatus) => void;
  onStart: () => void;
  onStop: () => void;
  onRemove: () => void;
  onDeleteSession: (sessionId: string) => void;
  onAddManualTime: (seconds: number, note?: string) => void;
}

const statusLabels: Record<GameStatus, string> = {
  playing: "Playing",
  completed: "Completed",
  backlog: "Backlog",
  dropped: "Dropped",
};

export function GameCard({
  game,
  isActive,
  activeElapsedSeconds,
  onStatusChange,
  onStart,
  onStop,
  onRemove,
  onDeleteSession,
  onAddManualTime,
}: GameCardProps) {
  const [showSessions, setShowSessions] = useState(false);
  const [manualMinutes, setManualMinutes] = useState("");
  const [manualNote, setManualNote] = useState("");

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex gap-4">
        {game.coverImageId ? (
          <Image
            src={getIGDBCoverUrl(game.coverImageId, "cover_big")}
            alt={game.name}
            width={264}
            height={352}
            className="h-32 w-24 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-32 w-24 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
            No cover
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold">{game.name}</h3>
              <p className="text-sm text-muted-foreground">
                Total time: {formatDuration(game.totalTimeSeconds)}
              </p>
            </div>
            <select
              value={game.status}
              onChange={(e) => onStatusChange(e.target.value as GameStatus)}
              className="rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
            {isActive ? (
              <>
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-mono">
                  {formatShortDuration(
                    game.totalTimeSeconds + activeElapsedSeconds,
                  )}
                </div>
                <Button variant="destructive" size="sm" onClick={onStop}>
                  Stop Session
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={onStart}>
                Start Session
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSessions((s) => !s)}
            >
              {showSessions ? "Hide" : "Sessions"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>

      {showSessions && (
        <div className="mt-4 space-y-3 border-t border-border pt-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label
                htmlFor={`manual-minutes-${game.id}`}
                className="block text-xs font-medium text-muted-foreground"
              >
                Add manual time (minutes)
              </label>
              <input
                id={`manual-minutes-${game.id}`}
                type="number"
                min={1}
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
                placeholder="60"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none"
              />
            </div>
            <div className="flex-[2]">
              <label
                htmlFor={`manual-note-${game.id}`}
                className="block text-xs font-medium text-muted-foreground"
              >
                Note
              </label>
              <input
                id={`manual-note-${game.id}`}
                type="text"
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                placeholder="Replay, co-op, etc."
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const minutes = Number.parseInt(manualMinutes, 10);
                if (minutes > 0) {
                  onAddManualTime(minutes * 60, manualNote || undefined);
                  setManualMinutes("");
                  setManualNote("");
                }
              }}
            >
              Add Time
            </Button>
          </div>
          <SessionList sessions={game.sessions} onDelete={onDeleteSession} />
        </div>
      )}
    </div>
  );
}
