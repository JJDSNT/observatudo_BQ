"use client";

import ComboBoxLocalidades from "@/components/ComboBoxLocalidades";
import Dashboard from "@/components/Dashboard";
import CategoryNav from "@/components/CategoryNav";
import { useIndicadoresDashboard } from "@/hooks/useIndicadoresDashboard";
import { useState } from "react";
import { IndicadorSearch } from "@/components/IndicadorSearch";
import { Indicador } from '@/types/indicadores';

const CATEGORIAS_INDICADORES = [
  { id: "educacao", nome: "Educação", indicadores: ["24", "55", "73"] },
  { id: "saude", nome: "Saúde", indicadores: ["14", "88"] },
  { id: "seguranca", nome: "Segurança", indicadores: ["100", "101"] },
];

export default function Home() {
  const [municipioId, setMunicipioId] = useState("4110953");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(
    CATEGORIAS_INDICADORES[0].id
  );
    const [indicadorSelecionado, setIndicadorSelecionado] = useState<Indicador | null>(null);

  const idsIndicadores =
    CATEGORIAS_INDICADORES.find((c) => c.id === categoriaSelecionada)
      ?.indicadores || [];

  const {
    data: payload,
    loading,
    error,
  } = useIndicadoresDashboard(municipioId, idsIndicadores);

  const handleMunicipioChange = (novoMunicipioId: string) => {
    console.log("🔍 município selecionado:", novoMunicipioId);
    setMunicipioId(novoMunicipioId);
  };

  const handleCategoriaChange = (novaCategoriaId: string) => {
    console.log("📂 categoria selecionada:", categoriaSelecionada);
    setCategoriaSelecionada(novaCategoriaId);
  };

    const handleIndicadorSelect = (indicador: Indicador) => {
    console.log("🔍 Indicador selecionado:", indicador);
    setIndicadorSelecionado(indicador);
    // Aqui você pode:
    // - disparar uma nova consulta para esse indicador
    // - substituir a categoria atual
    // - alterar uma URL de filtro etc
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">
        Bem-vindo ao Observatudo
      </h2>
      <p className="text-sm opacity-70">
        Em breve, você poderá navegar por indicadores por estado, cidade e tema.
      </p>

      <ComboBoxLocalidades onChange={handleMunicipioChange} />
      <IndicadorSearch onSelect={handleIndicadorSelect} />
      <CategoryNav
        categorias={CATEGORIAS_INDICADORES}
        categoriaSelecionada={categoriaSelecionada}
        onCategoriaChange={handleCategoriaChange}
      />

      {loading && <p>Carregando indicadores...</p>}
      {error && <p className="text-red-500">Erro: {error.message}</p>}
      {payload && <Dashboard payload={payload} />}
    </section>
  );
}
