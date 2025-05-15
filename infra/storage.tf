resource "google_storage_bucket" "data_bucket" {
  name     = "${var.project_id}-www-data"
  location = "US"

  labels = {
    module = "observatudo-www-app"
    usage  = "datasets"
  }

  force_destroy = true
  uniform_bucket_level_access = true
}
