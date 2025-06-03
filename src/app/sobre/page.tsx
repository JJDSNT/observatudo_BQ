export default function Sobre() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-zinc-800 dark:text-zinc-200">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-bold">Sobre o Observatudo</h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400">
          Dados públicos acessíveis, para uma sociedade mais transparente, inteligente e participativa.
        </p>
      </header>

      <article className="space-y-6">
        <p>
          O <strong>Observatudo</strong> é uma iniciativa de visualização cívica que conecta dados públicos com ferramentas modernas de análise e design.
          Utilizamos tecnologias como BigQuery, Next.js e Firebase para tornar indicadores públicos mais acessíveis, compreensíveis e úteis.
        </p>

        <div>
          <h2 className="text-2xl font-semibold">Por que dados abertos?</h2>
          <p className="mt-2">
            Dados abertos são essenciais para <strong>cidades inteligentes</strong> e para a construção de um <strong>governo aberto</strong>, baseado em
            transparência, participação social e inovação.
          </p>
          <p className="mt-2">
            Quando acessíveis e bem estruturados, os dados permitem aprimorar políticas públicas, fortalecer o controle social e inspirar soluções criativas vindas da sociedade civil.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold">Engaje-se!</h2>
          <p className="mt-2">
            Apoie a criação de uma legislação nacional que fortaleça a política de dados abertos no Brasil. Conheça o <strong>Projeto de Lei nº 4.361/2004</strong> e manifeste seu apoio:
          </p>

          <div className="mt-4 text-center">
            <a
              href="https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=620193&fichaAmigavel=nao"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2.5 rounded-full text-sm font-semibold bg-amber-500 text-black shadow hover:bg-amber-600 transition-colors"
            >
              Acompanhar o PL 4.361/2004 na Câmara
            </a>
          </div>
        </div>
      </article>

      <footer className="pt-6 text-center text-sm text-zinc-500 dark:text-zinc-400 italic">
        Esta plataforma está em desenvolvimento contínuo. Toda colaboração é bem-vinda.
      </footer>
    </section>
  );
}
