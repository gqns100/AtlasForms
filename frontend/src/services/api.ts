import axios from 'axios';
import type { BankAccount, Investment, LoyaltyProgram, Transaction } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzQwMDUwNjQyfQ.ztGghXBSwZ84f2EHTFX-WMP21wrR2Xfl22EgHN0wu1A`
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access. Please log in again.');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, base_currency: string) =>
    api.post('/auth/register', { email, password, base_currency }),
};

export const accountsApi = {
  getAccounts: () => api.get<BankAccount[]>('/bank-accounts/'),
  addAccount: (account: Omit<BankAccount, 'id' | 'user_id' | 'last_updated'>) =>
    api.post('/bank-accounts/', account),
  getTransactions: (accountId: number) =>
    api.get<Transaction[]>(`/bank-accounts/${accountId}/transactions/`),
  getMonthlySpending: (accountId: number) =>
    api.get(`/bank-accounts/${accountId}/monthly-spending/`),
  createTransaction: (accountId: number, transaction: Omit<Transaction, 'id' | 'timestamp'>) =>
    api.post(`/bank-accounts/${accountId}/transactions/`, transaction),
};

export const investmentsApi = {
  getInvestments: () => api.get<Investment[]>('/investments/'),
  addInvestment: (investment: Omit<Investment, 'id' | 'user_id' | 'last_price' | 'last_updated'>) =>
    api.post('/investments/', investment),
  getPerformance: (investmentId: number) =>
    api.get(`/investments/${investmentId}/performance/`),
};

export const loyaltyApi = {
  getPrograms: () => api.get<LoyaltyProgram[]>('/loyalty/'),
  addProgram: (program: Omit<LoyaltyProgram, 'id' | 'user_id' | 'last_updated'>) =>
    api.post('/loyalty/', program),
  getSummary: () => api.get('/loyalty/summary/'),
};
