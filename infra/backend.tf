terraform {
  backend "gcs" {
    bucket = "tfstate-observatudo"
    prefix = "apps/observatudo-www-app"
  }
}
