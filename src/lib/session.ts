import { cookies, headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { ROLE_SCOPES } from '@/lib/roles';
import { getUserPermissions } from '@/lib/authz';
import type { Member, UserSession, TwoFactorAuth, TrustedDevice } from '@/types/database';

// Cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Obtém o membro atual da sessão
 * @returns Promise<Member | null>
 */
export async function getCurrentMember(): Promise<Member | null> {
  const h = headers();
  const c = cookies();
  
  // Em desenvolvimento, usar role do cookie/env
  const cookieRole = c.get('x-role')?.value || h.get('x-role') || process.env.NEXUS_DEV_ROLE || 'admin';
  const role = cookieRole in ROLE_SCOPES ? cookieRole : 'admin';
  
  // Em produção, isso viria do Supabase Auth
  const userId = process.env.NEXUS_DEV_USER_ID || 'dev-user';
  const orgId = process.env.NEXUS_DEV_ORG_ID || 'dev-org';
  
  // Buscar permissões do usuário
  const permissions = await getUserPermissions(userId, orgId);
  
  return {
    userId,
    orgId,
    role,
    scopes: ROLE_SCOPES[role],
    permissions
  };
}

/**
 * Cria uma nova sessão de usuário
 * @param userId - ID do usuário
 * @param orgId - ID da organização
 * @param deviceInfo - Informações do dispositivo
 * @param ipAddress - Endereço IP
 * @param userAgent - User Agent
 * @returns Promise<UserSession | null>
 */
export async function createUserSession(
  userId: string,
  orgId: string,
  deviceInfo?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<UserSession | null> {
  try {
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 dias

    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        org_id: orgId,
        session_token: sessionToken,
        device_info: deviceInfo,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar sessão:', error);
      return null;
    }

    return data as UserSession;
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    return null;
  }
}

/**
 * Valida uma sessão de usuário
 * @param sessionToken - Token da sessão
 * @returns Promise<UserSession | null>
 */
export async function validateUserSession(sessionToken: string): Promise<UserSession | null> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    return data as UserSession;
  } catch (error) {
    console.error('Erro ao validar sessão:', error);
    return null;
  }
}

/**
 * Revoga uma sessão de usuário
 * @param sessionToken - Token da sessão
 * @returns Promise<boolean>
 */
export async function revokeUserSession(sessionToken: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('session_token', sessionToken);

    return !error;
  } catch (error) {
    console.error('Erro ao revogar sessão:', error);
    return false;
  }
}

/**
 * Revoga todas as sessões de um usuário (exceto a atual)
 * @param userId - ID do usuário
 * @param currentSessionToken - Token da sessão atual
 * @returns Promise<boolean>
 */
export async function revokeAllUserSessions(
  userId: string, 
  currentSessionToken?: string
): Promise<boolean> {
  try {
    let query = supabase
      .from('user_sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('revoked_at', null);

    if (currentSessionToken) {
      query = query.neq('session_token', currentSessionToken);
    }

    const { error } = await query;
    return !error;
  } catch (error) {
    console.error('Erro ao revogar sessões:', error);
    return false;
  }
}

/**
 * Configura autenticação de dois fatores para um usuário
 * @param userId - ID do usuário
 * @param method - Método de 2FA ('totp', 'sms', 'email')
 * @param secret - Chave secreta (para TOTP)
 * @returns Promise<TwoFactorAuth | null>
 */
export async function setupTwoFactorAuth(
  userId: string,
  method: 'totp' | 'sms' | 'email',
  secret?: string
): Promise<TwoFactorAuth | null> {
  try {
    const backupCodes = generateBackupCodes();
    
    const { data, error } = await supabase
      .from('two_factor_auth')
      .upsert({
        user_id: userId,
        method,
        secret,
        backup_codes: backupCodes,
        is_enabled: false
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao configurar 2FA:', error);
      return null;
    }

    return data as TwoFactorAuth;
  } catch (error) {
    console.error('Erro ao configurar 2FA:', error);
    return null;
  }
}

/**
 * Habilita autenticação de dois fatores
 * @param userId - ID do usuário
 * @returns Promise<boolean>
 */
export async function enableTwoFactorAuth(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('two_factor_auth')
      .update({ is_enabled: true })
      .eq('user_id', userId);

    return !error;
  } catch (error) {
    console.error('Erro ao habilitar 2FA:', error);
    return false;
  }
}

/**
 * Desabilita autenticação de dois fatores
 * @param userId - ID do usuário
 * @returns Promise<boolean>
 */
export async function disableTwoFactorAuth(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('two_factor_auth')
      .update({ 
        is_enabled: false,
        secret: null,
        backup_codes: []
      })
      .eq('user_id', userId);

    return !error;
  } catch (error) {
    console.error('Erro ao desabilitar 2FA:', error);
    return false;
  }
}

