"""
Migration script to add missing columns to existing Supabase tables.
Run once: python migrate.py
"""
import os
import sys
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)


def run_migration():
    print("[MIGRATE] Starting database migration...")

    with engine.connect() as conn:
        inspector = inspect(engine)

        # ── Users table ──────────────────────────────────────
        user_columns = [c["name"] for c in inspector.get_columns("users")]
        print(f"  [users] existing columns: {user_columns}")

        if "phone" not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR"))
            print("  [+] Added 'phone' to users")

        if "password_hash" not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR NOT NULL DEFAULT 'needs_reset'"))
            print("  [+] Added 'password_hash' to users")

        if "role" not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR NOT NULL DEFAULT 'user'"))
            print("  [+] Added 'role' to users")

        if "created_at" not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW()"))
            print("  [+] Added 'created_at' to users")

        # ── Bookings table ───────────────────────────────────
        booking_columns = [c["name"] for c in inspector.get_columns("bookings")]
        print(f"  [bookings] existing columns: {booking_columns}")

        if "updated_at" not in booking_columns:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()"))
            print("  [+] Added 'updated_at' to bookings")

        # ── Waitlist table ───────────────────────────────────
        tables = inspector.get_table_names()
        if "waitlist" not in tables:
            conn.execute(text("""
                CREATE TABLE waitlist (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR NOT NULL,
                    email VARCHAR NOT NULL,
                    guest_count INTEGER NOT NULL,
                    booking_date DATE NOT NULL,
                    booking_time TIME NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """))
            print("  [+] Created 'waitlist' table")
        else:
            print("  [OK] 'waitlist' table already exists")

        conn.commit()

    print("[MIGRATE] Migration complete!")


if __name__ == "__main__":
    run_migration()
