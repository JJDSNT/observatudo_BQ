# === SA do App (frontend/backend) ===
resource "google_service_account" "www_app" {
  account_id   = "sa-observatudo-www-app"
  display_name = "Service Account para frontend/backend do Observatudo"
}

# Lê só o dataset `gold` — é o único que o frontend (e futuramente o
# Cube.js) deve acessar. Nunca recebe acesso a raw/silver/ops.
resource "google_bigquery_dataset_iam_member" "www_app_viewer" {
  dataset_id = google_bigquery_dataset.gold.dataset_id
  role       = "roles/bigquery.dataViewer"
  member     = "serviceAccount:${google_service_account.www_app.email}"
}

resource "google_project_iam_member" "www_app_job_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.www_app.email}"
}


# === SA do pipeline de dados (substitui a antiga SA do dbt) ===
# ATENÇÃO ao aplicar: muda account_id (sa-observatudo-dbt -> sa-observatudo-pipeline),
# o que destrói a SA antiga e cria uma nova com email diferente. Se houver uma
# key file já baixada para sa-observatudo-dbt em uso em algum lugar (CI, .env local),
# ela precisa ser substituída pela key da nova SA após o apply.
resource "google_service_account" "pipeline" {
  account_id   = "sa-observatudo-pipeline"
  display_name = "Service Account para o pipeline de dados (ingestão + transformação) do Observatudo"
}

# Escreve em todas as camadas: raw (ingestão), silver/gold (transformação),
# ops (log de execução).
resource "google_bigquery_dataset_iam_member" "pipeline_editor_raw" {
  dataset_id = google_bigquery_dataset.raw.dataset_id
  role       = "roles/bigquery.dataEditor"
  member     = "serviceAccount:${google_service_account.pipeline.email}"
}

resource "google_bigquery_dataset_iam_member" "pipeline_editor_silver" {
  dataset_id = google_bigquery_dataset.silver.dataset_id
  role       = "roles/bigquery.dataEditor"
  member     = "serviceAccount:${google_service_account.pipeline.email}"
}

resource "google_bigquery_dataset_iam_member" "pipeline_editor_gold" {
  dataset_id = google_bigquery_dataset.gold.dataset_id
  role       = "roles/bigquery.dataEditor"
  member     = "serviceAccount:${google_service_account.pipeline.email}"
}

resource "google_bigquery_dataset_iam_member" "pipeline_editor_ops" {
  dataset_id = google_bigquery_dataset.ops.dataset_id
  role       = "roles/bigquery.dataEditor"
  member     = "serviceAccount:${google_service_account.pipeline.email}"
}

resource "google_project_iam_member" "pipeline_job_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.pipeline.email}"
}
