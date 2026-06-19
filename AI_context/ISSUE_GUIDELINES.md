# Como escrever issues para esta migração

Use [`issue_template.md`](./issue_template.md) como base. Toda issue gerada
pela IA sobre a refatoração deve ter estas seções:

## 1. Contexto

Por que essa issue existe, ligando ao plano geral em
[`REFACTOR_CONTEXT.md`](./REFACTOR_CONTEXT.md). Cite a fase do roadmap a que
pertence. Se a issue depende de uma decisão ainda aberta (ver
`docs/external/*.md`), diga explicitamente qual decisão e onde ela está
registrada.

## 2. O que já foi feito

Liste, com base em evidência real (código, commits, arquivos existentes) —
não em suposição — o que já está pronto e que essa issue assume como dado.
Se nada foi feito ainda nessa frente, diga isso explicitamente em vez de
omitir a seção.

## 3. O que precisa ser feito

Lista de passos concretos e verificáveis. Prefira ações que resultem em algo
testável (ex.: "rodar `pnpm install` na raiz e confirmar que os dois apps
resolvem dependências" em vez de "configurar o pnpm").

## 4. Critérios de aceite

Como saber que a issue está concluída. Sempre que possível, algo que pode ser
checado por comando (build passa, teste passa, app sobe) — não apenas "ficou
bom".

## 5. Riscos / dependências

O que pode quebrar, e de qual outra issue/decisão esta depende ou bloqueia.

## Convenções

- Título: `[<área>] <ação concreta>` — área é uma de `monorepo`, `frontend`,
  `dw`, `dvc`, `api` (Cube.js), `infra`. Ex.: `[dvc] Inicializar DVC e
  configurar remote GCS para apps/datawarehouse/data`.
- Uma issue = uma fase/passo do roadmap em `REFACTOR_CONTEXT.md`, não a
  migração inteira. Se a tarefa não cabe em um PR revisável, quebre em mais
  de uma issue.
- Nunca declare uma decisão arquitetural aberta (Cube.js self-hosted vs
  Cloud, nome final do dataset, etc.) como resolvida só porque ficaria mais
  simples escrever a issue — referencie o documento em `docs/external/` e
  deixe a decisão explícita como pré-requisito.
- Escreva em português, consistente com o resto da documentação do repo.
