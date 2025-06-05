// types/indicadores.ts

export interface ValorSerie {
  data: string;   // "2022-01-01" ou apenas ano, se preferir
  valor: number | null;
}

export interface Indicador {
  id: string;
  nome: string;
  descricao?: string;
  unidade?: string;
  fonte?: string;
  periodicidade?: string;
  serie: ValorSerie[];
}

// DTO usado no frontend para enviar subeixos
export interface Subeixo {
  id: string;
  nome: string;
  indicadores: string[];
}

// Resultado completo de um subeixo com dados reais
export interface SubeixoResultado {
  id: string;
  nome: string;
  indicadores: Indicador[];
}

export interface LocalidadePayload {
  id: string;
  nome: string;
  sigla?: string;  // para estado ou país
  uf?: string;     // para município
  subeixos: SubeixoResultado[]; // ✅ trocado de 'categorias' para 'subeixos'
}

export interface LocalidadeFullResponse {
  municipio: LocalidadePayload;
  estado: LocalidadePayload;
  pais: LocalidadePayload;
}
