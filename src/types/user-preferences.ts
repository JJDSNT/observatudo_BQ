// src/types/user-preferences.ts
import type { CategoriaIndicador } from "@/types";

/**
 * Preferências personalizadas do usuário, salvas localmente ou remotamente.
 */
export interface UserPreferences {
  /**
   * Lista de categorias e subeixos preferidos
   */
  categoriasIndicadores?: CategoriaIndicador[];

  /**
   * Tema visual da interface
   */
  tema?: "claro" | "escuro";

  /**
   * Idioma da interface
   */
  idioma?: "pt-BR" | "en-US";

  /**
   * Permite ou não notificações
   */
  notificacoesAtivas?: boolean;

  debugZustand?: boolean;
  debugPwa?: boolean;
  debugLatency?: boolean

  /**
   * ID da cidade selecionada (localidade atual)
   */
  cidadeSelecionada?: string;

  /**
   * Sigla ou ID do estado selecionado
   */
  estadoSelecionado?: string;

  /**
   * ID da categoria atualmente selecionada
   */
  categoriaSelecionada?: number;

  /**
   * ID do eixo temático atualmente selecionado
   */
  eixoSelecionado?: number;

  /**
   * Lista de subeixos filtrados ou destacados
   */
  subeixosSelecionados?: string[];
}
