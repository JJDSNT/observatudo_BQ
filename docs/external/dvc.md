# External: DVC (Data Version Control) para os datasets

> Status: decisão tomada (usar DVC, escopado dentro de `apps/datawarehouse`,
> instalado como dependência de dev do `uv`), implementação ainda não feita.

## Por que DVC

Hoje os datasets (`dados/cidades-sustentaveis/*.csv`, `dados/ibge/`,
`dados/tesouro-nacional/capag/`) vivem como arquivos crus no Git, e o envio
para o bucket GCS é feito manualmente em código Python
(`observatudo/io_utils.py::upload_to_bucket`, chamado pelos transformers em
`observatudo/transformers/*.py`). Isso significa:

- Histórico de dados pesado vivendo no histórico do Git.
- Nenhuma garantia de que o que está no bucket corresponde ao que está
  versionado no código — são dois sistemas desacoplados, atualizados por
  scripts separados.

DVC resolve isso: os arquivos de dados saem do Git (ficam no `.gitignore`) e
em seu lugar o Git versiona apenas um ponteiro (`*.dvc`, texto pequeno com
hash). O conteúdo real fica em um **remote** — no nosso caso, o bucket GCS
que já existe via Terraform (`infra/storage.tf`,
`google_storage_bucket.data_bucket`).

## Como deve funcionar aqui

1. Os datasets passam a viver dentro de `apps/datawarehouse/data/` (ou
   caminho equivalente, a definir na issue de migração de pastas).
2. `dvc init` **dentro de `apps/datawarehouse`** (decidido — não na raiz do
   monorepo). Mesmo princípio usado para o Python em geral: a fronteira do
   app contém suas próprias ferramentas (`uv`, `dvc`), e o resto do monorepo
   (frontend, api) não tem relação nenhuma com DVC. DVC suporta normalmente
   ser inicializado num subdiretório de um repositório Git maior.
3. `dvc remote add -d gcs gs://<bucket-do-data_bucket>` reaproveitando o
   bucket já provisionado via Terraform, ou um bucket dedicado para dados
   versionados (decidir: o bucket atual mistura "datasets de output" com o
   que seria histórico versionado do DVC — pode valer separar).
4. `dvc add dados/<arquivo>` gera o `.dvc` que vai pro Git; `dvc push` manda
   o conteúdo pro bucket.
5. Os scripts de transformação (`observatudo/transformers/*.py`) deixam de
   chamar `upload_to_bucket` manualmente para "publicar" um dataset — o
   fluxo passa a ser: script gera o CSV/parquet localmente → `dvc add` +
   `dvc push` versiona e sincroniza. O upload direto ao BigQuery
   (`upload_csv_to_bigquery`) é uma preocupação diferente (carga na tabela)
   e pode continuar existindo separadamente do versionamento do arquivo
   fonte.

## Pontos abertos

- Reaproveitar `google_storage_bucket.data_bucket` como remote do DVC ou
  criar um bucket dedicado (`*-dvc-remote`) via Terraform — misturar dados
  "operacionais" (output já tratado, consumido por BigQuery) com dados
  "versionados" (entrada bruta + histórico) pode confundir lifecycle rules
  e custos.
- Autenticação do DVC com GCS: reaproveitar a mesma service account usada
  pelos scripts Python (`BIGQUERY_KEYFILE` hoje) ou uma credencial própria
  com permissão só de leitura/escrita no bucket de dados.
- Se vale usar `dvc.yaml` (pipelines declarativos, com `dvc repro`) para
  orquestrar os transformers em vez de chamá-los manualmente via
  `scripts/preprocess_*.py` — não é necessário para o MVP de versionamento,
  mas é um próximo passo natural depois que o `dvc add`/`dvc push` básico
  estiver funcionando.

## Referências

- Docs oficiais: https://dvc.org/doc
- Remote GCS: https://dvc.org/doc/user-guide/data-management/remote-storage/google-cloud-storage
