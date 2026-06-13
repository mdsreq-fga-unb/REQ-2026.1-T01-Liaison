/**
 * Shared interest/area options used by both Student and Organization profiles.
 * Extracted from StudentProfileEditScreen to be reusable.
 */
export const INTERESSE_OPTIONS = [
  { id: 'saude', label: 'Saúde', icon: 'fitness-outline' as const },
  { id: 'educacao', label: 'Educação', icon: 'school-outline' as const },
  { id: 'tecnologia', label: 'Tecnologia', icon: 'laptop-outline' as const },
  { id: 'meio_ambiente', label: 'Meio Ambiente', icon: 'leaf-outline' as const },
  { id: 'assistencia_social', label: 'Assistência Social', icon: 'people-outline' as const },
  { id: 'arte_cultura', label: 'Arte & Cultura', icon: 'color-palette-outline' as const },
];
