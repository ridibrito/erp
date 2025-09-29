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

// Função para listar todas as tabelas
async function listAllTables() {
  try {
    console.log('🔍 Listando todas as tabelas do banco...');
    
    // Usar SQL direto para listar tabelas
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `
    });

    if (error) {
      console.error('❌ Erro ao listar tabelas:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Tabelas encontradas:');
      data.forEach(table => {
        console.log(`  📋 ${table.table_name} (${table.table_type})`);
      });
    } else {
      console.log('❌ Nenhuma tabela encontrada');
    }

  } catch (error) {
    console.error('❌ Erro ao listar tabelas:', error.message);
  }
}

// Função para testar acesso a uma tabela específica
async function testTableAccess(tableName) {
  try {
    console.log(`🔍 Testando acesso à tabela: ${tableName}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ ${tableName}: ${error.message}`);
      return false;
    } else {
      console.log(`✅ ${tableName}: Acesso OK`);
      return true;
    }
  } catch (error) {
    console.log(`❌ ${tableName}: ${error.message}`);
    return false;
  }
}

// Função para verificar permissões do usuário
async function checkUserPermissions() {
  try {
    console.log('🔍 Verificando permissões do usuário...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT 
          current_user as current_user,
          session_user as session_user,
          current_database() as database_name
      `
    });

    if (error) {
      console.error('❌ Erro ao verificar permissões:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('👤 Informações do usuário:');
      console.log(`  Usuário atual: ${data[0].current_user}`);
      console.log(`  Usuário da sessão: ${data[0].session_user}`);
      console.log(`  Banco de dados: ${data[0].database_name}`);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar permissões:', error.message);
  }
}

// Função principal
async function main() {
  console.log('🚀 Verificação detalhada do banco de dados...');
  console.log('📡 Conectando ao Supabase:', supabaseUrl);

  try {
    // 1. Verificar permissões do usuário
    await checkUserPermissions();
    console.log('');

    // 2. Listar todas as tabelas
    await listAllTables();
    console.log('');

    // 3. Testar acesso às tabelas principais
    const mainTables = [
      'permissions', 'roles', 'role_permissions', 'user_permissions',
      'user_sessions', 'audit_logs', 'security_logs', 'api_keys'
    ];

    console.log('🔍 Testando acesso às tabelas principais...');
    let accessibleTables = 0;
    
    for (const table of mainTables) {
      const accessible = await testTableAccess(table);
      if (accessible) accessibleTables++;
    }

    console.log('');
    console.log(`📊 Resumo: ${accessibleTables}/${mainTables.length} tabelas acessíveis`);

    if (accessibleTables === mainTables.length) {
      console.log('🎉 Todas as tabelas estão acessíveis!');
    } else if (accessibleTables > 0) {
      console.log('⚠️  Algumas tabelas estão acessíveis, mas outras não');
    } else {
      console.log('❌ Nenhuma tabela está acessível');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar
main().catch(console.error);
