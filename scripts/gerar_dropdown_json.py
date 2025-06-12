import os
import json
from google.cloud import bigquery
from collections import defaultdict

# === CONFIG ===
PROJETO = "observatudo-infra"
DATASET = "dados"
TABELA = "dim_localidades"
DESTINO_JSON = "src/data/localidades_dropdown.json"

# === CLIENTE ===
client = bigquery.Client(project=PROJETO)

# === CONSULTA ===
query = f"""
    SELECT
      localidade_id,
      nome,
      tipo,
      localidade_pai_id,
      sigla,
      `é_capital`,
      capital_localidade_id
    FROM `{PROJETO}.{DATASET}.{TABELA}`
"""

result = client.query(query).result()

# === ORGANIZAÇÃO DOS DADOS ===
estados = {}
cidades_por_estado = defaultdict(dict)  # dict interno para deduplicar por ID

for row in result:
    if row.tipo == "estado":
        uf = row.sigla
        estados[uf] = {
            "nome": row.nome,
            "capital_id": row.capital_localidade_id,
            "cidades": []
        }
    elif row.tipo == "cidade":
        estado_uf = row.localidade_pai_id.replace("BR-", "")
        cidades_por_estado[estado_uf][row.localidade_id] = {
            "id": row.localidade_id,
            "nome": row.nome,
            "é_capital": row["é_capital"] or False
        }

# === AGRUPAR CIDADES E FORMATAR ===
estado_objs = []

for uf in sorted(estados.keys()):
    estado = estados[uf]
    cidades_dict = cidades_por_estado.get(uf, {})
    cidades_ordenadas = sorted(cidades_dict.values(), key=lambda c: c["nome"])

    cidades_formatadas = [
        { "label": cidade["nome"], "value": cidade["id"] }
        for cidade in cidades_ordenadas
    ]

    estado_objs.append({
        "label": uf.strip(),
        "value": uf.strip(),
        "default": estado["capital_id"],
        "children": cidades_formatadas
    })

# === FORMATO FINAL COM O PAÍS ===
localidades_json = [
    {
        "label": "Brasil",
        "value": "BR",
        "children": estado_objs
    }
]

# === CRIAR DIRETÓRIO SE NECESSÁRIO ===
os.makedirs(os.path.dirname(DESTINO_JSON), exist_ok=True)

# === ESCREVER JSON ===
with open(DESTINO_JSON, "w", encoding="utf-8") as f:
    json.dump(localidades_json, f, ensure_ascii=False, indent=2)

print(f"✅ JSON de localidades gerado com sucesso em: {DESTINO_JSON}")
