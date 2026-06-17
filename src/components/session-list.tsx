"use client";

import { Button } from "@/components/ui/button";
import { formatDuration, type GameSession } from "@/types/game";

interface SessionListProps {
  sessions: GameSession[];
  onDelete?: (sessionId: string) => void;
}

export function SessionList({ sessions, onDelete }: SessionListProps) {
  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">No sessions yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {[...sessions].reverse().map((session) => (
        <li
          key={session.id}
          className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <div>
            <span className="font-medium">
              {formatDuration(session.durationSeconds)}
            </span>
            {session.note && (
              <span className="ml-2 text-muted-foreground">{session.note}</span>
            )}
            <span className="ml-2 text-xs text-muted-foreground">
              {new Date(session.startedAt).toLocaleDateString()}
            </span>
          </div>
          {onDelete && (
            <Button
              variant="destructive"
              size="xs"
              onClick={() => onDelete(session.id)}
            >
              Delete
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
