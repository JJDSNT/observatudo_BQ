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



