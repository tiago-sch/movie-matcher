import type { Locale } from '../i18n/translations';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_PROFILE_BASE = 'https://image.tmdb.org/t/p/w185';

export interface CastMember {
  name: string;
  character: string;
  profileUrl: string | null;
}

export interface MovieDetails {
  tmdbId: number;
  title: string;
  year?: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  rating: number | null;
  runtime: number | null;
  genres: string[];
  cast: CastMember[];
  tmdbUrl: string;
}

function apiKey(): string | undefined {
  return import.meta.env.VITE_TMDB_API_KEY;
}

async function searchMovieId(title: string, year?: string): Promise<number | null> {
  const key = apiKey();
  if (!key) return null;
  try {
    const params = new URLSearchParams({ api_key: key, query: title });
    if (year) params.set('year', year);
    let res = await fetch(`${TMDB_BASE}/search/movie?${params}`);
    if (!res.ok) return null;
    let data = await res.json() as { results?: { id: number }[] };
    if (!data.results?.length && year) {
      // Retry without the year — the model's year is occasionally off by one
      params.delete('year');
      res = await fetch(`${TMDB_BASE}/search/movie?${params}`);
      if (!res.ok) return null;
      data = await res.json() as { results?: { id: number }[] };
    }
    return data.results?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function fetchMoviePoster(title: string, year?: string): Promise<string | null> {
  const key = apiKey();
  if (!key) return null;
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

const detailsCache = new Map<string, Promise<MovieDetails | null>>();

export function fetchMovieDetails(title: string, year: string | undefined, locale: Locale): Promise<MovieDetails | null> {
  const cacheKey = `${locale}|${title}|${year ?? ''}`;
  const cached = detailsCache.get(cacheKey);
  if (cached) return cached;

  const promise = (async (): Promise<MovieDetails | null> => {
    const key = apiKey();
    if (!key) return null;
    const id = await searchMovieId(title, year);
    if (!id) return null;
    try {
      const params = new URLSearchParams({ api_key: key, language: locale, append_to_response: 'credits' });
      const res = await fetch(`${TMDB_BASE}/movie/${id}?${params}`);
      if (!res.ok) return null;
      const d = await res.json() as {
        id: number; title: string; release_date?: string; overview?: string;
        poster_path?: string | null; backdrop_path?: string | null; vote_average?: number;
        runtime?: number | null; genres?: { name: string }[];
        credits?: { cast?: { name: string; character: string; profile_path?: string | null }[] };
      };
      return {
        tmdbId: d.id,
        title: d.title,
        year: d.release_date?.slice(0, 4) || year,
        overview: d.overview ?? '',
        posterUrl: d.poster_path ? `${TMDB_IMG_BASE}${d.poster_path}` : null,
        backdropUrl: d.backdrop_path ? `${TMDB_IMG_BASE}${d.backdrop_path}` : null,
        rating: typeof d.vote_average === 'number' && d.vote_average > 0 ? Math.round(d.vote_average * 10) / 10 : null,
        runtime: d.runtime ?? null,
        genres: d.genres?.map(g => g.name) ?? [],
        cast: (d.credits?.cast ?? []).slice(0, 8).map(c => ({
          name: c.name,
          character: c.character,
          profileUrl: c.profile_path ? `${TMDB_PROFILE_BASE}${c.profile_path}` : null,
        })),
        tmdbUrl: `https://www.themoviedb.org/movie/${d.id}`,
      };
    } catch {
      return null;
    }
  })();

  detailsCache.set(cacheKey, promise);
  return promise;
}
