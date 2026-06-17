"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameSession, GameStatus, TrackedGame } from "@/types/game";

const STORAGE_KEY = "game-tracker-data-v1";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadGames(): TrackedGame[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TrackedGame[]) : [];
  } catch {
    return [];
  }
}

function saveGames(games: TrackedGame[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function useTrackedGames() {
  const [games, setGames] = useState<TrackedGame[]>([]);
  const [activeSession, setActiveSession] = useState<{
    gameId: string;
    startedAt: number;
  } | null>(null);

  useEffect(() => {
    setGames(loadGames());
  }, []);

  useEffect(() => {
    saveGames(games);
  }, [games]);

  const addGame = useCallback(
    ({
      igdbId,
      name,
      coverImageId,
      status = "backlog",
    }: {
      igdbId: number;
      name: string;
      coverImageId?: string;
      status?: GameStatus;
    }) => {
      setGames((prev) => {
        if (prev.some((g) => g.igdbId === igdbId)) return prev;
        const newGame: TrackedGame = {
          id: generateId(),
          igdbId,
          name,
          coverImageId,
          status,
          sessions: [],
          totalTimeSeconds: 0,
          addedAt: Date.now(),
        };
        return [newGame, ...prev];
      });
    },
    [],
  );

  const removeGame = useCallback((id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const updateStatus = useCallback((id: string, status: GameStatus) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const completedAt = status === "completed" ? Date.now() : g.completedAt;
        return { ...g, status, completedAt };
      }),
    );
  }, []);

  const startSession = useCallback(
    (gameId: string) => {
      if (activeSession) return;
      setActiveSession({ gameId, startedAt: Date.now() });
      setGames((prev) =>
        prev.map((g) => (g.id === gameId ? { ...g, status: "playing" } : g)),
      );
    },
    [activeSession],
  );

  const stopSession = useCallback(
    (note?: string) => {
      if (!activeSession) return;
      const endedAt = Date.now();
      const durationSeconds = Math.floor(
        (endedAt - activeSession.startedAt) / 1000,
      );
      const session: GameSession = {
        id: generateId(),
        startedAt: activeSession.startedAt,
        endedAt,
        durationSeconds,
        note,
      };

      setGames((prev) =>
        prev.map((g) => {
          if (g.id !== activeSession.gameId) return g;
          const sessions = [...g.sessions, session];
          const totalTimeSeconds = sessions.reduce(
            (sum, s) => sum + s.durationSeconds,
            0,
          );
          return { ...g, sessions, totalTimeSeconds };
        }),
      );
      setActiveSession(null);
    },
    [activeSession],
  );

  const addManualSession = useCallback(
    (gameId: string, durationSeconds: number, note?: string) => {
      if (durationSeconds <= 0) return;
      const session: GameSession = {
        id: generateId(),
        startedAt: Date.now(),
        durationSeconds,
        note,
      };
      setGames((prev) =>
        prev.map((g) => {
          if (g.id !== gameId) return g;
          const sessions = [...g.sessions, session];
          const totalTimeSeconds = sessions.reduce(
            (sum, s) => sum + s.durationSeconds,
            0,
          );
          return { ...g, sessions, totalTimeSeconds };
        }),
      );
    },
    [],
  );

  const deleteSession = useCallback((gameId: string, sessionId: string) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== gameId) return g;
        const sessions = g.sessions.filter((s) => s.id !== sessionId);
        const totalTimeSeconds = sessions.reduce(
          (sum, s) => sum + s.durationSeconds,
          0,
        );
        return { ...g, sessions, totalTimeSeconds };
      }),
    );
  }, []);

  return {
    games,
    activeSession,
    addGame,
    removeGame,
    updateStatus,
    startSession,
    stopSession,
    addManualSession,
    deleteSession,
  };
}
