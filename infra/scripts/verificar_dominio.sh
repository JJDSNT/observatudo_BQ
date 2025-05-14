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
DOMAIN_INFO=$(gcloud beta run domain-mappings describe \
  --domain="$DOMAIN" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --platform=managed \
  --format="yaml")

if [[ -z "$DOMAIN_INFO" ]]; then
  echo -e "${RED}❌ DomainMapping não encontrado${NC}"
  DOMAIN_STATUS=""
else
  RRDATA=$(echo "$DOMAIN_INFO" | grep "rrdata:" | awk '{print $2}')
  if [[ -n "$RRDATA" ]]; then
    DOMAIN_STATUS=$(echo "$RRDATA" | sed 's/\.$//') # Remove ponto final
    echo -e "${GREEN}✅ DomainMapping espera CNAME para: $DOMAIN_STATUS${NC}"
  else
    echo -e "${YELLOW}⚠️ DomainMapping encontrado, mas sem informações de CNAME ainda${NC}"
    DOMAIN_STATUS=""
  fi
fi

echo -e "${YELLOW}🔍 Verificando CNAME no Cloud DNS...${NC}"
DNS_CNAME=$(gcloud dns record-sets list \
  --project="$PROJECT_ID" \
  --zone="$DNS_ZONE" \
  --name="${DOMAIN}." \
  --format="value(rrdatas[0])" | sed 's/\.$//')

if [[ -z "$DNS_CNAME" ]]; then
  echo -e "${RED}❌ Nenhum CNAME encontrado para $DOMAIN na zona $DNS_ZONE${NC}"
else
  echo -e "${GREEN}✅ CNAME em DNS aponta para: $DNS_CNAME${NC}"
fi

# Comparar
if [[ -z "$DOMAIN_STATUS" ]]; then
  echo -e "${RED}⚠️ Não foi possível obter o valor do DomainMapping para comparação${NC}"
elif [[ "$DOMAIN_STATUS" == "$DNS_CNAME" ]]; then
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