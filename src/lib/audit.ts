import { createClient } from '@supabase/supabase-js';
import type { AuditLog } from '@/types/database';

// Cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Registra uma ação no log de auditoria
 * @param orgId - ID da organização
 * @param userId - ID do usuário (opcional)
 * @param action - Ação realizada
 * @param tableName - Nome da tabela
 * @param recordId - ID do registro (opcional)
 * @param oldValues - Valores antigos (opcional)
 * @param newValues - Valores novos (opcional)
 * @param ipAddress - Endereço IP (opcional)
 * @param userAgent - User Agent (opcional)
 * @param sessionId - ID da sessão (opcional)
 */
export async function logAuditEvent(
  orgId: string,
  userId?: string,
  action: string,
  tableName: string,
  recordId?: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string,
  sessionId?: string
): Promise<void> {
  try {
    await supabase
      .from('audit_logs')
      .insert({
        org_id: orgId,
        user_id: userId,
        action,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: ipAddress,
        user_agent: userAgent,
        session_id: sessionId
      });
  } catch (error) {
    console.error('Erro ao registrar evento de auditoria:', error);
  }
}

/**
 * Busca logs de auditoria com filtros
 * @param orgId - ID da organização
 * @param filters - Filtros opcionais
 * @param pagination - Paginação
 * @returns Promise<AuditLog[]>
 */
export async function getAuditLogs(
  orgId: string,
  filters?: {
    userId?: string;
    action?: string;
    tableName?: string;
    recordId?: string;
    startDate?: string;
    endDate?: string;
  },
  pagination?: {
    page: number;
    limit: number;
  }
): Promise<AuditLog[]> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.tableName) {
      query = query.eq('table_name', filters.tableName);
    }
    if (filters?.recordId) {
      query = query.eq('record_id', filters.recordId);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Aplicar paginação
    if (pagination) {
      const offset = (pagination.page - 1) * pagination.limit;
      query = query.range(offset, offset + pagination.limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      return [];
    }

    return data as AuditLog[];
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    return [];
  }
}

/**
 * Busca histórico de alterações de um registro específico
 * @param orgId - ID da organização
 * @param tableName - Nome da tabela
 * @param recordId - ID do registro
 * @returns Promise<AuditLog[]>
 */
export async function getRecordHistory(
  orgId: string,
  tableName: string,
  recordId: string
): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('org_id', orgId)
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar histórico do registro:', error);
      return [];
    }

    return data as AuditLog[];
  } catch (error) {
    console.error('Erro ao buscar histórico do registro:', error);
    return [];
  }
}

/**
 * Busca atividades de um usuário específico
 * @param orgId - ID da organização
 * @param userId - ID do usuário
 * @param limit - Limite de registros
 * @returns Promise<AuditLog[]>
 */
export async function getUserActivity(
  orgId: string,
  userId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar atividades do usuário:', error);
      return [];
    }

    return data as AuditLog[];
  } catch (error) {
    console.error('Erro ao buscar atividades do usuário:', error);
    return [];
  }
}

/**
 * Gera relatório de auditoria
 * @param orgId - ID da organização
 * @param startDate - Data inicial
 * @param endDate - Data final
 * @returns Promise<Record<string, any>>
 */
export async function generateAuditReport(
  orgId: string,
  startDate: string,
  endDate: string
): Promise<Record<string, any>> {
  try {
    // Buscar estatísticas gerais
    const { data: generalStats, error: generalError } = await supabase
      .from('audit_logs')
      .select('action, table_name')
      .eq('org_id', orgId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (generalError) {
      console.error('Erro ao gerar relatório de auditoria:', generalError);
      return {};
    }

    // Processar estatísticas
    const stats = {
      totalEvents: generalStats?.length || 0,
      actionsByType: {} as Record<string, number>,
      tablesByActivity: {} as Record<string, number>,
      usersByActivity: {} as Record<string, number>
    };

    // Contar ações por tipo
    generalStats?.forEach(log => {
      stats.actionsByType[log.action] = (stats.actionsByType[log.action] || 0) + 1;
      stats.tablesByActivity[log.table_name] = (stats.tablesByActivity[log.table_name] || 0) + 1;
    });

    // Buscar usuários mais ativos
    const { data: userStats, error: userError } = await supabase
      .from('audit_logs')
      .select('user_id')
      .eq('org_id', orgId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .not('user_id', 'is', null);

    if (!userError && userStats) {
      userStats.forEach(log => {
        if (log.user_id) {
          stats.usersByActivity[log.user_id] = (stats.usersByActivity[log.user_id] || 0) + 1;
        }
      });
    }

    return stats;
  } catch (error) {
    console.error('Erro ao gerar relatório de auditoria:', error);
    return {};
  }
}

/**
 * Limpa logs de auditoria antigos
 * @param orgId - ID da organização
 * @param daysToKeep - Número de dias para manter
 * @returns Promise<number> - Número de registros removidos
 */
export async function cleanupAuditLogs(
  orgId: string,
  daysToKeep: number = 365
): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error } = await supabase
      .from('audit_logs')
      .delete()
      .eq('org_id', orgId)
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      console.error('Erro ao limpar logs de auditoria:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Erro ao limpar logs de auditoria:', error);
    return 0;
  }
}

/**
 * Exporta logs de auditoria para CSV
 * @param orgId - ID da organização
 * @param filters - Filtros opcionais
 * @returns Promise<string> - CSV content
 */
export async function exportAuditLogsToCSV(
  orgId: string,
  filters?: {
    userId?: string;
    action?: string;
    tableName?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<string> {
  try {
    const logs = await getAuditLogs(orgId, filters);

    // Cabeçalho CSV
    const headers = [
      'Data/Hora',
      'Usuário',
      'Ação',
      'Tabela',
      'Registro',
      'Valores Antigos',
      'Valores Novos',
      'IP',
      'User Agent'
    ];

    // Linhas de dados
    const rows = logs.map(log => [
      log.created_at,
      log.user_id || '',
      log.action,
      log.table_name,
      log.record_id || '',
      JSON.stringify(log.old_values || {}),
      JSON.stringify(log.new_values || {}),
      log.ip_address || '',
      log.user_agent || ''
    ]);

    // Combinar cabeçalho e dados
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  } catch (error) {
    console.error('Erro ao exportar logs de auditoria:', error);
    return '';
  }
}

/**
 * Monitora atividades suspeitas
 * @param orgId - ID da organização
 * @param userId - ID do usuário
 * @param timeWindow - Janela de tempo em minutos
 * @param threshold - Limite de ações para considerar suspeito
 * @returns Promise<boolean> - Se há atividade suspeita
 */
export async function detectSuspiciousActivity(
  orgId: string,
  userId: string,
  timeWindow: number = 5, // 5 minutos
  threshold: number = 50 // 50 ações
): Promise<boolean> {
  try {
    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() - timeWindow);

    const { data, error } = await supabase
      .from('audit_logs')
      .select('id')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .gte('created_at', startTime.toISOString());

    if (error) {
      console.error('Erro ao detectar atividade suspeita:', error);
      return false;
    }

    return (data?.length || 0) > threshold;
  } catch (error) {
    console.error('Erro ao detectar atividade suspeita:', error);
    return false;
  }
}
