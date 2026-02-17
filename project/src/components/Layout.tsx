import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, FileText, DollarSign, LogOut } from 'lucide-react';

type Page = 'maintenance' | 'reports' | 'transactions';

type LayoutProps = {
  children: (page: Page) => React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(profile?.role === 'admin' ? 'maintenance' : 'reports');

  const handleSignOut = async () => {
    await signOut();
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Event Management</h1>
            </div>

            <div className="flex items-center space-x-1">
              {isAdmin && (
                <button
                  onClick={() => setCurrentPage('maintenance')}
                  className={`px-4 py-2 rounded-md flex items-center space-x-2 transition ${
                    currentPage === 'maintenance'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Maintenance</span>
                </button>
              )}

              <button
                onClick={() => setCurrentPage('reports')}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 transition ${
                  currentPage === 'reports'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Reports</span>
              </button>

              <button
                onClick={() => setCurrentPage('transactions')}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 transition ${
                  currentPage === 'transactions'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Transactions</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{profile?.full_name}</span>
                <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                  {profile?.role}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-red-600 transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children(currentPage)}
      </main>
    </div>
  );
}
