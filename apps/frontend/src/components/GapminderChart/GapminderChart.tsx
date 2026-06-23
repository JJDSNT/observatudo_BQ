"use client";

// src/components/GapminderChart/GapminderChart.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { scaleLinear, scaleLog, scaleSqrt } from "d3-scale";
import { Pause, Play } from "lucide-react";
import type { PaisSerieHistorica } from "@/lib/analytics/mundo";

interface GapminderChartProps {
  serie: PaisSerieHistorica[];
}

const LARGURA = 720;
const ALTURA = 440;
const MARGEM = { top: 24, right: 24, bottom: 40, left: 56 };
const INTERVALO_PLAY_MS = 600;

// 7 regiões distintas hoje em produção (`gold.dim_localidades`, tipo
// 'pais') — taxonomia do World Bank, não os 6 continentes do vídeo do
// Hans Rosling (decisão registrada em ISSUE-0021).
const CORES_REGIAO: Record<string, string> = {
  "East Asia & Pacific": "#f59e0b",
  "Europe & Central Asia": "#3b82f6",
  "Latin America & Caribbean": "#10b981",
  "Middle East, North Africa, Afghanistan & Pakistan": "#ef4444",
  "North America": "#8b5cf6",
  "South Asia": "#ec4899",
  "Sub-Saharan Africa": "#14b8a6",
};
const COR_PADRAO = "#71717a";

function formatarEixoX(valor: number): string {
  if (valor >= 1000) return `$${Math.round(valor / 1000)}k`;
  return `$${Math.round(valor)}`;
}

