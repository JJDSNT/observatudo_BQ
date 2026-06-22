output "cloud_run_url" {
  description = "URL pública do serviço Cloud Run"
  value       = google_cloud_run_service.www_observatudo.status[0].url
}

output "www_app_sa_email" {
  value = google_service_account.www_app.email
}

output "pipeline_sa_email" {
  value = google_service_account.pipeline.email
}

output "firestore_database_name" {
  value = google_firestore_database.default.name
}

output "cubejs_cloud_run_url" {
  description = "URL pública do serviço Cloud Run do Cube.js"
  value       = google_cloud_run_service.cubejs.status[0].url
}

output "cubejs_sa_email" {
  value = google_service_account.cubejs.email
}
