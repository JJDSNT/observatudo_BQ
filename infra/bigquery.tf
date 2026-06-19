# Datasets em camadas (medallion architecture) — substitui o antigo
# dataset único `dados`. Ver docs/architecture.md (seção 2) e
# AI_context/REFACTOR_CONTEXT.md (Fase 3) para o racional completo.

resource "google_bigquery_dataset" "raw" {
  dataset_id = "raw"
  project    = var.project_id
  location   = "US"

  delete_contents_on_destroy = true

  labels = {
    module = "observatudo-www-app"
    usage  = "raw"
  }
}

resource "google_bigquery_dataset" "silver" {
  dataset_id = "silver"
  project    = var.project_id
  location   = "US"

  delete_contents_on_destroy = true

  labels = {
    module = "observatudo-www-app"
    usage  = "silver"
  }
}

resource "google_bigquery_dataset" "gold" {
  dataset_id = "gold"
  project    = var.project_id
  location   = "US"

  delete_contents_on_destroy = true

  labels = {
    module = "observatudo-www-app"
    usage  = "gold"
  }
}

resource "google_bigquery_dataset" "ops" {
  dataset_id = "ops"
  project    = var.project_id
  location   = "US"

  delete_contents_on_destroy = true

  labels = {
    module = "observatudo-www-app"
    usage  = "ops"
  }
}

resource "google_bigquery_table" "localidades" {
  dataset_id          = google_bigquery_dataset.gold.dataset_id
  table_id            = "dim_localidades"
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

resource "google_bigquery_table" "pipeline_runs" {
  dataset_id          = google_bigquery_dataset.ops.dataset_id
  table_id            = "pipeline_runs"
  deletion_protection = false
  lifecycle { prevent_destroy = false }

  schema = jsonencode([
    { name = "run_id", type = "STRING", mode = "REQUIRED" },
    { name = "pipeline_step", type = "STRING", mode = "REQUIRED" },
    { name = "status", type = "STRING", mode = "REQUIRED" },
    { name = "started_at", type = "TIMESTAMP", mode = "REQUIRED" },
    { name = "finished_at", type = "TIMESTAMP", mode = "NULLABLE" },
    { name = "rows_affected", type = "INTEGER", mode = "NULLABLE" },
    { name = "error_message", type = "STRING", mode = "NULLABLE" }
  ])

  labels = {
    module = "observatudo-www-app"
    usage  = "ops"
  }
}
