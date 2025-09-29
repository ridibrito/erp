-- =====================================================
-- CORTUS ERP - CORREÇÃO DE PERMISSÕES
-- Execute este SQL no Supabase Studio > SQL Editor
-- =====================================================

-- Habilitar RLS (Row Level Security) nas tabelas principais
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_connections ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para permitir acesso com service role
-- (Estas políticas permitem acesso total para desenvolvimento)

-- Política para permissions (acesso total)
CREATE POLICY "Allow all access to permissions" ON permissions
FOR ALL USING (true) WITH CHECK (true);

-- Política para roles (acesso total)
CREATE POLICY "Allow all access to roles" ON roles
FOR ALL USING (true) WITH CHECK (true);

-- Política para role_permissions (acesso total)
CREATE POLICY "Allow all access to role_permissions" ON role_permissions
FOR ALL USING (true) WITH CHECK (true);

-- Política para user_permissions (acesso total)
CREATE POLICY "Allow all access to user_permissions" ON user_permissions
FOR ALL USING (true) WITH CHECK (true);

-- Política para user_sessions (acesso total)
CREATE POLICY "Allow all access to user_sessions" ON user_sessions
FOR ALL USING (true) WITH CHECK (true);

-- Política para audit_logs (acesso total)
CREATE POLICY "Allow all access to audit_logs" ON audit_logs
FOR ALL USING (true) WITH CHECK (true);

-- Política para security_logs (acesso total)
CREATE POLICY "Allow all access to security_logs" ON security_logs
FOR ALL USING (true) WITH CHECK (true);

-- Política para api_keys (acesso total)
CREATE POLICY "Allow all access to api_keys" ON api_keys
FOR ALL USING (true) WITH CHECK (true);

-- Política para tenant_domains (acesso total)
CREATE POLICY "Allow all access to tenant_domains" ON tenant_domains
FOR ALL USING (true) WITH CHECK (true);

-- Política para tenant_settings (acesso total)
CREATE POLICY "Allow all access to tenant_settings" ON tenant_settings
FOR ALL USING (true) WITH CHECK (true);

-- Política para two_factor_auth (acesso total)
CREATE POLICY "Allow all access to two_factor_auth" ON two_factor_auth
FOR ALL USING (true) WITH CHECK (true);

-- Política para trusted_devices (acesso total)
CREATE POLICY "Allow all access to trusted_devices" ON trusted_devices
FOR ALL USING (true) WITH CHECK (true);

-- Política para data_consents (acesso total)
CREATE POLICY "Allow all access to data_consents" ON data_consents
FOR ALL USING (true) WITH CHECK (true);

-- Política para data_subject_requests (acesso total)
CREATE POLICY "Allow all access to data_subject_requests" ON data_subject_requests
FOR ALL USING (true) WITH CHECK (true);

-- Política para data_processing_logs (acesso total)
CREATE POLICY "Allow all access to data_processing_logs" ON data_processing_logs
FOR ALL USING (true) WITH CHECK (true);

-- Política para oauth_connections (acesso total)
CREATE POLICY "Allow all access to oauth_connections" ON oauth_connections
FOR ALL USING (true) WITH CHECK (true);

-- Criar função exec_sql para permitir execução de SQL via RPC
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE sql_query;
    RETURN 'SQL executed successfully';
END;
$$;

-- Conceder permissões para a função exec_sql
GRANT EXECUTE ON FUNCTION public.exec_sql(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.exec_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(TEXT) TO service_role;

-- =====================================================
-- PERMISSÕES CORRIGIDAS!
-- =====================================================
