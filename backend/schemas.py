from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderBase(BaseModel):
    woo_order_id: int
    status: str
    total: float
    currency: str
    date_created: datetime

class OrderCreate(OrderBase):
    customer_id: int

class Order(OrderBase):
    id: int
    
    class Config:
        from_attributes = True

class CustomerBase(BaseModel):
    woo_customer_id: int
    email: str
    first_name: str
    last_name: str
    total_spend: float = 0.0
    order_count: int = 0
    tags: List[str] = []

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    last_order_date: Optional[datetime] = None
    orders: List[Order] = []
    
    class Config:
        from_attributes = True

class WebhookPayload(BaseModel):
    id: int
    status: str
    total: str
    currency: str
    date_created: str
    customer_id: int
    billing: dict
    line_items: List[dict]
