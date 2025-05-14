#!/bin/bash

# === Configurações ===
PROJECT_ID="observatudo-infra"
REGION="us-east1"
DOMAIN="www.observatudo.com.br"
SERVICE_NAME="www-observatudo"
DNS_ZONE="observatudo-zone"

GREEN="\033[1;32m"
RED="\033[1;31m"
YELLOW="\033[1;33m"
NC="\033[0m"

echo -e "${YELLOW}🔍 Verificando domainMapping do Cloud Run...${NC}"
DOMAIN_STATUS=$(gcloud run domain-mappings describe "$DOMAIN" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --format="value(status.resourceRecords[0].rrdata)")

if [[ -z "$DOMAIN_STATUS" ]]; then
  echo -e "${RED}❌ DomainMapping não encontrado ou sem status provisionado${NC}"
else
  echo -e "${GREEN}✅ DomainMapping aponta para: $DOMAIN_STATUS${NC}"
fi

echo -e "${YELLOW}🔍 Verificando CNAME no Cloud DNS...${NC}"
DNS_CNAME=$(gcloud dns record-sets list \
  --project="$PROJECT_ID" \
  --zone="$DNS_ZONE" \
  --name="${DOMAIN}." \
  --format="value(rrdatas[0])")

if [[ -z "$DNS_CNAME" ]]; then
  echo -e "${RED}❌ Nenhum CNAME encontrado para $DOMAIN na zona $DNS_ZONE${NC}"
else
  echo -e "${GREEN}✅ CNAME em DNS aponta para: $DNS_CNAME${NC}"
fi

# Comparar
if [[ "$DOMAIN_STATUS" == "$DNS_CNAME" ]]; then
  echo -e "${GREEN}✅ CNAME e DomainMapping estão consistentes${NC}"
else
  echo -e "${RED}⚠️ CNAME e DomainMapping estão inconsistentes${NC}"
fi

echo -e "${YELLOW}🔍 Verificando status do serviço Cloud Run...${NC}"
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --format="value(status.url)")

TRAFFIC_PERCENT=$(gcloud run services describe "$SERVICE_NAME" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --format="value(status.traffic[0].percent)")

echo -e "${GREEN}🌐 URL do serviço: $SERVICE_URL${NC}"
echo -e "${GREEN}🚦 Tráfego alocado: ${TRAFFIC_PERCENT}%${NC}"

echo -e "${YELLOW}🔍 Testando resposta HTTP do domínio...${NC}"
curl -I --silent --location "https://$DOMAIN" | head -n 1

