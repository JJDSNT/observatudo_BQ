//src/types/user-preferences.ts
export interface UserPreferences {
  tema?: 'claro' | 'escuro';
  idioma?: 'pt-BR' | 'en-US';
  notificacoesAtivas?: boolean;
  [key: string]: string | number | boolean | undefined;
}