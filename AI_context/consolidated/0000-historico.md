# Migração do AI_context para o formato ai_sdlc

Até 2026-06-22, `AI_context/` deste repositório era formato livre: um
`README.md` + `ISSUE_GUIDELINES.md` + `issue_template.md` focados em
**escrever issues sobre a refatoração para monorepo**, e um único arquivo
narrativo (`REFACTOR_CONTEXT.md`) que acumulava todo o histórico da
migração — objetivo, estado atual/alvo, decisões fechadas, roadmap de 7
fases e o progresso de cada uma, decisões abertas e ideias futuras.

# Motivação

Adotar a convenção de `AI_context/` usada no projeto `ai_sdlc`
(`~/ai_sdlc/docs/09 - ai-context.md` e `~/ai_sdlc/AI_context/README.md`):
arquivos markdown com frontmatter (`id`/`status`/`priority`/`type`),
estrutura `issues/`/`specs/`/`consolidated/`/`templates/`/`metadata/`, e um
fluxo explícito `Issue → Implementação → Review → Consolidation →
Documentation Update`. Isso dá um vocabulário e uma granularidade comuns
entre projetos, e torna possível responder "o que está em aberto?" com
`grep` direto no frontmatter, sem precisar ler um único arquivo de texto
corrido crescendo indefinidamente.

# Solução adotada

`REFACTOR_CONTEXT.md` foi decomposto em issues individuais, uma por fase
do roadmap (mais o incidente do Terraform, que não era uma fase mas tinha
narrativa própria substancial):

- `ISSUE-0001` — Fase 1: Setup do monorepo pnpm
- `ISSUE-0002` — Fase 2: Criar `apps/datawarehouse`
- `ISSUE-0003` — Fase 3: Camadas BigQuery raw/silver/gold/ops + remover dbt
- `ISSUE-0004` — Fase 4: Inicializar DVC dentro de `apps/datawarehouse`
- `ISSUE-0005` — Incidente: state do Terraform apagado e recuperado
- `ISSUE-0006` — Fase 5: Scaffold de `apps/api` (Cube.js) + Terraform + CI/CD
- `ISSUE-0007` — Fase 6: Migrar o frontend rota a rota (Cube.js)
- `ISSUE-0008` — Fix: CAPAG estadual ausente na área do estado (resolve a
  decisão aberta deixada pela Fase 6 sobre formato de `localidade_id`)
- `ISSUE-0009` — Fase 7: Limpeza (ainda não feita — `backlog`)

As "decisões abertas" e "ideias para o futuro" que `REFACTOR_CONTEXT.md`
registrava em texto corrido se tornaram issues `backlog` próprias
(`ISSUE-0010` a `ISSUE-0018`), uma por item, em vez de uma lista dentro de
um arquivo guarda-chuva.

`ISSUE_GUIDELINES.md` e `issue_template.md` (antigos) foram substituídos
por `AI_context/README.md` (convenções) e
`AI_context/templates/issue.template.md` — o mesmo papel, formato do
ai_sdlc.

Nenhuma spec (`AI_context/specs/`) foi criada nesta migração: a
arquitetura estável deste projeto já vive em `docs/architecture.md` e
`docs/monorepo-structure.md`, fora do `AI_context` — recriá-la como spec
seria duplicar, não definir trabalho novo.

# Arquivos alterados

- Removidos: `AI_context/REFACTOR_CONTEXT.md`, `AI_context/ISSUE_GUIDELINES.md`,
  `AI_context/issue_template.md`.
- Criados: `AI_context/README.md` (reescrito), `AI_context/templates/*.template.md`,
  `AI_context/specs/README.md`, `AI_context/consolidated/README.md`,
  `AI_context/metadata/README.md`, `AI_context/issues/ISSUE-0001.md` a
  `ISSUE-0018.md`, este arquivo.

Também criadas nesta sessão, fora da decomposição do
`REFACTOR_CONTEXT.md`: `ISSUE-0019` (indicadores internacionais) e
`ISSUE-0020` (aviso de dado antigo no `MetricCard`), pedidas diretamente
pelo usuário.

**Duas correções feitas na mesma sessão**:

1. A primeira versão desta migração marcou `ISSUE-0001` a `0006` e
   `0008` com `status: consolidated` sem de fato promovê-las — ficaram só
   com o campo de status mudado, ainda inteiras em `issues/`. Isso
   contradizia a própria regra em `consolidated/README.md` ("nenhuma
   issue pode ser **movida** para consolidated sem..."). Corrigido:
   criado um `consolidated/ISSUE-XXXX.md` (extrato) para cada uma.
2. Mesmo depois da correção 1, as issues continuavam fisicamente em
   `issues/` (só ganharam um extrato espelhado em `consolidated/`, não
   foram de fato movidas). Corrigido de verdade na sequência: as 7 issues
   foram removidas de `issues/`. Como nenhum commit havia sido feito
   ainda nesta sessão, a remoção por si só apagaria o conteúdo completo
   sem deixar rastro — por isso os arquivos originais foram recriados
   antes do commit, e a promoção (remoção + extrato em `consolidated/`)
   foi feita como um **commit separado e posterior**, garantindo que
   `git log -p -- AI_context/issues/ISSUE-XXXX.md` recupera de fato o
   conteúdo original. `consolidated/README.md` foi atualizado para deixar
   essa convenção explícita.

# Impacto arquitetural

Nenhum no sistema em produção — é só reorganização de documentação/memória
operacional. Nenhum código foi alterado por esta migração.

# Documentações atualizadas

Nenhuma fora de `AI_context/` — `docs/` não foi tocado (está fora do
escopo do `AI_context`, ver `AI_context/README.md`).

# Próximos passos

- Ao concluir `ISSUE-0009` (Fase 7 — Limpeza) ou qualquer issue `backlog`
  (`ISSUE-0010` a `ISSUE-0018`), seguir o fluxo normal: issue → review →
  promoção para `consolidated/` quando os critérios de aceite estiverem
  satisfeitos — não acumular narrativa solta de novo num arquivo único.
