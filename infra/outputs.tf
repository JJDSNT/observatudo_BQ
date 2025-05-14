output "cloud_run_url" {
  description = "URL pública do serviço Cloud Run"
  value = google_cloud_run_service.www_observatudo.status[0].url
}