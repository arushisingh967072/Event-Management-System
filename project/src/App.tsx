import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Transactions from './pages/Transactions';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return authView === 'login' ? (
      <Login onSwitchToSignup={() => setAuthView('signup')} />
    ) : (
      <Signup onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <Layout>
      {(page) => {
        if (page === 'maintenance' && profile.role === 'admin') {
          return <Maintenance />;
        }
        if (page === 'reports') {
          return <Reports />;
        }
        if (page === 'transactions') {
          return <Transactions />;
        }
        return <Reports />;
      }}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
