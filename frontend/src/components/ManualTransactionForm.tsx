import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { accountsApi } from '../services/api';

const transactionSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) !== 0, {
    message: "Amount must be a non-zero number",
  }),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  currency: z.string().min(1, "Currency is required"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface ManualTransactionFormProps {
  accountId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ManualTransactionForm: React.FC<ManualTransactionFormProps> = ({
  accountId,
  onSuccess,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      currency: 'USD',
      category: 'General',
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    try {
      await accountsApi.createTransaction(accountId, {
        amount: parseFloat(data.amount),
        description: data.description,
        category: data.category,
        currency: data.currency,
        account_id: accountId,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Failed to create transaction. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              step="0.01"
              {...register('amount')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              {...register('description')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              {...register('category')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="General">General</option>
              <option value="Food">Food</option>
              <option value="Transportation">Transportation</option>
              <option value="Housing">Housing</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Shopping">Shopping</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              {...register('currency')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="USD">USD</option>
              <option value="CNY">CNY</option>
              <option value="HKD">HKD</option>
              <option value="SGD">SGD</option>
            </select>
            {errors.currency && (
              <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualTransactionForm;