/**
 * Verifica se um dispositivo é confiável
 * @param userId - ID do usuário
 * @param deviceId - ID do dispositivo
 * @returns Promise<boolean>
 */
export async function isTrustedDevice(userId: string, deviceId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('trusted_devices')
      .select('id')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .is('expires_at', null)
      .or('expires_at.gt', new Date().toISOString())
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
}

/**
 * Adiciona um dispositivo confiável
 * @param userId - ID do usuário
 * @param orgId - ID da organização
 * @param deviceId - ID do dispositivo
 * @param deviceName - Nome do dispositivo
 * @param deviceType - Tipo do dispositivo
 * @param ipAddress - Endereço IP
 * @param userAgent - User Agent
 * @returns Promise<TrustedDevice | null>
 */
export async function addTrustedDevice(
  userId: string,
  orgId: string,
  deviceId: string,
  deviceName?: string,
  deviceType?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<TrustedDevice | null> {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365); // 1 ano

    const { data, error } = await supabase
      .from('trusted_devices')
      .insert({
        user_id: userId,
        org_id: orgId,
        device_id: deviceId,
        device_name: deviceName,
        device_type: deviceType,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar dispositivo confiável:', error);
      return null;
    }

    return data as TrustedDevice;
  } catch (error) {
    console.error('Erro ao adicionar dispositivo confiável:', error);
    return null;
  }
}

/**
 * Remove um dispositivo confiável
 * @param userId - ID do usuário
 * @param deviceId - ID do dispositivo
 * @returns Promise<boolean>
 */
export async function removeTrustedDevice(userId: string, deviceId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('trusted_devices')
      .delete()
      .eq('user_id', userId)
      .eq('device_id', deviceId);

    return !error;
  } catch (error) {
    console.error('Erro ao remover dispositivo confiável:', error);
    return false;
  }
}

/**
 * Lista dispositivos confiáveis de um usuário
 * @param userId - ID do usuário
 * @returns Promise<TrustedDevice[]>
 */
export async function getTrustedDevices(userId: string): Promise<TrustedDevice[]> {
  try {
    const { data, error } = await supabase
      .from('trusted_devices')
      .select('*')
      .eq('user_id', userId)
      .is('expires_at', null)
      .or('expires_at.gt', new Date().toISOString())
      .order('last_used_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar dispositivos confiáveis:', error);
      return [];
    }

    return data as TrustedDevice[];
  } catch (error) {
    console.error('Erro ao buscar dispositivos confiáveis:', error);
    return [];
  }
}

/**
 * Atualiza o último uso de um dispositivo confiável
 * @param userId - ID do usuário
 * @param deviceId - ID do dispositivo
 * @returns Promise<boolean>
 */
export async function updateTrustedDeviceLastUsed(
  userId: string, 
  deviceId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('trusted_devices')
      .update({ last_used_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('device_id', deviceId);

    return !error;
  } catch (error) {
    console.error('Erro ao atualizar dispositivo confiável:', error);
    return false;
  }
}

// Funções auxiliares

/**
 * Gera um token de sessão seguro
 * @returns string
 */
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Gera códigos de backup para 2FA
 * @returns string[]
 */
function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Registra um evento de segurança
 * @param orgId - ID da organização
 * @param userId - ID do usuário (opcional)
 * @param eventType - Tipo do evento
 * @param severity - Severidade
 * @param description - Descrição
 * @param metadata - Metadados adicionais
 * @param ipAddress - Endereço IP
 * @param userAgent - User Agent
 */
export async function logSecurityEvent(
  orgId: string,
  userId?: string,
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string,
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await supabase
      .from('security_logs')
      .insert({
        org_id: orgId,
        user_id: userId,
        event_type: eventType,
        severity,
        description,
        metadata,
        ip_address: ipAddress,
        user_agent: userAgent
      });
  } catch (error) {
    console.error('Erro ao registrar evento de segurança:', error);
  }
}
