import os
from dotenv import load_dotenv

load_dotenv()

# === Google Cloud ===
BUCKET_NAME = os.getenv("GCS_BUCKET", "observatudo-infra-www-data")

# === Diretórios locais ===
DADOS_DIR = "dados/cidades-sustentaveis"
CACHE_DIR = os.path.join(DADOS_DIR, "cache")
MAPA_EIXOS_PATH = os.path.join(CACHE_DIR, "eixos_llm.json")
INVALIDOS_PATH = os.path.join(CACHE_DIR, "classificacoes_invalidas.csv")

# === Ollama (LLM Local) ===
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:0.5b")

# === Timeout padrão para chamadas LLM ===
LLM_TIMEOUT = int(os.getenv("LLM_TIMEOUT", "30"))

# === Logging ===
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
