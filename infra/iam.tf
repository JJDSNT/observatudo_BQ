# === SA do App ===
resource "google_service_account" "www_app" {
  account_id   = "sa-observatudo-www-app"
  display_name = "Service Account para frontend/backend do Observatudo"
}

resource "google_bigquery_dataset_iam_member" "www_app_viewer" {
  dataset_id = google_bigquery_dataset.dados_dataset.dataset_id
  role       = "roles/bigquery.dataViewer"
  member     = "serviceAccount:${google_service_account.www_app.email}"
}

resource "google_project_iam_member" "www_app_job_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.www_app.email}"
}


# === SA do dbt ===
resource "google_service_account" "dbt" {
  account_id   = "sa-observatudo-dbt"
  display_name = "Service Account para DBT pipeline do Observatudo"
}

resource "google_bigquery_dataset_iam_member" "dbt_editor" {
  dataset_id = google_bigquery_dataset.dados_dataset.dataset_id
  role       = "roles/bigquery.dataEditor"
  member     = "serviceAccount:${google_service_account.dbt.email}"
}

resource "google_project_iam_member" "dbt_job_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.dbt.email}"
}
