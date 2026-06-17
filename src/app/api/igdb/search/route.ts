import { type IGDBGame, igdbRequest } from "@/lib/igdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return Response.json({ games: [] });
  }

  try {
    const results = (await igdbRequest(
      `fields name, cover.image_id, first_release_date, summary, genres.name, platforms.name; ` +
        `search "${query.replace(/"/g, '\\"')}"; ` +
        `where version_parent = null; ` +
        `limit 10;`,
    )) as IGDBGame[];

    return Response.json({ games: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
