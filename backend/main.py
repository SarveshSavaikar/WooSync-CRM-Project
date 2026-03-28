from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from database import get_supabase
from supabase import Client
import schemas
from woocommerce import WooCommerceClient
import datetime
import json
import asyncio
from contextlib import asynccontextmanager

async def background_sync_loop():
    while True:
        try:
            print("DEBUG: Running automatic background sync loop...")
            await run_sync_job()
        except Exception as e:
            print(f"DEBUG: Background sync error: {e}")
        await asyncio.sleep(60) # Sync every 60 seconds

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the background sync loop
    task = asyncio.create_task(background_sync_loop())
    yield
    # Shutdown: cancel task if needed
    task.cancel()

app = FastAPI(title="WooSync CRM API", lifespan=lifespan)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "WooSync CRM API is running with Supabase SDK!"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

wc_client = WooCommerceClient()

@app.post("/webhook/order-created")
async def handle_order_created(request: Request, sb: Client = Depends(get_supabase)):
    payload = await request.json()
    
    woo_order_id = payload.get("id")
    status = payload.get("status")
    total = float(payload.get("total", 0))
    currency = payload.get("currency")
    woo_customer_id = payload.get("customer_id")
    
    # Get customer
    response = sb.table("customers").select("*").eq("woo_customer_id", woo_customer_id).execute()
    customer = response.data[0] if response.data else None
    
    if not customer:
        billing = payload.get("billing", {})
        new_customer = {
            "woo_customer_id": woo_customer_id,
            "email": billing.get("email"),
            "first_name": billing.get("first_name"),
            "last_name": billing.get("last_name"),
            "total_spend": total,
            "order_count": 1,
            "last_order_date": datetime.datetime.utcnow().isoformat(),
            "tags": ["New Lead"]
        }
        # Check for High Value tag
        if total > 500:
            new_customer["tags"].append("High Value")
            
        res = sb.table("customers").insert(new_customer).execute()
        customer = res.data[0]
    else:
        # Update existing customer
        new_total_spend = float(customer.get("total_spend", 0)) + total
        new_order_count = int(customer.get("order_count", 0)) + 1
        tags = customer.get("tags", []) or []
        
        if new_total_spend > 500 and "High Value" not in tags:
            tags.append("High Value")
            
        update_data = {
            "total_spend": new_total_spend,
            "order_count": new_order_count,
            "last_order_date": datetime.datetime.utcnow().isoformat(),
            "tags": tags
        }
        res = sb.table("customers").update(update_data).eq("id", customer["id"]).execute()
        customer = res.data[0]
    
    # Save Order
    new_order = {
        "woo_order_id": woo_order_id,
        "customer_id": customer["id"],
        "status": status,
        "total": total,
        "currency": currency,
        "date_created": datetime.datetime.utcnow().isoformat()
    }
    sb.table("orders").insert(new_order).execute()
    
    await manager.broadcast({"event": "new_order", "order_id": woo_order_id, "amount": total})
    
    return {"status": "success", "order_id": woo_order_id}

@app.get("/api/dashboard/stats")
async def get_stats(sb: Client = Depends(get_supabase)):
    # Get total customers
    cust_res = sb.table("customers").select("id", count="exact").execute()
    total_customers = cust_res.count if cust_res.count is not None else len(cust_res.data)
    
    # Get total revenue
    order_res = sb.table("orders").select("total").eq("status", "completed").execute()
    revenue_sum = sum([float(o["total"]) for o in order_res.data if o.get("total")])
    
    # Get recent orders
    recent_res = sb.table("orders").select("*").order("date_created", desc=True).limit(5).execute()
    
    # Get top customers
    top_res = sb.table("customers").select("*").order("total_spend", desc=True).limit(5).execute()
    
    return {
        "total_consumers": total_customers,
        "total_revenue": revenue_sum,
        "recent_orders": recent_res.data,
        "top_customers": top_res.data
    }

@app.get("/api/customers", response_model=List[schemas.Customer])
async def get_customers(sb: Client = Depends(get_supabase)):
    res = sb.table("customers").select("*").execute()
    return res.data

@app.get("/api/customers/{customer_id}/orders")
async def get_customer_orders(customer_id: int, sb: Client = Depends(get_supabase)):
    res = sb.table("orders").select("*").eq("customer_id", customer_id).order("date_created", desc=True).execute()
    return res.data

@app.get("/api/orders")
async def get_orders(sb: Client = Depends(get_supabase)):
    res = sb.table("orders").select("*").order("date_created", desc=True).execute()
    return res.data

async def run_sync_job():
    sb = get_supabase()
    print(f"DEBUG: Starting sync from {wc_client.base_url}")
    orders = await wc_client.get_orders()
    print(f"DEBUG: Fetched {len(orders)} orders from WooCommerce")
    synced_count = 0
    updated = False
    
    for order in orders:
        try:
            woo_order_id = order.get("id")
            woo_customer_id = order.get("customer_id")
            total = float(order.get("total", 0))
            
            # 1. Get/Upsert Customer
            billing = order.get("billing", {})
            customer_data = {
                "woo_customer_id": woo_customer_id,
                "email": billing.get("email"),
                "first_name": billing.get("first_name"),
                "last_name": billing.get("last_name"),
                "total_spend": total,
                "order_count": 1,
                "last_order_date": order.get("date_created")
            }
            
            cust_res = sb.table("customers").upsert(customer_data, on_conflict="woo_customer_id").execute()
            customer = cust_res.data[0]
            
            # 2. Check if Order exists
            existing = sb.table("orders").select("status").eq("woo_order_id", woo_order_id).execute()
            status_changed = False
            if not existing.data or existing.data[0]["status"] != order.get("status"):
                status_changed = True

            # 3. Upsert Order
            order_data = {
                "woo_order_id": woo_order_id,
                "customer_id": customer["id"],
                "status": order.get("status"),
                "total": total,
                "currency": order.get("currency"),
                "date_created": order.get("date_created")
            }
            sb.table("orders").upsert(order_data, on_conflict="woo_order_id").execute()
            synced_count += 1
            if status_changed:
                updated = True
        except Exception as item_error:
            print(f"DEBUG: Error syncing order {order.get('id')}: {str(item_error)}")
            continue
        
    print(f"DEBUG: Sync completed. Total synced: {synced_count}")
    return synced_count, updated

@app.post("/api/sync")
async def trigger_sync():
    # Manual Sync Logic
    try:
        synced_count, updated = await run_sync_job()
        if updated:
            await manager.broadcast({"event": "sync_complete", "synced_orders": synced_count})
        return {"status": "success", "synced_orders": synced_count}
    except Exception as e:
        print(f"DEBUG: Sync FATAL error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
