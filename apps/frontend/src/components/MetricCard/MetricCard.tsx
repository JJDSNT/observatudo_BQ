"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { GripVertical, Info, X } from "lucide-react";
import type { Indicador } from "@/types";
import { Sparkline } from "./Sparkline";

export type ComparacaoGeo = {
  municipio: number | null;
  estado: number | null;
  pais: number | null;
};

type Semaforo = "verde" | "vermelho" | "amarelo" | "cinza";

const SEMAFORO: Record<Semaforo, { dot: string; sparkline: string; label: string }> = {
  verde:    { dot: "bg-green-500",                  sparkline: "#16a34a", label: "Melhorando" },
  vermelho: { dot: "bg-red-500",                    sparkline: "#dc2626", label: "Piorando" },
  amarelo:  { dot: "bg-yellow-400",                 sparkline: "#ca8a04", label: "Estável" },
  cinza:    { dot: "bg-gray-300 dark:bg-gray-600",  sparkline: "#9ca3af", label: "Sem referência" },
};

function calcularSemaforo(indicador: Indicador): Semaforo {
  if (!indicador.direcionalidade) return "cinza";

  const serie = indicador.serie.filter((p) => p.valor !== null);
  const ultimo = serie.at(-1);
  const penultimo = serie.at(-2);
  if (ultimo?.valor == null || penultimo?.valor == null) return "cinza";

  const delta = ultimo.valor - penultimo.valor;
  const pct = Math.abs(delta / penultimo.valor) * 100;
  if (pct < 1) return "amarelo";

  const subiu = delta > 0;
  if (indicador.direcionalidade === "quanto maior, melhor") return subiu ? "verde" : "vermelho";
  if (indicador.direcionalidade === "quanto menor, melhor") return subiu ? "vermelho" : "verde";
  return "amarelo";
}

function formatarValor(v: number | null | undefined, unidade?: string): string {
  if (v == null) return "—";
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(1) + "K";
  const decimais = unidade === "%" ? 1 : v % 1 !== 0 ? 2 : 0;
  return v.toLocaleString("pt-BR", { minimumFractionDigits: decimais, maximumFractionDigits: decimais });
}

type MetricCardProps = {
  indicador: Indicador;
  cor?: string;
  comparacao?: ComparacaoGeo;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
};

