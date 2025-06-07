// src/types/location.ts

export interface Localizacao {
  estado: string;
  cidade: string;
}

export interface CidadeDropdown {
  label: string; // Nome da cidade
  value: string; // ID da cidade
}

export interface EstadoDropdown {
  label: string;     // Sigla do estado, ex: "SP"
  value: string;     // Mesmo valor da sigla, ex: "SP"
  default: string;   // ID da capital
  children: CidadeDropdown[]; // Lista de cidades
}

export interface PaisDropdown {
  label: string; // Nome do país, ex: "Brasil"
  value: string; // ID do país, ex: "BR"
  children: EstadoDropdown[];
}