export function GapminderChart({ serie }: GapminderChartProps) {
  const anos = useMemo(() => {
    const todos = new Set<number>();
    for (const pais of serie) {
      for (const ponto of pais.serie) todos.add(ponto.ano);
    }
    return Array.from(todos).sort((a, b) => a - b);
  }, [serie]);

  const [anoIndex, setAnoIndex] = useState(anos.length - 1);
  const [tocando, setTocando] = useState(false);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!tocando) return;

    intervaloRef.current = setInterval(() => {
      setAnoIndex((indiceAtual) => {
        if (indiceAtual >= anos.length - 1) {
          setTocando(false);
          return indiceAtual;
        }
        return indiceAtual + 1;
      });
    }, INTERVALO_PLAY_MS);

    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [tocando, anos.length]);

  const { escalaX, escalaY, escalaRaio } = useMemo(() => {
    let minPib = Infinity;
    let maxPib = -Infinity;
    let minVida = Infinity;
    let maxVida = -Infinity;
    let maxPopulacao = 0;

    for (const pais of serie) {
      for (const ponto of pais.serie) {
        if (ponto.pib < minPib) minPib = ponto.pib;
        if (ponto.pib > maxPib) maxPib = ponto.pib;
        if (ponto.expectativaVida < minVida) minVida = ponto.expectativaVida;
        if (ponto.expectativaVida > maxVida) maxVida = ponto.expectativaVida;
        if (ponto.populacao > maxPopulacao) maxPopulacao = ponto.populacao;
      }
    }

    return {
      // Domínios fixos sobre toda a série (não por ano), pra os eixos não
      // "saltarem" entre anos durante a animação.
      escalaX: scaleLog()
        .domain([Math.max(minPib, 1), maxPib])
        .range([MARGEM.left, LARGURA - MARGEM.right])
        .clamp(true),
      escalaY: scaleLinear()
        .domain([minVida, maxVida])
        .range([ALTURA - MARGEM.bottom, MARGEM.top]),
      // Raio proporcional à área (convenção Gapminder), não ao raio.
      escalaRaio: scaleSqrt().domain([0, maxPopulacao]).range([2, 40]),
    };
  }, [serie]);

  if (anos.length === 0) {
    return (
      <p className="text-center text-sm italic text-zinc-400 py-8">
        Sem série histórica completa (PIB + expectativa de vida + população
        no mesmo ano) disponível ainda.
      </p>
    );
  }

  const anoAtual = anos[anoIndex];
  const pontosDoAno = serie
    .map((pais) => ({
      ...pais,
      ponto: pais.serie.find((p) => p.ano === anoAtual),
    }))
    .filter((pais): pais is typeof pais & { ponto: NonNullable<typeof pais.ponto> } =>
      pais.ponto !== undefined
    );

  const regioesPresentes = Array.from(
    new Set(serie.map((pais) => pais.regiao).filter(Boolean))
  ).sort();

  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        <button
          type="button"
          onClick={() => setTocando((v) => !v)}
          disabled={anoIndex >= anos.length - 1 && !tocando}
          className="p-2 rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 transition-colors"
          aria-label={tocando ? "Pausar" : "Reproduzir"}
        >
          {tocando ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <input
          type="range"
          min={0}
          max={anos.length - 1}
          value={anoIndex}
          onChange={(e) => {
            setTocando(false);
            setAnoIndex(Number(e.target.value));
          }}
          className="flex-1"
        />
        <span className="w-14 text-right font-mono text-sm tabular-nums">
          {anoAtual}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label={`Renda x expectativa de vida por país em ${anoAtual}`}
      >
        {/* Eixos */}
        <line
          x1={MARGEM.left}
          x2={LARGURA - MARGEM.right}
          y1={ALTURA - MARGEM.bottom}
          y2={ALTURA - MARGEM.bottom}
          stroke="currentColor"
          strokeOpacity={0.2}
        />
        <line
          x1={MARGEM.left}
          x2={MARGEM.left}
          y1={MARGEM.top}
          y2={ALTURA - MARGEM.bottom}
          stroke="currentColor"
          strokeOpacity={0.2}
        />
        {escalaX.ticks(5).map((tick) => (
          <text
            key={tick}
            x={escalaX(tick)}
            y={ALTURA - MARGEM.bottom + 16}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
            opacity={0.6}
          >
            {formatarEixoX(tick)}
          </text>
        ))}
        {escalaY.ticks(5).map((tick) => (
          <text
            key={tick}
            x={MARGEM.left - 8}
            y={escalaY(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={10}
            fill="currentColor"
            opacity={0.6}
          >
            {tick}
          </text>
        ))}
        <text
          x={LARGURA - MARGEM.right}
          y={ALTURA - 6}
          textAnchor="end"
          fontSize={11}
          fill="currentColor"
          opacity={0.7}
        >
          PIB per capita (US$, escala log)
        </text>
        <text
          x={12}
          y={MARGEM.top - 8}
          textAnchor="start"
          fontSize={11}
          fill="currentColor"
          opacity={0.7}
        >
          Expectativa de vida (anos)
        </text>

        {/* Bolhas */}
        {pontosDoAno.map((pais) => (
          <circle
            key={pais.codigoIso}
            cx={escalaX(pais.ponto.pib)}
            cy={escalaY(pais.ponto.expectativaVida)}
            r={escalaRaio(pais.ponto.populacao)}
            fill={CORES_REGIAO[pais.regiao] ?? COR_PADRAO}
            fillOpacity={0.75}
            stroke="currentColor"
            strokeOpacity={0.2}
            style={{ transition: "cx 0.4s ease, cy 0.4s ease, r 0.4s ease" }}
          >
            <title>
              {`${pais.nome}: ${formatarEixoX(pais.ponto.pib)} per capita, ${pais.ponto.expectativaVida.toFixed(1)} anos`}
            </title>
          </circle>
        ))}
      </svg>

      <div className="flex flex-wrap gap-3 justify-center mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        {regioesPresentes.map((regiao) => (
          <span key={regiao} className="flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: CORES_REGIAO[regiao] ?? COR_PADRAO }}
            />
            {regiao}
          </span>
        ))}
      </div>
    </div>
  );
}
