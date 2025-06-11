"use client";

import { useState, useMemo, useLayoutEffect } from "react";
import ComboBoxLocalidades from "@/components/ComboBoxLocalidades";
import Dashboard from "@/components/Dashboard";
import CategoriaSelector from "@/components/CategoriaSelector";
import { useIndicadoresDashboard } from "@/hooks/useIndicadoresDashboard";
import { useCategorias } from "@/store/hooks/useCategorias";
import { usePreferencesStore } from "@/store/preferencesStore";
import { Subeixo } from "@/types";

export default function Home() {
  const [municipioId, setMunicipioId] = useState("4110953");
  const [subeixosSelecionados, setSubeixosSelecionados] = useState<Subeixo[]>([]);

  const initializeDefaultsIfNeeded = usePreferencesStore((s) => s.initializeDefaultsIfNeeded);
  const [categorias] = useCategorias();

  useLayoutEffect(() => {
    initializeDefaultsIfNeeded();
  }, [initializeDefaultsIfNeeded]);

  const eixos = useMemo(() => categorias ?? [], [categorias]);

  const { data: payload, loading, error } = useIndicadoresDashboard(
    municipioId,
    subeixosSelecionados
  );

  return (
    <section className="space-y-6">
      <ComboBoxLocalidades onChange={setMunicipioId} />

      {eixos.length > 0 ? (
        <CategoriaSelector
          eixos={eixos}
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
