import json
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "pressform.db"


def init_db() -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                payload TEXT NOT NULL,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)


def save_project(project_id: str, name: str, payload: dict) -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO projects(id,name,payload) VALUES(?,?,?) "
            "ON CONFLICT(id) DO UPDATE SET name=excluded.name,payload=excluded.payload,updated_at=CURRENT_TIMESTAMP",
            (project_id, name, json.dumps(payload)),
        )


def list_projects() -> list[dict]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT id,name,payload,updated_at FROM projects ORDER BY updated_at DESC").fetchall()
    return [{**dict(row), "payload": json.loads(row["payload"])} for row in rows]

