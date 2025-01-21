from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from datetime import datetime
from .config import get_settings
from .database import get_db, init_db, AsyncSessionLocal
from .auth import get_password_hash
from .db import Base
from . import models
from .routers import auth, bank_accounts, investments, loyalty, currency

# Initialize settings
settings = get_settings()

# Initialize database
from .database import init_db
init_db()

app = FastAPI(title="Personal Finance Manager")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(bank_accounts.router)
app.include_router(investments.router)
app.include_router(loyalty.router)
app.include_router(currency.router)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

# Initialize test data
@app.on_event("startup")
async def init_test_data():
    try:
        # Initialize database first
        await init_db()
        async with AsyncSessionLocal() as db:
            print("Starting test data initialization...")
            
            # Create test user if not exists
            result = await db.execute(
                select(models.User).where(models.User.email == "test@example.com")
            )
            test_user = result.scalar_one_or_none()
            
            if not test_user:
                print("Creating test user...")
                test_user = models.User(
                    email="test@example.com",
                    hashed_password=get_password_hash("testpass123"),
                    base_currency="USD"
                )
                db.add(test_user)
                await db.commit()
                await db.refresh(test_user)
                
                # Add test bank accounts
                print("Adding test bank accounts...")
                accounts = [
                    {
                        "account_name": "Chase Checking",
                        "account_type": "checking",
                        "institution": "Chase Bank",
                        "country": "US",
                        "currency": "USD",
                        "balance": "15000.00",  # String for EncryptedString type
                        "last_updated": datetime.utcnow()
                    },
                    {
                        "account_name": "HSBC Savings",
                        "account_type": "savings",
                        "institution": "HSBC",
                        "country": "HK",
                        "currency": "HKD",
                        "balance": "200000.00",  # String for EncryptedString type
                        "last_updated": datetime.utcnow()
                    }
                ]
                
                for account_data in accounts:
                    account = models.BankAccount(**account_data, user_id=test_user.id)
                    db.add(account)
                await db.commit()
                
                # Add test investments
                print("Adding test investments...")
                investments = [
                    {
                        "symbol": "AAPL",
                        "quantity": "50",  # String for EncryptedString type
                        "cost_basis": "150.00",
                        "currency": "USD",
                        "last_price": "175.00",
                        "last_updated": datetime.utcnow()
                    },
                    {
                        "symbol": "9988.HK",
                        "quantity": "1000",
                        "cost_basis": "85.00",
                        "currency": "HKD",
                        "last_price": "88.00",
                        "last_updated": datetime.utcnow()
                    }
                ]
                
                for inv_data in investments:
                    investment = models.Investment(**inv_data, user_id=test_user.id)
                    db.add(investment)
                await db.commit()
                
                # Add test loyalty programs
                print("Adding test loyalty programs...")
                programs = [
                    {
                        "program_name": "United MileagePlus",
                        "program_type": "airline",
                        "points_balance": "75000",  # String for EncryptedString type
                        "currency_value": "1500.00",
                        "last_updated": datetime.utcnow()
                    },
                    {
                        "program_name": "Chase Ultimate Rewards",
                        "program_type": "bank",
                        "points_balance": "100000",
                        "currency_value": "2000.00",
                        "last_updated": datetime.utcnow()
                    }
                ]
                
                for program_data in programs:
                    program = models.LoyaltyProgram(**program_data, user_id=test_user.id)
                    db.add(program)
                await db.commit()
                
                # Add test transactions
                print("Adding test transactions...")
                transactions = [
                    {
                        "amount": "-50.00",  # String for EncryptedString type
                        "currency": "USD",
                        "description": "Dinner at Restaurant",
                        "category": "Dining",
                        "timestamp": datetime.utcnow()
                    },
                    {
                        "amount": "-1200.00",
                        "currency": "USD",
                        "description": "Monthly Rent",
                        "category": "Housing",
                        "timestamp": datetime.utcnow()
                    },
                    {
                        "amount": "-75.00",
                        "currency": "USD",
                        "description": "Groceries",
                        "category": "Food",
                        "timestamp": datetime.utcnow()
                    }
                ]
                
                # Add transactions to first account
                result = await db.execute(
                    select(models.BankAccount)
                    .where(models.BankAccount.user_id == test_user.id)
                    .limit(1)
                )
                first_account = result.scalar_one_or_none()
                
                if first_account:
                    for tx_data in transactions:
                        transaction = models.Transaction(**tx_data, account_id=first_account.id)
                        db.add(transaction)
                await db.commit()
                print("Test data initialization complete!")
            else:
                print("Test user already exists, skipping initialization")
    except Exception as e:
        print(f"Error initializing test data: {str(e)}")
        raise
