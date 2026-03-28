import httpx
import os
from dotenv import load_dotenv

load_dotenv()

WC_URL = os.getenv("WC_URL")
WC_CONSUMER_KEY = os.getenv("WC_CONSUMER_KEY")
WC_CONSUMER_SECRET = os.getenv("WC_CONSUMER_SECRET")

class WooCommerceClient:
    def __init__(self):
        self.auth = (WC_CONSUMER_KEY, WC_CONSUMER_SECRET)
        # Handle .local domains by forcing IPv4 (127.0.0.1) if it's a local site
        self.is_local = ".local" in WC_URL
        self.display_url = WC_URL.rstrip('/')
        self.base_url = f"{self.display_url}/wp-json/wc/v3"
        
        # If local, we'll use a custom client that maps the hostname to 127.0.0.1
        self.headers = {"Host": self.display_url.split("//")[-1]}

    async def get_orders(self):
        url = f"{self.base_url}/orders"
        # If it's a .local site, we might need to use 127.0.0.1 to avoid DNS/IPv6 issues
        final_url = url.replace(self.display_url.split("//")[-1], "127.0.0.1") if self.is_local else url
        
        async with httpx.AsyncClient(auth=self.auth, verify=False) as client:
            response = await client.get(final_url, headers=self.headers if self.is_local else None)
            response.raise_for_status()
            return response.json()

    async def get_customers(self):
        async with httpx.AsyncClient(auth=self.auth, verify=False) as client:
            response = await client.get(f"{self.base_url}/customers", headers=self.headers if self.is_local else None)
            response.raise_for_status()
            return response.json()

    async def get_customer_orders(self, customer_id: int):
        async with httpx.AsyncClient(auth=self.auth, verify=False) as client:
            response = await client.get(f"{self.base_url}/orders", params={"customer": customer_id}, headers=self.headers if self.is_local else None)
            response.raise_for_status()
            return response.json()
