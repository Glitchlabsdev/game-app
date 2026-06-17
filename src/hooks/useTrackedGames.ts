"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  GameSession,
  GameStatus,
  ImportedSession,
  PlaytimeCategory,
  SessionSource,
  TrackedGame,
} from "@/types/game";

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
    category?: PlaytimeCategory;
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
    (gameId: string, category?: PlaytimeCategory) => {
      if (activeSession) return;
      setActiveSession({ gameId, startedAt: Date.now(), category });
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
        category: activeSession.category,
        source: "timer",
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
    (
      gameId: string,
      durationSeconds: number,
      note?: string,
      category?: PlaytimeCategory,
      source: SessionSource = "manual",
    ) => {
      if (durationSeconds <= 0) return;
      const session: GameSession = {
        id: generateId(),
        startedAt: Date.now(),
        durationSeconds,
        note,
        category,
        source,
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

  const importSessions = useCallback(
    (gameId: string, imported: ImportedSession[], source: SessionSource) => {
      if (imported.length === 0) return;
      const newSessions: GameSession[] = imported.map((s) => ({
        id: generateId(),
        startedAt: s.date ? new Date(s.date).getTime() : Date.now(),
        durationSeconds: Math.round(s.durationMinutes * 60),
        note: s.note,
        category: s.category,
        source,
      }));
      setGames((prev) =>
        prev.map((g) => {
          if (g.id !== gameId) return g;
          const sessions = [...g.sessions, ...newSessions];
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
    importSessions,
    deleteSession,
  };
}
