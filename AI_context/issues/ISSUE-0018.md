---
id: ISSUE-0018
title: "Refletir município + eixo selecionados na URL (compartilhamento)"
status: backlog
priority: low
type: feature
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - frontend
  - feature
related_files:
  - apps/frontend/src/store/preferencesStore.ts
  - apps/frontend/src/app/page.tsx
---

# Resumo

Hoje a seleção de localidade/eixo vive só em estado client-side
(`preferencesStore`), sem refletir na URL — impede copiar/compartilhar um
link direto para, por exemplo, "Salvador, Economia & Finanças".

# Problema

Sem URL com estado, todo link compartilhado do dashboard cai na seleção
default, não na localidade/eixo que o usuário estava vendo.

# Objetivo

URL refletindo município + eixo selecionados (ex.:
`/?municipio=2927408&eixo=economia` ou rota dinâmica equivalente), de
forma que abrir o link restaure a mesma visualização.

# O que falta fazer

- [ ] Decidir entre query string (`?municipio=...&eixo=...`) ou rota
      dinâmica (`/[municipio]/[eixo]`).
- [ ] Sincronizar `preferencesStore` com a URL nos dois sentidos (URL →
      estado ao carregar; estado → URL ao selecionar).
- [ ] Garantir que o estado (derivado do município) também é
      recuperável só a partir do município na URL, sem precisar
      duplicar na query string.

# Observações

Mudança de roteamento — vale revisar se afeta o comportamento de cache da
PWA (`runtimeCaching`, ver achado registrado em `ISSUE-0007`).

# Log de execução

(ainda não iniciada)
