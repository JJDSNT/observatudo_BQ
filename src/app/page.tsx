// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import ComboBoxLocalidades from "@/components/ComboBoxLocalidades";
import Dashboard from "@/components/Dashboard";
import CategoriaSelector from "@/components/CategoriaSelector";
import { useIndicadoresDashboard } from "@/hooks/useIndicadoresDashboard";
import { CATEGORIAS_DEFAULT } from "@/data/categoriasIndicadores";
import { Subeixo } from "@/types";

export default function Home() {
  const [municipioId, setMunicipioId] = useState("4110953");
  const [subeixosSelecionados, setSubeixosSelecionados] = useState<Subeixo[]>([]);

  const { data: payload, loading, error } = useIndicadoresDashboard(
    municipioId,
    subeixosSelecionados
  );

  useEffect(() => {
    if (payload) {
      console.log("📊 Dados prontos para renderização no Dashboard:", {
        municipio: payload?.municipio?.nome,
        totalSubeixos: payload?.municipio?.subeixos?.length ?? 0,
        raw: payload,
      });
    }
  }, [payload]);

  return (
    <section className="space-y-6">
      <ComboBoxLocalidades onChange={setMunicipioId} />
      <CategoriaSelector
        eixos={CATEGORIAS_DEFAULT}
        onCategoriaChange={setSubeixosSelecionados}
      />
      {loading && <p>⏳ Carregando indicadores...</p>}
      {error && <p className="text-red-500">❌ Erro: {error.message}</p>}
      {!loading && !error && payload && <Dashboard payload={payload} />}
    </section>
  );
}
