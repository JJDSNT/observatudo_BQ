---
id: ISSUE-0020
title: "Aviso visual no MetricCard quando o dado for antigo (mais de 2 anos)"
status: backlog
priority: medium
type: feature
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - frontend
  - feature
related_files:
  - apps/frontend/src/components/MetricCard/MetricCard.tsx
---

# Resumo

`MetricCard` já exibe "Atualizado em <data>" para cada indicador, mas não
chama atenção quando esse dado está desatualizado. Adicionar um aviso
visual quando a última atualização tiver mais de 2 anos.

# Problema

Vários indicadores (especialmente do Cidades Sustentáveis) têm cadência
de atualização irregular — o usuário não tem nenhum sinal visual de que
está vendo um número de, por exemplo, 2017, sem precisar ler a data por
extenso.

# Objetivo

Indicador visual (ex.: ícone/cor de alerta) no card quando
`data_referencia`/`data_insercao` mais recente da série for mais antiga
que 2 anos da data atual.

# O que falta fazer

- [ ] Definir o cálculo exato: 2 anos a partir de quando (data do build?
      data de carregamento da página?) e qual campo usar como referência
      (`data_referencia` do ponto mais recente da série).
- [ ] Definir a treatment visual (ícone + tooltip explicando "dado de
      <ano>, pode estar desatualizado", cor de borda, etc. — escolher algo
      que não pareça erro/falha, já que não é um bug, é uma limitação da
      fonte).
- [ ] Implementar em `MetricCard.tsx`.
- [ ] Decidir se o limiar (2 anos) fica hardcoded ou configurável por
      indicador/fonte (algumas fontes são estruturalmente mais lentas que
      outras).

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] Card de um indicador com dado de mais de 2 anos mostra o aviso.
- [ ] Card de um indicador com dado recente não mostra o aviso.
- [ ] Card sem nenhum dado (`serie: []`) continua mostrando "sem dados",
      sem confundir com o aviso de dado antigo.

# Observações

Nenhuma ainda.

# Log de execução

(ainda não iniciada)
