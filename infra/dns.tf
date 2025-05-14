# Registro CNAME para www.observatudo.com.br
resource "google_dns_record_set" "www" {
  name         = "www.observatudo.com.br."
  type         = "CNAME"
  ttl          = 300
  managed_zone = data.google_dns_managed_zone.observatudo_com_br.name
  rrdatas      = ["ghs.googlehosted.com."]
}

# Registros A para observatudo.com.br (raiz)
resource "google_dns_record_set" "root_a" {
  name         = "observatudo.com.br."
  type         = "A"
  ttl          = 300
  managed_zone = data.google_dns_managed_zone.observatudo_com_br.name
  rrdatas      = [
    "216.239.32.21",
    "216.239.34.21",
    "216.239.36.21",
    "216.239.38.21",
  ]
}

# Registros AAAA para observatudo.com.br (raiz)
resource "google_dns_record_set" "root_aaaa" {
  name         = "observatudo.com.br."
  type         = "AAAA"
  ttl          = 300
  managed_zone = data.google_dns_managed_zone.observatudo_com_br.name
  rrdatas      = [
    "2001:4860:4802:32::15",
    "2001:4860:4802:34::15",
    "2001:4860:4802:36::15",
    "2001:4860:4802:38::15",
  ]
}