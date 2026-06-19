// src/components/MetricCard/MetricCard.tsx
import React, { useMemo } from "react";
import { Indicador } from "@/types";
import { TrendingUp, TrendingDown, Minus, Info, Calendar } from "lucide-react";

type MetricCardProps = {
  indicador: Indicador;
  localidadeNome?: string;
  variant?: "default" | "compact" | "detailed";
  showTrend?: boolean;
  showHistory?: boolean;
  onClick?: () => void;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  indicador,
  localidadeNome,
  variant = "default",
  showTrend = true,
  showHistory = true,
  onClick,
}) => {
  const dados = useMemo(() => {
    const serie = indicador.serie.filter(p => p.valor !== null && p.valor !== undefined);
    const ultimaMedida = serie.at(-1);
    const penultimaMedida = serie.at(-2);
    const serieRecentes = serie.slice(-5);
    
    // Cálculo de tendência
    let tendencia: "up" | "down" | "stable" | null = null;
    let percentualMudanca: number | null = null;
    
    if (ultimaMedida && penultimaMedida && typeof ultimaMedida.valor === 'number' && typeof penultimaMedida.valor === 'number') {
      const diferenca = ultimaMedida.valor - penultimaMedida.valor;
      percentualMudanca = (diferenca / penultimaMedida.valor) * 100;
      
      if (Math.abs(percentualMudanca) < 0.1) {
        tendencia = "stable";
      } else if (diferenca > 0) {
        tendencia = "up";
      } else {
        tendencia = "down";
      }
    }

    return {
      ultimaMedida,
      serieRecentes,
      tendencia,
      percentualMudanca,
      temDados: serie.length > 0
    };
  }, [indicador.serie]);

  const formatarData = (data: unknown): string => {
    if (!data) return "--";

    if (typeof data === "object" && data !== null && "value" in data) {
      const value = (data as { value?: string }).value;
      return typeof value === "string" ? value : "--";
    }

    if (typeof data === "string") {
      // Tenta formatar como data se possível
      const date = new Date(data);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("pt-BR", { 
          month: "short", 
          year: "numeric" 
        });
      }
      return data;
    }

    return "--";
  };

  const formatarValor = (valor: number | null | undefined): string => {
    if (valor === null || valor === undefined) return "--";
    
    // Formatação inteligente baseada no tamanho do número
    if (Math.abs(valor) >= 1_000_000) {
      return (valor / 1_000_000).toFixed(1) + "M";
    } else if (Math.abs(valor) >= 1_000) {
      return (valor / 1_000).toFixed(1) + "K";
    } else if (valor % 1 !== 0) {
      return valor.toFixed(2);
    }
    
    return valor.toLocaleString("pt-BR");
  };

  const getTrendIcon = () => {
    switch (dados.tendencia) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "stable":
        return <Minus className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (dados.tendencia) {
      case "up": return "text-green-600";
      case "down": return "text-red-600";
      case "stable": return "text-gray-500";
      default: return "text-gray-600";
    }
  };

  if (variant === "compact") {
    return (
      <div 
        className={`rounded-lg border border-gray-200 p-3 bg-white hover:shadow-md transition-all duration-200 ${
          onClick ? "cursor-pointer hover:border-blue-300" : ""
        }`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {indicador.nome || `Indicador ${indicador.id}`}
            </div>
            {localidadeNome && (
              <div className="text-xs text-gray-500">{localidadeNome}</div>
            )}
          </div>
          <div className="flex items-center gap-2 ml-3">
            {showTrend && getTrendIcon()}
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatarValor(dados.ultimaMedida?.valor)}
                {indicador.unidade && (
                  <span className="text-xs ml-1 text-gray-500 font-normal">
                    {indicador.unidade}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`rounded-xl border border-gray-200 p-5 bg-white hover:shadow-lg transition-all duration-300 ${
        onClick ? "cursor-pointer hover:border-blue-300 hover:-translate-y-0.5" : ""
      } ${variant === "detailed" ? "p-6" : ""}`}
      onClick={onClick}
    >
      {/* Cabeçalho */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          {localidadeNome && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <span>{localidadeNome}</span>
            </div>
          )}
          <div className="text-lg font-semibold text-gray-900 leading-tight mb-1">
            {indicador.nome || `Indicador ${indicador.id}`}
          </div>
          {indicador.descricao && variant === "detailed" && (
            <div className="text-sm text-gray-600 line-clamp-2">
              {indicador.descricao}
            </div>
          )}
        </div>
        
        {/* Valor principal */}
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatarValor(dados.ultimaMedida?.valor)}
            {indicador.unidade && (
              <span className="text-sm ml-2 text-gray-600 font-normal">
                {indicador.unidade}
              </span>
            )}
          </div>
          
          {/* Indicador de tendência */}
          {showTrend && dados.tendencia && dados.percentualMudanca !== null && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="font-medium">
                {dados.percentualMudanca > 0 ? "+" : ""}
                {dados.percentualMudanca.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Última atualização */}
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
        <Calendar className="w-3 h-3" />
        <span>Atualizado em {formatarData(dados.ultimaMedida?.data)}</span>
      </div>

      {/* Histórico recente */}
      {showHistory && dados.serieRecentes.length > 1 && (
        <div className="border-t border-gray-100 pt-3">
          <div className="text-xs font-medium text-gray-700 mb-2">
            Histórico recente
          </div>
          <div className="space-y-1">
            {dados.serieRecentes.slice(-3).reverse().map((ponto, index) => (
              <div 
                key={`${formatarData(ponto.data)}-${index}`} 
                className="flex justify-between items-center text-xs"
              >
                <span className="text-gray-600">{formatarData(ponto.data)}</span>
                <span className="font-medium text-gray-900">
                  {formatarValor(ponto.valor)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rodapé com fonte */}
      {indicador.fonte && (
        <div className="flex items-start gap-1 text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span className="italic">Fonte: {indicador.fonte}</span>
        </div>
      )}

      {/* Estado vazio */}
      {!dados.temDados && (
        <div className="text-center py-4 text-gray-500">
          <div className="text-sm">Sem dados disponíveis</div>
        </div>
      )}
    </div>
  );
};