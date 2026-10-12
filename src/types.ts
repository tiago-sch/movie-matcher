export interface MoodSliders {
  energy: number; // 1=calm, 10=intense
  tone: number;   // 1=hopeful, 10=dark
  pace: number;   // 1=slow, 10=fast
}

export interface MoodInputs {
  text: string;
  sliders: MoodSliders;
  watchingContext: string[];
  mentalState: string;
  genres: string[];
  sameLanguageOnly: boolean;
}

export interface MovieRecommendation {
  title: string;
  year?: string;
  why: string;
  energy: number;
  warmth: number;
  genres?: string[];
  emotionalTags?: string[];
  posterUrl?: string;
}

export interface AlternativeMovie {
  title: string;
  year?: string;
  why: string;
  genres?: string[];
  emotionalTags?: string[];
  posterUrl?: string;
}

export interface RecommendationResponse {
  title: string;   // short evocative name for this "feel"
  tagline: string; // one-line description
  moodSummary: string;
  recommendations: MovieRecommendation[];
  alternatives: {
    safer: AlternativeMovie[];
    bolder: AlternativeMovie[];
    weirder: AlternativeMovie[];
  };
}

export type FeelLocale = 'en' | 'pt-BR';

/** A saved search: everything needed to show the results again without calling the model. */
export interface Feel {
  id: string;
  createdAt: string; // ISO date
  locale: FeelLocale;
  mood: MoodInputs;
  results: RecommendationResponse;
}

export interface FeelSummary {
  id: string;
  createdAt: string;
  title: string;
  tagline: string;
  posterUrl?: string;
}

export interface RecommendResult extends RecommendationResponse {
  id?: string; // absent when the database is not configured
}
