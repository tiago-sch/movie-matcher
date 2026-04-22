export type Locale = 'en' | 'pt-BR';

export interface T {
  langSwitch: string;
  subtitle: string;
  checking: string;
  warnings: Record<'no-key' | 'invalid-key' | 'model-unavailable' | 'network-error', { title: string; detail: string }>;
  moodLabel: string;
  moodPlaceholder: string;
  slidersLabel: string;
  energy: string;
  tone: string;
  pace: string;
  calm: string;
  intense: string;
  hopeful: string;
  dark: string;
  slow: string;
  fast: string;
  watchingContext: string;
  contexts: Record<'alone' | 'date night' | 'with friends' | 'background watch', string>;
  mentalState: string;
  states: Record<'tired' | 'curious' | 'overstimulated' | 'emotional', string>;
  submit: string;
  submitting: string;
  apiUnavailable: string;
  loading: string[];
  moodRead: string;
  pickedForYou: string;
  safer: string;
  saferDesc: string;
  bolder: string;
  bolderDesc: string;
  weirder: string;
  weirderDesc: string;
  startOver: string;
  tryAgain: string;
  energyLabel: string;
  warmthLabel: string;
  footerMadeBy: string;
  footerGithub: string;
}

export const translations: Record<Locale, T> = {
  en: {
    langSwitch: 'PT',
    subtitle: "Tell me how you feel. I'll find your film.",
    checking: 'Checking API availability…',
    warnings: {
      'no-key':            { title: 'API key missing.',      detail: 'Add VITE_GEMINI_API_KEY to your .env file. Get a free key at aistudio.google.com.' },
      'invalid-key':       { title: 'API key invalid.',      detail: 'Your VITE_GEMINI_API_KEY was rejected. Double-check it in Google AI Studio.' },
      'model-unavailable': { title: 'Model unavailable.',    detail: 'gemini-2.5-flash is not accessible on this key. It may not be enabled for your account yet.' },
      'network-error':     { title: 'Cannot reach Gemini.', detail: 'Check your internet connection or try again in a moment.' },
    },
    moodLabel: 'How are you feeling?',
    moodPlaceholder: '"I want something comforting but not childish"\n"Mentally tired, need smart but not heavy"\n"Chaotic and stylish — it\'s Friday night"',
    slidersLabel: 'Tune your mood',
    energy: 'Energy',
    tone: 'Tone',
    pace: 'Pace',
    calm: 'calm',
    intense: 'intense',
    hopeful: 'hopeful',
    dark: 'dark',
    slow: 'slow',
    fast: 'fast',
    watchingContext: 'Watching context',
    contexts: {
      'alone':            'alone',
      'date night':       'date night',
      'with friends':     'with friends',
      'background watch': 'background watch',
    },
    mentalState: 'Mental state',
    states: {
      tired:          'tired',
      curious:        'curious',
      overstimulated: 'overstimulated',
      emotional:      'emotional',
    },
    submit:         'Find My Movie',
    submitting:     'Finding your movies…',
    apiUnavailable: 'API unavailable',
    loading: [
      'Scanning your wavelength',
      'Consulting the archive',
      'Matching emotional frequency',
      'Curating your list',
    ],
    moodRead:    'Your mood read',
    pickedForYou: 'Picked for you',
    safer:       'Safer bet',
    saferDesc:   'A bit more familiar',
    bolder:      'Bolder choice',
    bolderDesc:  'Push yourself a little',
    weirder:     'Weirder pick',
    weirderDesc: 'Fully commit to the vibe',
    startOver:   'Start over',
    tryAgain:    'Try again',
    energyLabel: 'Energy',
    warmthLabel: 'Warmth',
    footerMadeBy: 'Made by',
    footerGithub: 'GitHub',
  },

  'pt-BR': {
    langSwitch: 'EN',
    subtitle: 'Me diga como você está. Eu encontro seu filme.',
    checking: 'Verificando disponibilidade da API…',
    warnings: {
      'no-key':            { title: 'Chave de API ausente.',               detail: 'Adicione VITE_GEMINI_API_KEY ao seu arquivo .env. Obtenha uma chave gratuita em aistudio.google.com.' },
      'invalid-key':       { title: 'Chave de API inválida.',              detail: 'Sua VITE_GEMINI_API_KEY foi rejeitada. Verifique no Google AI Studio.' },
      'model-unavailable': { title: 'Modelo indisponível.',                detail: 'gemini-2.5-flash não está acessível com esta chave. Pode não estar habilitado para sua conta ainda.' },
      'network-error':     { title: 'Não foi possível acessar o Gemini.', detail: 'Verifique sua conexão com a internet ou tente novamente em instantes.' },
    },
    moodLabel: 'Como você está se sentindo?',
    moodPlaceholder: '"Quero algo reconfortante mas não infantil"\n"Cansado mentalmente, preciso de algo inteligente mas não pesado"\n"Caótico e estiloso — é sexta-feira à noite"',
    slidersLabel: 'Ajuste seu humor',
    energy: 'Energia',
    tone: 'Tom',
    pace: 'Ritmo',
    calm: 'calmo',
    intense: 'intenso',
    hopeful: 'esperançoso',
    dark: 'sombrio',
    slow: 'lento',
    fast: 'rápido',
    watchingContext: 'Contexto de exibição',
    contexts: {
      'alone':            'sozinho',
      'date night':       'noite a dois',
      'with friends':     'com amigos',
      'background watch': 'plano de fundo',
    },
    mentalState: 'Estado mental',
    states: {
      tired:          'cansado',
      curious:        'curioso',
      overstimulated: 'superestimulado',
      emotional:      'emotivo',
    },
    submit:         'Encontrar Meu Filme',
    submitting:     'Encontrando seus filmes…',
    apiUnavailable: 'API indisponível',
    loading: [
      'Escaneando seu comprimento de onda',
      'Consultando o arquivo',
      'Sintonizando frequência emocional',
      'Curadoria da sua lista',
    ],
    moodRead:    'Sua leitura de humor',
    pickedForYou: 'Selecionados para você',
    safer:       'Escolha segura',
    saferDesc:   'Um pouco mais familiar',
    bolder:      'Escolha ousada',
    bolderDesc:  'Se desafie um pouco',
    weirder:     'Escolha diferente',
    weirderDesc: 'Mergulhe de cabeça no clima',
    startOver:   'Começar de novo',
    tryAgain:    'Tentar novamente',
    energyLabel: 'Energia',
    warmthLabel: 'Calor',
    footerMadeBy: 'Feito por',
    footerGithub: 'GitHub',
  },
};
