import localidadesJson from '@/data/localidades_dropdown.json';
import type { LocalidadesMap } from '@/types/localidadesDropdown.types';

const localidades = localidadesJson as LocalidadesMap;

export function getInfoMunicipio(municipioId: string): {
  id: string;
  nome: string;
  estadoId: string;
  sigla: string;
  estadoNome: string;
} | null {
  for (const [sigla, estado] of Object.entries(localidades)) {
    const cidade = estado.cidades.find(c => c.id === municipioId);
    if (cidade) {
      return {
        id: cidade.id,
        nome: cidade.nome,
        estadoId: sigla,
        sigla: sigla,
        estadoNome: estado.nome,
      };
    }
  }
  return null;
}

export function getEstadoDoMunicipio(municipioId: string) {
  const info = getInfoMunicipio(municipioId);
  if (!info) return null;
  return {
    id: info.estadoId,
    nome: info.estadoNome,
    sigla: info.sigla,
  };
}

export function getInfoPais() {
  return { id: "BR", nome: "Brasil", sigla: "BR" };
}
