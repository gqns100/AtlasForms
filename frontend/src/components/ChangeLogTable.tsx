import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TransactionUploader } from './TransactionUploader';
import { ManualTransactionForm } from './ManualTransactionForm';
import type { BankAccount, Investment, LoyaltyProgram } from '../types';

interface ChangeLogTableProps {
  bankAccounts: BankAccount[];
  investments: Investment[];
  loyaltyPrograms: LoyaltyProgram[];
  baseCurrency: string;
}

type AccountType = 'bank' | 'investment' | 'loyalty';

interface TableRow {
  id: number;
  type: AccountType;
  name: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

const ChangeLogTable: React.FC<ChangeLogTableProps> = ({
  bankAccounts,
  investments,
  loyaltyPrograms,
  baseCurrency
}) => {
  const [filter, setFilter] = useState<AccountType | 'all'>('all');
  const [sortField, setSortField] = useState<keyof TableRow>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showUploader, setShowUploader] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

  // Transform data into unified format
  const tableData: TableRow[] = [
    ...bankAccounts.map(account => ({
      id: account.id,
      type: 'bank' as AccountType,
      name: account.account_name,
      balance: account.balance,
      currency: account.currency,
      lastUpdated: account.last_updated
    })),
    ...investments.map(investment => ({
      id: investment.id,
      type: 'investment' as AccountType,
      name: investment.symbol,
      balance: investment.last_price * investment.quantity,
      currency: investment.currency,
      lastUpdated: investment.last_updated
    })),
    ...loyaltyPrograms.map(program => ({
      id: program.id,
      type: 'loyalty' as AccountType,
      name: program.program_name,
      balance: program.currency_value,
      currency: baseCurrency,
      lastUpdated: program.last_updated
    }))
  ];

  // Filter data based on selected type
  const filteredData = filter === 'all' 
    ? tableData 
    : tableData.filter(row => row.type === filter);

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === 'asc' ? 1 : -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * direction;
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * direction;
    }
    return 0;
  });

  const handleSort = (field: keyof TableRow) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getTypeColor = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return 'bg-blue-100 text-blue-800';
      case 'investment':
        return 'bg-green-100 text-green-800';
      case 'loyalty':
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Account Changes</CardTitle>
          <div className="flex gap-2">
            <button
              className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              onClick={() => setShowUploader(true)}
            >
              Upload Transactions
            </button>
            <button
              className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              onClick={() => setShowManualEntry(true)}
            >
              Manual Entry
            </button>
            {showUploader && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg w-full max-w-2xl">
                  <TransactionUploader
                    accountId={selectedAccountId || bankAccounts[0]?.id}
                    onSuccess={() => {
                      setShowUploader(false);
                      // Trigger refresh of account data
                      window.location.reload();
                    }}
                  />
                  <button
                    onClick={() => setShowUploader(false)}
                    className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            {showManualEntry && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg w-full max-w-2xl">
                  <ManualTransactionForm
                    accountId={selectedAccountId || bankAccounts[0]?.id}
                    onSuccess={() => {
                      setShowManualEntry(false);
                      // Trigger refresh of account data
                      window.location.reload();
                    }}
                    onCancel={() => setShowManualEntry(false)}
                  />
                </div>
              </div>
            )}
            <select
              className="rounded-md border border-gray-300 px-3 py-1"
              value={filter}
              onChange={(e) => setFilter(e.target.value as AccountType | 'all')}
            >
              <option value="all">All Accounts</option>
              <option value="bank">Bank Accounts</option>
              <option value="investment">Investments</option>
              <option value="loyalty">Loyalty Programs</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th 
                  className="px-4 py-2 text-left cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('type')}
                >
                  Type
                  {sortField === 'type' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-4 py-2 text-left cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('name')}
                >
                  Name
                  {sortField === 'name' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-4 py-2 text-right cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('balance')}
                >
                  Balance/Value
                  {sortField === 'balance' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-4 py-2 text-left cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('lastUpdated')}
                >
                  Last Updated
                  {sortField === 'lastUpdated' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row) => (
                <tr 
                  key={`${row.type}-${row.id}`} 
                  className={`border-b hover:bg-gray-50 cursor-pointer ${
                    row.type === 'bank' && row.id === selectedAccountId ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (row.type === 'bank') {
                      setSelectedAccountId(row.id);
                      setShowUploader(true);
                    }
                  }}
                >
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(row.type)}`}>
                      {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2">{row.name}</td>
                  <td className="px-4 py-2 text-right">
                    {row.currency} {row.balance.toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(row.lastUpdated).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChangeLogTable;
