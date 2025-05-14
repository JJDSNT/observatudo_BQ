variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "us-east1"
}

variable "image_url" {
  type = string
  description = "URL da imagem Docker publicada"
}

variable "state_label" {
  type    = string
  default = "observatudo-www-app"
}