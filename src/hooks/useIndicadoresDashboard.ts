// src/hooks/useIndicadoresDashboard.ts
import { useEffect, useState } from "react";
import { LocalidadeFullResponse } from "@/types/indicadores";

export function useIndicadoresDashboard(municipioId: string, indicadores?: string[]) {
  const [data, setData] = useState<LocalidadeFullResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!municipioId) return;

    setLoading(true);

    // Construa a URL dinamicamente conforme indicadores selecionados
    const queryIndicadores = indicadores ? `?indicadores=${indicadores.join(",")}` : "";
    
    console.log("📡 Buscando dados para:", municipioId, indicadores);
    fetch(`/api/indicadores/localidade/${municipioId}${queryIndicadores}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [municipioId, indicadores]);

  return { data, loading, error };
}
