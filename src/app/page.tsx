"use client";

import ComboBoxLocalidades from "@/components/ComboBoxLocalidades";
import Dashboard from "@/components/Dashboard";
import CategoryNav from "@/components/CategoryNav";
import { useIndicadoresDashboard } from "@/hooks/useIndicadoresDashboard";
import { useState, useMemo, useEffect } from "react";
import { IndicadorSearch } from "@/components/IndicadorSearch";
import categoriasJson from "@/data/categoriasIndicadores.json";
import { Categoria } from "@/types/categorias";

const CATEGORIAS_INDICADORES: Categoria[] = categoriasJson;

export default function Home() {
  const [municipioId, setMunicipioId] = useState("4110953");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);

  // Categorização personalizada para o backend
  const categoriasSelecionadas = useMemo(() => {
    if (categoriaSelecionada === null) return [];
    const encontrada = CATEGORIAS_INDICADORES.find((c) => c.id === categoriaSelecionada);
    return encontrada ? [encontrada] : [];
  }, [categoriaSelecionada]);

  const {
    data: payload,
    loading,
    error,
  } = useIndicadoresDashboard(municipioId, categoriasSelecionadas);

  useEffect(() => {
    if (payload) {
      console.log("📊 Dados prontos para renderização no Dashboard:", {
        municipio: payload?.municipio?.nome,
        totalCategorias: payload?.municipio?.categorias?.length ?? 0,
        raw: payload,
      });
    }
  }, [payload]);

  const handleMunicipioChange = (novoMunicipioId: string) => {
    console.log("🌍 Município selecionado:", novoMunicipioId);
    setMunicipioId(novoMunicipioId);
  };

  const handleCategoriaChange = (novaCategoriaId: number) => {
    console.log("📂 Nova categoria clicada:", novaCategoriaId);
    setCategoriaSelecionada(novaCategoriaId);
  };

  type IndicadorBusca = {
    id: string;
    nome: string;
  };

  const handleIndicadorSelect = (indicador: IndicadorBusca) => {
    console.log("🔍 Indicador selecionado via busca:", indicador);
    // Se quiser acionar consulta por indicador isolado, pode adaptar aqui
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
        categoriaSelecionada={categoriaSelecionada ?? -1}
        onCategoriaChange={handleCategoriaChange}
      />

      {loading && <p>⏳ Carregando indicadores...</p>}
      {error && <p className="text-red-500">❌ Erro: {error.message}</p>}
      {!loading && !error && payload && <Dashboard payload={payload} />}
    </section>
  );
}
