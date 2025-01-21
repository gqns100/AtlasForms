import React, { useEffect, useState } from 'react';
import { AccountOverview } from './AccountOverview';
import { InvestmentAnalytics } from './InvestmentAnalytics';
import { SpendingAnalytics } from './SpendingAnalytics';
import { LoyaltyAnalytics } from './LoyaltyAnalytics';
import { CurrencySelector } from './CurrencySelector';
import ChangeLogTable from './ChangeLogTable';
import { accountsApi, investmentsApi, loyaltyApi } from '../services/api';
import type { BankAccount, Investment, LoyaltyProgram, Transaction } from '../types';

export const Dashboard: React.FC = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlySpending, setMonthlySpending] = useState<Record<string, number>>({});
  const [performanceData, setPerformanceData] = useState<{
    symbol: string;
    current_price: number;
    total_value: number;
    total_return: number;
    total_return_percentage: number;
    ytd_return_percentage: number;
    mtd_return_percentage: number;
    is_volatile: boolean;
  }[]>([]);
  const [loyaltySummary, setLoyaltySummary] = useState<{
    total_value: number;
    by_type: Record<string, { value: number; points: number }>;
    recommendations: Array<{ program: string; message: string }>;
  }>({
    total_value: 0,
    by_type: {},
    recommendations: []
  });
  const [baseCurrency, setBaseCurrency] = useState<string>("USD");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsRes, investmentsRes, loyaltyRes, loyaltySummaryRes] = await Promise.all([
          accountsApi.getAccounts(),
          investmentsApi.getInvestments(),
          loyaltyApi.getPrograms(),
          loyaltyApi.getSummary()
        ]);

        setBankAccounts(accountsRes.data);
        setInvestments(investmentsRes.data);
        setLoyaltyPrograms(loyaltyRes.data);
        setLoyaltySummary(loyaltySummaryRes.data);

        // Fetch transactions for the first account
        if (accountsRes.data.length > 0) {
          const transactionsRes = await accountsApi.getTransactions(accountsRes.data[0].id);
          setTransactions(transactionsRes.data);
        }

        // Fetch performance data for each investment
        const performancePromises = investmentsRes.data.map(investment =>
          investmentsApi.getPerformance(investment.id)
        );
        const performanceResults = await Promise.all(performancePromises);
        setPerformanceData(performanceResults.map(res => res.data));

        setError(null);
      } catch (err) {
        setError('Failed to fetch account data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCurrencyChange = async (currency: string) => {
    setBaseCurrency(currency);
    // Currency conversion will be handled by the backend
    await fetchData();
  };

  const fetchData = async () => {
    try {
      const [accountsRes, investmentsRes, loyaltyRes, loyaltySummaryRes] = await Promise.all([
        accountsApi.getAccounts(),
        investmentsApi.getInvestments(),
        loyaltyApi.getPrograms(),
        loyaltyApi.getSummary()
      ]);

      setBankAccounts(accountsRes.data);
      setInvestments(investmentsRes.data);
      setLoyaltyPrograms(loyaltyRes.data);
      setLoyaltySummary(loyaltySummaryRes.data);

      // Fetch transactions for the first account
      if (accountsRes.data.length > 0) {
        const transactionsRes = await accountsApi.getTransactions(accountsRes.data[0].id);
        setTransactions(transactionsRes.data);

        // Get monthly spending breakdown
        const spendingRes = await accountsApi.getMonthlySpending(accountsRes.data[0].id);
        setMonthlySpending(spendingRes.data);
      }

      // Fetch performance data for each investment
      const performancePromises = investmentsRes.data.map(investment =>
        investmentsApi.getPerformance(investment.id)
      );
      const performanceResults = await Promise.all(performancePromises);
      setPerformanceData(performanceResults.map(res => res.data));

      setError(null);
    } catch (err) {
      setError('Failed to fetch account data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financial Dashboard</h1>
        <CurrencySelector value={baseCurrency} onChange={handleCurrencyChange} />
      </div>

      <AccountOverview
        bankAccounts={bankAccounts}
        investments={investments}
        loyaltyPrograms={loyaltyPrograms}
        baseCurrency={baseCurrency}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <InvestmentAnalytics
          investments={investments}
          performanceData={performanceData}
          baseCurrency={baseCurrency}
        />
        <SpendingAnalytics
          transactions={transactions}
          monthlySpending={monthlySpending}
          baseCurrency={baseCurrency}
        />
      </div>
      
      <LoyaltyAnalytics
        programs={loyaltyPrograms}
        summary={loyaltySummary}
        baseCurrency={baseCurrency}
      />

      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Account Changes</h2>
        <ChangeLogTable
          bankAccounts={bankAccounts}
          investments={investments}
          loyaltyPrograms={loyaltyPrograms}
          baseCurrency={baseCurrency}
        />
      </div>
    </div>
  );
};
