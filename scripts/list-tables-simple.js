const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listTables() {
  try {
    console.log('🔍 Listando tabelas do Supabase...\n');

    // Lista de tabelas que sabemos que podem existir
    const possibleTables = [
      'permissions', 'roles', 'role_permissions', 'user_permissions',
      'user_sessions', 'audit_logs', 'security_logs', 'api_keys',
      'tenant_domains', 'organizations', 'user_organizations',
      'profiles', 'user_profiles', 'settings', 'notifications',
      'banks', 'bank_accounts', 'charges', 'collection_rules',
      'collection_history', 'nfse', 'nfse_settings'
    ];

    console.log('📊 Verificando tabelas existentes...\n');

    const existingTables = [];
    const nonExistingTables = [];

    for (const tableName of possibleTables) {
      try {
        // Tentar fazer uma consulta simples para verificar se a tabela existe
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          if (error.message.includes('relation') && error.message.includes('does not exist')) {
            nonExistingTables.push(tableName);
          } else {
            // Tabela existe mas pode ter erro de permissão
            existingTables.push({ name: tableName, error: error.message });
          }
        } else {
          existingTables.push({ name: tableName, count: data ? data.length : 0 });
        }
      } catch (err) {
        nonExistingTables.push(tableName);
      }
    }

    // Exibir resultados
    if (existingTables.length > 0) {
      console.log('✅ Tabelas existentes:');
      existingTables.forEach(table => {
        if (table.error) {
          console.log(`  • ${table.name}: ❌ Erro (${table.error})`);
        } else {
          console.log(`  • ${table.name}: ${table.count} registros (amostra)`);
        }
      });
      console.log('');
    }

    if (nonExistingTables.length > 0) {
      console.log('❌ Tabelas não existentes:');
      nonExistingTables.forEach(table => {
        console.log(`  • ${table}`);
      });
      console.log('');
    }

    // Verificar tabelas do sistema Supabase
    console.log('🔍 Verificando tabelas do sistema Supabase...\n');

    // Tentar acessar tabelas do auth (isso deve funcionar)
    try {
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      if (!usersError) {
        console.log(`👥 Usuários no sistema: ${users.users.length}`);
      }
    } catch (err) {
      console.log('❌ Erro ao acessar usuários:', err.message);
    }

    // Verificar storage
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (!bucketsError) {
        console.log('📦 Buckets de storage:');
        buckets.forEach(bucket => {
          console.log(`  • ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
        });
      }
    } catch (err) {
      console.log('❌ Erro ao acessar storage:', err.message);
    }

    // Verificar se exec_sql funciona
    console.log('\n🔧 Testando função exec_sql...');
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: 'SELECT 1 as test'
      });
      
      if (error) {
        console.log('❌ exec_sql não funciona:', error.message);
      } else {
        console.log('✅ exec_sql funciona:', data);
      }
    } catch (err) {
      console.log('❌ Erro ao testar exec_sql:', err.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
listTables();
