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

// Função para verificar tabelas
async function verifyTables() {
  try {
    console.log('🔍 Verificando tabelas criadas...');
    
    const expectedTables = [
      'tenant_domains', 'tenant_settings', 'permissions', 'roles', 
      'role_permissions', 'user_permissions', 'user_sessions',
      'two_factor_auth', 'trusted_devices', 'data_consents',
      'data_subject_requests', 'data_processing_logs', 'audit_logs',
      'security_logs', 'api_keys', 'oauth_connections'
    ];

    // Usar RPC para executar SQL direto
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ANY($1)
      `,
      table_names: expectedTables
    });

    if (error) {
      console.error('❌ Erro ao verificar tabelas:', error.message);
      return false;
    }

    const existingTables = data?.map(t => t.table_name) || [];
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));

    console.log('✅ Tabelas existentes:', existingTables.join(', '));
    
    if (missingTables.length > 0) {
      console.log('❌ Tabelas faltando:', missingTables.join(', '));
      return false;
    } else {
      console.log('✅ Todas as tabelas foram criadas com sucesso!');
      return true;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
    return false;
  }
}

// Função para verificar permissões
async function verifyPermissions() {
  try {
    console.log('🔍 Verificando permissões...');
    
    const { data, error } = await supabase
      .from('permissions')
      .select('name, module, action, resource')
      .order('module', { ascending: true });

    if (error) {
      console.error('❌ Erro ao verificar permissões:', error.message);
      return false;
    }

    console.log(`✅ ${data?.length || 0} permissões encontradas:`);
    
    // Agrupar por módulo
    const grouped = data?.reduce((acc, perm) => {
      if (!acc[perm.module]) acc[perm.module] = [];
      acc[perm.module].push(perm);
      return acc;
    }, {}) || {};

    Object.keys(grouped).forEach(module => {
      console.log(`  📁 ${module}: ${grouped[module].length} permissões`);
    });

    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar permissões:', error.message);
    return false;
  }
}

// Função para verificar índices
async function verifyIndexes() {
  try {
    console.log('🔍 Verificando índices...');
    
    const { data, error } = await supabase
      .from('pg_indexes')
      .select('indexname, tablename')
      .eq('schemaname', 'public')
      .like('indexname', 'idx_%');

    if (error) {
      console.error('❌ Erro ao verificar índices:', error.message);
      return false;
    }

    console.log(`✅ ${data?.length || 0} índices encontrados`);
    
    // Agrupar por tabela
    const grouped = data?.reduce((acc, idx) => {
      if (!acc[idx.tablename]) acc[idx.tablename] = [];
      acc[idx.tablename].push(idx.indexname);
      return acc;
    }, {}) || {};

    Object.keys(grouped).forEach(table => {
      console.log(`  📊 ${table}: ${grouped[table].length} índices`);
    });

    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar índices:', error.message);
    return false;
  }
}

// Função para testar inserção de dados
async function testDataInsertion() {
  try {
    console.log('🔍 Testando inserção de dados...');
    
    // Testar inserção de uma permissão
    const { data, error } = await supabase
      .from('permissions')
      .insert({
        name: 'test.permission',
        description: 'Permissão de teste',
        module: 'test',
        action: 'test',
        resource: 'test'
      })
      .select();

    if (error) {
      console.error('❌ Erro ao inserir dados de teste:', error.message);
      return false;
    }

    console.log('✅ Inserção de dados funcionando!');

    // Limpar dados de teste
    await supabase
      .from('permissions')
      .delete()
      .eq('name', 'test.permission');

    console.log('✅ Limpeza de dados de teste concluída!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar inserção:', error.message);
    return false;
  }
}

// Função principal
async function main() {
  console.log('🚀 Verificando configuração do banco de dados Cortus ERP...');
  console.log('📡 Conectando ao Supabase:', supabaseUrl);

  try {
    // 1. Verificar tabelas
    const tablesOk = await verifyTables();
    if (!tablesOk) {
      console.error('❌ Verificação de tabelas falhou');
      process.exit(1);
    }

    console.log('');

    // 2. Verificar permissões
    const permissionsOk = await verifyPermissions();
    if (!permissionsOk) {
      console.error('❌ Verificação de permissões falhou');
      process.exit(1);
    }

    console.log('');

    // 3. Verificar índices
    const indexesOk = await verifyIndexes();
    if (!indexesOk) {
      console.error('❌ Verificação de índices falhou');
      process.exit(1);
    }

    console.log('');

    // 4. Testar inserção de dados
    const insertionOk = await testDataInsertion();
    if (!insertionOk) {
      console.error('❌ Teste de inserção falhou');
      process.exit(1);
    }

    console.log('');
    console.log('🎉 Verificação completa do banco de dados!');
    console.log('✅ Todas as tabelas, permissões e índices estão funcionando');
    console.log('🔗 Banco de dados pronto para uso');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { verifyTables, verifyPermissions, verifyIndexes, testDataInsertion };
