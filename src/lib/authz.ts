import { createClient } from '@supabase/supabase-js';
import type { Permission, Role, RolePermission, UserPermission } from '@/types/database';

export type Scope = string;
export type Member = { 
  userId: string; 
  orgId: string; 
  role: string; 
  scopes: string[];
  permissions?: string[];
};

// Cliente Supabase para consultas de permissões
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
 * Busca permissões do usuário no banco de dados
 * @param userId - ID do usuário
 * @param orgId - ID da organização
 * @returns Promise<string[]> - Lista de permissões
 */
export async function getUserPermissions(userId: string, orgId: string): Promise<string[]> {
  try {
    // Buscar papel do usuário na organização
    const { data: member, error: memberError } = await supabase
      .from('org_members')
      .select('role')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .eq('status', 'active')
      .single();

    if (memberError || !member) {
      return [];
    }

    // Buscar permissões do papel
    const { data: rolePermissions, error: roleError } = await supabase
      .from('role_permissions')
      .select(`
        permissions (
          name
        )
      `)
      .eq('roles.org_id', orgId)
      .eq('roles.name', member.role)
      .eq('roles.is_active', true);

    if (roleError) {
      console.error('Erro ao buscar permissões do papel:', roleError);
      return [];
    }

    // Buscar permissões especiais do usuário
    const { data: userPermissions, error: userError } = await supabase
      .from('user_permissions')
      .select(`
        permissions (
          name
        )
      `)
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .is('expires_at', null)
      .or('expires_at.gt', new Date().toISOString());

    if (userError) {
      console.error('Erro ao buscar permissões especiais:', userError);
    }

    // Combinar permissões
    const permissions = new Set<string>();
    
    // Adicionar permissões do papel
    rolePermissions?.forEach(rp => {
      if (rp.permissions?.name) {
        permissions.add(rp.permissions.name);
      }
    });
    
    // Adicionar permissões especiais do usuário
    userPermissions?.forEach(up => {
      if (up.permissions?.name) {
        permissions.add(up.permissions.name);
      }
    });

    return Array.from(permissions);
  } catch (error) {
    console.error('Erro ao buscar permissões do usuário:', error);
    return [];
  }
}

/**
 * Verifica se o usuário tem permissão para um registro específico
 * @param userPermissions - Lista de permissões do usuário
 * @param module - Módulo
 * @param action - Ação
 * @param record - Registro com org_id e outros campos
 * @param userId - ID do usuário (para verificações de propriedade)
 * @returns boolean
 */
export function canAccessRecord(
  userPermissions: string[] = [],
  module: string,
  action: string,
  record: any,
  userId?: string
): boolean {
  // Verificar permissão básica
  if (!canAction(userPermissions, module, action)) {
    return false;
  }

  // Verificações específicas por módulo
  switch (module) {
    case 'crm':
      // Verificar se o registro pertence à organização do usuário
      // (assumindo que o record tem org_id)
      return true; // Implementar lógica específica se necessário
      
    case 'finance':
      // Verificações específicas para financeiro
      return true;
      
    case 'projects':
      // Verificar se o usuário é membro do projeto ou tem permissão administrativa
      if (record.assigned_to === userId) return true;
      if (canAction(userPermissions, 'projects', 'admin')) return true;
      return false;
      
    default:
      return true;
  }
}

/**
 * Filtra registros baseado nas permissões do usuário
 * @param userPermissions - Lista de permissões do usuário
 * @param module - Módulo
 * @param records - Array de registros
 * @param userId - ID do usuário
 * @returns Array filtrado de registros
 */
export function filterRecordsByPermissions(
  userPermissions: string[] = [],
  module: string,
  records: any[],
  userId?: string
): any[] {
  return records.filter(record => 
    canAccessRecord(userPermissions, module, 'view', record, userId)
  );
}

/**
 * Gera query SQL para filtrar por permissões (para uso em RLS)
 * @param module - Módulo
 * @param action - Ação
 * @param userId - ID do usuário
 * @returns string - Condição SQL
 */
export function generatePermissionFilter(
  module: string,
  action: string,
  userId: string
): string {
  return `
    EXISTS (
      SELECT 1 FROM org_members om
      JOIN role_permissions rp ON rp.role_id = om.role_id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE om.user_id = '${userId}'
        AND om.status = 'active'
        AND p.module = '${module}'
        AND p.action = '${action}'
    )
    OR
    EXISTS (
      SELECT 1 FROM user_permissions up
      JOIN permissions p ON p.id = up.permission_id
      WHERE up.user_id = '${userId}'
        AND up.expires_at IS NULL OR up.expires_at > NOW()
        AND p.module = '${module}'
        AND p.action = '${action}'
    )
  `;
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
