resource "google_bigquery_dataset" "dados_dataset" {
  dataset_id = "dados"
  project    = var.project_id
  location   = "US"

  delete_contents_on_destroy = true

  labels = {
    module = "observatudo-www-app"
    usage  = "indicators"
  }
}

resource "google_bigquery_table" "localidades" {
  dataset_id = google_bigquery_dataset.dados_dataset.dataset_id
  table_id   = "dim_localidades"
  deletion_protection = false
  lifecycle { prevent_destroy = false }

  schema = jsonencode([
    { name = "localidade_id", type = "STRING", mode = "REQUIRED" },
    { name = "nome", type = "STRING", mode = "REQUIRED" },
    { name = "tipo", type = "STRING", mode = "REQUIRED" },
    { name = "localidade_pai_id", type = "STRING", mode = "NULLABLE" },
    { name = "sigla", type = "STRING", mode = "NULLABLE" },
    { name = "regiao", type = "STRING", mode = "NULLABLE" },
    { name = "é_capital", type = "BOOLEAN", mode = "NULLABLE" },
    { name = "capital_localidade_id", type = "STRING", mode = "NULLABLE" },
    { name = "latitude", type = "FLOAT", mode = "NULLABLE" },
    { name = "longitude", type = "FLOAT", mode = "NULLABLE" },
    { name = "populacao", type = "INTEGER", mode = "NULLABLE" },
    { name = "codigo_oficial", type = "STRING", mode = "NULLABLE" },
    { name = "data_inclusao", type = "TIMESTAMP", mode = "NULLABLE" }
  ])

  labels = {
    module = "observatudo-www-app"
    usage  = "localidades"
  }
}

resource "google_bigquery_table" "dim_indicadores" {
  dataset_id = google_bigquery_dataset.dados_dataset.dataset_id
  table_id   = "dim_indicadores"
  project    = var.project_id

  deletion_protection = false

  schema = jsonencode([
    { name = "indicador_id",           type = "STRING", mode = "REQUIRED" },
    { name = "nome",                   type = "STRING", mode = "REQUIRED" },
    { name = "descricao",              type = "STRING", mode = "NULLABLE" },
    { name = "categoria",              type = "STRING", mode = "NULLABLE" },
    { name = "unidade_medida",         type = "STRING", mode = "NULLABLE" },
    { name = "formula_calculo",        type = "STRING", mode = "NULLABLE" },
    { name = "fonte",                  type = "STRING", mode = "NULLABLE" },
    { name = "frequencia_atualizacao", type = "STRING", mode = "NULLABLE" },
    { name = "metadados",              type = "JSON",   mode = "NULLABLE" },
    { name = "data_criacao",           type = "TIMESTAMP", mode = "NULLABLE" },
    { name = "ultima_atualizacao",     type = "TIMESTAMP", mode = "NULLABLE" }
  ])

  labels = {
    module = "observatudo-www-app"
    usage  = "indicadores"
  }

  clustering = ["categoria", "nome"]
}


resource "google_bigquery_table" "fact_indicadores" {
  dataset_id = google_bigquery_dataset.dados_dataset.dataset_id
  table_id   = "fact_indicadores"
  project    = var.project_id

  deletion_protection = false

  schema = jsonencode([
    { name = "indicador_id",        type = "STRING",   mode = "REQUIRED" },
    { name = "localidade_id",       type = "STRING",   mode = "REQUIRED" },
    { name = "data_referencia",     type = "DATE",     mode = "REQUIRED" },
    { name = "valor",               type = "FLOAT",    mode = "NULLABLE" },
    { name = "fonte_dados",         type = "STRING",   mode = "NULLABLE" },
    { name = "url_fonte",           type = "STRING",   mode = "NULLABLE" },
    { name = "metodologia_calculo", type = "STRING",   mode = "NULLABLE" },
    { name = "observacoes",         type = "STRING",   mode = "NULLABLE" },
    { name = "data_coleta",         type = "TIMESTAMP",mode = "NULLABLE" },
    { name = "data_insercao",       type = "TIMESTAMP",mode = "NULLABLE" },
    { name = "confiabilidade",      type = "FLOAT",    mode = "NULLABLE" },
    { name = "usuario_insercao",    type = "STRING",   mode = "NULLABLE" },
    { name = "processo_etl",        type = "STRING",   mode = "NULLABLE" },
    { name = "versao_metodologia",  type = "STRING",   mode = "NULLABLE" },
    { name = "flags",               type = "JSON",     mode = "NULLABLE" },
    { name = "metadados",           type = "JSON",     mode = "NULLABLE" }
  ])

  time_partitioning {
    type  = "MONTH"
    field = "data_referencia"
  }

  clustering = ["indicador_id", "localidade_id"]

  labels = {
    module = "observatudo-www-app"
    usage  = "valores"
  }

}
