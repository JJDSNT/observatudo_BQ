// src/lib/analytics/mundo.ts
import { cubejsApi } from "@/lib/cubejs/client";

export interface PaisIndicadores {
  codigoIso: string;
  nome: string;
  regiao: string;
  pibPerCapita: { valor: number; ano: number } | null;
  expectativaVida: { valor: number; ano: number } | null;
  populacao: { valor: number; ano: number } | null;
}

const INDICADOR_PIB = "NY.GDP.PCAP.CD";
const INDICADOR_EXPECTATIVA_VIDA = "SP.DYN.LE00.IN";
const INDICADOR_POPULACAO = "SP.POP.TOTL";

// World Bank tem defasagem entre indicadores (ex.: expectativa de vida
// costuma sair com 1-2 anos de atraso em relação a PIB) — janela ampla
// pra garantir que cada indicador encontre seu ano mais recente.
const JANELA_ANOS = 8;

/**
 * Snapshot mais recente dos 3 indicadores internacionais clássicos do
 * Gapminder (PIB per capita, expectativa de vida, população), por país.
 * Usado pela página /world — visualização simples (tabela) desta entrega;
 * o gráfico animado tipo Gapminder está em ISSUE-0021.
 */
export async function buscarIndicadoresMundiais(): Promise<PaisIndicadores[]> {
  const anoMinimo = new Date().getFullYear() - JANELA_ANOS;

  const resultSet = await cubejsApi.load({
    dimensions: [
      "dim_localidades.codigo_iso",
      "dim_localidades.nome",
      "dim_localidades.regiao",
      "dim_indicadores.indicador_id",
      "fact_indicadores.ano",
    ],
    measures: ["fact_indicadores.valor_medio"],
    filters: [
      { member: "dim_localidades.tipo", operator: "equals", values: ["pais"] },
      {
        member: "dim_indicadores.indicador_id",
        operator: "equals",
        values: [INDICADOR_PIB, INDICADOR_EXPECTATIVA_VIDA, INDICADOR_POPULACAO],
      },
      {
        member: "fact_indicadores.ano",
        operator: "gte",
        values: [String(anoMinimo)],
      },
    ],
    order: { "fact_indicadores.ano": "desc" },
  });

  const porPais = new Map<string, PaisIndicadores>();

  for (const row of resultSet.rawData()) {
    const valorBruto = row["fact_indicadores.valor_medio"];
    if (valorBruto == null) continue;

    const codigoIso = String(row["dim_localidades.codigo_iso"]);
    const indicadorId = String(row["dim_indicadores.indicador_id"]);
    const ano = Number(row["fact_indicadores.ano"]);
    const valor = Number(valorBruto);

    if (!porPais.has(codigoIso)) {
      porPais.set(codigoIso, {
        codigoIso,
        nome: String(row["dim_localidades.nome"] ?? codigoIso),
        regiao: String(row["dim_localidades.regiao"] ?? ""),
        pibPerCapita: null,
        expectativaVida: null,
        populacao: null,
      });
    }
    const pais = porPais.get(codigoIso)!;

    // Resultado ordenado por ano desc: a primeira linha vista por
    // (país, indicador) já é a mais recente disponível.
    if (indicadorId === INDICADOR_PIB && pais.pibPerCapita === null) {
      pais.pibPerCapita = { valor, ano };
    } else if (
      indicadorId === INDICADOR_EXPECTATIVA_VIDA &&
      pais.expectativaVida === null
    ) {
      pais.expectativaVida = { valor, ano };
    } else if (indicadorId === INDICADOR_POPULACAO && pais.populacao === null) {
      pais.populacao = { valor, ano };
    }
  }

  return Array.from(porPais.values()).sort(
    (a, b) => (b.pibPerCapita?.valor ?? 0) - (a.pibPerCapita?.valor ?? 0)
  );
}

export interface PontoSerieMundial {
  ano: number;
  pib: number;
  expectativaVida: number;
  populacao: number;
}

export interface PaisSerieHistorica {
  codigoIso: string;
  nome: string;
  regiao: string;
  serie: PontoSerieMundial[];
}

interface AnoParcial {
  pib?: number;
  expectativaVida?: number;
  populacao?: number;
}

/**
 * Série histórica completa (todos os anos disponíveis) dos 3 indicadores,
 * por país — usada pelo gráfico animado tipo Gapminder (ISSUE-0021). Só
 * mantém os anos em que os 3 indicadores têm valor: uma bolha precisa das
 * 3 dimensões (renda, expectativa de vida, população) pra existir.
 */
export async function buscarSerieHistoricaMundial(): Promise<PaisSerieHistorica[]> {
  const resultSet = await cubejsApi.load({
    dimensions: [
      "dim_localidades.codigo_iso",
      "dim_localidades.nome",
      "dim_localidades.regiao",
      "dim_indicadores.indicador_id",
      "fact_indicadores.ano",
    ],
    measures: ["fact_indicadores.valor_medio"],
    filters: [
      { member: "dim_localidades.tipo", operator: "equals", values: ["pais"] },
      {
        member: "dim_indicadores.indicador_id",
        operator: "equals",
        values: [INDICADOR_PIB, INDICADOR_EXPECTATIVA_VIDA, INDICADOR_POPULACAO],
      },
    ],
    // ~40k linhas no total (217 países x 3 indicadores x ~65 anos) —
    // acima do limite implícito de algumas instalações Cube, explícito
    // aqui pra não depender do default do servidor.
    limit: 50000,
  });

  const porPais = new Map<
    string,
    { nome: string; regiao: string; porAno: Map<number, AnoParcial> }
  >();

  for (const row of resultSet.rawData()) {
    const valorBruto = row["fact_indicadores.valor_medio"];
    if (valorBruto == null) continue;

    const codigoIso = String(row["dim_localidades.codigo_iso"]);
    const indicadorId = String(row["dim_indicadores.indicador_id"]);
    const ano = Number(row["fact_indicadores.ano"]);
    const valor = Number(valorBruto);

    if (!porPais.has(codigoIso)) {
      porPais.set(codigoIso, {
        nome: String(row["dim_localidades.nome"] ?? codigoIso),
        regiao: String(row["dim_localidades.regiao"] ?? ""),
        porAno: new Map(),
      });
    }
    const pais = porPais.get(codigoIso)!;
    const anoParcial = pais.porAno.get(ano) ?? {};

    if (indicadorId === INDICADOR_PIB) anoParcial.pib = valor;
    else if (indicadorId === INDICADOR_EXPECTATIVA_VIDA) anoParcial.expectativaVida = valor;
    else if (indicadorId === INDICADOR_POPULACAO) anoParcial.populacao = valor;

    pais.porAno.set(ano, anoParcial);
  }

  const resultado: PaisSerieHistorica[] = [];

  for (const [codigoIso, { nome, regiao, porAno }] of porPais) {
    const serie: PontoSerieMundial[] = [];

    for (const [ano, { pib, expectativaVida, populacao }] of porAno) {
      if (pib == null || expectativaVida == null || populacao == null) continue;
      serie.push({ ano, pib, expectativaVida, populacao });
    }

    if (serie.length === 0) continue;
    serie.sort((a, b) => a.ano - b.ano);
    resultado.push({ codigoIso, nome, regiao, serie });
  }

  return resultado;
}
