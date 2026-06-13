"""
Database abstraction.

Default backend: SQLite at hackathon/.data/marketwin.db (zero external deps).
Opt-in backend: Postgres / Supabase, enabled by setting DATABASE_URL to a
postgresql:// URL. The Postgres path uses psycopg if installed; if not, an
informative ImportError is raised at connect time.

Column names match across both schemas (see schema.sql vs schema_sqlite.sql).
"""

from __future__ import annotations

import json
import os
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SQLITE_PATH = ROOT / ".data" / "marketwin.db"
SQLITE_SCHEMA_PATH = ROOT / "schema_sqlite.sql"
POSTGRES_SCHEMA_PATH = ROOT / "schema.sql"


def now_iso() -> str:
    """UTC ISO-8601 with milliseconds, timezone-aware."""
    return datetime.now(tz=timezone.utc).isoformat(timespec="milliseconds")


def new_id() -> str:
    return str(uuid.uuid4())


def _database_url() -> str | None:
    url = os.environ.get("DATABASE_URL", "").strip()
    return url or None


def is_postgres() -> bool:
    url = _database_url()
    return bool(url and url.startswith(("postgresql://", "postgres://")))


# ─────────────────────────────────────────────────────────────────────────
# SQLite path
# ─────────────────────────────────────────────────────────────────────────

def _sqlite_connect() -> sqlite3.Connection:
    DEFAULT_SQLITE_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DEFAULT_SQLITE_PATH), isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute("pragma foreign_keys = on")
    conn.execute("pragma journal_mode = WAL")
    return conn


def _sqlite_init() -> None:
    sql = SQLITE_SCHEMA_PATH.read_text(encoding="utf-8")
    conn = _sqlite_connect()
    try:
        conn.executescript(sql)
    finally:
        conn.close()


# ─────────────────────────────────────────────────────────────────────────
# Postgres path (opt-in)
# ─────────────────────────────────────────────────────────────────────────

def _pg_connect():  # pragma: no cover — exercised only when DATABASE_URL is set
    try:
        import psycopg  # type: ignore
        from psycopg.rows import dict_row  # type: ignore
    except ImportError as e:
        raise ImportError(
            "DATABASE_URL points to Postgres but psycopg is not installed. "
            "Run `uv pip install 'psycopg[binary]'` or unset DATABASE_URL "
            "to fall back to SQLite."
        ) from e
    return psycopg.connect(_database_url(), row_factory=dict_row, autocommit=True)


def _pg_init() -> None:  # pragma: no cover
    sql = POSTGRES_SCHEMA_PATH.read_text(encoding="utf-8")
    conn = _pg_connect()
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
    finally:
        conn.close()


# ─────────────────────────────────────────────────────────────────────────
# Unified surface
# ─────────────────────────────────────────────────────────────────────────

def init_db() -> str:
    """Apply schema. Returns backend identifier."""
    if is_postgres():
        _pg_init()
        return "postgres"
    _sqlite_init()
    return f"sqlite:{DEFAULT_SQLITE_PATH}"


@contextmanager
def connect():
    """Yield a DB connection. Caller writes via cursor()/execute(); reads use query()."""
    if is_postgres():  # pragma: no cover
        conn = _pg_connect()
    else:
        conn = _sqlite_connect()
    try:
        yield conn
    finally:
        conn.close()


def _row_to_dict(row: Any) -> dict[str, Any]:
    if isinstance(row, dict):
        return dict(row)
    if isinstance(row, sqlite3.Row):
        return {k: row[k] for k in row.keys()}
    return dict(row)


def _decode_jsonish(value: Any) -> Any:
    """SQLite stores JSON as TEXT. Postgres returns dict/list already."""
    if value is None or not isinstance(value, (str, bytes)):
        return value
    s = value.decode() if isinstance(value, bytes) else value
    if not s:
        return None
    if s and (s[0] in '[{"' or s in ("true", "false", "null") or s.lstrip("-").replace(".", "", 1).isdigit()):
        try:
            return json.loads(s)
        except (ValueError, json.JSONDecodeError):
            return s
    return s


def _normalize_row(row: dict[str, Any]) -> dict[str, Any]:
    out = {}
    for k, v in row.items():
        if k in ("metadata", "raw", "result", "details") and isinstance(v, str):
            out[k] = _decode_jsonish(v)
        else:
            out[k] = v
    return out


def query(sql: str, params: Iterable[Any] | dict[str, Any] = ()) -> list[dict[str, Any]]:
    """Run a SELECT and return list of dicts with JSON columns decoded."""
    with connect() as conn:
        if is_postgres():  # pragma: no cover
            with conn.cursor() as cur:
                cur.execute(sql, params)
                rows = cur.fetchall()
        else:
            cur = conn.execute(sql, params)
            rows = cur.fetchall()
    return [_normalize_row(_row_to_dict(r)) for r in rows]


def execute(sql: str, params: Iterable[Any] | dict[str, Any] = ()) -> None:
    with connect() as conn:
        if is_postgres():  # pragma: no cover
            with conn.cursor() as cur:
                cur.execute(sql, params)
        else:
            conn.execute(sql, params)


def insert(table: str, data: dict[str, Any]) -> dict[str, Any]:
    """Insert a row, auto-filling id/timestamps. Returns the inserted row dict."""
    row = dict(data)
    if "id" not in row:
        row["id"] = new_id()

    # Timestamp defaults per table
    if table in ("scrape_runs",) and "started_at" not in row:
        row["started_at"] = now_iso()
    if table in ("competitor_prices",) and "observed_at" not in row:
        row["observed_at"] = now_iso()
    if table in ("experiment_results", "recommendations", "agent_logs") and "created_at" not in row:
        row["created_at"] = now_iso()

    # JSON columns
    for json_col in ("metadata", "raw", "result", "details"):
        if json_col in row and row[json_col] is not None and not isinstance(row[json_col], (str, bytes)):
            row[json_col] = json.dumps(row[json_col])

    cols = list(row.keys())
    placeholders = ", ".join(["?"] * len(cols)) if not is_postgres() else ", ".join(f"%({c})s" for c in cols)
    if is_postgres():  # pragma: no cover
        sql = f"insert into {table} ({', '.join(cols)}) values ({placeholders})"
        with connect() as conn, conn.cursor() as cur:
            cur.execute(sql, row)
    else:
        sql = f"insert into {table} ({', '.join(cols)}) values ({placeholders})"
        with connect() as conn:
            conn.execute(sql, [row[c] for c in cols])
    return row


def update(table: str, row_id: str, changes: dict[str, Any]) -> None:
    if not changes:
        return
    sanitized = dict(changes)
    for json_col in ("metadata", "raw", "result", "details"):
        if json_col in sanitized and not isinstance(sanitized[json_col], (str, bytes)):
            sanitized[json_col] = json.dumps(sanitized[json_col])
    if is_postgres():  # pragma: no cover
        set_clause = ", ".join(f"{c} = %({c})s" for c in sanitized)
        sql = f"update {table} set {set_clause} where id = %(id_for_update)s"
        params = {**sanitized, "id_for_update": row_id}
        with connect() as conn, conn.cursor() as cur:
            cur.execute(sql, params)
    else:
        set_clause = ", ".join(f"{c} = ?" for c in sanitized)
        sql = f"update {table} set {set_clause} where id = ?"
        with connect() as conn:
            conn.execute(sql, [*sanitized.values(), row_id])
