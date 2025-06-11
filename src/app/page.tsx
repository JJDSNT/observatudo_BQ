"use client";

import { useMemo, useLayoutEffect } from "react";
import ComboBoxLocalidades from "@/components/ComboBoxLocalidades";
import Dashboard from "@/components/Dashboard";
import CategoriaSelector from "@/components/CategoriaSelector";
import { useIndicadoresSelecionados } from "@/hooks/useIndicadoresSelecionados";
import { useCategorias } from "@/store/hooks/useCategorias";
import { usePreferencesStore } from "@/store/preferencesStore";

export default function Home() {
  const initializeDefaultsIfNeeded = usePreferencesStore((s) => s.initializeDefaultsIfNeeded);
  const [categorias] = useCategorias();

  useLayoutEffect(() => {
    initializeDefaultsIfNeeded();
  }, [initializeDefaultsIfNeeded]);

  const eixos = useMemo(() => categorias ?? [], [categorias]);
  const { indicadores, loading, error } = useIndicadoresSelecionados(true);

  return (
    <section className="space-y-6">
      <ComboBoxLocalidades onChange={() => {}} />

      {eixos.length > 0 ? (
        <CategoriaSelector eixos={eixos} onCategoriaChange={() => {}} />
      ) : (
        <p className="text-yellow-500">⚠️ Nenhuma categoria configurada.</p>
      )}

      {loading && <p>⏳ Carregando indicadores...</p>}
      {error && <p className="text-red-500">❌ Erro: {error}</p>}
      {indicadores && !loading && !error && <Dashboard payload={indicadores} />}
    </section>
  );
}
