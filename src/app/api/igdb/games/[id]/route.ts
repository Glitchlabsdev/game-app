import { type IGDBGame, igdbRequest } from "@/lib/igdb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const gameId = Number(id);

  if (Number.isNaN(gameId)) {
    return Response.json({ error: "Invalid game ID" }, { status: 400 });
  }

  try {
    const results = (await igdbRequest(
      `fields name, cover.image_id, first_release_date, summary, genres.name, platforms.name; ` +
        `where id = ${gameId}; ` +
        `limit 1;`,
    )) as IGDBGame[];

    if (results.length === 0) {
      return Response.json({ error: "Game not found" }, { status: 404 });
    }

    return Response.json({ game: results[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
