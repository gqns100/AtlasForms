import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Wallet, TrendingUp, Gift } from 'lucide-react';
import { BankAccount, Investment, LoyaltyProgram } from '../types';

interface AccountOverviewProps {
  bankAccounts: BankAccount[];
  investments: Investment[];
  loyaltyPrograms: LoyaltyProgram[];
  baseCurrency: string;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({
  bankAccounts,
  investments,
  loyaltyPrograms,
  baseCurrency
}) => {
  // Calculate total balances
  const totalBankBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalInvestmentValue = investments.reduce((sum, inv) => 
    sum + (inv.last_price * inv.quantity), 0);
  const totalLoyaltyValue = loyaltyPrograms.reduce((sum, program) => 
    sum + program.currency_value, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bank Accounts</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{baseCurrency} {totalBankBalance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {bankAccounts.length} Active Accounts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Investments</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{baseCurrency} {totalInvestmentValue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {investments.length} Active Positions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Loyalty Programs</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{baseCurrency} {totalLoyaltyValue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {loyaltyPrograms.length} Active Programs
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
