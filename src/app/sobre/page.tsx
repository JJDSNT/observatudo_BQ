export default function Sobre() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-zinc-800 dark:text-zinc-200">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-bold">A Visão da Sociedade 5.0</h1>
        <h2>Construindo o Futuro Urbano</h2>
        
        <p className="text-base text-zinc-600 dark:text-zinc-400">
          Construindo o Futuro Urbano
        </p>
      </header>

      <article className="space-y-6">

        <p>
          <strong>Sociedade 5.0</strong> é uma proposta de reorganização social e econômica centrada no uso da tecnologia para atender às necessidades humanas de forma equilibrada, inclusiva e sustentável. Seu objetivo não é apenas aumentar a eficiência, mas alinhar inovação tecnológica com bem-estar e participação cidadã.
        </p>
        <p>
          <strong>Economia Urbana</strong> é nossa metodologia fundamental para materializar essa visão em um contexto urbano. Ela nos oferece as ferramentas para analisar o dinamismo das cidades, compreender as relações sociais e econômicas e, assim, construir prosperidade, inovação e inclusão social. é o campo que utilizamos como base analítica. Ela permite entender como os fluxos econômicos, sociais e espaciais se organizam no território urbano, revelando assimetrias, oportunidades e pontos de intervenção para políticas públicas mais eficazes.
        </p>
        <p>
          <strong>Cidades Inteligentes</strong> preconiza a criação de serviços digitais inteligentes para um estado verdadeiramente centrado no cidadão. Nela, a tecnologia serve diretamente para melhorar a qualidade de vida e o bem-estar de cada indivíduo. são um conceito que propõe o uso sistemático de dados e tecnologias digitais para transformar a gestão urbana. Essa abordagem busca promover decisões baseadas em evidências, melhorar a alocação de recursos e aprimorar a qualidade dos serviços públicos
        </p>
        <p>
          <strong>Governo Aberto</strong> é o princípio que fundamenta essa transformação. Ele estabelece a transparência, a participação cidadã e a colaboração como pilares da gestão pública, criando as condições para que a inteligência urbana seja, de fato, democrática.
        </p>
        <p>
          <strong>Dados Abertos</strong> são a infraestrutura mínima para tornar tudo isso viável. Sem acesso público a dados estruturados e confiáveis, não há como avaliar políticas, construir soluções ou exercer controle social.
        </p>

        <div>
          <h2 className="text-2xl font-semibold">A Relevância dos Dados Abertos</h2>
          <p className="mt-2">
            Os dados abertos conectam a análise da economia urbana com a aplicação dos princípios da Sociedade 5.0.
            Eles viabilizam práticas de governo aberto e dão suporte técnico à implementação de cidades inteligentes, mais responsivas, inclusivas e sustentáveis.
          </p>
          <p className="mt-2">
            Para isso, é necessário avançar na institucionalização dessa política no Brasil.
          </p>
        </div>

        <div>
          
          <p className="mt-2 text-center text-xl">
            📢 Apoie a criação de uma legislação nacional que fortaleça a política de dados abertos no Brasil. Conheça o <strong>Projeto de Lei nº 4.361/2004</strong> e manifeste seu apoio:
          </p>

          <div className="mt-4 text-center">
            <a
              href="https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=620193&fichaAmigavel=nao"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2.5 rounded-full text-sm font-semibold bg-amber-500 text-black shadow hover:bg-amber-600 transition-colors"
            >
              🔗 Acompanhar o PL 4.361/2004 na Câmara
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