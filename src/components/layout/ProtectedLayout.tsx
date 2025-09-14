'use client';

import { useAuth } from '@/contexts/AuthContext-simple';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <div className="flex h-screen">
      <Sidebar scopes={user.permissions || []} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          orgLabel={user.orgId} 
          roleLabel={user.role}
          userName={user.name}
          userEmail={user.email}
        />
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
