"""Inspect existing Supabase schema."""
from sqlalchemy import inspect, create_engine
from dotenv import load_dotenv
import os

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"))
insp = inspect(engine)

for table_name in insp.get_table_names():
    cols = [c["name"] for c in insp.get_columns(table_name)]
    print(f"{table_name}: {cols}")
