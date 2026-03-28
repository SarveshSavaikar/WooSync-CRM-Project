import os
import random
import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_KEY")

if not URL or not KEY:
    print("❌ Error: SUPABASE_URL or SUPABASE_KEY not found.")
    exit(1)

supabase: Client = create_client(URL, KEY)

def seed():
    print("🌱 Starting data seeding...")
    
    # 1. Clear existing data (optional, but good for clean demo)
    # supabase.table("orders").delete().neq("id", 0).execute()
    # supabase.table("customers").delete().neq("id", 0).execute()

    first_names = ["John", "Jane", "Alice", "Bob", "Charlie", "David", "Eva", "Frank", "Grace", "Henry"]
    last_names = ["Doe", "Smith", "Johnson", "Brown", "Taylor", "Miller", "Wilson", "Moore", "Anderson", "Thomas"]
    statuses = ["completed", "processing", "pending", "cancelled"]

    # 2. Create 10 Customers
    customers = []
    for i in range(10):
        first = random.choice(first_names)
        last = random.choice(last_names)
        cust_data = {
            "woo_customer_id": 1000 + i,
            "email": f"{first.lower()}.{last.lower()}{i}@example.com",
            "first_name": first,
            "last_name": last,
            "total_spend": 0,
            "order_count": 0,
            "last_order_date": None,
            "tags": ["Imported"]
        }
        res = supabase.table("customers").insert(cust_data).execute()
        if res.data:
            customers.append(res.data[0])
            print(f"👤 Created customer: {first} {last}")

    # 3. Create 40 Orders
    for i in range(40):
        customer = random.choice(customers)
        status = random.choice(statuses)
        total = round(random.uniform(20.0, 350.0), 2)
        days_ago = random.randint(0, 30)
        date = (datetime.datetime.utcnow() - datetime.timedelta(days=days_ago)).isoformat()
        
        order_data = {
            "woo_order_id": 5000 + i,
            "customer_id": customer["id"],
            "status": status,
            "total": total,
            "currency": "USD",
            "date_created": date
        }
        
        supabase.table("orders").insert(order_data).execute()
        
        # Update customer stats
        new_spend = float(customer["total_spend"]) + total
        new_count = customer["order_count"] + 1
        tags = customer["tags"]
        if new_spend > 500 and "High Value" not in tags:
            tags.append("High Value")
            
        supabase.table("customers").update({
            "total_spend": new_spend,
            "order_count": new_count,
            "last_order_date": date,
            "tags": tags
        }).eq("id", customer["id"]).execute()
        
        # Update local ref for next iteration
        customer["total_spend"] = new_spend
        customer["order_count"] = new_count
        customer["tags"] = tags
        
        if i % 10 == 0:
            print(f"📦 Created {i} orders...")

    print("✅ Seeding complete!")

if __name__ == "__main__":
    seed()
