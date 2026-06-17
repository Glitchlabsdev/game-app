import { type IGDBGame, igdbRequest } from "@/lib/igdb";

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return Response.json({ games: [], hasMore: false });
  }

  const rawPage = Number(searchParams.get("page"));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const offset = (page - 1) * PAGE_SIZE;

  try {
    const results = (await igdbRequest(
      `fields name, cover.image_id, first_release_date, summary, genres.name, platforms.name; ` +
        `search "${query.replace(/"/g, '\\"')}"; ` +
        `where version_parent = null; ` +
        `sort first_release_date desc; ` +
        `limit ${PAGE_SIZE + 1}; ` +
        `offset ${offset};`,
    )) as IGDBGame[];

    const hasMore = results.length > PAGE_SIZE;
    const games = results.slice(0, PAGE_SIZE);

    return Response.json({ games, hasMore });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
