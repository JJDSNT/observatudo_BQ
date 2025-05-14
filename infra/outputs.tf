output "cloud_run_url" {
  description = "URL pública do serviço Cloud Run"
  value       = google_cloud_run_service.nextjs.status[0].url
}