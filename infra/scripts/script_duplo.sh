#!/bin/bash

# === Configurações ===
PROJECT_ID="observatudo-infra"
REGION="us-east1"
DNS_ZONE="observatudo-zone"
SERVICE_NAME="www-observatudo"
DOMAINS=("www.observatudo.com.br" "observatudo.com.br")

GREEN="\033[1;32m"
RED="\033[1;31m"
YELLOW="\033[1;33m"
BLUE="\033[1;34m"
NC="\033[0m"

START=$(date +%s)
echo -e "${GREEN}🌐 Iniciando verificação de domínios: ${DOMAINS[*]}${NC}"
echo

for DOMAIN in "${DOMAINS[@]}"; do
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "🔍 Iniciando verificação do domínio: $DOMAIN"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  sleep 5

  DOMAIN_INFO=$(gcloud beta run domain-mappings describe \
    --domain="$DOMAIN" \
    --project="$PROJECT_ID" \
    --region="$REGION" \
    --platform=managed \
    --format="yaml" 2>/dev/null)

  if [[ -z "$DOMAIN_INFO" ]]; then
    echo -e "${RED}❌ DomainMapping não encontrado na API${NC}"
    DOMAIN_STATUS=""
  else
    echo -e "${GREEN}✅ DomainMapping localizado com sucesso${NC}"

    if [[ "$DOMAIN" == "observatudo.com.br" ]]; then
      echo -e "${GREEN}✅ DomainMapping configurado para domínio raiz (apex)${NC}"
      DOMAIN_STATUS="apex_domain"
    else
      RRDATA=$(echo "$DOMAIN_INFO" | grep "rrdata:" | head -1 | awk '{print $2}')
      if [[ -n "$RRDATA" ]]; then
        DOMAIN_STATUS=$(echo "$RRDATA" | sed 's/\.$//')
        echo -e "${GREEN}✅ DomainMapping requer CNAME apontando para: $DOMAIN_STATUS${NC}"
      else
        echo -e "${YELLOW}⚠️ DomainMapping localizado, mas ainda sem CNAME definido no status${NC}"
        DOMAIN_STATUS=""
      fi
    fi
  fi

  echo -e "${BLUE}🌐 Testando resposta HTTP real do domínio...${NC}"
  HTTP_STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN")

  if [[ "$HTTP_STATUS_CODE" == "200" || "$HTTP_STATUS_CODE" =~ ^30[0-9]$ ]]; then
    echo -e "${GREEN}✅ DomainMapping está pronto e funcional (HTTP $HTTP_STATUS_CODE)${NC}"
  else
    DOMAIN_READY=$(gcloud beta run domain-mappings describe \
      --domain="$DOMAIN" \
      --project="$PROJECT_ID" \
      --region="$REGION" \
      --platform=managed \
      --format="get(status.conditions[?type=Ready].status)" 2>/dev/null)

    if [[ "$DOMAIN_READY" == "True" ]]; then
      echo -e "${YELLOW}⚠️ DomainMapping está marcado como pronto, mas responde HTTP $HTTP_STATUS_CODE${NC}"
    elif [[ -z "$DOMAIN_READY" ]]; then
      echo -e "${YELLOW}⚠️ Condição 'Ready' ainda não está disponível na API (HTTP $HTTP_STATUS_CODE)${NC}"
    else
      echo -e "${YELLOW}⚠️ DomainMapping ainda não está totalmente provisionado (HTTP $HTTP_STATUS_CODE)${NC}"
    fi
  fi

  echo -e "${YELLOW}🔍 Verificando registros DNS na zona $DNS_ZONE...${NC}"

  if [[ "$DOMAIN" == "observatudo.com.br" ]]; then
    A_RECORDS=$(gcloud dns record-sets list \
      --project="$PROJECT_ID" \
      --zone="$DNS_ZONE" \
      --name="${DOMAIN}." \
      --type="A" \
      --format="value(rrdatas[])")

    if [[ -n "$A_RECORDS" ]]; then
      echo -e "${GREEN}✅ Registros A encontrados:${NC}"
      echo "$A_RECORDS" | sed 's/^/  - /'
    else
      echo -e "${RED}❌ Nenhum registro A encontrado para o domínio raiz${NC}"
    fi

    AAAA_RECORDS=$(gcloud dns record-sets list \
      --project="$PROJECT_ID" \
      --zone="$DNS_ZONE" \
      --name="${DOMAIN}." \
      --type="AAAA" \
      --format="value(rrdatas[])")

    if [[ -n "$AAAA_RECORDS" ]]; then
      echo -e "${GREEN}✅ Registros AAAA encontrados:${NC}"
      echo "$AAAA_RECORDS" | sed 's/^/  - /'
    else
      echo -e "${RED}❌ Nenhum registro AAAA encontrado para o domínio raiz${NC}"
    fi

    echo -e "${BLUE}ℹ️ Comparação de CNAME omitida (domínio raiz usa registros A/AAAA)${NC}"
  else
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

    if [[ -z "$DOMAIN_STATUS" ]]; then
      echo -e "${RED}⚠️ Não foi possível obter o valor do DomainMapping para comparação${NC}"
    elif [[ "$DOMAIN_STATUS" == "$DNS_CNAME" ]]; then
      echo -e "${GREEN}✅ CNAME em DNS corresponde ao esperado pelo DomainMapping${NC}"
    else
      echo -e "${RED}❌ CNAME em DNS não corresponde ao valor esperado pelo DomainMapping${NC}"
    fi
  fi

  echo -e "${YELLOW}🔍 Cabeçalho HTTP retornado pelo domínio:${NC}"
  HTTP_RESPONSE=$(curl -I --silent --location "https://$DOMAIN" | head -n 1)
  echo "$HTTP_RESPONSE"
  echo
done

echo -e "${YELLOW}🔍 Verificando status do serviço Cloud Run (${SERVICE_NAME})...${NC}"
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

END=$(date +%s)
DURATION=$((END - START))
echo
echo -e "${YELLOW}⏱️ Verificação finalizada em ${DURATION}s${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
