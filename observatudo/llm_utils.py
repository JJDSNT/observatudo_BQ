import requests
import os
from dotenv import load_dotenv
from observatudo.constants import OLLAMA_URL, MODEL_NAME

load_dotenv()


def check_server() -> bool:
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        r.raise_for_status()
        models = r.json().get("models", [])
        available = any(m["name"] == MODEL_NAME for m in models)
        if not available:
            print(f"❌ Modelo '{MODEL_NAME}' não encontrado no servidor Ollama.")
            return False
        print(f"✅ Modelo '{MODEL_NAME}' encontrado no servidor.")
        return True
    except Exception as e:
        print(f"❌ Erro ao conectar no Ollama: {e}")
        return False


def classificar_eixo(texto: str) -> str:
    payload = {
        "model": MODEL_NAME,
        "prompt": f"Classifique o seguinte indicador em um eixo temático:\n\n{texto}\n\nEixo:",
        "stream": False
    }
    try:
        r = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=30)
        r.raise_for_status()
        return r.json()["response"].strip()
    except Exception as e:
        raise RuntimeError(f"Erro na chamada ao Ollama: {e}")
