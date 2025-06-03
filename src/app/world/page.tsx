// src/app/world/page.tsx
export default function World() {
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

      {/* Placeholder do gráfico animado */}
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-6 shadow-inner">
        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-4">
          (Visualização em construção — animações por país, continentes e eventos globais)
        </p>
        <div className="h-96 flex items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg">
          <span className="text-sm italic text-zinc-400">
            Gráfico animado: Eixos de Renda x Expectativa de Vida | Cores por Continente | Linha do tempo: 1800 → 2025
          </span>
        </div>
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
