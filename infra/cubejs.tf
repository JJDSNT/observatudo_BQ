# Cube.js (apps/api) — camada analítica somente-leitura sobre `gold`.
# Decisão de deploy fechada em 2026-06-22 (self-hosted via Cloud Run, ver
# docs/external/cubejs.md). Terraform declara o serviço; a imagem real
# (build de apps/api/Dockerfile) é publicada via CI
# (.github/workflows/build-and-deploy-cubejs.yml) — mesmo padrão usado
# para o frontend (var.image_url + gcloud run deploy fora do apply).

resource "google_service_account" "cubejs" {
  account_id   = "sa-observatudo-cubejs"
  display_name = "Service Account para o Cube.js (camada analítica) do Observatudo"
}

# Só leitura em `gold` — nunca em raw/silver/ops (ver docs/architecture.md
# seção 2 e docs/external/cubejs.md).
resource "google_bigquery_dataset_iam_member" "cubejs_viewer" {
  dataset_id = google_bigquery_dataset.gold.dataset_id
  role       = "roles/bigquery.dataViewer"
  member     = "serviceAccount:${google_service_account.cubejs.email}"
}

resource "google_project_iam_member" "cubejs_job_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.cubejs.email}"
}

# Bucket de apoio (CUBEJS_DB_EXPORT_BUCKET) — export de resultados grandes
# do BigQuery e/ou destino de pre-agregações. Reaproveita o bucket
# existente (`storage.tf`), só com permissão de objeto (não de bucket
# inteiro) para a SA do Cube.js.
resource "google_storage_bucket_iam_member" "cubejs_export_bucket" {
  bucket = google_storage_bucket.data_bucket.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.cubejs.email}"
}

resource "google_cloud_run_service" "cubejs" {
  name     = "cubejs-observatudo"
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
      service_account_name = google_service_account.cubejs.email

      containers {
        # Placeholder inicial até o CI publicar a imagem real (mesmo
        # bootstrap usado para o serviço do frontend) — a imagem oficial
        # do Cube já roda standalone, só não tem o nosso model/ embutido.
        image = var.cubejs_image_url

        ports {
          container_port = 4000
        }

        env {
          name  = "NODE_ENV"
          value = "production"
        }

        # Sem isso, NODE_ENV=production faz o Cube exigir um cluster
        # externo de Cube Store (CUBEJS_CUBESTORE_HOST/PORT) pra
        # cache/fila de queries — desproporcional para 1 instância
        # Cloud Run sem pre-agregação configurada ainda. "memory" é o
        # driver documentado pra deployments single-instance pequenos.
        env {
          name  = "CUBEJS_CACHE_AND_QUEUE_DRIVER"
          value = "memory"
        }

        env {
          name  = "CUBEJS_DB_TYPE"
          value = "bigquery"
        }

        env {
          name  = "CUBEJS_DB_BQ_PROJECT_ID"
          value = var.project_id
        }

        env {
          name  = "CUBEJS_DB_EXPORT_BUCKET"
          value = google_storage_bucket.data_bucket.name
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

# Exposto publicamente na camada de transporte (mesma config do
# frontend) — o controle de acesso real é o CUBEJS_API_SECRET (JWT),
# ativo porque NODE_ENV=production desliga o modo dev sem auth. Ver
# "Autenticação" em docs/external/cubejs.md (ainda em aberto: hoje é só
# o secret, não integrado ao Firebase Auth do frontend).
resource "google_cloud_run_service_iam_member" "cubejs_public_access" {
  location = google_cloud_run_service.cubejs.location
  service  = google_cloud_run_service.cubejs.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
