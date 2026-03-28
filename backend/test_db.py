import os
from supabase import create_client, Client
from dotenv import load_dotenv

def test_supabase_sdk():
    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        print("❌ Error: SUPABASE_URL or SUPABASE_KEY not found in .env file.")
        return

    print(f"Connecting to Supabase SDK: {url[:20]}...")
    
    try:
        supabase: Client = create_client(url, key)
        # Try a simple query
        res = supabase.table("customers").select("id").limit(1).execute()
        print("✅ Successfully connected via Supabase SDK!")
        print("Note: If you haven't created the 'customers' table yet, this might show a relation error, but the connection is working.")
    except Exception as e:
        print(f"❌ SDK Connection failed: {str(e)}")

if __name__ == "__main__":
    test_supabase_sdk()
