"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getIGDBCoverUrl } from "@/lib/igdb";
import {
  CATEGORY_LABELS,
  SOURCE_LABELS,
  formatDuration,
  formatShortDuration,
  type GameStatus,
  type ImportedSession,
  type PlaytimeCategory,
  type SessionSource,
  type TrackedGame,
} from "@/types/game";
import { SessionList } from "./session-list";

interface GameCardProps {
  game: TrackedGame;
  isActive: boolean;
  activeElapsedSeconds: number;
  onStatusChange: (status: GameStatus) => void;
  onStart: (category?: PlaytimeCategory) => void;
  onStop: () => void;
  onRemove: () => void;
  onDeleteSession: (sessionId: string) => void;
  onAddManualTime: (seconds: number, note?: string, category?: PlaytimeCategory) => void;
  onImportSessions: (sessions: ImportedSession[], source: SessionSource) => void;
}

const statusLabels: Record<GameStatus, string> = {
  playing: "Playing",
  completed: "Completed",
  backlog: "Backlog",
  dropped: "Dropped",
};

const importPlatforms: { value: SessionSource; label: string }[] = [
  { value: "steam", label: "Steam" },
  { value: "playstation", label: "PlayStation" },
  { value: "xbox", label: "Xbox" },
  { value: "gog", label: "GOG" },
];

const IMPORT_PLACEHOLDER = `[
  {
    "durationMinutes": 120,
    "category": "main_story",
    "date": "2024-01-15",
    "note": "Optional note"
  }
]`;

type SessionsTab = "sessions" | "import";

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
  onImportSessions,
}: GameCardProps) {
  const [showSessions, setShowSessions] = useState(false);
  const [activeTab, setActiveTab] = useState<SessionsTab>("sessions");

  const [timerCategory, setTimerCategory] = useState<PlaytimeCategory>("other");

  const [manualMinutes, setManualMinutes] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [manualCategory, setManualCategory] = useState<PlaytimeCategory>("other");

  const [importPlatform, setImportPlatform] = useState<SessionSource>("steam");
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  function handleImport() {
    setImportError(null);
    setImportSuccess(null);
    try {
      const parsed = JSON.parse(importJson) as unknown;
      if (!Array.isArray(parsed)) throw new Error("Expected a JSON array.");
      const sessions: ImportedSession[] = parsed.map((item, i) => {
        if (typeof item !== "object" || item === null)
          throw new Error(`Item ${i} is not an object.`);
        const obj = item as Record<string, unknown>;
        if (typeof obj.durationMinutes !== "number" || obj.durationMinutes <= 0)
          throw new Error(`Item ${i}: "durationMinutes" must be a positive number.`);
        return {
          durationMinutes: obj.durationMinutes,
          category: obj.category as PlaytimeCategory | undefined,
          date: obj.date as string | undefined,
          note: obj.note as string | undefined,
        };
      });
      onImportSessions(sessions, importPlatform);
      setImportJson("");
      setImportSuccess(`Imported ${sessions.length} session${sessions.length !== 1 ? "s" : ""} from ${SOURCE_LABELS[importPlatform]}.`);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Invalid JSON.");
    }
  }

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
              <div className="flex items-center gap-2">
                <select
                  value={timerCategory}
                  onChange={(e) =>
                    setTimerCategory(e.target.value as PlaytimeCategory)
                  }
                  className="rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none"
                >
                  {(
                    Object.entries(CATEGORY_LABELS) as [
                      PlaytimeCategory,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <Button size="sm" onClick={() => onStart(timerCategory)}>
                  Start Session
                </Button>
              </div>
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
        <div className="mt-4 border-t border-border pt-3">
          <div className="mb-3 flex gap-1 rounded-lg border border-border bg-muted/40 p-1 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("sessions")}
              className={`flex-1 rounded-md px-3 py-1 font-medium transition-colors ${
                activeTab === "sessions"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Log & History
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("import")}
              className={`flex-1 rounded-md px-3 py-1 font-medium transition-colors ${
                activeTab === "import"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Import
            </button>
          </div>

          {activeTab === "sessions" && (
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label
                    htmlFor={`manual-minutes-${game.id}`}
                    className="block text-xs font-medium text-muted-foreground"
                  >
                    Minutes
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
                <div className="flex-1">
                  <label
                    htmlFor={`manual-category-${game.id}`}
                    className="block text-xs font-medium text-muted-foreground"
                  >
                    Category
                  </label>
                  <select
                    id={`manual-category-${game.id}`}
                    value={manualCategory}
                    onChange={(e) =>
                      setManualCategory(e.target.value as PlaytimeCategory)
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none"
                  >
                    {(
                      Object.entries(CATEGORY_LABELS) as [
                        PlaytimeCategory,
                        string,
                      ][]
                    ).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
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
                      onAddManualTime(
                        minutes * 60,
                        manualNote || undefined,
                        manualCategory,
                      );
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

          {activeTab === "import" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Platform
                </label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {importPlatforms.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setImportPlatform(p.value)}
                      className={`rounded-lg border px-3 py-1 text-sm font-medium transition-colors ${
                        importPlatform === p.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor={`import-json-${game.id}`}
                  className="block text-xs font-medium text-muted-foreground"
                >
                  Paste session data (JSON)
                </label>
                <textarea
                  id={`import-json-${game.id}`}
                  value={importJson}
                  onChange={(e) => {
                    setImportJson(e.target.value);
                    setImportError(null);
                    setImportSuccess(null);
                  }}
                  placeholder={IMPORT_PLACEHOLDER}
                  rows={6}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs outline-none"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Each entry needs <code className="rounded bg-muted px-1">durationMinutes</code>.
                  Optional: <code className="rounded bg-muted px-1">category</code>,{" "}
                  <code className="rounded bg-muted px-1">date</code> (YYYY-MM-DD),{" "}
                  <code className="rounded bg-muted px-1">note</code>.
                </p>
              </div>

              {importError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {importError}
                </p>
              )}
              {importSuccess && (
                <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-700 dark:text-green-400">
                  {importSuccess}
                </p>
              )}

              <Button
                size="sm"
                variant="outline"
                disabled={!importJson.trim()}
                onClick={handleImport}
              >
                Import from {SOURCE_LABELS[importPlatform]}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
