terraform {
  backend "gcs" {
    bucket = "tfstate-observatudo"
    prefix = "zones/observatudo.com.br"
  }
}