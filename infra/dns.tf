# www.observatudo.com.br → Cloud Run
resource "google_dns_record_set" "www" {
  name         = "www.observatudo.com.br."
  type         = "CNAME"
  ttl          = 300
  managed_zone = data.google_dns_managed_zone.observatudo_com_br.name
  rrdatas = [
    "${replace(google_cloud_run_service.www_observatudo.status[0].url, "https://", "")}."
  ]
}

