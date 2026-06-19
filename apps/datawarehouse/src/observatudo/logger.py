import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
import os

import colorlog

from observatudo.config import LOG_LEVEL  # Defina LOG_LEVEL no seu .env

def setup_logger(
    name: str,
    log_to_file: bool = False,
    log_file_path: str = None,
) -> logging.Logger:
    """
    Cria um logger configurado com suporte a console colorido e rotação de arquivo.

    Args:
        name (str): Nome do logger (geralmente use __name__)
        log_to_file (bool): Se True, salva logs em arquivo além do console
        log_file_path (str): Caminho do arquivo de log (se log_to_file=True)

    Returns:
        logging.Logger: Instância configurada do logger
    """
    level = getattr(logging, LOG_LEVEL.upper(), logging.INFO)
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Evita adicionar handlers múltiplos se já existe
    if not logger.hasHandlers():
        # Handler para console com cores
        console_handler = logging.StreamHandler()
        console_handler.setLevel(level)
        color_formatter = colorlog.ColoredFormatter(
            fmt="%(log_color)s%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
            log_colors={
                "DEBUG": "cyan",
                "INFO": "white",
                "WARNING": "yellow",
                "ERROR": "red",
                "CRITICAL": "red,bg_white",
            },
        )
        console_handler.setFormatter(color_formatter)
        logger.addHandler(console_handler)

        # Handler para arquivo (sem cor)
        if log_to_file:
            # Permite log_file_path vir do .env ou argumento
            log_file_path = log_file_path or os.getenv(
                "LOG_FILE_PATH", "logs/observatudo.log"
            )
            Path(log_file_path).parent.mkdir(parents=True, exist_ok=True)
            file_handler = RotatingFileHandler(
                log_file_path, maxBytes=5_000_000, backupCount=3, encoding="utf-8"
            )
            file_handler.setLevel(level)
            file_formatter = logging.Formatter(
                fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S"
            )
            file_handler.setFormatter(file_formatter)
            logger.addHandler(file_handler)

    return logger


def stream_subprocess_output(command: list[str], logger: logging.Logger):
    """Captura a saída de um subprocesso (como dbt run) e envia ao logger."""
    import subprocess

    logger.info(f"Executando comando: {' '.join(command)}")
    proc = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )
    for line in proc.stdout:
        logger.info(f"[subprocess] {line.strip()}")
    proc.wait()
    if proc.returncode != 0:
        logger.error(f"Comando terminou com código de saída {proc.returncode}")
    else:
        logger.info("Comando finalizado com sucesso.")


# Exemplo de uso: normalmente só use setup_logger(__name__) nos seus scripts principais!
# logger = setup_logger("observatudo", log_to_file=True)
