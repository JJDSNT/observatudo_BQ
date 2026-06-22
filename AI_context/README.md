# AI_context

## Objetivo

Esta pasta é a memória operacional do projeto: contexto persistente entre
sessões para que uma IA (ex.: Claude Code) não precise que um humano
re-explique o histórico e as decisões a cada conversa.

Formato adotado de [`ai_sdlc`](https://github.com/) (`docs/09 - ai-context.md`
e `AI_context/README.md` desse projeto) — ver `consolidated/0000-historico.md`
nesta pasta para o registro de como o `AI_context` anterior (formato livre,
focado só na migração para monorepo) foi decomposto neste formato.

Documentação de arquitetura "estável" (não específica de uma issue) vive em
[`../docs/`](../docs/), não aqui. `AI_context/` é sobre **planejamento e
rastreio de trabalho**; `docs/` é sobre **como o sistema funciona**.

## Fluxo

```text
Issue
 ↓
Implementação
 ↓
Review
 ↓
Consolidation
 ↓
Documentation Update
```

## Estrutura

- `issues/` — trabalho ativo e histórico. Documentos vivos, modificáveis.
- `specs/` — especificações formais. Ver `specs/README.md`. (Arquitetura
  estável deste projeto já vive em `docs/architecture.md` e
  `docs/monorepo-structure.md` — só crie uma spec aqui se for definição de
  trabalho futuro, não para redocumentar o que já está em `docs/`.)
- `consolidated/` — conhecimento estabilizado. Ver `consolidated/README.md`
  para a regra de promoção.
- `templates/` — modelos para novas issues, specs e entradas consolidadas.
- `metadata/` — reservado para uma futura view derivada/cacheada (não
  populado nesta fase; leitura é feita diretamente do frontmatter dos
  arquivos markdown).

## Status permitidos

`backlog`, `ready`, `doing`, `review`, `done`, `consolidated`, `blocked`

## Prioridades

`low`, `medium`, `high`, `critical`

## Tipos

`feature`, `bug`, `refactor`, `research`, `docs`, `infra`

## Convenções específicas deste projeto

- Título da issue: `<ação concreta>` — se for útil situar a área, use uma
  tag (`monorepo`, `frontend`, `dw`, `dvc`, `api`, `infra`, `localidades`)
  em vez de prefixar o título.
- Issue de bug/decisão técnica deve citar arquivo:linha real (não suposição)
  no campo `related_files` e no corpo.
- Nunca declare uma decisão arquitetural aberta como resolvida só porque
  ficaria mais simples escrever a issue — se a decisão ainda não foi
  tomada, a issue fica `backlog`/`blocked` e referencia onde a decisão
  pendente está registrada.
- Escreva em português, consistente com o resto da documentação do repo.

## Visão rápida do estado

Sem precisar de UI, API ou MCP — `grep` direto nos arquivos já responde
"o que está em aberto?". `head` antes do `grep` limita a busca ao bloco de
frontmatter (sempre as primeiras linhas), evitando casar texto solto no
corpo da issue que por acaso comece com `status:`/`priority:`.

Quantas issues por status:

```bash
for f in AI_context/issues/ISSUE-*.md; do head -8 "$f" | grep "^status:"; done | sort | uniq -c
```

Tabela rápida (id, título, status, prioridade) de todas as issues:

```bash
for f in AI_context/issues/ISSUE-*.md; do
  head -12 "$f" | grep -E "^(id|status|priority|title):"
  echo
done
```

Mesma ideia vale para `AI_context/specs/SPEC-*.md` (campos `id`/`status`/
`title`, sem `priority`).
