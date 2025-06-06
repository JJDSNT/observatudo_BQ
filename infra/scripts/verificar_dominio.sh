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
NC="\033[0m"

START=$(date +%s)
echo -e "${GREEN}🌐 Iniciando verificação de domínios: ${DOMAINS[*]}${NC}"
echo

for DOMAIN in "${DOMAINS[@]}"; do
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "🔍 Verificando: $DOMAIN"
  echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  sleep 5

  DOMAIN_INFO=$(gcloud beta run domain-mappings describe \
    --domain="$DOMAIN" \
    --project="$PROJECT_ID" \
    --region="$REGION" \
    --platform=managed \
    --format="yaml" 2>/dev/null)

  if [[ -z "$DOMAIN_INFO" ]]; then
    echo -e "${RED}❌ DomainMapping não encontrado${NC}"
    DOMAIN_STATUS=""
  else
    echo -e "${GREEN}✅ DomainMapping encontrado${NC}"
    
    # Para domínio raiz (apex), verificamos apenas se existe o mapeamento
    if [[ "$DOMAIN" == "observatudo.com.br" ]]; then
      echo -e "${GREEN}✅ DomainMapping para domínio raiz configurado${NC}"
      DOMAIN_STATUS="apex_domain"
    else
      # Para subdomínios, usa CNAME
      RRDATA=$(echo "$DOMAIN_INFO" | grep "rrdata:" | head -1 | awk '{print $2}')
      if [[ -n "$RRDATA" ]]; then
        DOMAIN_STATUS=$(echo "$RRDATA" | sed 's/\.$//')
        echo -e "${GREEN}✅ DomainMapping espera CNAME para: $DOMAIN_STATUS${NC}"
      else
        echo -e "${YELLOW}⚠️ DomainMapping encontrado, mas sem informações de CNAME ainda${NC}"
        DOMAIN_STATUS=""
      fi
    fi
  fi

  # Verificar o status do DomainMapping de forma diferente
  # Primeiro, verificar se conseguimos obter uma resposta HTTP bem-sucedida
  HTTP_STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN")
  
  # Se obteve status HTTP 200 ou 30X (redirecionamento), consideramos o domínio funcionando
  if [[ "$HTTP_STATUS_CODE" == "200" || "$HTTP_STATUS_CODE" =~ ^30[0-9]$ ]]; then
    echo -e "${GREEN}✅ DomainMapping está pronto e funcionando (HTTP $HTTP_STATUS_CODE)${NC}"
  else
    # Se não obteve resposta HTTP bem-sucedida, então verificamos o status do DomainMapping
    DOMAIN_READY=$(gcloud beta run domain-mappings describe \
      --domain="$DOMAIN" \
      --project="$PROJECT_ID" \
      --region="$REGION" \
      --platform=managed \
      --format="get(status.conditions[?type=Ready].status)" 2>/dev/null)
  
    if [[ "$DOMAIN_READY" == "True" ]]; then
      echo -e "${GREEN}✅ DomainMapping está pronto, mas está respondendo com HTTP $HTTP_STATUS_CODE${NC}"
    else
      echo -e "${YELLOW}⚠️ DomainMapping ainda não está totalmente provisionado (HTTP $HTTP_STATUS_CODE)${NC}"
    fi
  fi

  echo -e "${YELLOW}🔍 Verificando DNS na zona $DNS_ZONE...${NC}"

  if [[ "$DOMAIN" == "observatudo.com.br" ]]; then
    # Verifica registros A
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

    # Verifica registros AAAA
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

    echo -e "${YELLOW}🔁 Comparação de CNAME ignorada para domínio raiz${NC}"
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
      echo -e "${GREEN}✅ CNAME e DomainMapping estão consistentes${NC}"
    else
      echo -e "${RED}⚠️ CNAME e DomainMapping estão inconsistentes${NC}"
    fi
  fi

  echo -e "${YELLOW}🔍 Testando resposta HTTP do domínio...${NC}"
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