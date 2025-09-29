-- =====================================================
-- CORTUS ERP - CONCEDER PERMISSÕES DIRETAS
-- Execute este SQL no Supabase Studio > SQL Editor
-- =====================================================

-- Conceder permissões completas ao service_role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Conceder permissões específicas para cada tabela
GRANT SELECT, INSERT, UPDATE, DELETE ON permissions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON role_permissions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_permissions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON security_logs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON tenant_domains TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON tenant_settings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON two_factor_auth TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON trusted_devices TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_consents TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_subject_requests TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_processing_logs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON oauth_connections TO service_role;

-- Conceder permissões para usuários anônimos e autenticados (para desenvolvimento)
GRANT SELECT, INSERT, UPDATE, DELETE ON permissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON roles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON role_permissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_permissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON security_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON tenant_domains TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON tenant_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON two_factor_auth TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON trusted_devices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_consents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_subject_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_processing_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON oauth_connections TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON role_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON security_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tenant_domains TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tenant_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON two_factor_auth TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON trusted_devices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_consents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_subject_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_processing_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON oauth_connections TO authenticated;

-- Desabilitar RLS completamente para desenvolvimento
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_domains DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth DISABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE data_consents DISABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_connections DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- PERMISSÕES CONCEDIDAS!
-- =====================================================
