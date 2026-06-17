"use client";

import { useEffect, useState } from "react";

export function useActiveTimer(
  activeSession: { gameId: string; startedAt: number } | null,
) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    setElapsedSeconds(
      Math.floor((Date.now() - activeSession.startedAt) / 1000),
    );

    const interval = setInterval(() => {
      setElapsedSeconds(
        Math.floor((Date.now() - activeSession.startedAt) / 1000),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  return elapsedSeconds;
}
