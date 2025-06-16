# scripts/preprocess_capag.py

if __name__ == "__main__":
    import sys
    from pathlib import Path

    sys.path.append(str(Path(__file__).resolve().parent.parent))

    from observatudo.transformers.capag import main

    main()
