"use client";

import { useActiveTimer } from "@/hooks/useActiveTimer";
import { useTrackedGames } from "@/hooks/useTrackedGames";
import { formatShortDuration } from "@/types/game";
import { GameList } from "./game-list";
import { GameSearch } from "./game-search";

export function GameDashboard() {
  const {
    games,
    activeSession,
    addGame,
    removeGame,
    updateStatus,
    startSession,
    stopSession,
    addManualSession,
    deleteSession,
  } = useTrackedGames();

  const elapsedSeconds = useActiveTimer(activeSession);

  return (
    <div className="flex min-h-full flex-col">
      {activeSession && (
        <div className="sticky top-0 z-50 flex items-center justify-between bg-primary px-4 py-2 text-primary-foreground shadow">
          <span className="text-sm font-medium">Session running</span>
          <span className="font-mono text-lg">
            {formatShortDuration(elapsedSeconds)}
          </span>
        </div>
      )}

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Game Tracker
          </h1>
          <p className="text-muted-foreground">
            Search IGDB, add games, and track your playtime.
          </p>
        </div>

        <section className="mb-8 rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-lg font-medium">Add a game</h2>
          <GameSearch onAdd={addGame} />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium">Your games</h2>
          <GameList
            games={games}
            activeSession={activeSession}
            activeElapsedSeconds={elapsedSeconds}
            onStatusChange={updateStatus}
            onStart={startSession}
            onStop={stopSession}
            onRemove={removeGame}
            onDeleteSession={deleteSession}
            onAddManualTime={addManualSession}
          />
        </section>
      </main>
    </div>
  );
}
