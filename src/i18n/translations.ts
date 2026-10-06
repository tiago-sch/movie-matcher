export type Locale = 'en' | 'pt-BR';

export interface T {
  langSwitch: string;
  subtitle: string;
  checking: string;
  warnings: Record<'no-key' | 'invalid-key' | 'model-unavailable' | 'quota-exceeded' | 'network-error' | 'captcha-misconfigured', { title: string; detail: string }>;
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
  loadMore: string;
  loadingMore: string;
  viewDetails: string;
  whyThisFits: string;
  overview: string;
  cast: string;
  noDetails: string;
  viewOnTmdb: string;
  close: string;
  errors: {
    parse: string;
    api: string;
    captcha: string;
    generic: string;
  };
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
      'no-key':            { title: 'API key missing.',      detail: 'Set OPENAI_API_KEY in the server environment. Get a key at platform.openai.com/api-keys.' },
      'invalid-key':       { title: 'API key invalid.',      detail: 'OPENAI_API_KEY was rejected. Double-check it in the OpenAI dashboard.' },
      'model-unavailable': { title: 'Model unavailable.',    detail: 'The configured OpenAI model is not accessible on this key. Check OPENAI_MODEL.' },
      'quota-exceeded':     { title: 'Unavailable right now.', detail: 'The service is temporarily at capacity. Check back in a little while.' },
      'network-error':     { title: 'Cannot reach the server.', detail: 'Check your internet connection or try again in a moment.' },
      'captcha-misconfigured': { title: 'Captcha not configured.', detail: 'Set VITE_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY.' },
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
    loadMore:    'Show 3 more',
    loadingMore: 'Finding more…',
    viewDetails: 'View details',
    whyThisFits: 'Why this fits',
    overview:    'Overview',
    cast:        'Cast',
    noDetails:   'No synopsis available for this title.',
    viewOnTmdb:  'View on TMDB',
    close:       'Close',
    errors: {
      parse:   'The AI returned an unexpected response. Please try again.',
      api:     'The OpenAI API returned an error. Please try again later.',
      captcha: 'We could not verify that you are human. Please reload the page and try again.',
      generic: 'Something went wrong. Please try again.',
    },
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
      'no-key':            { title: 'Chave de API ausente.',               detail: 'Defina OPENAI_API_KEY no ambiente do servidor. Obtenha uma chave em platform.openai.com/api-keys.' },
      'invalid-key':       { title: 'Chave de API inválida.',              detail: 'OPENAI_API_KEY foi rejeitada. Verifique no painel da OpenAI.' },
      'model-unavailable': { title: 'Modelo indisponível.',                detail: 'O modelo OpenAI configurado não está acessível com esta chave. Verifique OPENAI_MODEL.' },
      'quota-exceeded':     { title: 'Indisponível no momento.', detail: 'O serviço está temporariamente sobrecarregado. Volte daqui a pouco.' },
      'network-error':     { title: 'Não foi possível acessar o servidor.', detail: 'Verifique sua conexão com a internet ou tente novamente em instantes.' },
      'captcha-misconfigured': { title: 'Captcha não configurado.', detail: 'Defina VITE_TURNSTILE_SITE_KEY e TURNSTILE_SECRET_KEY.' },
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
    loadMore:    'Mostrar mais 3',
    loadingMore: 'Buscando mais…',
    viewDetails: 'Ver detalhes',
    whyThisFits: 'Por que combina',
    overview:    'Sinopse',
    cast:        'Elenco',
    noDetails:   'Sem sinopse disponível para este título.',
    viewOnTmdb:  'Ver no TMDB',
    close:       'Fechar',
    errors: {
      parse:   'A IA retornou uma resposta inesperada. Tente novamente.',
      api:     'A API da OpenAI retornou um erro. Tente novamente mais tarde.',
      captcha: 'Não conseguimos verificar que você é humano. Recarregue a página e tente de novo.',
      generic: 'Algo deu errado. Tente novamente.',
    },
    energyLabel: 'Energia',
    warmthLabel: 'Calor',
    footerMadeBy: 'Feito por',
    footerGithub: 'GitHub',
  },
};
