from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from core.config import settings

# ─────────────────────────────────────────────────────────────────
# Engine — configured for SQLite or PostgreSQL via DATABASE_URL
#
# SQLite:     sqlite:///./restaurant.db   (local, no server needed)
# PostgreSQL: postgresql://...            (Supabase or any PG host)
# ─────────────────────────────────────────────────────────────────
_is_sqlite = settings.DATABASE_URL.startswith("sqlite")

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=not _is_sqlite,                      # not needed for SQLite
    connect_args={"check_same_thread": False} if _is_sqlite else {
        "connect_timeout": 10,
    },
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_connection():
    """Quick sanity check — called at startup to surface DB errors early."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_type = "SQLite" if _is_sqlite else "PostgreSQL"
        print(f"[OK] Database connection OK ({db_type})")
    except Exception as e:
        print(f"[FAIL] Database connection FAILED: {e}")
        raise
