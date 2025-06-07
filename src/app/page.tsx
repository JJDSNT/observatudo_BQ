// src/app/page.tsx
"use client";

import { useState } from "react";
import ComboBoxLocalidades from "@/components/ComboBoxLocalidades";
import Dashboard from "@/components/Dashboard";
import CategoriaSelector from "@/components/CategoriaSelector";
import { useIndicadoresDashboard } from "@/hooks/useIndicadoresDashboard";
import { useCategorias } from "@/store/hooks/useCategorias";
import { Subeixo } from "@/types";

export default function Home() {
  const [municipioId, setMunicipioId] = useState("4110953");
  const [subeixosSelecionados, setSubeixosSelecionados] = useState<Subeixo[]>([]);

  const categorias = useCategorias();
  const { data: payload, loading, error } = useIndicadoresDashboard(
    municipioId,
    subeixosSelecionados
  );

  return (
    <section className="space-y-6">
      <ComboBoxLocalidades onChange={setMunicipioId} />

      {categorias?.length ? (
        <CategoriaSelector
          eixos={categorias}
          onCategoriaChange={setSubeixosSelecionados}
        />
      ) : (
        <p className="text-yellow-500">⚠️ Nenhuma categoria configurada.</p>
      )}

      {loading && <p>⏳ Carregando indicadores...</p>}
      {error && <p className="text-red-500">❌ Erro: {error.message}</p>}
      {payload && !loading && !error && <Dashboard payload={payload} />}
    </section>
  );
}
