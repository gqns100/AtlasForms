from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List
from datetime import datetime
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(
    prefix="/loyalty",
    tags=["loyalty"]
)

@router.post("/", response_model=schemas.LoyaltyProgram)
async def create_loyalty_program(
    program: schemas.LoyaltyProgramCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Convert numeric values to strings for EncryptedString fields
    program_dict = program.dict()
    program_dict["points_balance"] = str(program_dict["points_balance"])
    program_dict["currency_value"] = str(program_dict["currency_value"])
    
    db_program = models.LoyaltyProgram(
        **program_dict,
        user_id=current_user.id,
        last_updated=datetime.utcnow()
    )
    db.add(db_program)
    await db.commit()
    await db.refresh(db_program)
    return db_program

@router.get("/", response_model=List[schemas.LoyaltyProgram])
async def get_loyalty_programs(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    result = await db.execute(
        select(models.LoyaltyProgram)
        .where(models.LoyaltyProgram.user_id == current_user.id)
    )
    return result.scalars().all()

@router.get("/summary", response_model=dict)
async def get_loyalty_summary(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    result = await db.execute(
        select(models.LoyaltyProgram)
        .where(models.LoyaltyProgram.user_id == current_user.id)
    )
    programs = result.scalars().all()
    
    summary = {
        "total_value": 0,
        "by_type": {},
        "recommendations": []
    }
    
    for program in programs:
        program_type = str(program.program_type)
        value = float(str(program.currency_value))
        points = float(str(program.points_balance))
        
        summary["total_value"] += value
        
        if program_type in summary["by_type"]:
            summary["by_type"][program_type]["value"] += value
            summary["by_type"][program_type]["points"] += points
        else:
            summary["by_type"][program_type] = {
                "value": value,
                "points": points
            }
        
        # Add recommendations based on points balance
        if points > 50000:
            summary["recommendations"].append({
                "program": str(program.program_name),
                "message": "Consider redeeming points due to high balance"
            })
        elif points < 1000 and value > 0:
            summary["recommendations"].append({
                "program": str(program.program_name),
                "message": "Consider earning more points to reach redemption threshold"
            })
    
    return summary

@router.put("/{program_id}", response_model=schemas.LoyaltyProgram)
async def update_loyalty_program(
    program_id: int,
    program_update: schemas.LoyaltyProgramCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    result = await db.execute(
        select(models.LoyaltyProgram)
        .where(
            models.LoyaltyProgram.id == program_id,
            models.LoyaltyProgram.user_id == current_user.id
        )
    )
    db_program = result.scalar_one_or_none()
    
    if not db_program:
        raise HTTPException(status_code=404, detail="Loyalty program not found")
    
    # Convert numeric values to strings for EncryptedString fields
    update_dict = program_update.dict()
    update_dict["points_balance"] = str(update_dict["points_balance"])
    update_dict["currency_value"] = str(update_dict["currency_value"])
    
    await db.execute(
        update(models.LoyaltyProgram)
        .where(models.LoyaltyProgram.id == program_id)
        .values(
            **update_dict,
            last_updated=datetime.utcnow()
        )
    )
    await db.commit()
    
    # Fetch updated program
    result = await db.execute(
        select(models.LoyaltyProgram)
        .where(models.LoyaltyProgram.id == program_id)
    )
    return result.scalar_one()
