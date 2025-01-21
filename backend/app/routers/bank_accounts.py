from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List
from datetime import datetime, timedelta
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(
    prefix="/bank-accounts",
    tags=["bank-accounts"]
)

@router.post("/", response_model=schemas.BankAccount)
async def create_bank_account(
    account: schemas.BankAccountCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_account = models.BankAccount(
        **account.dict(),
        user_id=current_user.id
    )
    db.add(db_account)
    await db.commit()
    await db.refresh(db_account)
    return db_account

@router.get("/", response_model=List[schemas.BankAccount])
async def get_bank_accounts(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    result = await db.execute(
        select(models.BankAccount)
        .where(models.BankAccount.user_id == current_user.id)
    )
    return result.scalars().all()

@router.get("/{account_id}", response_model=schemas.BankAccount)
async def get_bank_account(
    account_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    result = await db.execute(
        select(models.BankAccount)
        .where(
            models.BankAccount.id == account_id,
            models.BankAccount.user_id == current_user.id
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.get("/{account_id}/transactions", response_model=List[schemas.Transaction])
async def get_account_transactions(
    account_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify account exists and belongs to user
    result = await db.execute(
        select(models.BankAccount)
        .where(
            models.BankAccount.id == account_id,
            models.BankAccount.user_id == current_user.id
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Get transactions
    result = await db.execute(
        select(models.Transaction)
        .where(models.Transaction.account_id == account_id)
        .order_by(models.Transaction.timestamp.desc())
    )
    return result.scalars().all()

@router.get("/{account_id}/monthly-spending", response_model=dict)
async def get_monthly_spending(
    account_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify account exists and belongs to user
    result = await db.execute(
        select(models.BankAccount)
        .where(
            models.BankAccount.id == account_id,
            models.BankAccount.user_id == current_user.id
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Get transactions for the last month
    one_month_ago = datetime.utcnow() - timedelta(days=30)
    result = await db.execute(
        select(models.Transaction)
        .where(
            models.Transaction.account_id == account_id,
            models.Transaction.timestamp >= one_month_ago,
            models.Transaction.amount < 0  # Only consider spending (negative amounts)
        )
    )
    transactions = result.scalars().all()
    
    # Group transactions by category
    spending_by_category = {}
    for transaction in transactions:
        category = transaction.category
        amount = abs(float(str(transaction.amount)))  # Convert to float for abs operation
        if category in spending_by_category:
            spending_by_category[category] += amount
        else:
            spending_by_category[category] = amount
    
    return spending_by_category

@router.post("/{account_id}/transactions", response_model=schemas.Transaction)
async def create_transaction(
    account_id: int,
    transaction: schemas.TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify account exists and belongs to user
    result = await db.execute(
        select(models.BankAccount)
        .where(
            models.BankAccount.id == account_id,
            models.BankAccount.user_id == current_user.id
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db_transaction = models.Transaction(
        **transaction.dict(),
        account_id=account_id
    )
    
    # Update account balance
    new_balance = str(float(str(account.balance)) + float(str(transaction.amount)))  # Handle EncryptedString
    await db.execute(
        update(models.BankAccount)
        .where(models.BankAccount.id == account_id)
        .values(balance=new_balance)
    )
    
    db.add(db_transaction)
    await db.commit()
    await db.refresh(db_transaction)
    return db_transaction
