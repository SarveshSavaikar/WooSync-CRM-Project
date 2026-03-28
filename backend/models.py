from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    woo_customer_id = Column(Integer, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    total_spend = Column(Float, default=0.0)
    order_count = Column(Integer, default=0)
    last_order_date = Column(DateTime)
    tags = Column(JSON, default=[]) # e.g. ["High Value", "New Lead"]
    
    orders = relationship("Order", back_populates="customer")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    woo_order_id = Column(Integer, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    status = Column(String) # Pending, Processing, Completed, Cancelled
    total = Column(Float)
    currency = Column(String)
    date_created = Column(DateTime, default=datetime.datetime.utcnow)
    
    customer = relationship("Customer", back_populates="orders")
