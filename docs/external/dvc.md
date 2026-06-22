# External: DVC (Data Version Control) para os datasets

> Status: implementado (Fase 4, `refactor/04-dvc-init`). `dvc init --subdir`
> dentro de `apps/datawarehouse`, remote GCS configurado, datasets atuais
> migrados (`dvc add`) e enviados ao bucket (`dvc push` real executado em
> 2026-06-19, 28 arquivos, confirmado via `dvc status -c` e listagem direta
> do bucket).

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

## Como funciona aqui (implementado na Fase 4)

1. Os datasets vivem em `apps/datawarehouse/data/` (movido na Fase 2).
2. `dvc init --subdir` dentro de `apps/datawarehouse` (não na raiz do
   monorepo) — DVC funciona normalmente inicializado num subdiretório de um
   repositório Git maior. Mesmo princípio usado para o Python em geral: a
   fronteira do app contém suas próprias ferramentas (`uv`, `dvc`), e o
   resto do monorepo (frontend, api) não tem relação com DVC.
3. `dvc remote add -d gcs gs://observatudo-infra-www-data/dvc-store` —
   **reaproveita** o bucket `google_storage_bucket.data_bucket` já
   provisionado via Terraform (`infra/storage.tf`), só com um prefixo de
   path (`dvc-store/`) dedicado para não colidir com o que os transformers
   já escrevem ali (`indicadores/...`, ver `io_utils.py::upload_to_bucket`).
   Decisão: bucket único em vez de um bucket dedicado — simplicidade
   operacional para o tamanho atual do projeto, sem custo/IAM extra; o
   prefixo de path já dá separação lógica suficiente.
4. `git rm -r --cached data/<dir>` + `dvc add data/<dir>` por domínio de
   dados (`cidades-sustentaveis`, `ibge`, `tesouro-nacional`) gera os `.dvc`
   que vão pro Git e tira os arquivos crus do índice do Git (ficam só no
   cache local do DVC + remote).
5. Autenticação: mesma ADC (Application Default Credentials) já usada por
   `google.cloud.storage.Client()`/`bigquery.Client()` no resto do app — sem
   credencial nova. `dvc push` herda isso automaticamente (`gcsfs` usa ADC).
6. **Não implementado nesta fase** (fora do escopo decidido — ver
   "Pontos abertos"): os transformers continuam chamando `upload_to_bucket`
   manualmente; `dvc add`/`dvc push` não substituíram esse fluxo ainda.

## Pontos abertos

- Os transformers (`observatudo/transformers/*.py`) ainda chamam
  `upload_to_bucket` manualmente em vez de o fluxo terminar em `dvc add` +
  `dvc push`. Decisão fechada em 2026-06-22: migrar para DVC; uma primeira
  tentativa (chamar `dvc add`/`dvc push` via `subprocess` a cada execução,
  num diretório inteiro) foi revertida — cada pasta de dados hoje mistura
  três tipos de conteúdo com ciclos de vida diferentes (**raw** estável,
  **cache/estado incremental do pipeline** — ex.: `cache/eixos_llm.json` —
  e **output processado**, regenerado a cada run), e `dvc add <dir>` trata
  tudo como uma coisa só. Falta decidir como separar essas categorias em
  unidades DVC distintas antes de tentar de novo (ver
  `AI_context/REFACTOR_CONTEXT.md`, "Decisões abertas", para o mapeamento
  completo dos arquivos).
- Se vale usar `dvc.yaml` (pipelines declarativos, com `dvc repro`) para
  orquestrar os transformers em vez de chamá-los manualmente via
  `scripts/preprocess_*.py` — não é necessário para o MVP de versionamento,
  mas é um próximo passo natural depois que o `dvc add`/`dvc push` básico
  estiver funcionando.

## Referências

- Docs oficiais: https://dvc.org/doc
- Remote GCS: https://dvc.org/doc/user-guide/data-management/remote-storage/google-cloud-storage
