const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura das tabelas...\n');

    const tables = [
      'permissions', 'roles', 'role_permissions', 'user_permissions',
      'user_sessions', 'audit_logs', 'security_logs', 'api_keys',
      'tenant_domains', 'profiles'
    ];

    for (const tableName of tables) {
      console.log(`📊 Tabela: ${tableName}`);
      console.log('─'.repeat(50));

      try {
        // Tentar obter uma amostra de dados para ver a estrutura
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Erro: ${error.message}`);
        } else if (data && data.length > 0) {
          console.log('📝 Estrutura (baseada em dados de exemplo):');
          const sample = data[0];
          Object.keys(sample).forEach(key => {
            const value = sample[key];
            const type = typeof value;
            const isNull = value === null;
            console.log(`  • ${key}: ${type}${isNull ? ' (NULL)' : ''}`);
          });
        } else {
          console.log('📭 Tabela vazia');
        }

        // Contar registros
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!countError) {
          console.log(`📈 Total de registros: ${count}`);
        }

      } catch (err) {
        console.log(`❌ Erro: ${err.message}`);
      }

      console.log('');
    }

    // Verificar usuário atual
    console.log('👤 USUÁRIO ATUAL:\n');
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        console.log('✅ Usuário logado:');
        console.log(`  • ID: ${user.id}`);
        console.log(`  • Email: ${user.email}`);
        console.log(`  • Metadata:`, user.user_metadata);
      } else {
        console.log('❌ Nenhum usuário logado');
      }
    } catch (err) {
      console.log('❌ Erro ao obter usuário:', err.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
checkTableStructure();
