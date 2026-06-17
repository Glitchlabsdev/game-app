"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getIGDBCoverUrl, type IGDBGame } from "@/lib/igdb";
import type { GameStatus } from "@/types/game";

interface GameSearchProps {
  onAdd: (game: {
    igdbId: number;
    name: string;
    coverImageId?: string;
    status: GameStatus;
  }) => void;
}

export function GameSearch({ onAdd }: GameSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IGDBGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/igdb/search?q=${encodeURIComponent(query)}`,
      );
      const data = (await res.json()) as { games?: IGDBGame[]; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Search failed");
      }
      setResults(data.games ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search games on IGDB..."
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {results.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {results.map((game) => (
            <li
              key={game.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              {game.cover?.image_id ? (
                <Image
                  src={getIGDBCoverUrl(game.cover.image_id, "cover_small")}
                  alt={game.name}
                  width={90}
                  height={128}
                  className="h-16 w-12 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                  No cover
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{game.name}</p>
                {game.first_release_date && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(game.first_release_date * 1000).getFullYear()}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button
                  size="sm"
                  onClick={() =>
                    onAdd({
                      igdbId: game.id,
                      name: game.name,
                      coverImageId: game.cover?.image_id,
                      status: "playing",
                    })
                  }
                >
                  Play
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onAdd({
                      igdbId: game.id,
                      name: game.name,
                      coverImageId: game.cover?.image_id,
                      status: "backlog",
                    })
                  }
                >
                  Backlog
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
