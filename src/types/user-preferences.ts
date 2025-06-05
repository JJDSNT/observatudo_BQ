//src/types/user-preferences.ts
import type { CategoriaIndicador } from '@/types/categorias';

export interface UserPreferences {
  categoriasIndicadores?: CategoriaIndicador[];
  tema?: 'claro' | 'escuro';
  idioma?: 'pt-BR' | 'en-US';
  notificacoesAtivas?: boolean;
}
