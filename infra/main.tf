provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_cloud_run_service" "www_observatudo" {
  name = "www-observatudo"
  location = var.region

  template {
    spec {
      containers {
        image = var.image_url

        ports {
          container_port = 8080
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_service.www_observatudo.location
  service  = google_cloud_run_service.www_observatudo.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}