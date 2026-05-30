# Starbucks Analyser – CV Analysis

## Contributions

---

CONTRIBUTION: Robust Data Ingestion Pipeline
FILES INVOLVED: `src/starbucks_analyser/data_loader.py`
SKILL DOMAIN: Data Engineering / Backend Systems
WHAT WAS BUILT: Developed a resilient CSV data loader in Pandas that automatically handles multi-encoding fallback (`utf-8-sig`, `utf-16le`, `latin-1`), performs strict column normalization, handles data sparseness via imputation/NaN coercion, and implements a deterministic first-non-null row deduplication strategy.
NON-TRIVIAL BECAUSE: Naive `pd.read_csv` fails on real-world raw data due to mixed encodings, ragged schemas, and invisible whitespace. The implementation actively traps parsing errors, attempts fallback with lenient settings, issues structured warnings, and guarantees a strict downstream schema regardless of input anomalies.
CV-READY BULLET: Built a fault-tolerant data ingestion pipeline in Pandas supporting multi-encoding fallback, automated schema normalization, and heuristic-based row deduplication to process messy datasets.
GAPS / METRICS NEEDED: What volume of data does this process? What is the parse time? Include a metric like "reduced ingestion errors by X%" or "handling dataset sizes up to Y MB".

---

---

CONTRIBUTION: Deterministic LLM Summarization Service
FILES INVOLVED: `src/starbucks_analyser/llm/summarize.py`, `src/starbucks_analyser/llm/groq_client.py`, `app_streamlit.py`
SKILL DOMAIN: Applies AI / Backend Engineering
WHAT WAS BUILT: Integrated Groq LLM API to generate structured markdown summaries from statistical JSON payloads. Implemented a deterministic configuration (temperature=0.0, fixed seed), recursive key-sorting for reproducible prompting, automatic exponential backoff retries, and local caching.
NON-TRIVIAL BECAUSE: LLMs are inherently non-deterministic, making them difficult to use in reliable analytical applications. By serializing metrics consistently and forcing structural API constraints, the generator avoids hallucinations. The local caching layer handles rate-limiting and prevents redundant API burn on identical requests.
CV-READY BULLET: Engineered a robust LLM summarization pipeline using Groq with deterministic prompting, exponential backoff retries, and local caching to ensure reproducible analytics.
GAPS / METRICS NEEDED: What was the cache hit rate? How much API cost or latency was saved? E.g., "reduced latency by X seconds natively via caching."

---

---

CONTRIBUTION: Multi-Interface Analytics Toolset
FILES INVOLVED: `src/starbucks_analyser/cli.py`, `app_streamlit.py`
SKILL DOMAIN: Full-Stack / Tooling
WHAT WAS BUILT: Created a unified analytical core exposed via two interfaces: a Typer-powered CLI for headless/automated querying and a responsive Streamlit web UI for interactive visual analytics.
NON-TRIVIAL BECAUSE: Decoupling core processing logic from the presentation layer requires strong modularity. Both interfaces seamlessly share the same caching mechanisms, filtration functions (`src/starbucks_analyser/filters.py`), and metric calculators without duplication.
CV-READY BULLET: Decoupled analytical processing from the presentation layer to deliver both an automated CLI using Typer and an interactive Streamlit UI for data exploration.
GAPS / METRICS NEEDED: Mention user adoption, number of CLI commands supported, or speed of rendering. "Developed a dual-interface analytics application serving [X] concurrent users."

---

## Top Picks

1. **Deterministic LLM Summarization Service**: _(Depth & Modern Tech)_ Utilizing LLMs for analytics while deliberately constraining their non-determinism via caching and strictly keyed prompt constraints demonstrates strong maturity. It touches Cloud/AI, API reliability (backoffs), and performance optimization.
2. **Robust Data Ingestion Pipeline**: _(Depth & Production-Grade Concerns)_ It handles edge cases most students ignore: encoding failovers, silent data corruption, unstripped whitespace, and ragged columns. Clean data engineering with solid error-boundary logic is a very strong employer signal.
3. **Multi-Interface Analytics Toolset**: _(Demonstrable System Design)_ Showcasing an architecture that effectively supports multiple delivery models (Web and CLI) implies a strong understanding of Separation of Concerns.

## Tech Stack Summary

**Languages**

- Python 3.10+ (DEMONSTRATED)

**Web / Mobile**

- Streamlit (DEMONSTRATED)

**Cloud & Infrastructure**

- N/A

**DevOps & Security**

- N/A

**Data & Databases**

- Pandas (DEMONSTRATED)
- NumPy (SHALLOW - imported, largely used under the hood via Pandas)
- Matplotlib (DEMONSTRATED)

**Testing & Tools**

- Pytest (DEMONSTRATED)
- Typer (DEMONSTRATED)
- Mypy (DEMONSTRATED - strict config found in pyproject.toml)
- Ruff / Black (SHALLOW - defined in config but not execution logic)
- python-dotenv (DEMONSTRATED)

**AI & LLM**

- Groq API (DEMONSTRATED)

## Missing Best Practices

- **Testing Coverage & Depth**: The `/tests/` directory contains only 3 rudimentary test files (`test_filters.py`, `test_processing.py`, `test_summarize.py`) dealing with "happy paths". Missing: parameterized tests for edge cases (e.g., malformed ingestion, broken encodings), and end-to-end integration tests for the CLI or UI.
- **Synchronous External API Calls**: In `app_streamlit.py` and `summarize.py`, the LLM API call is entirely synchronous. In a web environment like Streamlit, this blocks the main thread and can degrade the entire application's responsiveness under concurrent load. Missing: Async API calls (`asyncio`, `aiohttp`, async Groq client).
- **Hardcoded File System Writes**: In several locations (`app_streamlit.py`, `cli.py`), files are written directly to relative paths (`outputs/metrics/metrics.json`). In production, ephemeral environments (like Docker or cloud platforms) could destroy these directories. Missing: using temporary directories effectively system-wide, object storage abstraction (e.g., S3), or a Database.
- **Secrets Management**: Relying on `.env` parsing inside execution logic (`load_dotenv()`) is acceptable locally but poor for production security contexts. Missing: using a configuration manager or injecting secrets from the environment at CI/CD runtime.
