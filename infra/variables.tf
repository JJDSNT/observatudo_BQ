variable "project_id" {
  type        = string
  description = "ID do projeto GCP"
}

variable "region" {
  type        = string
  default     = "us-east1"
  description = "Região padrão"
}

variable "image_url" {
  type        = string
  description = "URL da imagem Docker publicada"
}

variable "cubejs_image_url" {
  type        = string
  description = "URL da imagem Docker do Cube.js publicada pelo CI (gcr.io/observatudo-infra/observatudo-cubejs). Sem default: usar o placeholder público (cubejs/cube:latest) por engano aqui reverte o deploy real feito pelo CI (já aconteceu uma vez)."
}

variable "cubejs_api_secret" {
  type        = string
  sensitive   = true
  description = "CUBEJS_API_SECRET — chave usada pelo Cube.js para assinar/validar JWT de acesso à API. Nunca commitar um valor real; vem de uma var de CI (GitHub Actions secret)."
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