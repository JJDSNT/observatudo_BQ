"""
🔍 meu_llm.py

Módulo auxiliar para comunicação com o servidor Ollama local,
responsável por classificar indicadores em eixos temáticos como
Saúde, Educação, Segurança, etc.

Este módulo:
- Valida a conectividade com o Ollama
- Verifica se o modelo desejado está carregado
- Fornece a função `classificar_eixo(texto)` para uso no pré-processamento
- Pode ser usado isoladamente ou importado por outros scripts

Configuração esperada no arquivo `.env`:

    OLLAMA_BASE_URL=http://localhost:11434
    OLLAMA_MODEL=qwen2.5-coder:0.5b
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL_NAME = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:0.5b")


def check_server() -> bool:
    # Verifica se o servidor Ollama está acessível e o modelo está carregado
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=3)
        r.raise_for_status()
        tags = r.json().get("models", [])
        available = any(m["name"] == MODEL_NAME for m in tags)
        if not available:
            print(f"❌ Modelo '{MODEL_NAME}' não está disponível no servidor Ollama.")
            return False
        print(f"✅ Servidor acessível e modelo '{MODEL_NAME}' disponível.")
        return True
    except Exception as e:
        print(f"❌ Falha ao conectar no servidor Ollama: {e}")
        return False


def classificar_eixo(texto: str) -> str:
    """
    Usa o modelo LLM local via Ollama para
    classificar um indicador em um eixo temático.
    Retorna o nome do eixo como string (ex: 'Saúde', 'Governança', etc.)
    Em caso de erro, retorna 'Indefinido'.
    """
    prompt = (
        "Classifique o seguinte indicador em um dos eixos temáticos: "
        "Saúde, Educação, Assistência Social, Segurança, Meio Ambiente, Economia, Governança. "
        "Responda somente com o nome exato do eixo. \n\n"
        f"Indicador: {texto}"
    )

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=10)
        response.raise_for_status()
        eixo = response.json().get("response", "").strip()
        return eixo or "Indefinido"
    except Exception as e:
        print(f"⚠️ Erro ao classificar indicador com LLM: {e}")
        return "Indefinido"

# Permite executar o script diretamente para testar o servidor


if __name__ == "__main__":
    if check_server():
        exemplo = "Acesso à internet nas escolas dos ensinos fundamental e médio"
        eixo = classificar_eixo(exemplo)
        print(f"\n📌 Exemplo de classificação:\n  Indicador: {exemplo}\n  → Eixo IA: {eixo}")
    else:
        print("⚠️ Corrija a conexão com o servidor Ollama antes de continuar.")
