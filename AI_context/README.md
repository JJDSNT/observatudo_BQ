# AI_context

Esta pasta existe para que uma IA (ex.: Claude Code) tenha contexto suficiente
para **escrever issues** sobre a refatoração do Observatudo em andamento —
sem precisar que um humano re-explique o objetivo a cada conversa.

## Como usar

- [`REFACTOR_CONTEXT.md`](./REFACTOR_CONTEXT.md) — o que está sendo feito,
  por quê, estado atual vs. estado alvo, e o roadmap de fases. **Leia este
  arquivo antes de escrever qualquer issue sobre a migração.**
- [`ISSUE_GUIDELINES.md`](./ISSUE_GUIDELINES.md) — como estruturar uma issue
  (seções obrigatórias, tom, nível de detalhe).
- [`issue_template.md`](./issue_template.md) — template pronto para copiar.

Documentação de arquitetura "estável" (não específica da migração) vive em
[`../docs/`](../docs/), não aqui. `AI_context/` é sobre **planejamento e
rastreio de trabalho**; `docs/` é sobre **como o sistema funciona**.

## Regra geral para a IA

Ao escrever uma issue a partir desta pasta:

1. Releia `REFACTOR_CONTEXT.md` para saber em que fase o projeto está e o que
   já foi marcado como concluído.
2. Verifique no código/git (não confie só neste arquivo) se o que está
   descrito como "feito" ainda é verdade — esta pasta pode ficar
   desatualizada entre sessões.
3. Atualize `REFACTOR_CONTEXT.md` (seção "Progresso") sempre que uma fase for
   concluída ou o escopo mudar, para a próxima sessão começar atualizada.
