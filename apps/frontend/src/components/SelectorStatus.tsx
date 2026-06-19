//src/components/SelectorStatus.tsx
"use client";

import { usePreferencesStore } from "@/store/preferencesStore";
import { getNomeEstado, getNomeCidade } from "@/utils/nomeUtils";
import { formatarNomeCategoria } from "@/utils/categoriaUtils";

export default function SelectorStatus() {
  const { selecionado, categoriasIndicadores } = usePreferencesStore();

  const estadoNome = getNomeEstado(selecionado.estado);
  const cidadeNome = getNomeCidade(selecionado.cidade);

  const categoria = categoriasIndicadores.find(
    (c) => c.id === selecionado.categoriaId
  );
  const categoriaNome = categoria ? formatarNomeCategoria(categoria) : null;

  return (
    <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 px-4">
      📍 <span className="font-medium">Estado:</span> {estadoNome || "—"} |{" "}
      <span className="font-medium">Cidade:</span> {cidadeNome || "—"} |{" "}
      <span className="font-medium">Categoria:</span> {categoriaNome || "—"}
    </div>
  );
}
