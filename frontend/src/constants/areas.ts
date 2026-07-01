// Rótulos e ícones por área de atuação (slug do backend → display).
export const AREA_LABELS: Record<string, string> = {
  educacao: 'Educação',
  saude: 'Saúde',
  tecnologia: 'Tecnologia',
  meio_ambiente: 'Meio Ambiente',
  assistencia_social: 'Assistência Social',
  arte_cultura: 'Arte & Cultura',
  esporte: 'Esporte',
};

export const AREA_ICONS: Record<string, string> = {
  educacao: 'book-outline',
  saude: 'medkit-outline',
  tecnologia: 'laptop-outline',
  meio_ambiente: 'leaf-outline',
  assistencia_social: 'heart-outline',
  arte_cultura: 'color-palette-outline',
  esporte: 'basketball-outline',
};

export const areaLabel = (area: string): string => AREA_LABELS[area] ?? area;
