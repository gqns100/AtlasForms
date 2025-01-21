import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Investment } from '../types';
import { AlertTriangle } from 'lucide-react';

interface InvestmentAnalyticsProps {
  investments: Investment[];
  baseCurrency: string;
  performanceData: {
    symbol: string;
    current_price: number;
    total_value: number;
    total_return: number;
    total_return_percentage: number;
    ytd_return_percentage: number;
    mtd_return_percentage: number;
    is_volatile: boolean;
  }[];
}

export const InvestmentAnalytics: React.FC<InvestmentAnalyticsProps> = ({
  investments,
  performanceData,
  baseCurrency
}) => {
  // Transform data for the chart and calculate investment values
  const chartData = performanceData.map(data => {
    const investment = investments.find(inv => inv.symbol === data.symbol);
    const quantity = investment ? parseFloat(String(investment.quantity)) : 0;
    return {
      name: data.symbol,
      'YTD Return': data.ytd_return_percentage,
      'MTD Return': data.mtd_return_percentage,
      'Quantity': quantity
    };
  });

  // Filter volatile investments for alerts
  const volatileInvestments = performanceData.filter(data => data.is_volatile);
  
  return (
    <div className="space-y-6">
      {volatileInvestments.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Volatile Price Movements Detected
              </p>
              <ul className="mt-2 text-sm text-yellow-700">
                {volatileInvestments.map((inv) => (
                  <li key={inv.symbol}>
                    {inv.symbol}: {inv.total_return_percentage >= 0 ? '+' : ''}{inv.total_return_percentage.toFixed(2)}% change
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Investment Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="YTD Return" 
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="MTD Return" 
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {performanceData.map((data, index) => (
          <Card key={`${data.symbol}-${index}`} className={data.is_volatile ? 'border-yellow-400' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg font-medium">{data.symbol}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Current Value: {data.total_value > 0 ? 
                    `${baseCurrency} ${data.total_value.toFixed(2)}` : 
                    'Loading...'}
                </p>
              </div>
              {data.is_volatile && (
                <div className="tooltip" title="High volatility detected">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current Price:</span>
                  <span className="text-lg font-semibold">{baseCurrency} {data.current_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Return:</span>
                  <span className={`text-lg font-semibold ${data.total_return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.total_return_percentage >= 0 ? '+' : ''}{data.total_return_percentage.toFixed(2)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium block">YTD Return</span>
                    <span className={`text-base font-semibold ${data.ytd_return_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.ytd_return_percentage >= 0 ? '+' : ''}{data.ytd_return_percentage.toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium block">MTD Return</span>
                    <span className={`text-base font-semibold ${data.mtd_return_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.mtd_return_percentage >= 0 ? '+' : ''}{data.mtd_return_percentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
