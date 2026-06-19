"""
🔍 observatudo/llm.py

Módulo auxiliar para comunicação com o servidor Ollama local,
responsável por classificar indicadores em eixos temáticos como
Saúde, Educação, Segurança, etc.

Este módulo:
- Valida a conectividade com o Ollama
- Verifica se o modelo desejado está carregado
- Fornece a função `classificar_eixo(texto)` para uso no pré-processamento
- Pode ser usado isoladamente ou importado por outros scripts

Requer configurações definidas em `config.py`, que por sua vez
pode carregar variáveis via `.env`:

.env esperado:
    OLLAMA_URL=http://localhost:11434
    OLLAMA_MODEL=qwen2.5-coder:0.5b
"""

import requests
from time import perf_counter

from observatudo.config import OLLAMA_URL, OLLAMA_MODEL, LLM_TIMEOUT
from observatudo.constants import CATEGORIAS_VALIDAS
from observatudo.logger import setup_logger

logger = setup_logger(__name__)


def check_server() -> bool:
    """Verifica se o servidor Ollama está acessível e o modelo está disponível."""
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=3)
        r.raise_for_status()
        tags = r.json().get("models", [])
        available = any(m["name"] == OLLAMA_MODEL for m in tags)
        if not available:
            logger.error(
                f"❌ Modelo '{OLLAMA_MODEL}' não está disponível no servidor Ollama."
            )
            return False
        logger.info(f"✅ Servidor acessível e modelo '{OLLAMA_MODEL}' disponível.")
        return True
    except Exception as e:
        logger.error(f"❌ Falha ao conectar no servidor Ollama: {e}")
        return False


def classificar_eixo(texto: str) -> str:
    """
    Usa o modelo LLM local via Ollama para
    classificar um indicador em um eixo temático.

    Retorna o nome do eixo como string (ex: 'Saúde', 'Governança', etc.)
    Em caso de erro, retorna 'Indefinido'
    """
    prompt = (
        "Classifique o seguinte indicador em um dos eixos temáticos: "
        + ", ".join(sorted(CATEGORIAS_VALIDAS))
        + ".\nAtenção: responda somente com o nome exato da categoria.\n\n"
        f"Indicador: {texto}"
    )

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
    }

    try:
        start = perf_counter()
        r = requests.post(
            f"{OLLAMA_URL}/api/generate", json=payload, timeout=LLM_TIMEOUT
        )
        r.raise_for_status()
        duration = perf_counter() - start

        resposta = r.json().get("response", "").strip()
        logger.debug(f"⏱️ LLM respondeu em {duration:.2f}s: '{resposta}'")
        return resposta or "Indefinido"
    except Exception as e:
        logger.warning(f"⚠️ Erro ao classificar indicador com LLM: {e}")
        return "Indefinido"


def inferir_direcionalidade(texto: str) -> str:
    """
    Usa LLM local para inferir a direcionalidade de um indicador.

    Pode responder:
    - quanto maior, melhor
    - quanto menor, melhor
    - indiferente
    - a > b > c
    """
    prompt = (
        "A seguir está a descrição de um indicador público. "
        "Classifique a direcionalidade esperada do indicador, escolhendo apenas uma das opções:\n"
        "- quanto maior, melhor\n"
        "- quanto menor, melhor\n"
        "- indiferente\n"
        "- a > b > c\n\n"
        f"Indicador:\n{texto}\n\n"
        "Resposta:"
    )

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
    }

    try:
        start = perf_counter()
        r = requests.post(
            f"{OLLAMA_URL}/api/generate", json=payload, timeout=LLM_TIMEOUT
        )
        r.raise_for_status()
        duration = perf_counter() - start

        resposta = r.json().get("response", "").strip().lower()
        logger.debug(f"⏱️ LLM respondeu em {duration:.2f}s: '{resposta}'")

        if "maior" in resposta:
            return "quanto maior, melhor"
        if "menor" in resposta:
            return "quanto menor, melhor"
        if "indiferente" in resposta:
            return "indiferente"
        if ">" in resposta or "a" in resposta:
            return "a > b > c"

        return "indiferente"
    except Exception as e:
        logger.warning(f"⚠️ Erro ao classificar direcionalidade com LLM: {e}")
        return "indiferente"


if __name__ == "__main__":
    if check_server():
        exemplo = (
            "Acesso à internet nas escolas dos ensinos fundamental e médio"
        )
        eixo = classificar_eixo(exemplo)
        direcionalidade = inferir_direcionalidade(exemplo)
        print("\n📌 Exemplo de classificação:")
        print(f"  Indicador: {exemplo}")
        print(f"  → Eixo IA: {eixo}")
        print(f"  → Direcionalidade IA: {direcionalidade}")
    else:
        print("⚠️ Corrija a conexão com o servidor Ollama antes de continuar.")
