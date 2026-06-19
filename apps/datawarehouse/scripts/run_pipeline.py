# scripts/run_pipeline.py
# Substitui `dbt run`. Uso:
#   uv run python scripts/run_pipeline.py
#   uv run python scripts/run_pipeline.py --only gold

if __name__ == "__main__":
    import argparse

    from google.cloud import bigquery

    from observatudo.pipeline.runner import run_step
    from observatudo.pipeline.steps import STEPS, steps_for_layer

    parser = argparse.ArgumentParser(
        description="Roda o pipeline raw -> silver -> gold no BigQuery."
    )
    parser.add_argument("--only", choices=["silver", "gold"], default=None)
    args = parser.parse_args()

    steps = steps_for_layer(args.only) if args.only else STEPS
    client = bigquery.Client()

    for step in steps:
        print(f"-> {step.name}")
        rows = run_step(client, step)
        print(f"   ok ({rows if rows is not None else '?'} linhas)")
