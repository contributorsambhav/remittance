'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { Dashboard } from '@/components/dashboard/dashboard';
import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/contexts/auth-context';
function AppContent() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Connecting...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return <LoginForm />;
  }
  return <Dashboard />;
}
export default function Page() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
