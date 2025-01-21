export interface User {
    id: number;
    email: string;
    base_currency: string;
}

export interface BankAccount {
    id: number;
    user_id: number;
    account_name: string;
    account_type: string;
    institution: string;
    country: string;
    currency: string;
    balance: number;
    last_updated: string;
}

export interface Investment {
    id: number;
    user_id: number;
    symbol: string;
    quantity: number;
    cost_basis: number;
    currency: string;
    last_price: number;
    last_updated: string;
}

export interface LoyaltyProgram {
    id: number;
    user_id: number;
    program_name: string;
    program_type: string;
    points_balance: number;
    currency_value: number;
    last_updated: string;
}

export interface Transaction {
    id: number;
    account_id: number;
    amount: number;
    currency: string;
    description: string;
    category: string;
    timestamp: string;
}