export function MetricCard({ indicador, cor, comparacao, dragHandleProps }: MetricCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showInfo) return;
    function onMouseDown(e: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setShowInfo(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [showInfo]);

  const semaforo = useMemo(() => calcularSemaforo(indicador), [indicador]);
  const colors = SEMAFORO[semaforo];

  const serieLimpa = useMemo(
    () => indicador.serie.filter((p) => p.valor !== null || p.nota),
    [indicador.serie]
  );
  const ultimoPonto = serieLimpa.at(-1);
  const penultimoPonto = serieLimpa.at(-2);

  const sparklineValues = useMemo(
    () => indicador.serie.map((p) => p.valor).filter((v): v is number => v !== null),
    [indicador.serie]
  );

  const variacao = useMemo(() => {
    if (ultimoPonto?.valor == null || penultimoPonto?.valor == null) return null;
    return ((ultimoPonto.valor - penultimoPonto.valor) / penultimoPonto.valor) * 100;
  }, [ultimoPonto, penultimoPonto]);

  const anoUltimo = ultimoPonto?.data ? parseInt(ultimoPonto.data.substring(0, 4)) : null;
  const defasagemAnos = anoUltimo ? new Date().getFullYear() - anoUltimo : null;
  const valorExibido = ultimoPonto?.nota ?? formatarValor(ultimoPonto?.valor, indicador.unidade);
  const temInfo = !!(indicador.descricao?.trim() || indicador.formula?.trim() || indicador.fonte?.trim());

  return (
    <div className="relative group flex rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-visible">
      {/* Acento semáforo */}
      <div
        className="w-1 flex-shrink-0 rounded-l-xl"
        style={{ backgroundColor: colors.sparkline }}
        title={colors.label}
        aria-label={`Tendência: ${colors.label}`}
      />

      <div className="flex-1 p-4 min-w-0">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight line-clamp-2">
              {indicador.nome}
            </h3>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
            {defasagemAnos !== null && defasagemAnos > 2 && anoUltimo && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  defasagemAnos > 4
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                }`}
                title={`Último dado disponível: ${anoUltimo}`}
              >
                {anoUltimo}
              </span>
            )}

            {temInfo && (
              <div ref={infoRef} className="relative">
                <button
                  onClick={() => setShowInfo((v) => !v)}
                  onKeyDown={(e) => e.key === "Enter" && setShowInfo((v) => !v)}
                  className="p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Ver descrição do indicador"
                  aria-expanded={showInfo}
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {showInfo && (
                  <div
                    role="tooltip"
                    className="absolute right-0 top-6 z-50 w-72 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 shadow-xl text-xs"
                  >
                    {/* Cabeçalho */}
                    <div
                      className="flex items-start justify-between gap-2 px-3 pt-3 pb-2 border-b border-gray-100 dark:border-gray-700"
                      style={{ borderLeftColor: colors.sparkline }}
                    >
                      <p className="font-semibold text-gray-800 dark:text-gray-100 leading-snug pr-4">
                        {indicador.nome}
                      </p>
                      <button
                        onClick={() => setShowInfo(false)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-0.5"
                        aria-label="Fechar"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="px-3 py-2 space-y-2.5">
                      {indicador.descricao?.trim() && (
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {indicador.descricao}
                        </p>
                      )}
                      {indicador.formula?.trim() && (
                        <div>
                          <p className="text-gray-400 dark:text-gray-500 uppercase tracking-wide text-[10px] font-semibold mb-0.5">
                            Fórmula
                          </p>
                          <p className="text-gray-600 dark:text-gray-300 font-mono leading-relaxed">
                            {indicador.formula}
                          </p>
                        </div>
                      )}
                      {indicador.fonte?.trim() && (
                        <p className="text-gray-400 dark:text-gray-500 italic border-t border-gray-100 dark:border-gray-700 pt-2">
                          Fonte: {indicador.fonte}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {dragHandleProps && (
              <button
                {...dragHandleProps}
                className="p-0.5 rounded text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity touch-none"
                aria-label="Arrastar indicador"
                tabIndex={0}
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Valor principal */}
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {valorExibido}
          </span>
          {indicador.unidade && !ultimoPonto?.nota && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {indicador.unidade}
            </span>
          )}
          {variacao !== null && (
            <span
              className={`text-xs font-medium ml-auto tabular-nums ${
                variacao > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {variacao > 0 ? "+" : ""}
              {variacao.toFixed(1)}%
            </span>
          )}
        </div>

        {indicador.periodicidade && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
            {indicador.periodicidade}
          </p>
        )}

        {/* Sparkline */}
        {sparklineValues.length >= 3 && (
          <div className="mt-3 mb-1">
            <Sparkline values={sparklineValues} color={colors.sparkline} />
          </div>
        )}

        {/* Comparação geográfica */}
        {comparacao && <ComparacaoGeografica comparacao={comparacao} unidade={indicador.unidade} />}
      </div>
    </div>
  );
}

function ComparacaoGeografica({
  comparacao,
  unidade,
}: {
  comparacao: ComparacaoGeo;
  unidade?: string;
}) {
  const itens = [
    { label: "MUN", valor: comparacao.municipio, destaque: true },
    { label: "EST", valor: comparacao.estado,    destaque: false },
    { label: "BR",  valor: comparacao.pais,      destaque: false },
  ];

  if (itens.every((i) => i.valor == null)) return null;

  return (
    <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700 flex gap-3">
      {itens.map(({ label, valor, destaque }) => (
        <div key={label} className="flex-1 min-w-0">
          <div
            className={`text-xs font-medium mb-0.5 ${
              destaque ? "text-gray-700 dark:text-gray-200" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {label}
          </div>
          <div
            className={`text-xs tabular-nums truncate ${
              destaque
                ? "font-semibold text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {valor != null ? formatarValor(valor, unidade) : "—"}
          </div>
        </div>
      ))}
    </div>
  );
}
