from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List
from datetime import datetime
from loguru import logger
from .. import models, schemas
from ..database import get_db, AsyncSessionLocal
from ..auth import get_current_user
from ..services.market_data import get_stock_data, check_volatility

router = APIRouter(
    prefix="/investments",
    tags=["investments"]
)

async def update_investment_price(investment_id: int):
    """Update investment price using market data service"""
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(models.Investment).where(models.Investment.id == investment_id)
        )
        investment = result.scalar_one_or_none()
        
        if not investment:
            return
        
        data = get_stock_data(investment.symbol)
        if data and "current_price" in data:
            try:
                await db.execute(
                    update(models.Investment)
                    .where(models.Investment.id == investment_id)
                    .values(
                        last_price=str(data["current_price"]),
                        last_updated=datetime.utcnow()
                    )
                )
                await db.commit()
                logger.info(f"Updated price for {investment.symbol}: {data['current_price']}")
            except Exception as e:
                logger.error(f"Failed to update investment {investment_id}: {str(e)}")
        else:
            logger.warning(f"No price data available for {investment.symbol}")

@router.post("/", response_model=schemas.Investment)
async def create_investment(
    investment: schemas.InvestmentCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify symbol exists and get current price
    data = get_stock_data(investment.symbol)
    if not data or "current_price" not in data:
        raise HTTPException(status_code=400, detail="Invalid stock symbol or unable to fetch price")
    
    db_investment = models.Investment(
        **investment.dict(),
        user_id=current_user.id,
        last_price=str(data["current_price"]),  # Convert to string for EncryptedString
        last_updated=datetime.utcnow()
    )
    db.add(db_investment)
    await db.commit()
    await db.refresh(db_investment)
    
    # Schedule price update
    investment_id = int(str(db_investment.id))
    background_tasks.add_task(update_investment_price, investment_id)
    
    return db_investment

@router.get("/", response_model=List[schemas.Investment])
async def get_investments(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    result = await db.execute(
        select(models.Investment)
        .where(models.Investment.user_id == current_user.id)
    )
    return result.scalars().all()

@router.get("/{investment_id}/performance", response_model=dict)
async def get_investment_performance(
    investment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    result = await db.execute(
        select(models.Investment)
        .where(
            models.Investment.id == investment_id,
            models.Investment.user_id == current_user.id
        )
    )
    investment = result.scalar_one_or_none()
    
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    
    # Get current price and performance data
    try:
        data = get_stock_data(investment.symbol)
        if not data or "current_price" not in data:
            raise HTTPException(status_code=500, detail="Failed to fetch current price")
            
        current_price = data["current_price"]
        
        # Calculate returns
        total_cost = float(str(investment.cost_basis)) * float(str(investment.quantity))
        current_value = current_price * float(str(investment.quantity))
        total_return = current_value - total_cost
        total_return_pct = (total_return / total_cost) * 100 if total_cost > 0 else 0
        
        # Check volatility with enhanced detection
        volatility = check_volatility(str(investment.symbol))
        
        # Update investment price in database
        await db.execute(
            update(models.Investment)
            .where(models.Investment.id == investment_id)
            .values(
                last_price=str(current_price),
                last_updated=datetime.utcnow()
            )
        )
        await db.commit()
        
        result = {
            "current_price": current_price,
            "total_value": current_value,
            "total_return": total_return,
            "total_return_percentage": total_return_pct,
            "ytd_return_percentage": volatility.get("ytd_return", 0),
            "mtd_return_percentage": volatility.get("mtd_return", 0),
            "is_volatile": volatility["is_volatile"],
            "volatility_details": volatility.get("details", [])
        }
        
        logger.info(f"Retrieved performance data for {investment.symbol}")
        return result
    except Exception as e:
        logger.error(f"Error fetching investment data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch investment data")
