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

  /**
   * Grupo de preferências de debug
   */
  debug?: {
    zustand?: boolean;
    pwa?: boolean;
    latency?: boolean;
    latencyMonitor?: boolean;
  };

  /**
   * Agrupamento dos filtros principais selecionados
   */
  selecionado?: {
    estado?: string;
    cidade?: string;
    eixo?: number;
    subeixos?: string[];
  };
}
