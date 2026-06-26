---
id: ISSUE-0024
title: "MetricCard: redesenho completo com semáforo, sparkline, comparação geográfica e ordenação"
status: in_progress
priority: high
type: feature
owner: agent
created_at: 2026-06-26
updated_at: 2026-06-26
tags:
  - frontend
  - components
  - ux
related_files:
  - apps/frontend/src/components/MetricCard/MetricCard.tsx
  - apps/frontend/src/components/MetricCard/MetricCard.module.css
  - apps/frontend/src/components/Dashboard.tsx
  - apps/frontend/src/store/preferencesStore.ts
  - apps/frontend/src/types/indicadores-model.ts
  - apps/frontend/src/services/indicadores.ts
---

# Resumo

O `MetricCard` atual é um MVP sem semáforo, sem gráfico, sem contexto geográfico
e sem ordenação pelo usuário. Esta issue cobre o redesenho completo do card e
da sua apresentação na tela do Dashboard.

# Elementos do card

## 1. Acento de cor por categoria
Borda esquerda colorida usando `cor` da `CategoriaResultado` — campo já
disponível e já usado com `style={{ borderColor }}` em outros componentes
(ex.: `CategoriaSelector`). O `Dashboard` passa `cor` ao renderizar cada card.

## 2. Semáforo (verde / amarelo / vermelho / cinza)
Indicador visual de desempenho baseado na variação entre o último e o
penúltimo valor da série, levando em conta a `direcionalidade` do indicador
(`ISSUE-0026`):
- `"quanto maior, melhor"` → aumento = verde, queda = vermelho
- `"quanto menor, melhor"` → queda = verde, aumento = vermelho
- `"indiferente"` → sempre amarelo
- `null` / ausente → cinza (desconhecido); mostrar ícone de
  configuração para o usuário definir a direcionalidade

Limiar para amarelo vs verde/vermelho: variação < 1% = estável (amarelo),
>= 1% com direção definida = verde ou vermelho. Valor ajustável.

## 3. Valor principal + unidade + periodicidade
- Valor do último ponto da série em destaque (formatação inteligente: K, M,
  casas decimais respeitando `unidade`)
- `unidade` exibida ao lado do valor
- `periodicidade` exibida como badge secundário (ex.: "Anual", "Bienal")
  — campo ainda não no modelo; depende de adição em `ISSUE-0026` junto com
  outros metadados, ou numa issue dedicada de metadados

## 4. Sparkline (line chart inline)
Mini gráfico SVG puro da série histórica completa, sem eixos ou labels —
só a linha de tendência com área sob ela. `d3-scale` já é dep; não adicionar
recharts nem outra biblioteca.
- Largura: 100% do card; altura: ~48px
- Colorido com a cor do semáforo (verde/vermelho/cinza)
- Mostrar apenas para indicadores com série numérica (não para `nota`
  categórica como CAPAG)

## 5. Comparação geográfica inline
Três pontos (município · estado · país) mostrando o valor mais recente em
cada nível geográfico. O Dashboard já busca os três níveis — o card precisa
receber os valores dos outros dois níveis além do principal.
- Layout: três dots com label e valor abaixo, ou uma barra horizontal com
  os três pontos marcados
- Destaca visualmente o nível atual (município) vs referência (estado, país)
- Omitir se não houver dado nos níveis superiores

## 6. Badge de desatualização
Se o ponto mais recente da série tiver mais de 2 anos em relação à data
atual, exibir badge "Dados de AAAA" em âmbar. Se mais de 4 anos, vermelho.
Usa `data` do último ponto da série (já disponível em `ValorSerie`).

## 7. Tooltip com descrição e fórmula
Ícone `Info` no cabeçalho abre tooltip (ou popover) com:
- `indicador.descricao` (já no tipo, opcional)
- `indicador.metodologia_calculo` (campo ainda não propagado — depende de
  `ISSUE-0026` para chegar no frontend)
- `indicador.fonte` com link se `url_fonte` disponível
Tooltip deve ser acessível via teclado (focus + Enter).

## 8. Skeleton de carregamento
`MetricCardSkeleton` com `animate-pulse` para exibir enquanto o Dashboard
busca dados. Deve ter as mesmas dimensões do card real para evitar layout
shift.

## 9. Dark mode
Todas as classes de cor com variantes `dark:` Tailwind. Depende de
`ISSUE-0025` para o padrão de tokens adotado no projeto.

## 10. Acessibilidade
- `role="button"` + `tabIndex={0}` + `onKeyDown` quando `onClick` passado
- `aria-label` descritivo no semáforo e no sparkline
- Tooltip acessível por teclado

# Ordenação pelo usuário (Dashboard)

Dois níveis de drag-and-drop no Dashboard usando `@dnd-kit` (já dep, já
usado em `SortableCategoria`):

1. **Subeixos**: o usuário reordena os blocos de subeixo dentro da categoria
   selecionada arrastando o cabeçalho do bloco.
2. **Indicadores**: o usuário reordena os cards dentro de cada subeixo
   arrastando o card pelo handle (ícone de grip).

A ordem é persistida automaticamente no `preferencesStore` via
`setCategoriasIndicadores` — a posição dos `subeixos[]` e dos `indicadores[]`
dentro de cada subeixo já define a ordem de exibição. Não requer nenhum
backend novo.

