import type { RecommendationResponse } from '../../src/types.js';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';

async function fetchPoster(key: string, title: string, year?: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({ api_key: key, query: title });
    if (year) params.set('year', year);
    const res = await fetch(`${TMDB_BASE}/search/movie?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { results?: { poster_path?: string | null }[] };
    const poster = data.results?.[0]?.poster_path;
    return poster ? `${TMDB_IMG_BASE}${poster}` : null;
  } catch {
    return null;
  }
}

/** Fills posterUrl on every movie so saved feels render without extra lookups. */
export async function attachPosters(data: RecommendationResponse): Promise<void> {
  // The client key is also present in the function environment on Vercel
  const key = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY;
  if (!key) return;
  const movies = [
    ...data.recommendations,
    ...(data.alternatives?.safer ?? []),
    ...(data.alternatives?.bolder ?? []),
    ...(data.alternatives?.weirder ?? []),
  ];
  await Promise.allSettled(movies.map(async movie => {
    const url = await fetchPoster(key, movie.title, movie.year);
    if (url) movie.posterUrl = url;
  }));
}
