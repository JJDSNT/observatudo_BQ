resource "google_dns_record_set" "www" {
  name         = "www.observatudo.com.br."
  type         = "CNAME"
  ttl          = 300
  managed_zone = google_dns_managed_zone.observatudo_com_br.name

  rrdatas = [google_cloud_run_service.www_observatudo.status[0].url]
}
