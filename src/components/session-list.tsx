"use client";

import { Button } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  SOURCE_LABELS,
  formatDuration,
  type GameSession,
  type PlaytimeCategory,
} from "@/types/game";

interface SessionListProps {
  sessions: GameSession[];
  onDelete?: (sessionId: string) => void;
}

const categoryColors: Record<PlaytimeCategory, string> = {
  main_story: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  main_extras: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  completionist: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  speedrun: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  other: "bg-muted text-muted-foreground",
};

export function SessionList({ sessions, onDelete }: SessionListProps) {
  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">No sessions yet.</p>;
  }

  const categoryTotals = sessions.reduce<Partial<Record<PlaytimeCategory, number>>>(
    (acc, s) => {
      if (!s.category) return acc;
      acc[s.category] = (acc[s.category] ?? 0) + s.durationSeconds;
      return acc;
    },
    {},
  );

  const hasCategoryData = Object.keys(categoryTotals).length > 0;

  return (
    <div className="space-y-3">
      {hasCategoryData && (
        <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-muted/40 p-2">
          {(Object.entries(categoryTotals) as [PlaytimeCategory, number][]).map(
            ([cat, secs]) => (
              <span
                key={cat}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${categoryColors[cat]}`}
              >
                {CATEGORY_LABELS[cat]}: {formatDuration(secs)}
              </span>
            ),
          )}
        </div>
      )}

      <ul className="space-y-2">
        {[...sessions].reverse().map((session) => (
          <li
            key={session.id}
            className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium">
                {formatDuration(session.durationSeconds)}
              </span>
              {session.category && (
                <span
                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${categoryColors[session.category]}`}
                >
                  {CATEGORY_LABELS[session.category]}
                </span>
              )}
              {session.source && session.source !== "timer" && session.source !== "manual" && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {SOURCE_LABELS[session.source]}
                </span>
              )}
              {session.note && (
                <span className="text-muted-foreground">{session.note}</span>
              )}
              <span className="ml-auto text-xs text-muted-foreground">
                {new Date(session.startedAt).toLocaleDateString()}
              </span>
            </div>
            {onDelete && (
              <Button
                variant="destructive"
                size="xs"
                className="ml-2 shrink-0"
                onClick={() => onDelete(session.id)}
              >
                Delete
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
