import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Papa from 'papaparse';
import { accountsApi } from '../services/api';

interface ParsedTransaction {
  amount: string;
  description: string;
  category: string;
  currency: string;
}

interface TransactionUploaderProps {
  accountId: number;
  onSuccess: () => void;
}

export const TransactionUploader: React.FC<TransactionUploaderProps> = ({
  accountId,
  onSuccess
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback((file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const transactions = results.data as ParsedTransaction[];
        if (transactions.length === 0) {
          setError('No transactions found in file');
          return;
        }
        
        // Validate required fields
        const hasRequiredFields = transactions.every(tx => 
          tx.amount && tx.description && tx.category && tx.currency
        );
        
        if (!hasRequiredFields) {
          setError('CSV file must include amount, description, category, and currency columns');
          return;
        }

        setParsedTransactions(transactions);
        setError(null);
      },
      error: (error) => {
        setError(`Failed to parse CSV file: ${error.message}`);
      }
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }
    
    processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    processFile(file);
  }, [processFile]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create transactions sequentially to maintain order
      for (const tx of parsedTransactions) {
        await accountsApi.createTransaction(accountId, {
          amount: parseFloat(tx.amount),
          description: tx.description,
          category: tx.category,
          currency: tx.currency,
          account_id: accountId
        });
      }
      
      setParsedTransactions([]);
      onSuccess();
    } catch (err) {
      setError('Failed to create transactions');
      console.error('Transaction creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Drag and drop your CSV file here, or click to select
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors"
            >
              Select File
            </label>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {parsedTransactions.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold">Preview ({parsedTransactions.length} transactions)</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Currency</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedTransactions.slice(0, 5).map((tx, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{tx.amount}</td>
                      <td className="px-4 py-2">{tx.description}</td>
                      <td className="px-4 py-2">{tx.category}</td>
                      <td className="px-4 py-2">{tx.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedTransactions.length > 5 && (
                <p className="mt-2 text-sm text-gray-500">
                  ...and {parsedTransactions.length - 5} more transactions
                </p>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full px-4 py-2 text-white rounded-md transition-colors ${
                isSubmitting
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isSubmitting ? 'Uploading...' : 'Upload Transactions'}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionUploader;
