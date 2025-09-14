import type { User } from './auth';

export type Scope = string;
export type Member = { 
  userId: string; 
  orgId: string; 
  role: string; 
  scopes: string[];
  permissions?: string[];
};

/**
 * Verifica se o usuário tem permissão para uma ação específica
 * @param userPermissions - Lista de permissões do usuário
 * @param required - Permissão ou array de permissões necessárias
 * @returns boolean
 */
export function can(userPermissions: string[] = [], required: Scope | Scope[]): boolean {
  const req = Array.isArray(required) ? required : [required];
  
  return req.every((r) => 
    userPermissions.includes(r) || 
    userPermissions.includes('*') || 
    userPermissions.some((s) => s.endsWith(':*') && r.startsWith(s.slice(0, -2)))
  );
}

/**
 * Verifica permissão granular por módulo/ação/recurso
 * @param userPermissions - Lista de permissões do usuário
 * @param module - Módulo (ex: 'crm', 'finance', 'projects')
 * @param action - Ação (ex: 'view', 'create', 'edit', 'delete')
 * @param resource - Recurso específico (opcional)
 * @returns boolean
 */
export function canAction(
  userPermissions: string[] = [], 
  module: string, 
  action: string, 
  resource?: string
): boolean {
  // Permissão específica: module.action.resource
  if (resource) {
    const specificPermission = `${module}.${action}.${resource}`;
    if (userPermissions.includes(specificPermission)) return true;
  }
  
  // Permissão de módulo: module.action.*
  const modulePermission = `${module}.${action}.*`;
  if (userPermissions.includes(modulePermission)) return true;
  
  // Permissão de ação: module.*
  const actionPermission = `${module}.*`;
  if (userPermissions.includes(actionPermission)) return true;
  
  // Permissão administrativa: *
  if (userPermissions.includes('*')) return true;
  
  return false;
}

/**
 * Verifica se o usuário tem permissão administrativa
 * @param userPermissions - Lista de permissões do usuário
 * @returns boolean
 */
export function isAdmin(userPermissions: string[] = []): boolean {
  return userPermissions.includes('*') || 
         userPermissions.includes('system.admin') ||
         userPermissions.some(p => p.startsWith('system.'));
}

/**
 * Verifica se o usuário pode gerenciar outros usuários
 * @param userPermissions - Lista de permissões do usuário
 * @returns boolean
 */
export function canManageUsers(userPermissions: string[] = []): boolean {
  return canAction(userPermissions, 'users', 'create') ||
         canAction(userPermissions, 'users', 'edit') ||
         canAction(userPermissions, 'users', 'delete') ||
         isAdmin(userPermissions);
}

/**
 * Verifica se o usuário pode gerenciar configurações
 * @param userPermissions - Lista de permissões do usuário
 * @returns boolean
 */
export function canManageSettings(userPermissions: string[] = []): boolean {
  return canAction(userPermissions, 'settings', 'edit') ||
         isAdmin(userPermissions);
}

/**
 * Verifica se o usuário pode visualizar relatórios
 * @param userPermissions - Lista de permissões do usuário
 * @returns boolean
 */
export function canViewReports(userPermissions: string[] = []): boolean {
  return canAction(userPermissions, 'reports', 'view') ||
         canAction(userPermissions, 'reports', 'export') ||
         isAdmin(userPermissions);
}

/**
 * Converte usuário para Member (compatibilidade com código existente)
 * @param user - Usuário autenticado
 * @returns Member
 */
export function userToMember(user: User): Member {
  return {
    userId: user.id,
    orgId: user.orgId,
    role: user.role,
    scopes: user.scopes,
    permissions: user.permissions
  };
}