const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// SQL para corrigir permissões
const fixPermissionsSQL = `
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
DO $$
BEGIN
    -- Permissions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'permissions' AND policyname = 'Allow all access to permissions') THEN
        CREATE POLICY "Allow all access to permissions" ON permissions FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- Roles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'Allow all access to roles') THEN
        CREATE POLICY "Allow all access to roles" ON roles FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- Role permissions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'role_permissions' AND policyname = 'Allow all access to role_permissions') THEN
        CREATE POLICY "Allow all access to role_permissions" ON role_permissions FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- User permissions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_permissions' AND policyname = 'Allow all access to user_permissions') THEN
        CREATE POLICY "Allow all access to user_permissions" ON user_permissions FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- User sessions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_sessions' AND policyname = 'Allow all access to user_sessions') THEN
        CREATE POLICY "Allow all access to user_sessions" ON user_sessions FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- Audit logs
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Allow all access to audit_logs') THEN
        CREATE POLICY "Allow all access to audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- Security logs
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_logs' AND policyname = 'Allow all access to security_logs') THEN
        CREATE POLICY "Allow all access to security_logs" ON security_logs FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- API keys
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Allow all access to api_keys') THEN
        CREATE POLICY "Allow all access to api_keys" ON api_keys FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
`;

// Função para aplicar correções via RPC
async function fixPermissions() {
  try {
    console.log('🔧 Aplicando correções de permissão via RPC...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: fixPermissionsSQL
    });
    
    if (error) {
      console.error('❌ Erro ao aplicar correções:', error.message);
      return false;
    } else {
      console.log('✅ Correções aplicadas com sucesso!');
      return true;
    }
  } catch (error) {
    console.error('❌ Erro ao aplicar correções:', error.message);
    return false;
  }
}

// Função para testar acesso às tabelas
async function testTableAccess() {
  const tables = [
    'permissions', 'roles', 'role_permissions', 'user_permissions',
    'user_sessions', 'audit_logs', 'security_logs', 'api_keys'
  ];

  console.log('🔍 Testando acesso às tabelas...');
  
  let accessibleTables = 0;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: OK`);
        accessibleTables++;
      }
    } catch (error) {
      console.log(`❌ ${table}: ${error.message}`);
    }
  }

  console.log(`📊 ${accessibleTables}/${tables.length} tabelas acessíveis`);
  return accessibleTables === tables.length;
}

// Função principal
async function main() {
  console.log('🚀 Correção de permissões via RPC...');
  console.log('📡 Conectando ao Supabase:', supabaseUrl);

  try {
    // 1. Aplicar correções
    const fixOk = await fixPermissions();
    if (!fixOk) {
      console.log('❌ Falha ao aplicar correções');
      process.exit(1);
    }

    console.log('');

    // 2. Testar acesso às tabelas
    const accessOk = await testTableAccess();
    
    console.log('');
    
    if (accessOk) {
      console.log('🎉 Permissões corrigidas com sucesso!');
      console.log('✅ Todas as tabelas estão acessíveis');
      console.log('🔗 Banco de dados pronto para uso');
    } else {
      console.log('⚠️  Algumas tabelas ainda não estão acessíveis');
      console.log('💡 Pode ser necessário executar o SQL manualmente no Supabase Studio');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    process.exit(1);
  }
}

// Executar
main().catch(console.error);
