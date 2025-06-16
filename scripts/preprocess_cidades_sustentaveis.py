# scripts/preprocess_cidades_sustentaveis.py

if __name__ == "__main__":
    import sys
    from pathlib import Path

    sys.path.append(str(Path(__file__).resolve().parent.parent))

    from observatudo.transformers.cidades_sustentaveis import main

    main()
