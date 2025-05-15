output "cloud_run_url" {
  description = "URL pública do serviço Cloud Run"
  value = google_cloud_run_service.www_observatudo.status[0].url
}

output "www_app_sa_email" {
  value = google_service_account.www_app.email
}

output "dbt_sa_email" {
  value = google_service_account.dbt.email
}
