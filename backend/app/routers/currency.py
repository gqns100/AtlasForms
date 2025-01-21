from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List
from loguru import logger
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user
from ..services.market_data import get_exchange_rate

router = APIRouter(
    prefix="/currency",
    tags=["currency"]
)

# Using the market data service for exchange rates

@router.get("/convert")
async def convert_currency(
    amount: float,
    from_currency: str,
    to_currency: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    rate = get_exchange_rate(from_currency, to_currency)
    if rate is None:
        raise HTTPException(status_code=400, detail="Failed to fetch exchange rate")
    logger.info(f"Converted {amount} {from_currency} to {to_currency} at rate {rate}")
    return {
        "amount": amount,
        "from_currency": from_currency,
        "to_currency": to_currency,
        "exchange_rate": rate,
        "converted_amount": amount * rate
    }

@router.get("/supported-currencies")
async def get_supported_currencies():
    return {
        "currencies": [
            "USD", "CNY", "HKD", "SGD",  # Required currencies
            "EUR", "GBP", "JPY", "AUD",  # Additional major currencies
            "BTC"  # Cryptocurrency
        ]
    }

@router.put("/base-currency")
async def update_base_currency(
    currency: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify currency is supported
    supported = (await get_supported_currencies())["currencies"]
    if currency not in supported:
        raise HTTPException(status_code=400, detail="Unsupported currency")
    
    # Update user's base currency
    await db.execute(
        update(models.User)
        .where(models.User.id == current_user.id)
        .values(base_currency=currency)
    )
    await db.commit()
    
    return {"message": f"Base currency updated to {currency}"}
