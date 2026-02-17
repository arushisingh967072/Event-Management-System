import { useState, useEffect } from 'react';
import { supabase, Transaction, Membership } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, Plus } from 'lucide-react';

export default function Transactions() {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      if (data) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = transactions.reduce((sum, t) => {
    return t.transaction_type === 'refund' ? sum - t.amount : sum + t.amount;
  }, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        {profile?.role === 'admin' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Balance</p>
            <p className="text-3xl font-bold text-gray-800">${totalAmount.toFixed(2)}</p>
          </div>
          <DollarSign className="w-12 h-12 text-green-500" />
        </div>
      </div>

      {showAddForm && profile?.role === 'admin' && (
        <AddTransactionForm
          userId={user?.id || ''}
          onSuccess={() => {
            setShowAddForm(false);
            fetchTransactions();
          }}
        />
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.transaction_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.transaction_type === 'payment'
                          ? 'bg-green-100 text-green-800'
                          : transaction.transaction_type === 'refund'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {transaction.transaction_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span
                      className={
                        transaction.transaction_type === 'refund'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }
                    >
                      {transaction.transaction_type === 'refund' ? '-' : '+'}$
                      {transaction.amount.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
}

function AddTransactionForm({
  userId,
  onSuccess,
}: {
  userId: string;
  onSuccess: () => void;
}) {
  const [membershipNumber, setMembershipNumber] = useState('');
  const [transactionType, setTransactionType] = useState<'payment' | 'refund' | 'extension'>(
    'payment'
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [membership, setMembership] = useState<Membership | null>(null);

  const handleSearch = async () => {
    if (!membershipNumber) return;

    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('membership_number', membershipNumber)
        .maybeSingle();

      if (error) throw error;
      setMembership(data);
    } catch (err) {
      console.error('Error finding membership:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || !description) {
      setError('Please fill in all required fields');
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('transactions').insert([
        {
          membership_id: membership?.id || null,
          transaction_type: transactionType,
          amount: Number(amount),
          description,
          transaction_date: new Date().toISOString().split('T')[0],
          created_by: userId,
        },
      ]);

      if (error) throw error;

      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Transaction</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Membership Number (Optional)
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={membershipNumber}
              onChange={(e) => setMembershipNumber(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Leave empty for general transactions"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Find
            </button>
          </div>
          {membership && (
            <p className="text-sm text-green-600 mt-1">
              Found: {membership.full_name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="transactionType"
                value="payment"
                checked={transactionType === 'payment'}
                onChange={(e) =>
                  setTransactionType(e.target.value as 'payment')
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Payment</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="transactionType"
                value="refund"
                checked={transactionType === 'refund'}
                onChange={(e) =>
                  setTransactionType(e.target.value as 'refund')
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Refund</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="transactionType"
                value="extension"
                checked={transactionType === 'extension'}
                onChange={(e) =>
                  setTransactionType(e.target.value as 'extension')
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Extension</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
          <button
            type="button"
            onClick={onSuccess}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
