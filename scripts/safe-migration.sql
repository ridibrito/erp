-- =====================================================
-- NEXUS ERP - MIGRAÇÃO SEGURA (IF NOT EXISTS)
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. TENANT PROVISIONING
-- =====================================================

-- Domínios customizados por organização
CREATE TABLE IF NOT EXISTS tenant_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Configurações por tenant
CREATE TABLE IF NOT EXISTS tenant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  key VARCHAR(255) NOT NULL,
  value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, key)
);

-- =====================================================
-- 2. RBAC GRANULAR
-- =====================================================

-- Tabela de permissões
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  module VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(module, action, resource)
);

-- Tabela de papéis
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, name)
);

-- Relacionamento papel-permissão
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Permissões especiais por usuário
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by UUID,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, org_id, permission_id)
);

-- =====================================================
-- 3. GESTÃO DE SESSÃO
-- =====================================================

-- Sessões de usuário
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Autenticação de dois fatores
CREATE TABLE IF NOT EXISTS two_factor_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  method VARCHAR(50) NOT NULL CHECK (method IN ('totp', 'sms', 'email')),
  secret VARCHAR(255),
  backup_codes TEXT[],
  is_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Dispositivos confiáveis
CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  device_name VARCHAR(255),
  device_type VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  last_used_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);

-- =====================================================
-- 4. LGPD COMPLIANCE
-- =====================================================

-- Consentimentos de dados
CREATE TABLE IF NOT EXISTS data_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  legal_basis VARCHAR(100) NOT NULL CHECK (legal_basis IN ('consent', 'contract', 'legitimate_interest', 'legal_obligation', 'vital_interest', 'public_interest')),
  consent_given BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Solicitações do titular dos dados
CREATE TABLE IF NOT EXISTS data_subject_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('export', 'delete', 'rectify', 'portability')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  data JSONB,
  processed_at TIMESTAMP,
  processed_by UUID,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Log de processamento de dados pessoais
CREATE TABLE IF NOT EXISTS data_processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  processing_activity VARCHAR(255) NOT NULL,
  legal_basis VARCHAR(100) NOT NULL,
  data_categories TEXT[],
  retention_period VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. AUDITORIA E LOGS
-- =====================================================

-- Log de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Log de segurança
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID,
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 6. API KEYS E OAUTH
-- =====================================================

-- Chaves de API
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  scopes TEXT[] NOT NULL,
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conexões OAuth
CREATE TABLE IF NOT EXISTS oauth_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  provider VARCHAR(100) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  scopes TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, user_id, provider)
);

-- =====================================================
-- 7. ÍNDICES PARA PERFORMANCE (IF NOT EXISTS)
-- =====================================================

-- Índices para tenant_domains
CREATE INDEX IF NOT EXISTS idx_tenant_domains_org_id ON tenant_domains(org_id);
CREATE INDEX IF NOT EXISTS idx_tenant_domains_status ON tenant_domains(status);

-- Índices para tenant_settings
CREATE INDEX IF NOT EXISTS idx_tenant_settings_org_id ON tenant_settings(org_id);

-- Índices para roles
CREATE INDEX IF NOT EXISTS idx_roles_org_id ON roles(org_id);
CREATE INDEX IF NOT EXISTS idx_roles_is_system ON roles(is_system);

-- Índices para role_permissions
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Índices para user_permissions
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_org ON user_permissions(user_id, org_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission_id ON user_permissions(permission_id);

-- Índices para user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Índices para two_factor_auth
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user_id ON two_factor_auth(user_id);

-- Índices para trusted_devices
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_id ON trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_device_id ON trusted_devices(device_id);

-- Índices para data_consents
CREATE INDEX IF NOT EXISTS idx_data_consents_user_org ON data_consents(user_id, org_id);
CREATE INDEX IF NOT EXISTS idx_data_consents_purpose ON data_consents(purpose);

-- Índices para data_subject_requests
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_user_org ON data_subject_requests(user_id, org_id);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_status ON data_subject_requests(status);

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Índices para security_logs
CREATE INDEX IF NOT EXISTS idx_security_logs_org_id ON security_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);

