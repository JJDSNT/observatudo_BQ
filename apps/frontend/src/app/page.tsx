"use client";

import { useMemo, useLayoutEffect } from "react";
import ComboBoxLocalidades from "@/components/ComboBoxLocalidades";
import Dashboard from "@/components/Dashboard";
import CategoriaSelector from "@/components/CategoriaSelector";
import { MetricCardSkeleton } from "@/components/MetricCard/MetricCardSkeleton";
import { useIndicadoresSelecionados } from "@/hooks/useIndicadoresSelecionados";
import { useCategorias } from "@/store/hooks/useCategorias";
import { usePreferencesStore } from "@/store/preferencesStore";
import SelectorStatus from "@/components/SelectorStatus";

export default function Home() {
  const initializeDefaultsIfNeeded = usePreferencesStore((s) => s.initializeDefaultsIfNeeded);
  const [categorias] = useCategorias();

  useLayoutEffect(() => {
    initializeDefaultsIfNeeded();
  }, [initializeDefaultsIfNeeded]);

  const eixos = useMemo(() => categorias ?? [], [categorias]);
  const cidade = usePreferencesStore((s) => s.selecionado.cidade);
  const { indicadores, loading, error } = useIndicadoresSelecionados(true);

  return (
    <section className="space-y-6">
      <SelectorStatus />
      <ComboBoxLocalidades onChange={() => {}} />

      {eixos.length > 0 ? (
        <CategoriaSelector eixos={eixos} onCategoriaChange={() => {}} />
      ) : (
        <p className="text-yellow-500">⚠️ Nenhuma categoria configurada.</p>
      )}

      {loading && cidade && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto px-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      )}
      {error && <p className="text-red-500">❌ Erro: {error}</p>}
      {indicadores && !loading && !error && cidade && <Dashboard payload={indicadores} />}
    </section>
    
  );
}
