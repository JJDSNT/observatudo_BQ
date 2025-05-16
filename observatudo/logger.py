import logging
from pathlib import Path


def setup_logger(
    name: str,
    level: int = logging.INFO,
    log_to_file: bool = False,
    log_file_path: str = "logs/observatudo.log",
) -> logging.Logger:
    """
    Cria um logger configurado.

    Args:
        name (str): Nome do logger (use __name__)
        level (int): Nível mínimo (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_to_file (bool): Se True, salva também em arquivo além do console
        log_file_path (str): Caminho do arquivo de log (se log_to_file=True)

    Returns:
        logging.Logger: Instância configurada do logger
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    if not logger.hasHandlers():
        # Handler para console
        console_handler = logging.StreamHandler()
        console_handler.setLevel(level)

        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

        # Handler para arquivo (opcional)
        if log_to_file:
            Path(log_file_path).parent.mkdir(parents=True, exist_ok=True)
            file_handler = logging.FileHandler(log_file_path, encoding="utf-8")
            file_handler.setLevel(level)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)

    return logger
