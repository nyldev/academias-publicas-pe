// Design tokens do app "Recife +" — cores da Prefeitura do Recife (azul e amarelo),
// além de espaçamento, raios e sombras. Centraliza a aparência de todas as telas.

export const colors = {
  // Azul Recife (cor primária: cabeçalhos, botões, ícones de marca)
  primary: '#0064B0',
  primaryDark: '#004B87',
  primarySoft: '#E4F0FA',
  primaryBorder: '#C7E0F2',

  // Amarelo Recife (cor de destaque: acentos, selos, o "+")
  accent: '#FFC20E',
  accentSoft: '#FFF6D6',
  accentText: '#8A6400',

  bg: '#F1F5F9',
  surface: '#FFFFFF',

  textPrimary: '#152230',
  textSecondary: '#54606B',
  textMuted: '#94A0AB',

  // Avaliações (estrelas) em amarelo — combina com a identidade
  star: '#FFC20E',
  starSoft: '#FFF6D6',
  starText: '#8A6400',

  border: '#E6ECF1',
  danger: '#C62828',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const radius = { sm: 10, md: 14, lg: 18, pill: 999 };

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
};
