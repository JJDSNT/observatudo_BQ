export interface CidadeDropdown {
  id: string
  nome: string
  é_capital: boolean
}

export interface EstadoDropdown {
  nome: string
  capital_id: string
  cidades: CidadeDropdown[]
}

export type LocalidadesMap = Record<string, EstadoDropdown> // Ex: { "SP": Estado, "RJ": Estado }
