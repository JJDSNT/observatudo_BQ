"use client";

import ComboBoxLocalidades from "@/components/ComboBoxLocalidades";
import Dashboard from "@/components/Dashboard";
import CategoriaSelector from "@/components/CategoriaSelector";
import { useIndicadoresDashboard } from "@/hooks/useIndicadoresDashboard";
import { useState, useEffect } from "react";
import eixosTematicosJson from "@/data/categoriasIndicadores.json";
import { CategoriaIndicador, Subeixo } from "@/types/categorias";
import type { LucideIconName } from "@/components/IconSelector";

const EIXOS_TEMATICOS: CategoriaIndicador[] = eixosTematicosJson.map((eixo) => ({
  ...eixo,
  icone: eixo.icone as LucideIconName,
}));

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
        eixos={EIXOS_TEMATICOS}
        onCategoriaChange={setSubeixosSelecionados}
      />

      {loading && <p>⏳ Carregando indicadores...</p>}
      {error && <p className="text-red-500">❌ Erro: {error.message}</p>}
      {!loading && !error && payload && <Dashboard payload={payload} />}
    </section>
  );
}
