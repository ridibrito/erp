'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  User, 
  Session, 
  AuthError, 
  SignUpData, 
  SignInData, 
  UserProfile,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getCurrentSession,
  refreshSession,
  updateProfile,
  resetPassword,
  updatePassword,
  hasPermission,
  hasScope,
  hasRole,
  isAuthenticated,
  supabase
} from '@/lib/auth-enhanced';

interface AuthContextType {
  // Estado
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;

  // Autenticação
  signIn: (data: SignInData) => Promise<{ error: AuthError | null }>;
  signUp: (data: SignUpData) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<{ error: AuthError | null }>;

  // Perfil
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;

  // Permissões
  hasPermission: (permission: string) => boolean;
  hasScope: (scope: string) => boolean;
  hasRole: (role: string) => boolean;
  isAuthenticated: () => Promise<boolean>;

  // Utilitários
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Função para limpar erros
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Função para atualizar estado do usuário
  const updateUserState = useCallback(async () => {
    try {
      console.log('AuthContext: Atualizando estado do usuário...');
      const currentUser = await getCurrentUser();
      const currentSession = await getCurrentSession();
      
      console.log('AuthContext: Usuário atual:', currentUser?.email);
      console.log('AuthContext: Sessão atual:', currentSession ? 'existe' : 'não existe');
      
      setUser(currentUser);
      setSession(currentSession);
      
      // Se não há usuário nem sessão, garantir que o loading seja finalizado
      if (!currentUser && !currentSession) {
        console.log('AuthContext: Nenhum usuário/sessão encontrado, finalizando loading');
      }
    } catch (error) {
      console.error('Erro ao atualizar estado do usuário:', error);
      setUser(null);
      setSession(null);
    }
  }, []);

  // Inicializar autenticação
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Inicializando autenticação...');
        setLoading(true);
        
