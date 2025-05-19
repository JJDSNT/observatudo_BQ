import { useEffect, useState } from "react";
import { LocalidadeFullResponse } from "@/types/indicadores";
import { Categoria } from "@/types/categorias";

export function useIndicadoresDashboard(
  municipioId: string,
  categorias?: Categoria[]
) {
  const [data, setData] = useState<LocalidadeFullResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.groupCollapsed("📊 useIndicadoresDashboard");
    console.log("🏷️ Município:", municipioId);
    console.log("📚 Categorias:", categorias);

    if (!municipioId || !categorias || categorias.length === 0) {
      console.warn("⚠️ Categorias não definidas ou vazias, abortando fetch.");
      console.groupEnd();
      return;
    }

    setLoading(true);
    setError(null);

    const url = `/api/indicadores/localidade/${municipioId}`;

    console.log("📡 Enviando POST para:", url);

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ categorias }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        console.log("✅ Resposta recebida:", json);
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Erro ao buscar indicadores:", err);
        setError(err);
        setLoading(false);
      })
      .finally(() => {
        console.groupEnd();
      });
  }, [municipioId, categorias]);

  return { data, loading, error };
}