-- Índices para api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON api_keys(org_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- Índices para oauth_connections
CREATE INDEX IF NOT EXISTS idx_oauth_connections_user_org ON oauth_connections(user_id, org_id);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_provider ON oauth_connections(provider);

-- =====================================================
-- 8. FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at (DROP IF EXISTS primeiro)
DROP TRIGGER IF EXISTS update_tenant_domains_updated_at ON tenant_domains;
DROP TRIGGER IF EXISTS update_tenant_settings_updated_at ON tenant_settings;
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
DROP TRIGGER IF EXISTS update_two_factor_auth_updated_at ON two_factor_auth;
DROP TRIGGER IF EXISTS update_data_subject_requests_updated_at ON data_subject_requests;
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
DROP TRIGGER IF EXISTS update_oauth_connections_updated_at ON oauth_connections;

-- Recriar triggers
CREATE TRIGGER update_tenant_domains_updated_at BEFORE UPDATE ON tenant_domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_settings_updated_at BEFORE UPDATE ON tenant_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_two_factor_auth_updated_at BEFORE UPDATE ON two_factor_auth FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_subject_requests_updated_at BEFORE UPDATE ON data_subject_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_oauth_connections_updated_at BEFORE UPDATE ON oauth_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. DADOS INICIAIS (SEEDS) - INSERT IGNORE
-- =====================================================

-- Inserir permissões básicas do sistema (IGNORE se já existir)
INSERT INTO permissions (name, description, module, action, resource) VALUES
-- Usuários e Organização
('users.view', 'Visualizar usuários', 'users', 'view', 'users'),
('users.create', 'Criar usuários', 'users', 'create', 'users'),
('users.edit', 'Editar usuários', 'users', 'edit', 'users'),
('users.delete', 'Excluir usuários', 'users', 'delete', 'users'),
('roles.view', 'Visualizar papéis', 'roles', 'view', 'roles'),
('roles.create', 'Criar papéis', 'roles', 'create', 'roles'),
('roles.edit', 'Editar papéis', 'roles', 'edit', 'roles'),
('roles.delete', 'Excluir papéis', 'roles', 'delete', 'roles'),

-- CRM
('crm.leads.view', 'Visualizar leads', 'crm', 'view', 'leads'),
('crm.leads.create', 'Criar leads', 'crm', 'create', 'leads'),
('crm.leads.edit', 'Editar leads', 'crm', 'edit', 'leads'),
('crm.leads.delete', 'Excluir leads', 'crm', 'delete', 'leads'),
('crm.accounts.view', 'Visualizar contas', 'crm', 'view', 'accounts'),
('crm.accounts.create', 'Criar contas', 'crm', 'create', 'accounts'),
('crm.accounts.edit', 'Editar contas', 'crm', 'edit', 'accounts'),
('crm.accounts.delete', 'Excluir contas', 'crm', 'delete', 'accounts'),
('crm.deals.view', 'Visualizar negócios', 'crm', 'view', 'deals'),
('crm.deals.create', 'Criar negócios', 'crm', 'create', 'deals'),
('crm.deals.edit', 'Editar negócios', 'crm', 'edit', 'deals'),
('crm.deals.delete', 'Excluir negócios', 'crm', 'delete', 'deals'),

-- Financeiro
('finance.invoices.view', 'Visualizar faturas', 'finance', 'view', 'invoices'),
('finance.invoices.create', 'Criar faturas', 'finance', 'create', 'invoices'),
('finance.invoices.edit', 'Editar faturas', 'finance', 'edit', 'invoices'),
('finance.invoices.delete', 'Excluir faturas', 'finance', 'delete', 'invoices'),
('finance.payments.view', 'Visualizar pagamentos', 'finance', 'view', 'payments'),
('finance.payments.create', 'Criar pagamentos', 'finance', 'create', 'payments'),
('finance.payments.edit', 'Editar pagamentos', 'finance', 'edit', 'payments'),
('finance.payments.delete', 'Excluir pagamentos', 'finance', 'delete', 'payments'),

-- Projetos
('projects.view', 'Visualizar projetos', 'projects', 'view', 'projects'),
('projects.create', 'Criar projetos', 'projects', 'create', 'projects'),
('projects.edit', 'Editar projetos', 'projects', 'edit', 'projects'),
('projects.delete', 'Excluir projetos', 'projects', 'delete', 'projects'),

-- Relatórios
('reports.view', 'Visualizar relatórios', 'reports', 'view', 'reports'),
('reports.create', 'Criar relatórios', 'reports', 'create', 'reports'),
('reports.export', 'Exportar relatórios', 'reports', 'export', 'reports'),

-- Configurações
('settings.view', 'Visualizar configurações', 'settings', 'view', 'settings'),
('settings.edit', 'Editar configurações', 'settings', 'edit', 'settings'),

-- Sistema
('system.admin', 'Acesso administrativo completo', 'system', 'admin', 'system'),
('system.audit', 'Visualizar logs de auditoria', 'system', 'audit', 'system')
ON CONFLICT (name) DO NOTHING;
