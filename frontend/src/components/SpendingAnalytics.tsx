import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Transaction } from '../types';

interface SpendingAnalyticsProps {
  transactions: Transaction[];
  monthlySpending: Record<string, number>;
  baseCurrency: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const SpendingAnalytics: React.FC<SpendingAnalyticsProps> = ({
  transactions,
  monthlySpending,
  baseCurrency
}) => {
  // Transform spending data for the chart
  const spendingData = Object.entries(monthlySpending).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  // Calculate total spending
  const totalSpending = Object.values(monthlySpending).reduce((sum, amount) => sum + amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {spendingData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: ValueType) => {
                      if (typeof value === 'number') {
                        return `${baseCurrency} ${value.toFixed(2)}`;
                      }
                      return value;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {spendingData.map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm font-medium">{baseCurrency} {category.value.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(category.value / totalSpending * 100)}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(category.value / totalSpending * 100).toFixed(1)}% of total spending
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Last {transactions.slice(0, 5).length} transactions
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{baseCurrency} {totalSpending.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Total Monthly Spending</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center py-3 border-b">
                <div className="space-y-1">
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full mr-2" 
                      style={{
                        backgroundColor: COLORS[
                          spendingData.findIndex(cat => cat.name === transaction.category) % COLORS.length
                        ]
                      }}
                    />
                    {transaction.category}
                  </div>
                </div>
                <div>
                  <div className={`text-lg font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.amount < 0 ? '-' : '+'}{baseCurrency} {Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
