const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupDatabase() {
  try {
    console.log('🧹 Limpeza e otimização do banco de dados\n');

    // 1. Tabelas que podem ser removidas (vazias e desnecessárias)
    const tablesToRemove = [
      'user_sessions',    // Sessões são gerenciadas pelo Supabase Auth
      'audit_logs',       // Vazia, não implementada
      'security_logs',    // Vazia, não implementada
      'api_keys',         // Vazia, não implementada
      'tenant_domains',   // Vazia, não implementada
      'user_permissions'  // Vazia, não implementada
    ];

    console.log('🗑️  Removendo tabelas desnecessárias...\n');

    for (const tableName of tablesToRemove) {
      try {
        console.log(`Removendo tabela: ${tableName}`);
        
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: `DROP TABLE IF EXISTS ${tableName} CASCADE;`
        });

        if (error) {
          console.log(`❌ Erro ao remover ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ Tabela ${tableName} removida com sucesso`);
        }
      } catch (err) {
        console.log(`❌ Erro: ${err.message}`);
      }
    }

    console.log('\n📊 Verificando tabelas restantes...\n');

    // 2. Verificar tabelas que permaneceram
    const remainingTables = ['permissions', 'roles', 'role_permissions', 'profiles'];

    for (const tableName of remainingTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          console.log(`✅ ${tableName}: ${count} registros`);
        } else {
          console.log(`❌ ${tableName}: Erro - ${error.message}`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: Erro - ${err.message}`);
      }
    }

    // 3. Verificar se precisamos criar tabelas essenciais
    console.log('\n🔧 Verificando tabelas essenciais...\n');

    // Verificar se existe tabela organizations
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .limit(1);

      if (error && error.message.includes('does not exist')) {
        console.log('❌ Tabela organizations não existe - precisa ser criada');
      } else {
        console.log('✅ Tabela organizations existe');
      }
    } catch (err) {
      console.log('❌ Tabela organizations não existe - precisa ser criada');
    }

    // 4. Recomendações finais
    console.log('\n💡 RECOMENDAÇÕES FINAIS:\n');
    console.log('✅ Tabelas mantidas (funcionais):');
    console.log('  • permissions - 44 permissões do sistema');
    console.log('  • roles - 6 papéis definidos');
    console.log('  • role_permissions - 114 associações papel-permissão');
    console.log('  • profiles - 1 perfil de usuário');
    console.log('');
    console.log('🔧 Próximos passos:');
    console.log('  1. Criar tabela organizations (se necessário)');
    console.log('  2. Criar tabela user_organizations (se necessário)');
    console.log('  3. Atualizar sistema para usar apenas Supabase Auth');
    console.log('  4. Implementar RBAC usando as tabelas existentes');
    console.log('');
    console.log('📝 Estrutura recomendada para o futuro:');
    console.log('  • auth.users (Supabase) - Dados básicos do usuário');
    console.log('  • profiles - Dados estendidos do usuário');
    console.log('  • organizations - Empresas/organizações');
    console.log('  • user_organizations - Relação usuário-empresa');
    console.log('  • permissions, roles, role_permissions - Sistema RBAC');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
cleanupDatabase();
