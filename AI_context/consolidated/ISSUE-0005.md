# Incidente: state do Terraform apagado e recuperado

Os states de três prefixos Terraform (compartilhando um bucket entre os
repos `manage-dns` e `observatudo-bq`) foram apagados silenciosamente por
uma `lifecycle_rule` de expiração, sem afetar a infra real do GCP. Issue
promovida — log de execução completo recuperável via
`git log -p -- AI_context/issues/ISSUE-0005.md`.

# Motivação

Bloqueava a aplicação real da Fase 3 (`ISSUE-0003`) — descoberto ao
tentar `terraform apply` pela primeira vez depois da reorganização dos
datasets BigQuery.

# Solução adotada

Causa raiz (`lifecycle_rule { condition { age = 365 } }` + versionamento
desligado no bucket `tfstate-observatudo`) removida em `manage-dns#1`. Os
três states reconstruídos via `terraform import` de cada recurso
confirmado como existente de verdade via API do GCP — nunca importado às
cegas. Gotcha do provider (`add_terraform_attribution_label` forçando
destroy+recreate de domain mappings) corrigido antes do `apply` final.

# Arquivos alterados

`manage-dns/infra-base/bucket.tf` (lifecycle rule removida),
`infra/main.tf` (`add_terraform_attribution_label = false`).

# Impacto arquitetural

Nenhuma mudança de arquitetura — é recuperação de operação. Reforça uma
regra operacional: nunca tratar state vazio como "ambiente novo" sem
inventariar a infra real primeiro.

# Documentações atualizadas

Memória operacional do agente
(`infra_shared_tfstate.md`/`feedback_infra_changes.md`, fora do
`AI_context`).

# Próximos passos

Nenhum item técnico pendente. Versionamento do bucket de state continua
deliberadamente desligado (decisão consciente, não esquecimento).
