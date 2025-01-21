# Personal Finance Manager Documentation

## API Integration

### External APIs
- **Yahoo Finance API**: Used for real-time financial data
  - Exchange rates for currency conversion
  - Live stock prices for investment tracking
  - Data refresh triggers:
    - Application reload
    - Manual user refresh
    - Background updates every 5 minutes

### Internal API Endpoints

#### Authentication
- `POST /auth/register`: User registration
- `POST /auth/login`: User authentication (30-day JWT token)

#### Bank Accounts
- `GET /bank-accounts/`: List all bank accounts
- `POST /bank-accounts/`: Create new bank account
- `GET /bank-accounts/{id}/transactions/`: Get account transactions
- `GET /bank-accounts/{id}/monthly-spending/`: Get spending breakdown
- `POST /bank-accounts/{id}/transactions/`: Add new transaction

#### Investments
- `GET /investments/`: List all investments
- `POST /investments/`: Add new investment
- `GET /investments/{id}/performance/`: Get investment performance
  - Real-time price updates
  - YTD/MTD returns
  - Volatility detection

#### Loyalty Programs
- `GET /loyalty/`: List all loyalty programs
- `POST /loyalty/`: Add new loyalty program
- `GET /loyalty/summary/`: Get points value analysis
- `PUT /loyalty/{id}`: Update program details

#### Currency
- `GET /currency/convert`: Convert between currencies
- `GET /currency/supported-currencies`: List supported currencies
- `PUT /currency/base-currency`: Update user's base currency

## Database Schema

### User Management
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email STRING UNIQUE,
    hashed_password STRING,
    base_currency STRING DEFAULT "USD"
);
```

### Financial Data
```sql
CREATE TABLE bank_accounts (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    account_name STRING,
    account_type STRING,
    institution STRING,
    country STRING,
    currency STRING,
    balance ENCRYPTED_STRING,
    last_updated DATETIME,
    encrypted_data ENCRYPTED_STRING
);

CREATE TABLE investments (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    symbol STRING,
    quantity ENCRYPTED_STRING,
    cost_basis ENCRYPTED_STRING,
    currency STRING,
    last_price ENCRYPTED_STRING,
    last_updated DATETIME,
    encrypted_data ENCRYPTED_STRING
);

CREATE TABLE loyalty_programs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    program_name STRING,
    program_type STRING,
    points_balance ENCRYPTED_STRING,
    currency_value ENCRYPTED_STRING,
    last_updated DATETIME,
    encrypted_data ENCRYPTED_STRING
);

CREATE TABLE transactions (
    id INTEGER PRIMARY KEY,
    account_id INTEGER REFERENCES bank_accounts(id),
    amount ENCRYPTED_STRING,
    currency STRING,
    description ENCRYPTED_STRING,
    category STRING,
    timestamp DATETIME,
    encrypted_data ENCRYPTED_STRING
);
```

## Encryption Methods

### Data Protection
- **Encryption Algorithm**: Fernet (symmetric encryption)
  - Secure key generation using `cryptography.fernet.Fernet`
  - Automatic key rotation support
  - Built-in timestamp verification

### Sensitive Data Fields
All sensitive data is encrypted using the `EncryptedString` custom type:
- Account balances
- Transaction amounts and descriptions
- Investment quantities and prices
- Loyalty program points and values

### Implementation
```python
class EncryptedString(TypeDecorator):
    impl = LargeBinary

    def process_bind_param(self, value, dialect):
        if value is not None:
            return encrypt_value(str(value))
        return None

    def process_result_value(self, value, dialect):
        if value is not None:
            return decrypt_value(value)
        return None
```

### Security Features
1. **In-Memory Database**
   - SQLite with encryption for development
   - Data encrypted at rest even in memory
   - Automatic cleanup on application shutdown

2. **Access Control**
   - JWT-based authentication
   - 30-day token expiration
   - User-specific data isolation

3. **API Security**
   - CORS protection
   - Rate limiting on market data requests
   - Background job scheduler for price updates

4. **Error Handling**
   - Graceful fallback for API failures
   - Automatic retry with exponential backoff
   - Comprehensive error logging

## Multi-Currency Support

### Currency Conversion
- Real-time exchange rates from Yahoo Finance
- Support for traditional currencies (USD, CNY, HKD, SGD)
- Cryptocurrency support (BTC)
- Caching with 5-minute TTL

### Database Handling
- Base currency stored in user preferences
- Original currency stored with transactions
- Real-time conversion for display
- Historical rate tracking for accurate returns

## Performance Optimization
- Redis caching for exchange rates and stock prices
- Background task scheduler for data updates
- Rate limiting to prevent API abuse
- Efficient database queries with proper indexing
