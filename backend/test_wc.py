import asyncio
import os
from woocommerce import WooCommerceClient
from dotenv import load_dotenv

async def test_conn():
    load_dotenv()
    print("--- WooCommerce Connection Test ---")
    print(f"URL: {os.getenv('WC_URL')}")
    print(f"Key: {os.getenv('WC_CONSUMER_KEY')[:5]}...")
    
    client = WooCommerceClient()
    try:
        print("\nAttempting to fetch orders...")
        orders = await client.get_orders()
        print(f"✅ Success! Found {len(orders)} orders.")
        for o in orders[:2]:
            print(f" - Order #{o['id']} ({o['status']}): ${o['total']}")
            
        print("\nAttempting to fetch customers...")
        customers = await client.get_customers()
        print(f"✅ Success! Found {len(customers)} customers.")
    except Exception as e:
        print(f"\n❌ FAILED: {str(e)}")
        print("\nPossible solutions:")
        print("1. Check if the URL includes http:// or https://")
        print("2. Ensure Consumer Key/Secret are correct (no spaces)")
        print("3. Check if your site has a valid SSL certificate")

if __name__ == "__main__":
    asyncio.run(test_conn())
