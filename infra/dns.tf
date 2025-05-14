resource "google_dns_record_set" "www" {
  name          = "www.observatudo.com.br."
  type          = "CNAME"
  ttl           = 300
  managed_zone  = data.google_dns_managed_zone.observatudo_com_br.name
  rrdatas       = ["ghs.googlehosted.com."]
}