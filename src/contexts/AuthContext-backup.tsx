'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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

  useEffect(() => {
    // Verificar sessão existente
    checkSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session?.user) {
          await handleAuthChange(session);
        } else {
          setUser(null);
          setSession(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao verificar sessão:', error);
        setLoading(false);
        return;
      }

      if (session) {
        await handleAuthChange(session);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      setLoading(false);
    }
  };

  const handleAuthChange = async (supabaseSession: any) => {
    try {
      // Buscar dados do usuário no nosso sistema
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseSession.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar dados do usuário:', error);
        return;
      }

      // Se não existe perfil, criar um básico
      if (!userData) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: supabaseSession.user.id,
            email: supabaseSession.user.email,
            name: supabaseSession.user.user_metadata?.name || 'Usuário',
            role: 'user',
            org_id: 'default-org', // TODO: Implementar multi-tenancy
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Erro ao criar perfil:', insertError);
          return;
        }
      }

      // Criar objeto de usuário
      const nexusUser: User = {
        id: supabaseSession.user.id,
        email: supabaseSession.user.email || '',
        name: userData?.name || supabaseSession.user.user_metadata?.name || 'Usuário',
        role: userData?.role || 'user',
        orgId: userData?.org_id || 'default-org',
        permissions: userData?.permissions || ['dashboard.view'],
        scopes: userData?.scopes || ['user']
      };

      const nexusSession: Session = {
        user: nexusUser,
        token: supabaseSession.access_token,
        expiresAt: new Date(supabaseSession.expires_at! * 1000)
      };

      setUser(nexusUser);
      setSession(nexusSession);
    } catch (error) {
      console.error('Erro ao processar mudança de autenticação:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
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
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Erro ao renovar sessão:', error);
        return;
      }

      if (data.session) {
        await handleAuthChange(data.session);
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
    refreshSession
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
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
