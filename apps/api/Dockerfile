# Caminho self-hosted (vs. Cube Cloud) — decisão de deploy ainda aberta,
# ver docs/external/cubejs.md. Este Dockerfile não está em uso em nenhum
# pipeline de deploy ainda; existe para a opção self-hosted já ter um
# ponto de partida real quando a decisão for tomada.
FROM cubejs/cube:latest

WORKDIR /cube/conf

COPY package.json ./
COPY cube.js ./
COPY model ./model

EXPOSE 4000
