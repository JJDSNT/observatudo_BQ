variable "project_id" {
  type = string
  description = "ID do projeto GCP"
}

variable "region" {
  type    = string
  default = "us-east1"
  description = "Região padrão"
}

variable "image_url" {
  type = string
  description = "URL da imagem Docker publicada"
}

variable "bigquery_dataset_id" {
  type        = string
  default     = "dados"
  description = "Nome do dataset BigQuery usado pelo app"
}

variable "state_label" {
  type    = string
  default = "observatudo-www-app"
}

variable "firestore_location" {
  type        = string
  default     = "nam5" # ou southamerica-east1
  description = "Localização do Firestore"
}