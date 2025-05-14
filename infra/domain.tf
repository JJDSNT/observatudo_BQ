resource "google_cloud_run_domain_mapping" "www" {
  name     = "www.observatudo.com.br"
  location = var.region

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_service.www_observatudo.name
  }
}
