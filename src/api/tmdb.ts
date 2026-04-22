const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';

export async function fetchMoviePoster(title: string, year?: string): Promise<string | null> {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  if (!apiKey) return null;

  try {
    const params = new URLSearchParams({ api_key: apiKey, query: title });
    if (year) params.set('year', year);
    const res = await fetch(`${TMDB_BASE}/search/movie?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    const poster = data.results?.[0]?.poster_path;
    return poster ? `${TMDB_IMG_BASE}${poster}` : null;
  } catch {
    return null;
  }
}
