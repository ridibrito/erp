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

// SQL para desabilitar RLS temporariamente
const disableRLSSQL = `
-- Desabilitar RLS temporariamente para desenvolvimento
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
`;

// Função para desabilitar RLS
async function disableRLS() {
  try {
    console.log('🔧 Desabilitando RLS temporariamente...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: disableRLSSQL
    });
    
    if (error) {
      console.error('❌ Erro ao desabilitar RLS:', error.message);
      return false;
    } else {
      console.log('✅ RLS desabilitado com sucesso!');
      return true;
    }
  } catch (error) {
    console.error('❌ Erro ao desabilitar RLS:', error.message);
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

// Função para testar inserção
async function testInsertion() {
  try {
    console.log('🔍 Testando inserção de dados...');
    
    const { data, error } = await supabase
      .from('permissions')
      .insert({
        name: 'test.development',
        description: 'Teste de desenvolvimento',
        module: 'test',
        action: 'development',
        resource: 'test'
      })
      .select();

    if (error) {
      console.log('❌ Erro na inserção:', error.message);
      return false;
    } else {
      console.log('✅ Inserção funcionando!');
      
      // Limpar dados de teste
      await supabase
        .from('permissions')
        .delete()
        .eq('name', 'test.development');
      
      console.log('✅ Limpeza concluída!');
      return true;
    }
  } catch (error) {
    console.log('❌ Erro na inserção:', error.message);
    return false;
  }
}

// Função para listar permissões
async function listPermissions() {
  try {
    console.log('🔍 Listando permissões existentes...');
    
    const { data, error } = await supabase
      .from('permissions')
      .select('name, module, action, resource')
      .order('module', { ascending: true });

    if (error) {
      console.log('❌ Erro ao listar permissões:', error.message);
      return false;
    }

    if (data && data.length > 0) {
      console.log(`✅ ${data.length} permissões encontradas:`);
      
      // Agrupar por módulo
      const grouped = data.reduce((acc, perm) => {
        if (!acc[perm.module]) acc[perm.module] = [];
        acc[perm.module].push(perm);
        return acc;
      }, {});

      Object.keys(grouped).forEach(module => {
        console.log(`  📁 ${module}: ${grouped[module].length} permissões`);
      });
      
      return true;
    } else {
      console.log('❌ Nenhuma permissão encontrada');
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao listar permissões:', error.message);
    return false;
  }
}

// Função principal
async function main() {
  console.log('🚀 Desabilitando RLS para desenvolvimento...');
  console.log('📡 Conectando ao Supabase:', supabaseUrl);

  try {
    // 1. Desabilitar RLS
    const disableOk = await disableRLS();
    if (!disableOk) {
      console.log('❌ Falha ao desabilitar RLS');
      process.exit(1);
    }

    console.log('');

    // 2. Testar acesso às tabelas
    const accessOk = await testTableAccess();
    
    console.log('');

    // 3. Testar inserção
    const insertOk = await testInsertion();
    
    console.log('');

    // 4. Listar permissões
    const listOk = await listPermissions();
    
    console.log('');
    
    if (accessOk && insertOk && listOk) {
      console.log('🎉 Banco de dados funcionando perfeitamente!');
      console.log('✅ RLS desabilitado para desenvolvimento');
      console.log('✅ Todas as tabelas estão acessíveis');
      console.log('✅ Inserção e consulta funcionando');
      console.log('🔗 Pronto para desenvolvimento');
    } else {
      console.log('⚠️  Alguns problemas ainda persistem');
      console.log('💡 Verifique os logs acima para detalhes');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    process.exit(1);
  }
}

// Executar
main().catch(console.error);
