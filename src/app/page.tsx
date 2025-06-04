"use client";

import ComboBoxLocalidades from "@/components/ComboBoxLocalidades";
import Dashboard from "@/components/Dashboard";
import CategoriaSelector from "@/components/CategoriaSelector";
import { useIndicadoresDashboard } from "@/hooks/useIndicadoresDashboard";
import { useState, useEffect } from "react";
import eixosTematicosJson from "@/data/categoriasIndicadores.json"; // renomeado para refletir a nova estrutura
import { EixoTematico } from "@/types/categorias";

const EIXOS_TEMATICOS: EixoTematico[] = eixosTematicosJson;

export default function Home() {
  const [municipioId, setMunicipioId] = useState("4110953");
  const [indicadoresSelecionados, setIndicadoresSelecionados] = useState<string[]>([]);

  const { data: payload, loading, error } = useIndicadoresDashboard(
    municipioId,
    indicadoresSelecionados
  );

  useEffect(() => {
    if (payload) {
      console.log("📊 Dados prontos para renderização no Dashboard:", {
        municipio: payload?.municipio?.nome,
        totalCategorias: payload?.municipio?.categorias?.length ?? 0,
        raw: payload,
      });
    }
  }, [payload]);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">
        Bem-vindo ao Observatudo
      </h2>
      <p className="text-sm opacity-70">
        Em breve, você poderá navegar por indicadores por estado, cidade e tema.
      </p>

      <ComboBoxLocalidades onChange={setMunicipioId} />

      <CategoriaSelector
        eixos={EIXOS_TEMATICOS}
        onCategoriaChange={setIndicadoresSelecionados}
      />

      {loading && <p>⏳ Carregando indicadores...</p>}
      {error && <p className="text-red-500">❌ Erro: {error.message}</p>}
      {!loading && !error && payload && <Dashboard payload={payload} />}
    </section>
  );
}
