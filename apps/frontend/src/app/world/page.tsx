// src/app/world/page.tsx
import { buscarIndicadoresMundiais, buscarSerieHistoricaMundial } from "@/lib/analytics/mundo";
import { GapminderChart } from "@/components/GapminderChart/GapminderChart";

// Busca dados via Cube em cada request (BigQuery muda a cada rodada do
// pipeline) — sem isso o Next tenta pré-renderizar a página no build,
// quando CUBEJS_API_SECRET ainda não está disponível (só existe em
// runtime), e o build falha com "secretOrPrivateKey must have a value".
export const dynamic = "force-dynamic";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatarPopulacao(valor: number): string {
  if (valor >= 1_000_000_000) return (valor / 1_000_000_000).toFixed(2) + " bi";
  if (valor >= 1_000_000) return (valor / 1_000_000).toFixed(1) + " mi";
  if (valor >= 1_000) return (valor / 1_000).toFixed(1) + " mil";
  return valor.toLocaleString("pt-BR");
}

export default async function World() {
  const [paises, serieHistorica] = await Promise.all([
    buscarIndicadoresMundiais(),
    buscarSerieHistoricaMundial(),
  ]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-12 space-y-10 text-zinc-800 dark:text-zinc-200">
      <header className="text-center space-y-3">
        <h1 className="text-4xl font-bold">Evolução Global de Indicadores</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Inspire-se na jornada de 200 anos de progresso global. Explore como países evoluíram em renda, saúde, educação e outros indicadores ao longo do tempo.
        </p>
      </header>

      {/* Vídeo embutido da apresentação de Hans Rosling */}
      <div className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg">
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/fJ6y8ZJMoqM"
          title="200 países, 200 anos, 4 minutos - Hans Rosling"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Gráfico animado renda x expectativa de vida (estilo Gapminder) */}
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-6 shadow-inner">
        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-4 text-sm">
          Cada bolha é um país; tamanho = população, cor = região (fonte:
          World Bank Open Data, 1960–{new Date().getFullYear()}).
        </p>
        <GapminderChart serie={serieHistorica} />
      </div>

      {/* Tabela de indicadores internacionais (World Bank) */}
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-6 shadow-inner overflow-x-auto">
        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-4 text-sm">
          Dados mais recentes disponíveis por país (fonte: World Bank Open
          Data).
        </p>
        {paises.length === 0 ? (
          <p className="text-center text-sm italic text-zinc-400 py-8">
            Nenhum dado internacional disponível ainda.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-zinc-300 dark:border-zinc-600">
                <th className="py-2 pr-4">País</th>
                <th className="py-2 pr-4">Região</th>
                <th className="py-2 pr-4 text-right">PIB per capita</th>
                <th className="py-2 pr-4 text-right">Expectativa de vida</th>
                <th className="py-2 pr-4 text-right">População</th>
              </tr>
            </thead>
            <tbody>
              {paises.map((pais) => (
                <tr
                  key={pais.codigoIso}
                  className="border-b border-zinc-200 dark:border-zinc-700"
                >
                  <td className="py-2 pr-4 font-medium">{pais.nome}</td>
                  <td className="py-2 pr-4 text-zinc-500 dark:text-zinc-400">
                    {pais.regiao || "--"}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {pais.pibPerCapita
                      ? formatarMoeda(pais.pibPerCapita.valor)
                      : "--"}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {pais.expectativaVida
                      ? `${pais.expectativaVida.valor.toFixed(1)} anos`
                      : "--"}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {pais.populacao
                      ? formatarPopulacao(pais.populacao.valor)
                      : "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Descrição das dimensões e contexto histórico */}
      <aside className="text-sm text-center text-zinc-500 dark:text-zinc-400 space-y-1">
        <p>Classificação regional: África, Ásia, América Latina, Europa, Oceania, América do Norte.</p>
        <p>Eventos marcados na linha do tempo: 1ª Guerra Mundial, 2ª Guerra Mundial, Pandemias (como Covid-19), Crises Econômicas.</p>
        <p>Período coberto: de 1800 até o presente.</p>
      </aside>

      {/* Rodapé com crédito à inspiração */}
      <footer className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Inspirado na apresentação <a
          href="https://www.youtube.com/watch?v=fJ6y8ZJMoqM"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          “200 países, 200 anos, 4 minutos”
        </a>{' '}
        de Hans Rosling.
      </footer>
    </section>
  );
}