        // Aguardar um pouco para garantir que o Supabase esteja pronto
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await updateUserState();
        console.log('AuthContext: Autenticação inicializada');
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        if (mounted) {
          console.log('AuthContext: Finalizando loading na inicialização...');
          setLoading(false);
        }
      }
    };

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, supabaseSession?.user?.email);

      switch (event) {
        case 'SIGNED_IN':
          console.log('AuthContext: Usuário logado, atualizando estado...');
          await updateUserState();
          break;
        case 'SIGNED_OUT':
          console.log('AuthContext: Usuário deslogado, limpando estado...');
          setUser(null);
          setSession(null);
          break;
        case 'TOKEN_REFRESHED':
          console.log('AuthContext: Token renovado, atualizando estado...');
          await updateUserState();
          break;
        case 'USER_UPDATED':
          console.log('AuthContext: Usuário atualizado, atualizando estado...');
          // Aguardar um pouco para garantir que a atualização foi processada
          setTimeout(async () => {
            await updateUserState();
          }, 500);
          break;
        case 'INITIAL_SESSION':
          console.log('AuthContext: Sessão inicial, atualizando estado...');
          await updateUserState();
          break;
        default:
          console.log('AuthContext: Evento não tratado:', event);
          break;
      }

      // Sempre finalizar loading após qualquer evento
      if (mounted) {
        console.log('AuthContext: Finalizando loading após evento:', event);
        setLoading(false);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateUserState]);

  // Função de login
  const handleSignIn = useCallback(async (data: SignInData) => {
    try {
      console.log('AuthContext: Iniciando login...');
      setLoading(true);
      setError(null);

      const result = await signIn(data);

      if (result.error) {
        console.error('AuthContext: Erro no login:', result.error);
        setError(result.error);
        setLoading(false);
        return { error: result.error };
      }

      console.log('AuthContext: Login bem-sucedido, aguardando atualização do estado...');
      // O estado será atualizado pelo onAuthStateChange
      return { error: null };
    } catch (error) {
      console.error('AuthContext: Erro no login:', error);
      const authError: AuthError = { message: 'Erro interno do servidor' };
      setError(authError);
      setLoading(false);
      return { error: authError };
    }
  }, []);

  // Função de registro
  const handleSignUp = useCallback(async (data: SignUpData) => {
    try {
      setLoading(true);
      setError(null);

      const { user: newUser, error: signUpError } = await signUp(data);

      if (signUpError) {
        setError(signUpError);
        return { error: signUpError };
      }

      if (newUser) {
        setUser(newUser);
      }

      return { error: null };
    } catch (error) {
      const authError: AuthError = { message: 'Erro interno do servidor' };
      setError(authError);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  }, []);

  // Função de logout
  const handleSignOut = useCallback(async () => {
    try {
      console.log('AuthContext: Iniciando logout...');
      setLoading(true);
      setError(null);

      const { error: signOutError } = await signOut();

      if (signOutError) {
        console.error('AuthContext: Erro no logout:', signOutError);
        setError(signOutError);
        return { error: signOutError };
      }

      console.log('AuthContext: Logout realizado com sucesso');
      setUser(null);
      setSession(null);

      return { error: null };
    } catch (error) {
      console.error('AuthContext: Erro no logout:', error);
      const authError: AuthError = { message: 'Erro interno do servidor' };
      setError(authError);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para renovar sessão
  const handleRefreshSession = useCallback(async () => {
    try {
      setError(null);

      const { session: newSession, error: refreshError } = await refreshSession();

      if (refreshError) {
        setError(refreshError);
        return { error: refreshError };
      }

      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
      }

      return { error: null };
    } catch (error) {
      const authError: AuthError = { message: 'Erro interno do servidor' };
      setError(authError);
      return { error: authError };
    }
  }, []);

  // Função para atualizar perfil
  const handleUpdateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      setError(null);

      const { user: updatedUser, error: updateError } = await updateProfile(updates);

      if (updateError) {
        setError(updateError);
        return { error: updateError };
      }

      if (updatedUser) {
        setUser(updatedUser);
      }

      return { error: null };
    } catch (error) {
      const authError: AuthError = { message: 'Erro interno do servidor' };
      setError(authError);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para redefinir senha
  const handleResetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: resetError } = await resetPassword(email);

      if (resetError) {
        setError(resetError);
        return { error: resetError };
      }

      return { error: null };
    } catch (error) {
      const authError: AuthError = { message: 'Erro interno do servidor' };
      setError(authError);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para atualizar senha
  const handleUpdatePassword = useCallback(async (newPassword: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await updatePassword(newPassword);

      if (updateError) {
        setError(updateError);
        return { error: updateError };
      }

      return { error: null };
    } catch (error) {
      const authError: AuthError = { message: 'Erro interno do servidor' };
      setError(authError);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  }, []);

  // Funções de verificação de permissões
  const checkPermission = useCallback((permission: string) => {
    return user ? hasPermission(user, permission) : false;
  }, [user]);

  const checkScope = useCallback((scope: string) => {
    return user ? hasScope(user, scope) : false;
  }, [user]);

  const checkRole = useCallback((role: string) => {
    return user ? hasRole(user, role) : false;
  }, [user]);

  const checkAuthenticated = useCallback(async () => {
    return await isAuthenticated();
  }, []);

  const value: AuthContextType = {
    // Estado
    user,
    session,
    loading,
    error,

    // Autenticação
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshSession: handleRefreshSession,

    // Perfil
    updateProfile: handleUpdateProfile,
    resetPassword: handleResetPassword,
    updatePassword: handleUpdatePassword,

    // Permissões
    hasPermission: checkPermission,
    hasScope: checkScope,
    hasRole: checkRole,
    isAuthenticated: checkAuthenticated,

    // Utilitários
    clearError,
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

// Hook para verificar se usuário está autenticado
export function useRequireAuth() {
  const { user, loading } = useAuth();
  
  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}

// Hook para verificar permissões
export function usePermissions() {
  const { user, hasPermission, hasScope, hasRole } = useAuth();
  
  return {
    user,
    hasPermission,
    hasScope,
    hasRole,
    isAuthenticated: !!user,
  };
}
