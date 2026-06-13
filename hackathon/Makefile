# hackathon/Makefile — convenience commands for the MarketTwin subsystem.
# Run targets from inside hackathon/ (or via `make -C hackathon <target>`).

PY := uv run python
UVICORN := uv run uvicorn
PORT ?= 8001
API_URL ?= http://127.0.0.1:$(PORT)

.PHONY: help install init seed api smoke pipeline test clean

help:
	@echo "make install     Install Python deps via uv (FastAPI, Pydantic, ...)"
	@echo "make init        Initialise the local SQLite schema"
	@echo "make seed        Insert one cached-fixture scrape and analyse it"
	@echo "make api         Run the FastAPI shim on port $(PORT)"
	@echo "make smoke       End-to-end smoke test (no server, in-process)"
	@echo "make pipeline    Hit the running API: scrape → analyse → dashboard"
	@echo "make test        Run pytest (if any tests are present)"
	@echo "make clean       Remove the local SQLite database"

install:
	uv pip install -e ".[test]"

init:
	$(PY) -c "from api import db; print('backend=', db.init_db())"

seed:
	$(PY) scripts/seed.py

api:
	$(UVICORN) api.main:app --reload --host 0.0.0.0 --port $(PORT)

smoke:
	$(PY) scripts/smoke_test.py

pipeline:
	@echo "POST $(API_URL)/scrapes/run"
	@curl -sS -X POST -H "Content-Type: application/json" \
	  -d '{"source":"cached","actor_id":"apify/web-scraper","max_items":20}' \
	  $(API_URL)/scrapes/run | tee /tmp/scrape_run.json
	@SCRAPE_ID=$$(python -c "import json;print(json.load(open('/tmp/scrape_run.json'))['id'])"); \
	  echo; echo "POST $(API_URL)/scrapes/$$SCRAPE_ID/analyze"; \
	  curl -sS -X POST $(API_URL)/scrapes/$$SCRAPE_ID/analyze
	@echo
	@echo "GET $(API_URL)/dashboard"
	@curl -sS $(API_URL)/dashboard

test:
	uv run pytest -q || echo "(no tests configured)"

clean:
	rm -rf .data/
