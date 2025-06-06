// src/store/services/indicadoresService.ts
export async function fetchIndicadoresFromAPI(
  estado: string,
  cidade: string,
  categoriaId: string | number
): Promise<any> {
  const query = new URLSearchParams({
    estado,
    cidade,
    categoria: categoriaId.toString()
  });

  const response = await fetch(`/api/indicadores?${query.toString()}`);
  if (!response.ok) {
    throw new Error(`Erro ao buscar indicadores: ${response.status}`);
  }

  return await response.json();
}
