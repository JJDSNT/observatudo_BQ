"use client";

import { useState } from "react";
import { IndicadorSearch } from "@/components/IndicadorSearch";

type IndicadorBusca = {
  id: string;
  nome: string;
};

export default function IndicadoresPage() {
  const [indicadorSelecionado, setIndicadorSelecionado] =
    useState<IndicadorBusca | null>(null);

  const handleIndicadorSelect = (indicador: IndicadorBusca) => {
    setIndicadorSelecionado(indicador);
    console.log("🔍 Indicador selecionado:", indicador);
    // Aqui você pode acionar um fetch específico ou navegação, se desejar
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">
        Busca de Indicadores
      </h2>
      <p className="text-sm opacity-70">
        Digite para buscar por nome do indicador desejado.
      </p>
      <IndicadorSearch onSelect={handleIndicadorSelect} />
      {indicadorSelecionado && (
        <div className="text-sm text-gray-600 mt-4">
          Indicador selecionado: <strong>{indicadorSelecionado.nome}</strong>
        </div>
      )}
      <div className="p-6 bg-white text-black dark:bg-black dark:text-white rounded">
        <p>
          Se o modo escuro estiver ativo, o fundo ficará preto e o texto branco.
        </p>
      </div>
    </section>
  );
}
