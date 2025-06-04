export type Subeixo = {
  id: string;
  nome: string;
  indicadores: string[];
};

export type EixoTematico = {
  id: number;
  cor: string;
  icone: string; // Usado como chave em lucide-react (ex: "HeartPulse", "School")
  subeixos: Subeixo[];
};
