import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase Credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    # In a real app, we'd raise an error. For now, we'll initialize with empty strings 
    # to avoid crashing on import if the user hasn't set up .env yet.
    SUPABASE_URL = SUPABASE_URL or ""
    SUPABASE_KEY = SUPABASE_KEY or ""

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase():
    return supabase