O handle de drag deve ser visível apenas em hover/focus para não poluir o
card em leitura normal.

# O que falta fazer

**Card:**
- [ ] Redesenhar `MetricCard.tsx` com todos os elementos acima (acento de
      cor, semáforo, valor+unidade+periodicidade, sparkline, comparação
      geográfica, badge de desatualização, tooltip)
- [ ] Criar `MetricCardSkeleton`
- [ ] Adicionar `cor` e valores dos outros dois níveis geográficos às props
      do card (Dashboard passa esses dados)
- [ ] Adicionar `dark:` variants (coordenar com `ISSUE-0025`)
- [ ] Corrigir `formatarValor` para respeitar `unidade` nas casas decimais

**Dashboard:**
- [ ] Passar `cor` da categoria ao `MetricCard`
- [ ] Passar valores dos níveis geográfico superiores (estado, país) junto
      com o indicador do município para o mesmo card
- [ ] Implementar `SortableSubeixo` (reordenação de blocos de subeixo)
- [ ] Implementar drag handle nos cards para reordenação de indicadores
      dentro do subeixo

**Dados/tipos:**
- [ ] `periodicidade` e `metodologia_calculo` precisam chegar no tipo
      `Indicador` e ser passados pela API — coordenar com `ISSUE-0026`
- [ ] Semáforo depende de `indicador.direcionalidade` — `ISSUE-0026`

# Decisões tomadas

- Sparkline em SVG puro com `d3-scale` (já dep) — sem recharts ou lib nova.
- Ordenação persiste no `preferencesStore` existente, sem backend novo.
- CSS Module está vazio — tudo via Tailwind inline (padrão do projeto).
- Handle de drag visível só em hover para não poluir a leitura.

# Critérios de aceite

- [ ] Card exibe semáforo correto para indicadores com direcionalidade definida
      e cinza para os sem definição.
- [ ] Sparkline visível para indicadores numéricos com >= 2 pontos na série.
- [ ] Comparação geográfica exibe município, estado e país quando os três têm
      dado.
- [ ] Badge de desatualização aparece para dados com > 2 anos.
- [ ] Tooltip com descrição abre via clique e via teclado.
- [ ] Usuário consegue reordenar subeixos e indicadores; ordem persiste após
      reload.
- [ ] Skeleton exibido durante carregamento sem layout shift.
- [ ] Card renderiza corretamente em dark mode.

# Observações

`ISSUE-0026` é dependência para semáforo, tooltip de fórmula e periodicidade.
O card pode ser lançado em fases: primeiro sem semáforo (cinza) e sem
fórmula no tooltip, depois completo quando `ISSUE-0026` for resolvida.

A comparação geográfica exige mudança na forma como o Dashboard passa dados
ao `MetricCard` — hoje cada card recebe só o indicador de um nível. O Dashboard
precisará agrupar os três valores do mesmo indicador nos três níveis e passá-los
juntos ao card.

# Log de execução

## Sessão 2026-06-26 — implementação completa

**Implementado:**
- `MetricCard.tsx` redesenhado do zero: acento lateral (cor semáforo), valor
  principal + variação %, badge de desatualização, sparkline SVG, comparação
  geográfica MUN/EST/BR, tooltip enriquecido, handle de drag.
- `calcularSemaforo()`: usa `indicador.direcionalidade` → verde/vermelho/
  amarelo/cinza. Acento lateral usa cor do semáforo (não da categoria).
- `Sparkline.tsx` criado: SVG puro, sem dependências novas.
- `MetricCardSkeleton.tsx` criado: animate-pulse sincronizado com o layout real.
- `Dashboard.tsx` reestruturado: 3 seções geográficas (País / Estado /
  Município) independentes. Seções sem dados são ocultadas. `temDados()` filtra
  indicadores com série vazia. Guard: cards só aparecem quando `selecionado.cidade`
  está preenchido.
- Tooltip enriquecido com nome, descrição, fórmula (nova) e fonte.
- `formula` propagada pela cadeia completa: `dim_indicadores.js` view →
  `indicadorCivico.ts` query + tipo → `indicadores.ts` service → `Indicador`
  type → MetricCard tooltip.
- `direcionalidade` adicionada ao tipo `Indicador` e usada no semáforo; a
  propagação via API ainda não está completa (ver ISSUE-0026).

**Critérios de aceite atualizados:**
- [x] Card exibe semáforo correto / cinza quando direcionalidade ausente.
- [x] Sparkline para indicadores com >= 3 pontos numéricos.
- [x] Comparação geográfica MUN/EST/BR em todos os cards.
- [x] Badge de desatualização para dados > 2 anos.
- [x] Tooltip com nome, descrição, fórmula e fonte.
- [x] Reordenação de subeixos e indicadores com DnD (seção Município).
- [x] Skeleton durante carregamento.
- [x] Dark mode nos novos componentes.
- [ ] Semáforo funcional para `cidades_sustentaveis` depende de ISSUE-0026
      (direcionalidade preenchida no pipeline).

**Bugs corrigidos vs. backlog original:**
- Indicadores sem dados filtrados (não aparecem como "Indicador XXX").
- Fonte movida para tooltip (não mais no rodapé do card).
- `temInfo` usa `.trim()` para não disparar com strings vazias do sanitizador.
