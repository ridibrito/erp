const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migração de fundação
const foundationMigration = `
-- =====================================================
-- NEXUS ERP - FOUNDATION: IDENTIDADE, MULTI-TENANT E SEGURANÇA
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

-- =====================================================
-- 4. AUDITORIA E LOGS
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

-- =====================================================
-- 5. ÍNDICES PARA PERFORMANCE
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

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- 6. FUNÇÕES E TRIGGERS
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
CREATE TRIGGER update_tenant_domains_updated_at BEFORE UPDATE ON tenant_domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_settings_updated_at BEFORE UPDATE ON tenant_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// Função para executar SQL
async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec', { sql });
    
    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('❌ Erro na execução SQL:', error);
    throw error;
  }
}

// Função para aplicar migração
async function applyMigration(name, sql) {
  try {
    console.log(`🔄 Aplicando migração: ${name}`);
    
    // Dividir o SQL em comandos individuais
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (const command of commands) {
      if (command.trim()) {
        try {
          await executeSQL(command);
        } catch (error) {
          // Ignorar erros de "já existe" para tabelas e índices
          if (!error.message.includes('already exists') && !error.message.includes('duplicate key')) {
            throw error;
          }
        }
      }
    }
    
    console.log(`✅ Migração ${name} aplicada com sucesso!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao aplicar migração ${name}:`, error);
    throw error;
  }
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando aplicação das migrações do Nexus ERP...');
    console.log(`📡 Conectando ao Supabase: ${supabaseUrl}`);
    
    // Aplicar migração de fundação
    await applyMigration('Foundation - Identity & Security', foundationMigration);
    
    console.log('🎉 Todas as migrações foram aplicadas com sucesso!');
    console.log('✨ O banco de dados do Nexus ERP está pronto para uso!');
    
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { applyMigration, executeSQL };
