'use client';

import { useAuth } from '@/contexts/AuthContext-enhanced';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  console.log('AuthGuard: requireAuth=', requireAuth, 'user=', user?.email, 'loading=', loading);

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        console.log('AuthGuard: Usuário não autenticado, redirecionando para:', redirectTo);
        router.push(redirectTo);
      } else if (!requireAuth && user) {
        console.log('AuthGuard: Usuário já autenticado, redirecionando para dashboard');
        router.push('/dashboard');
      }
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Renderizar conteúdo baseado na lógica de autenticação
  if (requireAuth) {
    // Para páginas que requerem autenticação
    if (user) {
      console.log('AuthGuard: Renderizando conteúdo protegido');
      return <>{children}</>;
    } else {
      console.log('AuthGuard: Não renderizando - usuário não autenticado');
      return null; // Será redirecionado pelo useEffect
    }
  } else {
    // Para páginas que não requerem autenticação (login, register, etc.)
    if (!user) {
      console.log('AuthGuard: Renderizando conteúdo público');
      return <>{children}</>;
    } else {
      console.log('AuthGuard: Não renderizando - usuário já autenticado');
      return null; // Será redirecionado pelo useEffect
    }
  }
}
