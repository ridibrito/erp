'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { User, Session } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Verificar sessão existente
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted && currentSession?.user) {
          const user: User = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            name: currentSession.user.user_metadata?.name || 'Usuário',
            role: 'user',
            orgId: '00000000-0000-0000-0000-000000000001',
            permissions: [
              'dashboard:view', 
              'user:read', 
              'crm:read', 
              'crm.leads.view',
              'crm.clients.view',
              'crm.clients.create',
              'crm.clients.edit',
              'crm.clients.delete',
              'finance:read',
              'finance.invoices.view',
              'finance.invoices.create',
              'finance.invoices.edit',
              'projects:read',
              'projects.view',
              'projects.create',
              'projects.edit',
              'reports:view',
              'reports.view',
              'reports.export'
            ],
            scopes: ['dashboard', 'profile', 'crm', 'finance', 'projects', 'reports']
          };

          const session: Session = {
            user,
            token: currentSession.access_token,
            expiresAt: new Date(currentSession.expires_at! * 1000)
          };

          setUser(user);
          setSession(session);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
      if (!mounted) return;

      if (supabaseSession?.user) {
        const user: User = {
          id: supabaseSession.user.id,
          email: supabaseSession.user.email || '',
          name: supabaseSession.user.user_metadata?.name || 'Usuário',
          role: 'user',
          orgId: '00000000-0000-0000-0000-000000000001',
          permissions: [
            'dashboard:view', 
            'user:read', 
            'crm:read', 
            'crm.leads.view',
            'crm.clients.view',
            'crm.clients.create',
            'crm.clients.edit',
            'crm.clients.delete',
            'finance:read',
            'finance.invoices.view',
            'finance.invoices.create',
            'finance.invoices.edit',
            'projects:read',
            'projects.view',
            'projects.create',
            'projects.edit',
            'reports:view',
            'reports.view',
            'reports.export'
          ],
          scopes: ['dashboard', 'profile', 'crm', 'finance', 'projects', 'reports']
        };

        const session: Session = {
          user,
          token: supabaseSession.access_token,
          expiresAt: new Date(supabaseSession.expires_at! * 1000)
        };

        setUser(user);
        setSession(session);
      } else {
        setUser(null);
        setSession(null);
      }
      
      setLoading(false);
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') };
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') };
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return;

    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    if (!supabase) return;

    try {
      const { data: { session } } = await supabase.auth.refreshSession();
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'Usuário',
          role: 'user',
          orgId: '00000000-0000-0000-0000-000000000001',
          permissions: [
            'dashboard:view', 
            'user:read', 
            'crm:read', 
            'crm.leads.view',
            'crm.clients.view',
            'crm.clients.create',
            'crm.clients.edit',
            'crm.clients.delete',
            'finance:read',
            'finance.invoices.view',
            'finance.invoices.create',
            'finance.invoices.edit',
            'projects:read',
            'projects.view',
            'projects.create',
            'projects.edit',
            'reports:view',
            'reports.view',
            'reports.export'
          ],
          scopes: ['dashboard', 'profile', 'crm', 'finance', 'projects', 'reports']
        };

        const sessionData: Session = {
          user,
          token: session.access_token,
          expiresAt: new Date(session.expires_at! * 1000)
        };

        setUser(user);
        setSession(sessionData);
      }
    } catch (error) {
      console.error('Erro ao renovar sessão:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
