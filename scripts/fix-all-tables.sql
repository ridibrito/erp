-- =====================================================
-- CORREÇÃO COMPLETA DE TODAS AS TABELAS
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CORRIGIR TABELA API_KEYS
-- =====================================================

DO $$
BEGIN
    -- Se a tabela não existe, criar
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'api_keys') THEN
        CREATE TABLE api_keys (
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
        RAISE NOTICE 'Tabela api_keys criada';
    ELSE
        -- Adicionar colunas que podem estar faltando
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'key_hash') THEN
            ALTER TABLE api_keys ADD COLUMN key_hash VARCHAR(255);
            RAISE NOTICE 'Coluna key_hash adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'scopes') THEN
            ALTER TABLE api_keys ADD COLUMN scopes TEXT[];
            RAISE NOTICE 'Coluna scopes adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'expires_at') THEN
            ALTER TABLE api_keys ADD COLUMN expires_at TIMESTAMP;
            RAISE NOTICE 'Coluna expires_at adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'last_used_at') THEN
            ALTER TABLE api_keys ADD COLUMN last_used_at TIMESTAMP;
            RAISE NOTICE 'Coluna last_used_at adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'is_active') THEN
            ALTER TABLE api_keys ADD COLUMN is_active BOOLEAN DEFAULT true;
            RAISE NOTICE 'Coluna is_active adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'created_by') THEN
            ALTER TABLE api_keys ADD COLUMN created_by UUID;
            RAISE NOTICE 'Coluna created_by adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'created_at') THEN
            ALTER TABLE api_keys ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
            RAISE NOTICE 'Coluna created_at adicionada';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'updated_at') THEN
            ALTER TABLE api_keys ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
            RAISE NOTICE 'Coluna updated_at adicionada';
        END IF;
    END IF;
END $$;

-- =====================================================
-- 2. CRIAR TODAS AS OUTRAS TABELAS SE NÃO EXISTIREM
-- =====================================================

-- Tenant Domains
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

-- Tenant Settings
CREATE TABLE IF NOT EXISTS tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    key VARCHAR(255) NOT NULL,
    value JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(org_id, key)
);

-- Permissions
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

-- Roles
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

-- Role Permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- User Permissions
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

-- User Sessions
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

-- Two Factor Auth
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

-- Trusted Devices
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

-- Data Consents
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

-- Data Subject Requests
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

-- Data Processing Logs
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

-- Audit Logs
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

-- Security Logs
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

-- OAuth Connections
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
-- 3. CRIAR ÍNDICES
-- =====================================================

-- Índices para api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON api_keys(org_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- Outros índices importantes
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_roles_org_id ON roles(org_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(org_id);

-- =====================================================
-- 4. CRIAR FUNÇÃO E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. INSERIR PERMISSÕES BÁSICAS
-- =====================================================

INSERT INTO permissions (name, description, module, action, resource) VALUES
('users.view', 'Visualizar usuários', 'users', 'view', 'users'),
('users.create', 'Criar usuários', 'users', 'create', 'users'),
('users.edit', 'Editar usuários', 'users', 'edit', 'users'),
('users.delete', 'Excluir usuários', 'users', 'delete', 'users'),
('crm.leads.view', 'Visualizar leads', 'crm', 'view', 'leads'),
('crm.leads.create', 'Criar leads', 'crm', 'create', 'leads'),
('finance.invoices.view', 'Visualizar faturas', 'finance', 'view', 'invoices'),
('finance.invoices.create', 'Criar faturas', 'finance', 'create', 'invoices'),
('projects.view', 'Visualizar projetos', 'projects', 'view', 'projects'),
('projects.create', 'Criar projetos', 'projects', 'create', 'projects'),
('system.admin', 'Acesso administrativo completo', 'system', 'admin', 'system')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 6. VERIFICAR ESTRUTURA FINAL
-- =====================================================

SELECT 'api_keys' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'api_keys' 
ORDER BY ordinal_position;
