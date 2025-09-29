'use client';

import { useAuth } from '@/contexts/AuthContext-enhanced';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user } = useAuth();

  console.log('ProtectedLayout: user:', user);
  console.log('ProtectedLayout: user permissions:', user?.permissions);
  console.log('ProtectedLayout: user name:', user?.name);
  console.log('ProtectedLayout: user email:', user?.email);

  return (
    <AuthGuard requireAuth={true}>
      <div className="flex h-screen">
        <Sidebar scopes={user?.permissions || []} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Topbar 
            orgLabel={user?.orgId || ''} 
            roleLabel={user?.role || ''}
            userName={user?.name || ''}
            userEmail={user?.email || ''}
            userAvatar={user?.avatar || ''}
          />
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
