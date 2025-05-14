terraform {
  backend "gcs" {
    bucket = "tfstate-observatudo"
    prefix = "apps/www"
  }
}