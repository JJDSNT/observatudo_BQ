import { Github } from "lucide-react";

export default function Sobre() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-zinc-800 dark:text-zinc-200">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-bold">A Visão da Sociedade 5.0</h1>
        <h2 className="text-base text-zinc-600 dark:text-zinc-400">
          Construindo o Futuro Urbano
        </h2>
      </header>

      <article className="space-y-6">
        <p>
          A <strong>Sociedade 5.0</strong> é uma proposta de reorganização
          social e econômica centrada no uso da tecnologia para atender às
          necessidades humanas de forma equilibrada, inclusiva e sustentável.
          Seu objetivo não é apenas aumentar a eficiência, mas alinhar inovação
          tecnológica com bem-estar e participação cidadã.
        </p>
        <p>
          A <strong>Economia Urbana</strong> oferece ferramentas para analisar o
          dinamismo das cidades e compreender as relações sociais, econômicas e
          espaciais que moldam o território. É o campo que utilizamos como base
          analítica para entender como os fluxos urbanos se organizam, revelando
          assimetrias, oportunidades e pontos de intervenção para políticas
          públicas mais eficazes.
        </p>
        <p>
          As <strong>Cidades Inteligentes</strong> buscam promover decisões
          baseadas em evidências, melhorar a alocação de recursos e aprimorar a
          qualidade dos serviços públicos. Esse conceito preconiza a criação de
          serviços digitais inteligentes para um Estado verdadeiramente centrado
          no cidadão. A tecnologia, nesse contexto, atua diretamente na melhoria
          da qualidade de vida e do bem-estar individual, por meio do uso
          sistemático de dados e soluções digitais para transformar a gestão
          urbana.
        </p>
        <p>
          O <strong>Governo Aberto</strong> é o princípio que fundamenta essa
          transformação, estabelecendo a transparência, a participação cidadã e
          a colaboração como pilares de uma gestão pública mais democrática. A
          transparência garante que a informação seja acessível e compreensível;
          a participação social incentiva a construção conjunta de políticas; e
          a prestação de contas (accountability) assegura que o governo seja
          responsabilizado por suas ações.
        </p>
        <p>
          Os <strong>Dados Abertos</strong> são a infraestrutura mínima para tornar
          tudo isso viável. Sem acesso público a dados estruturados e
          confiáveis, não há como avaliar políticas, construir soluções ou
          exercer controle social.
        </p>

        <div>
          <h2 className="text-2xl font-semibold">
            A Relevância dos Dados Abertos
          </h2>
          <p className="mt-2">
            Os <strong>dados abertos</strong> conectam a análise da{" "}
            <strong>economia urbana</strong> com a aplicação dos princípios da{" "}
            <strong>Sociedade 5.0</strong>. Eles viabilizam práticas de{" "}
            <strong>governo aberto</strong> e dão suporte técnico à
            implementação de <strong>cidades inteligentes</strong> — mais
            responsivas, inclusivas e sustentáveis. Quando acessíveis e bem
            estruturados, os dados fortalecem o controle social, aprimoram
            políticas públicas e inspiram soluções criativas vindas da sociedade
            civil.
          </p>

          <p className="mt-2">
            Para isso, é necessário avançar na institucionalização dessa
            política no Brasil.
          </p>
        </div>

        <div>
          <p className="mt-2 text-center text-xl">
            📢 Apoie a criação de uma legislação nacional que fortaleça a
            política de dados abertos no Brasil. Conheça o{" "}
            <strong>Projeto de Lei nº 7.804/2014</strong> e manifeste seu apoio:
          </p>

          <div className="mt-4 text-center">
            <a
              href="https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=620193&fichaAmigavel=nao"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2.5 rounded-full text-sm font-semibold bg-amber-500 text-black shadow hover:bg-amber-600 transition-colors"
            >
              🔗 Acompanhar o PL 7.804/2014 na Câmara
            </a>
          </div>
        </div>
      </article>

      <footer className="pt-6 text-center text-sm text-zinc-500 dark:text-zinc-400 italic space-y-3">
        <p>
          Esta plataforma está em desenvolvimento contínuo. Toda colaboração é
          bem-vinda.
        </p>
        <a
          href="https://github.com/JJDSNT/observatudo_BQ"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 not-italic text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors font-medium"
        >
          <Github className="w-4 h-4" />
          JJDSNT/observatudo_BQ
        </a>
      </footer>
    </section>
  );
}
