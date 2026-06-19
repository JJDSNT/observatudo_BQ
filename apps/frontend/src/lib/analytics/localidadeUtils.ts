import localidadesJson from '@/data/localidades_dropdown.json';

const brasil = localidadesJson[0]; // único país

export function getInfoMunicipio(municipioId: string): {
  id: string;
  nome: string;
  estadoId: string;
  sigla: string;
  estadoNome: string;
} | null {
  for (const estado of brasil.children) {
    const cidade = estado.children.find(c => c.value === municipioId);
    if (cidade) {
      return {
        id: cidade.value,
        nome: cidade.label,
        estadoId: estado.value,
        sigla: estado.value,
        estadoNome: estado.label,
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
