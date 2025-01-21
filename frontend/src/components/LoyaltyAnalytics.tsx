import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LoyaltyProgram } from '../types';
import { Gift, AlertCircle } from 'lucide-react';

interface LoyaltyAnalyticsProps {
  programs: LoyaltyProgram[];
  baseCurrency: string;
  summary: {
    total_value: number;
    by_type: Record<string, { value: number; points: number }>;
    recommendations: Array<{ program: string; message: string }>;
  };
}

const COLORS = {
  airline: '#0088FE',
  hotel: '#00C49F',
  bank: '#FFBB28'
};

export const LoyaltyAnalytics: React.FC<LoyaltyAnalyticsProps> = ({
  programs,
  summary,
  baseCurrency
}) => {
  // Transform data for the chart
  const chartData = Object.entries(summary.by_type).map(([type, data]) => ({
    name: type,
    value: data.value,
    points: data.points
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Points Value by Program Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${baseCurrency} ${value.toFixed(2)}`} />
                  <Bar dataKey="value" fill="#8884d8">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">{rec.program}</p>
                    <p className="text-sm text-blue-700">{rec.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <Card key={program.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg font-medium">{program.program_name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {program.program_type}
                </p>
              </div>
              <Gift className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Points Balance:</span>
                  <span className="text-lg font-semibold">
                    {program.points_balance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Estimated Value:</span>
                  <span className="text-lg font-semibold text-green-600">
                    {baseCurrency} {program.currency_value.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Value per point: {baseCurrency} {(program.currency_value / program.points_balance).toFixed(4)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
