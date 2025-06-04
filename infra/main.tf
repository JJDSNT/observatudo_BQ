provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_cloud_run_service" "www_observatudo" {
  name     = "www-observatudo"
  location = var.region

  metadata {
    labels = {
      provisioned_by = var.state_label
    }
  }

  template {
    metadata {
      labels = {
        provisioned_by = var.state_label
      }
    }

    spec {
      containers {
        image = var.image_url

        ports {
          container_port = 8080
        }

        env {
          name  = "BIGQUERY_PROJECT_ID"
          value = var.project_id
        }

        env {
          name  = "BIGQUERY_DATASET_ID"
          value = var.bigquery_dataset_id
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
