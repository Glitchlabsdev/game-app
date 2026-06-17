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
        `limit ${PAGE_SIZE + 1}; ` +
        `offset ${offset};`,
    )) as IGDBGame[];

    const sorted = [...results].sort((a, b) => {
      if (!a.first_release_date) return 1;
      if (!b.first_release_date) return -1;
      return b.first_release_date - a.first_release_date;
    });

    const hasMore = sorted.length > PAGE_SIZE;
    const games = sorted.slice(0, PAGE_SIZE);

    return Response.json({ games, hasMore });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
