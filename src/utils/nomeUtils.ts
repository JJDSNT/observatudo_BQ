// src/utils/nomeUtils.ts
import LOCALIDADES from "@/data/localidades_dropdown.json";

export function getNomeEstado(sigla: string | undefined): string | null {
  const estados = LOCALIDADES[0]?.children ?? [];
  return estados.find((estado) => estado.value.trim() === sigla?.trim())?.label?.trim() ?? null;
}

export function getNomeCidade(cidadeId: string | undefined): string | null {
  const estados = LOCALIDADES[0]?.children ?? [];

  for (const estado of estados) {
    const cidade = estado.children?.find((c) => c.value === cidadeId?.trim());
    if (cidade) return cidade.label?.trim();
  }

  return null;
}
