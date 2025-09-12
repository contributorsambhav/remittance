'use client';

import { LogOut, Shield, User } from 'lucide-react';

import { AdminDashboard } from './admin-dashboard';
import { Button } from '@/components/ui/button';
import { UserDashboard } from './user-dashboard';
import { useAuth } from '@/contexts/auth-context';
import { useDisconnect } from 'wagmi';
export function Dashboard() {
  const { user, logout } = useAuth();
  const { disconnect } = useDisconnect();
  console.log('Dashboard rendering with user:', user);
  if (!user) return null;
  const handleLogout = async () => {
    try {
      if (user.isConnected) {
        await disconnect();
      }
      logout();
    } catch (error) {
      console.error('Logout failed:', error);
      logout();
    }
  };
  const formatAddress = (addr: string) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">{user.role === 'admin' ? <Shield className="h-6 w-6 text-white" /> : <User className="h-6 w-6 text-white" />}</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user.role === 'admin' ? 'Admin' : 'User'} Dashboard</h1>
                <p className="text-sm text-gray-600 font-mono">{formatAddress(user.address)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${user.isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-600">{user.isConnected ? 'Wallet Connected' : 'Demo Mode'}</span>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm" className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Dashboard Content */}
      <main>{user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}</main>
    </div>
  );
}
