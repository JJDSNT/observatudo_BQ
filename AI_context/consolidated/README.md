# AI_context/consolidated

## Regra

Nenhuma issue pode ser promovida para consolidated sem:

- implementação concluída
- documentação atualizada
- critérios de aceite satisfeitos

## Objetivo

Transformar trabalho concluído em conhecimento permanente.

## Convenção adotada neste projeto

"Promovida" significa **movida** de verdade: o arquivo sai de
`issues/ISSUE-XXXX.md` e um extrato (`consolidated/ISSUE-XXXX.md`, mesmo
id, formato `templates/consolidated.template.md`, sem frontmatter) entra
em `consolidated/`. `issues/` fica só com trabalho ativo (`backlog` até
`review`) — uma issue com `status: consolidated` não deveria mais existir
fisicamente em `issues/`.

O log de execução, decisões e critérios de aceite originais da issue não
desaparecem: ficam recuperáveis no histórico do git
(`git log -p -- AI_context/issues/ISSUE-XXXX.md`), desde que a issue
tenha sido commitada **antes** de ser removida — promover uma issue que
nunca foi commitada apaga essa informação de verdade, sem chance de
recuperação. Por isso, ao promover, sempre commitar a remoção como um
passo separado de qualquer commit que ainda não tenha capturado o
conteúdo completo da issue.

Um `consolidated/ISSUE-XXXX.md` sem a issue correspondente removida de
`issues/` é uma promoção incompleta.
