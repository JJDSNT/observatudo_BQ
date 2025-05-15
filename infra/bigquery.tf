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
