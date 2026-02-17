import { useState } from 'react';
import { supabase, Membership } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Edit } from 'lucide-react';

type ViewMode = 'add' | 'update';

export default function Maintenance() {
  const { user } = useAuth();
  const [mode, setMode] = useState<ViewMode>('add');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Membership Maintenance</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setMode('add')}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 transition ${
              mode === 'add'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
          <button
            onClick={() => setMode('update')}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 transition ${
              mode === 'update'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>Update Member</span>
          </button>
        </div>
      </div>

      {mode === 'add' ? <AddMemberForm userId={user?.id || ''} /> : <UpdateMemberForm />}
    </div>
  );
}

function AddMemberForm({ userId }: { userId: string }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [duration, setDuration] = useState<'6m' | '1y' | '2y'>('6m');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateEndDate = (startDate: Date, duration: string): string => {
    const end = new Date(startDate);
    switch (duration) {
      case '6m':
        end.setMonth(end.getMonth() + 6);
        break;
      case '1y':
        end.setFullYear(end.getFullYear() + 1);
        break;
      case '2y':
        end.setFullYear(end.getFullYear() + 2);
        break;
    }
    return end.toISOString().split('T')[0];
  };

  const generateMembershipNumber = (): string => {
    return 'M' + Date.now().toString().slice(-8);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !email || !phone) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const membershipNumber = generateMembershipNumber();
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = calculateEndDate(new Date(), duration);

      const { error } = await supabase.from('memberships').insert([
        {
          membership_number: membershipNumber,
          full_name: fullName,
          email,
          phone,
          duration,
          start_date: startDate,
          end_date: endDate,
          status: 'active',
          created_by: userId,
        },
      ]);

      if (error) throw error;

      setSuccess(`Member added successfully! Membership Number: ${membershipNumber}`);
      setFullName('');
      setEmail('');
      setPhone('');
      setDuration('6m');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Member</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Membership Duration <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="duration"
                value="6m"
                checked={duration === '6m'}
                onChange={(e) => setDuration(e.target.value as '6m')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">6 Months</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="duration"
                value="1y"
                checked={duration === '1y'}
                onChange={(e) => setDuration(e.target.value as '1y')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">1 Year</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="duration"
                value="2y"
                checked={duration === '2y'}
                onChange={(e) => setDuration(e.target.value as '2y')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">2 Years</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding Member...' : 'Add Member'}
        </button>
      </form>
    </div>
  );
}

function UpdateMemberForm() {
  const { user } = useAuth();
  const [membershipNumber, setMembershipNumber] = useState('');
  const [membership, setMembership] = useState<Membership | null>(null);
  const [action, setAction] = useState<'extend' | 'cancel'>('extend');
  const [extensionDuration, setExtensionDuration] = useState<'6m' | '1y' | '2y'>('6m');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!membershipNumber) {
      setError('Please enter a membership number');
      return;
    }

    setSearching(true);
    setError('');
    setMembership(null);

    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('membership_number', membershipNumber)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setError('Membership not found');
      } else {
        setMembership(data);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSearching(false);
    }
  };

  const calculateNewEndDate = (currentEndDate: string, duration: string): string => {
    const end = new Date(currentEndDate);
    switch (duration) {
      case '6m':
        end.setMonth(end.getMonth() + 6);
        break;
      case '1y':
        end.setFullYear(end.getFullYear() + 1);
        break;
      case '2y':
        end.setFullYear(end.getFullYear() + 2);
        break;
    }
    return end.toISOString().split('T')[0];
  };

  const handleUpdate = async () => {
    if (!membership) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (action === 'cancel') {
        const { error } = await supabase
          .from('memberships')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', membership.id);

        if (error) throw error;
        setSuccess('Membership cancelled successfully');
      } else {
        const newEndDate = calculateNewEndDate(membership.end_date, extensionDuration);
        const { error } = await supabase
          .from('memberships')
          .update({
            end_date: newEndDate,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', membership.id);

        if (error) throw error;
        setSuccess(`Membership extended successfully until ${newEndDate}`);
      }

      setMembership(null);
      setMembershipNumber('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Update Member</h2>

      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Membership Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={membershipNumber}
              onChange={(e) => setMembershipNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter membership number"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {membership && (
          <div className="border-t pt-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-semibold text-gray-800 mb-2">Member Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {membership.full_name}</p>
                <p><span className="font-medium">Email:</span> {membership.email}</p>
                <p><span className="font-medium">Phone:</span> {membership.phone}</p>
                <p><span className="font-medium">Duration:</span> {membership.duration}</p>
                <p><span className="font-medium">Start Date:</span> {membership.start_date}</p>
                <p><span className="font-medium">End Date:</span> {membership.end_date}</p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      membership.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : membership.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {membership.status}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="action"
                    value="extend"
                    checked={action === 'extend'}
                    onChange={(e) => setAction(e.target.value as 'extend')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Extend Membership</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="action"
                    value="cancel"
                    checked={action === 'cancel'}
                    onChange={(e) => setAction(e.target.value as 'cancel')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Cancel Membership</span>
                </label>
              </div>
            </div>

            {action === 'extend' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extension Duration <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="extensionDuration"
                      value="6m"
                      checked={extensionDuration === '6m'}
                      onChange={(e) => setExtensionDuration(e.target.value as '6m')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">6 Months</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="extensionDuration"
                      value="1y"
                      checked={extensionDuration === '1y'}
                      onChange={(e) => setExtensionDuration(e.target.value as '1y')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">1 Year</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="extensionDuration"
                      value="2y"
                      checked={extensionDuration === '2y'}
                      onChange={(e) => setExtensionDuration(e.target.value as '2y')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">2 Years</span>
                  </label>
                </div>
              </div>
            )}

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Updating...'
                : action === 'extend'
                ? 'Extend Membership'
                : 'Cancel Membership'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
