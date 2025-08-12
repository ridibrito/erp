import { createClient } from '@supabase/supabase-js';
import type { DataConsent, DataSubjectRequest, DataProcessingLog } from '@/types/database';

// Cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Registra consentimento do usuário
 * @param orgId - ID da organização
 * @param userId - ID do usuário
 * @param purpose - Finalidade do processamento
 * @param legalBasis - Base legal
 * @param consentGiven - Se o consentimento foi dado
 * @param ipAddress - Endereço IP
 * @param userAgent - User Agent
 */
export async function recordDataConsent(
  orgId: string,
  userId: string,
  purpose: string,
  legalBasis: 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation' | 'vital_interest' | 'public_interest',
  consentGiven: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await supabase
      .from('data_consents')
      .insert({
        org_id: orgId,
        user_id: userId,
        purpose,
        legal_basis: legalBasis,
        consent_given: consentGiven,
        ip_address: ipAddress,
        user_agent: userAgent
      });
  } catch (error) {
    console.error('Erro ao registrar consentimento:', error);
  }
}

/**
 * Verifica se o usuário deu consentimento para uma finalidade
 * @param orgId - ID da organização
 * @param userId - ID do usuário
 * @param purpose - Finalidade
 * @returns Promise<boolean>
 */
export async function hasDataConsent(
  orgId: string,
  userId: string,
  purpose: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('data_consents')
      .select('consent_given')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .eq('purpose', purpose)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return false;
    }

    return data.consent_given;
  } catch (error) {
    console.error('Erro ao verificar consentimento:', error);
    return false;
  }
}

/**
 * Cria uma solicitação do titular dos dados (DSR)
 * @param orgId - ID da organização
 * @param userId - ID do usuário
 * @param requestType - Tipo da solicitação
 * @param notes - Observações
 * @returns Promise<DataSubjectRequest | null>
 */
export async function createDataSubjectRequest(
  orgId: string,
  userId: string,
  requestType: 'export' | 'delete' | 'rectify' | 'portability',
  notes?: string
): Promise<DataSubjectRequest | null> {
  try {
    const { data, error } = await supabase
      .from('data_subject_requests')
      .insert({
        org_id: orgId,
        user_id: userId,
        request_type: requestType,
        status: 'pending',
        notes
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar solicitação DSR:', error);
      return null;
    }

    return data as DataSubjectRequest;
  } catch (error) {
    console.error('Erro ao criar solicitação DSR:', error);
    return null;
  }
}

/**
 * Processa uma solicitação do titular dos dados
 * @param requestId - ID da solicitação
 * @param processedBy - ID do usuário que processou
 * @param status - Novo status
 * @param data - Dados processados (para export/portability)
 * @param notes - Observações
 * @returns Promise<boolean>
 */
export async function processDataSubjectRequest(
  requestId: string,
  processedBy: string,
  status: 'processing' | 'completed' | 'rejected',
  data?: Record<string, any>,
  notes?: string
): Promise<boolean> {
  try {
    const updateData: any = {
      status,
      processed_by: processedBy,
      processed_at: new Date().toISOString()
    };

    if (data) {
      updateData.data = data;
    }
    if (notes) {
      updateData.notes = notes;
    }

    const { error } = await supabase
      .from('data_subject_requests')
      .update(updateData)
      .eq('id', requestId);

    return !error;
  } catch (error) {
    console.error('Erro ao processar solicitação DSR:', error);
    return false;
  }
}

/**
 * Busca solicitações do titular dos dados
 * @param orgId - ID da organização
 * @param filters - Filtros opcionais
 * @returns Promise<DataSubjectRequest[]>
 */
export async function getDataSubjectRequests(
  orgId: string,
  filters?: {
    userId?: string;
    requestType?: string;
    status?: string;
  }
): Promise<DataSubjectRequest[]> {
  try {
    let query = supabase
      .from('data_subject_requests')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.requestType) {
      query = query.eq('request_type', filters.requestType);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar solicitações DSR:', error);
      return [];
    }

    return data as DataSubjectRequest[];
  } catch (error) {
    console.error('Erro ao buscar solicitações DSR:', error);
    return [];
  }
}

