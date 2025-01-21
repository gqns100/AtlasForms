from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: str
    base_currency: str = "USD"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

class BankAccountBase(BaseModel):
    account_name: str
    account_type: str
    institution: str
    country: str
    currency: str
    balance: float

class BankAccountCreate(BankAccountBase):
    pass

class BankAccount(BankAccountBase):
    id: int
    user_id: int
    last_updated: datetime
    class Config:
        from_attributes = True

class InvestmentBase(BaseModel):
    symbol: str
    quantity: float
    cost_basis: float
    currency: str

class InvestmentCreate(InvestmentBase):
    pass

class Investment(InvestmentBase):
    id: int
    user_id: int
    last_price: float
    last_updated: datetime
    class Config:
        from_attributes = True

class LoyaltyProgramBase(BaseModel):
    program_name: str
    program_type: str
    points_balance: float
    currency_value: float

class LoyaltyProgramCreate(LoyaltyProgramBase):
    pass

class LoyaltyProgram(LoyaltyProgramBase):
    id: int
    user_id: int
    last_updated: datetime
    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    amount: float
    currency: str
    description: str
    category: str

class TransactionCreate(TransactionBase):
    account_id: int

class Transaction(TransactionBase):
    id: int
    account_id: int
    timestamp: datetime
    class Config:
        from_attributes = True
