'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext-enhanced';
import { User } from '@/lib/auth-enhanced';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredScopes?: string[];
  requiredRoles?: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredScopes = [],
  requiredRoles = [],
  fallback,
  redirectTo = '/403'
}: ProtectedRouteProps) {
  const { user, loading, hasPermission, hasScope, hasRole } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    // Se não há usuário, redirecionar para login
    if (!user) {
      router.push('/login');
      return;
    }

    // Verificar permissões
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      hasPermission(permission)
    );

    // Verificar escopos
    const hasRequiredScopes = requiredScopes.every(scope =>
      hasScope(scope)
    );

    // Verificar papéis
    const hasRequiredRoles = requiredRoles.every(role =>
      hasRole(role)
    );

    const authorized = hasRequiredPermissions && hasRequiredScopes && hasRequiredRoles;

    if (!authorized) {
      router.push(redirectTo);
      return;
    }

    setIsAuthorized(true);
    setChecking(false);
  }, [user, loading, requiredPermissions, requiredScopes, requiredRoles, hasPermission, hasScope, hasRole, router, redirectTo]);

  // Mostrar loading enquanto verifica
  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se não autorizado, mostrar fallback ou nada
  if (!isAuthorized) {
    return fallback || null;
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
}

// Componente para verificar permissão específica
interface RequirePermissionProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}

export function RequirePermission({ children, permission, fallback }: RequirePermissionProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Componente para verificar escopo específico
interface RequireScopeProps {
  children: React.ReactNode;
  scope: string;
  fallback?: React.ReactNode;
}

export function RequireScope({ children, scope, fallback }: RequireScopeProps) {
  const { hasScope } = useAuth();

  if (!hasScope(scope)) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Componente para verificar papel específico
interface RequireRoleProps {
  children: React.ReactNode;
  role: string;
  fallback?: React.ReactNode;
}

export function RequireRole({ children, role, fallback }: RequireRoleProps) {
  const { hasRole } = useAuth();

  if (!hasRole(role)) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Hook para verificar se usuário pode acessar rota
export function useCanAccess(permissions: string[] = [], scopes: string[] = [], roles: string[] = []) {
  const { user, hasPermission, hasScope, hasRole } = useAuth();

  if (!user) return false;

  const hasRequiredPermissions = permissions.every(permission =>
    hasPermission(permission)
  );

  const hasRequiredScopes = scopes.every(scope =>
    hasScope(scope)
  );

  const hasRequiredRoles = roles.every(role =>
    hasRole(role)
  );

  return hasRequiredPermissions && hasRequiredScopes && hasRequiredRoles;
}

// Hook para obter permissões do usuário
export function useUserPermissions() {
  const { user } = useAuth();

  return {
    permissions: user?.permissions || [],
    scopes: user?.scopes || [],
    role: user?.role || '',
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
  };
}
