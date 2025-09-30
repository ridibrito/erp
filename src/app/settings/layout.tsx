'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/contexts/AuthContext-enhanced';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <AuthGuard requireAuth={true}>
      <SidebarProvider>
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
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}

