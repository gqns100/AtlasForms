from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, TypeDecorator, LargeBinary
from datetime import datetime
from .database import encrypt_value, decrypt_value
from .db import Base

class EncryptedString(TypeDecorator):
    """Encrypted string type for sensitive data"""
    impl = LargeBinary

    def process_bind_param(self, value, dialect):
        if value is not None:
            return encrypt_value(str(value))
        return None

    def process_result_value(self, value, dialect):
        if value is not None:
            return decrypt_value(value)
        return None

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    base_currency = Column(String, default="USD")

class BankAccount(Base):
    __tablename__ = "bank_accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    account_name = Column(String)
    account_type = Column(String)  # checking, savings, credit
    institution = Column(String)
    country = Column(String)
    currency = Column(String)
    balance = Column(EncryptedString)
    last_updated = Column(DateTime, default=datetime.utcnow)
    encrypted_data = Column(EncryptedString)  # For additional sensitive account details

class Investment(Base):
    __tablename__ = "investments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String)
    quantity = Column(EncryptedString)
    cost_basis = Column(EncryptedString)
    currency = Column(String)
    last_price = Column(EncryptedString)
    last_updated = Column(DateTime, default=datetime.utcnow)
    encrypted_data = Column(EncryptedString)  # For additional sensitive investment details

class LoyaltyProgram(Base):
    __tablename__ = "loyalty_programs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    program_name = Column(String)
    program_type = Column(String)  # airline, hotel, bank
    points_balance = Column(EncryptedString)
    currency_value = Column(EncryptedString)  # estimated value in base currency
    last_updated = Column(DateTime, default=datetime.utcnow)
    encrypted_data = Column(EncryptedString)  # For additional sensitive loyalty details

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("bank_accounts.id"))
    amount = Column(EncryptedString)
    currency = Column(String)
    description = Column(EncryptedString)  # Encrypt description as it may contain sensitive info
    category = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    encrypted_data = Column(EncryptedString)  # For additional sensitive transaction details
