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
}

export interface MovieRecommendation {
  title: string;
  year?: string;
  why: string;
  energy: number;
  warmth: number;
  emotionalTags?: string[];
  posterUrl?: string;
}

export interface AlternativeMovie {
  title: string;
  year?: string;
  why: string;
  posterUrl?: string;
}

export interface RecommendationResponse {
  moodSummary: string;
  recommendations: MovieRecommendation[];
  alternatives: {
    safer: AlternativeMovie[];
    bolder: AlternativeMovie[];
    weirder: AlternativeMovie[];
  };
}
