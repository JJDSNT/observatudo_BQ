provider "google" {
  project = var.project_id
  region  = var.region
  # Evita que o provider injete a label goog-terraform-provisioned
  # automaticamente: para google_cloud_run_domain_mapping isso força
  # replace (destroy+create) em vez de update in-place, o que recriaria
  # o domain mapping (e o certificado SSL) sem necessidade real.
  add_terraform_attribution_label = false
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

        # Cube.js (apps/api) — uso server-side só nas rotas de API, ver
        # apps/frontend/src/lib/cubejs/client.ts. URL real do serviço
        # (não hardcoded) para não desincronizar se o Cloud Run do
        # Cube.js for recriado.
        env {
          name  = "CUBEJS_API_URL"
          value = google_cloud_run_service.cubejs.status[0].url
        }

        env {
          name  = "CUBEJS_API_SECRET"
          value = var.cubejs_api_secret
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