/**
 * Exporta dados pessoais do usuário
 * @param orgId - ID da organização
 * @param userId - ID do usuário
 * @returns Promise<Record<string, any>>
 */
export async function exportUserData(
  orgId: string,
  userId: string
): Promise<Record<string, any>> {
  try {
    const exportData: Record<string, any> = {
      user_info: {},
      consents: [],
      activities: [],
      settings: {}
    };

    // Buscar informações básicas do usuário
    const { data: userData, error: userError } = await supabase
      .from('org_members')
      .select('*')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .single();

    if (!userError && userData) {
      exportData.user_info = userData;
    }

    // Buscar consentimentos
    const { data: consents, error: consentsError } = await supabase
      .from('data_consents')
      .select('*')
      .eq('org_id', orgId)
      .eq('user_id', userId);

    if (!consentsError && consents) {
      exportData.consents = consents;
    }

    // Buscar atividades (logs de auditoria)
    const { data: activities, error: activitiesError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('org_id', orgId)
      .eq('user_id', userId);

    if (!activitiesError && activities) {
      exportData.activities = activities;
    }

    // Buscar configurações do usuário
    const { data: settings, error: settingsError } = await supabase
      .from('tenant_settings')
      .select('*')
      .eq('org_id', orgId)
      .like('key', `user.${userId}.%`);

    if (!settingsError && settings) {
      exportData.settings = settings;
    }

    return exportData;
  } catch (error) {
    console.error('Erro ao exportar dados do usuário:', error);
    return {};
  }
}

/**
 * Remove dados pessoais do usuário (anonymization)
 * @param orgId - ID da organização
 * @param userId - ID do usuário
 * @returns Promise<boolean>
 */
export async function anonymizeUserData(
  orgId: string,
  userId: string
): Promise<boolean> {
  try {
    // Anonimizar dados do usuário em várias tabelas
    const tablesToAnonymize = [
      'org_members',
      'user_sessions',
      'audit_logs',
      'security_logs',
      'data_consents',
      'data_processing_logs'
    ];

    for (const table of tablesToAnonymize) {
      const { error } = await supabase
        .from(table)
        .update({
          user_id: `anonymized_${userId}_${Date.now()}`
        })
        .eq('org_id', orgId)
        .eq('user_id', userId);

      if (error) {
        console.error(`Erro ao anonimizar tabela ${table}:`, error);
      }
    }

    // Remover dados sensíveis específicos
    await supabase
      .from('two_factor_auth')
      .delete()
      .eq('user_id', userId);

    await supabase
      .from('trusted_devices')
      .delete()
      .eq('user_id', userId);

    await supabase
      .from('oauth_connections')
      .delete()
      .eq('user_id', userId);

    return true;
  } catch (error) {
    console.error('Erro ao anonimizar dados do usuário:', error);
    return false;
  }
}

/**
 * Registra atividade de processamento de dados pessoais
 * @param orgId - ID da organização
 * @param userId - ID do usuário
 * @param processingActivity - Atividade de processamento
 * @param legalBasis - Base legal
 * @param dataCategories - Categorias de dados
 * @param retentionPeriod - Período de retenção
 */
export async function logDataProcessing(
  orgId: string,
  userId: string,
  processingActivity: string,
  legalBasis: string,
  dataCategories?: string[],
  retentionPeriod?: string
): Promise<void> {
  try {
    await supabase
      .from('data_processing_logs')
      .insert({
        org_id: orgId,
        user_id: userId,
        processing_activity: processingActivity,
        legal_basis: legalBasis,
        data_categories: dataCategories,
        retention_period: retentionPeriod
      });
  } catch (error) {
    console.error('Erro ao registrar processamento de dados:', error);
  }
}

/**
 * Gera relatório de compliance LGPD
 * @param orgId - ID da organização
 * @param startDate - Data inicial
 * @param endDate - Data final
 * @returns Promise<Record<string, any>>
 */
export async function generateLGPDReport(
  orgId: string,
  startDate: string,
  endDate: string
): Promise<Record<string, any>> {
  try {
    const report = {
      totalConsents: 0,
      consentByPurpose: {} as Record<string, number>,
      consentByLegalBasis: {} as Record<string, number>,
      totalDSR: 0,
      dsrByType: {} as Record<string, number>,
      dsrByStatus: {} as Record<string, number>,
      processingActivities: [] as string[]
    };

    // Estatísticas de consentimentos
    const { data: consents, error: consentsError } = await supabase
      .from('data_consents')
      .select('purpose, legal_basis, consent_given')
      .eq('org_id', orgId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (!consentsError && consents) {
      report.totalConsents = consents.length;
      
      consents.forEach(consent => {
        // Por finalidade
        report.consentByPurpose[consent.purpose] = (report.consentByPurpose[consent.purpose] || 0) + 1;
        
        // Por base legal
        report.consentByLegalBasis[consent.legal_basis] = (report.consentByLegalBasis[consent.legal_basis] || 0) + 1;
      });
    }

    // Estatísticas de solicitações DSR
    const { data: dsrs, error: dsrsError } = await supabase
      .from('data_subject_requests')
      .select('request_type, status')
      .eq('org_id', orgId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (!dsrsError && dsrs) {
      report.totalDSR = dsrs.length;
      
      dsrs.forEach(dsr => {
        // Por tipo
        report.dsrByType[dsr.request_type] = (report.dsrByType[dsr.request_type] || 0) + 1;
        
        // Por status
        report.dsrByStatus[dsr.status] = (report.dsrByStatus[dsr.status] || 0) + 1;
      });
    }

    // Atividades de processamento
    const { data: processingLogs, error: processingError } = await supabase
      .from('data_processing_logs')
      .select('processing_activity')
      .eq('org_id', orgId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (!processingError && processingLogs) {
      const activities = new Set(processingLogs.map(log => log.processing_activity));
      report.processingActivities = Array.from(activities);
    }

    return report;
  } catch (error) {
    console.error('Erro ao gerar relatório LGPD:', error);
    return {};
  }
}

/**
 * Verifica se há dados pessoais em uma tabela
 * @param tableName - Nome da tabela
 * @param record - Registro a ser verificado
 * @returns boolean
 */
export function containsPersonalData(tableName: string, record: any): boolean {
  const personalDataFields = [
    'email', 'phone', 'cpf', 'cnpj', 'address', 'name', 'first_name', 'last_name',
    'document', 'passport', 'social_security', 'tax_id'
  ];

  return personalDataFields.some(field => 
    record[field] && typeof record[field] === 'string' && record[field].length > 0
  );
}

/**
 * Mascara dados pessoais para exibição
 * @param data - Dados a serem mascarados
 * @param field - Campo específico
 * @returns string
 */
export function maskPersonalData(data: string, field: string): string {
  if (!data) return '';

  switch (field) {
    case 'email':
      const [local, domain] = data.split('@');
      return `${local.charAt(0)}***@${domain}`;
    
    case 'phone':
      return data.replace(/(\d{2})(\d{4,5})(\d{4})/, '$1****$3');
    
    case 'cpf':
      return data.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.***-$4');
    
    case 'cnpj':
      return data.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '**.$2.***/$4-**');
    
    case 'name':
    case 'first_name':
    case 'last_name':
      const words = data.split(' ');
      if (words.length === 1) {
        return `${words[0].charAt(0)}***`;
      }
      return `${words[0]} ${words[words.length - 1].charAt(0)}***`;
    
    default:
      if (data.length <= 4) {
        return '*'.repeat(data.length);
      }
      return `${data.substring(0, 2)}${'*'.repeat(data.length - 4)}${data.substring(data.length - 2)}`;
  }
}
