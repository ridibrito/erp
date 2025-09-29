const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeDatabase() {
  try {
    console.log('🔍 Análise completa do banco de dados Supabase\n');

    // 1. Verificar estrutura das tabelas existentes
    console.log('📋 ESTRUTURA DAS TABELAS EXISTENTES:\n');

    const existingTables = [
      'permissions', 'roles', 'role_permissions', 'user_permissions',
      'user_sessions', 'audit_logs', 'security_logs', 'api_keys',
      'tenant_domains', 'profiles'
    ];

    for (const tableName of existingTables) {
      console.log(`📊 Tabela: ${tableName}`);
      console.log('─'.repeat(40));

      try {
        // Obter estrutura da tabela
        const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
          sql_query: `
            SELECT 
              column_name,
              data_type,
              is_nullable,
              column_default
            FROM information_schema.columns 
            WHERE table_name = '${tableName}' 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
          `
        });

        if (columnsError) {
          console.log(`❌ Erro ao obter estrutura: ${columnsError.message}`);
        } else if (columns && columns.length > 0) {
          console.log('Colunas:');
          columns.forEach(col => {
            const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
            const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
            console.log(`  • ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
          });
        } else {
          console.log('❌ Nenhuma coluna encontrada');
        }

        // Contar registros
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!countError) {
          console.log(`📈 Registros: ${count}`);
        }

        // Mostrar alguns dados de exemplo
        if (count > 0) {
          const { data: sample, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .limit(3);

          if (!sampleError && sample && sample.length > 0) {
            console.log('📝 Exemplo de dados:');
            sample.forEach((row, index) => {
              console.log(`  ${index + 1}.`, JSON.stringify(row, null, 2).substring(0, 100) + '...');
            });
          }
        }

      } catch (err) {
        console.log(`❌ Erro: ${err.message}`);
      }

      console.log('');
    }

    // 2. Verificar usuários do sistema
    console.log('👥 USUÁRIOS DO SISTEMA:\n');
    try {
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      if (!usersError) {
        users.users.forEach((user, index) => {
          console.log(`Usuário ${index + 1}:`);
          console.log(`  • ID: ${user.id}`);
          console.log(`  • Email: ${user.email}`);
          console.log(`  • Criado em: ${user.created_at}`);
          console.log(`  • Último login: ${user.last_sign_in_at || 'Nunca'}`);
          console.log(`  • Metadata:`, user.user_metadata);
          console.log('');
        });
      }
    } catch (err) {
      console.log('❌ Erro ao acessar usuários:', err.message);
    }

    // 3. Verificar storage
    console.log('📦 STORAGE:\n');
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (!bucketsError) {
        for (const bucket of buckets) {
          console.log(`Bucket: ${bucket.name}`);
          console.log(`  • Público: ${bucket.public ? 'Sim' : 'Não'}`);
          console.log(`  • Criado em: ${bucket.created_at}`);
          
          // Listar arquivos no bucket
          const { data: files, error: filesError } = await supabase.storage
            .from(bucket.name)
            .list();

          if (!filesError && files) {
            console.log(`  • Arquivos: ${files.length}`);
            files.slice(0, 5).forEach(file => {
              console.log(`    - ${file.name} (${file.metadata?.size || 'N/A'} bytes)`);
            });
            if (files.length > 5) {
              console.log(`    ... e mais ${files.length - 5} arquivos`);
            }
          }
          console.log('');
        }
      }
    } catch (err) {
      console.log('❌ Erro ao acessar storage:', err.message);
    }

    // 4. Recomendações
    console.log('💡 RECOMENDAÇÕES:\n');
    console.log('✅ Tabelas necessárias e funcionais:');
    console.log('  • permissions, roles, role_permissions - Sistema RBAC');
    console.log('  • profiles - Perfis de usuário');
    console.log('  • avatars bucket - Upload de avatares');
    console.log('');
    console.log('⚠️  Tabelas vazias (podem ser removidas se não usadas):');
    console.log('  • user_sessions - Sessões são gerenciadas pelo Supabase Auth');
    console.log('  • audit_logs, security_logs - Logs de auditoria');
    console.log('  • api_keys - Chaves de API');
    console.log('  • tenant_domains - Domínios de tenant');
    console.log('  • user_permissions - Permissões específicas de usuário');
    console.log('');
    console.log('❌ Tabelas que faltam (se necessário):');
    console.log('  • organizations - Organizações/empresas');
    console.log('  • user_organizations - Relação usuário-organização');
    console.log('  • settings - Configurações do sistema');
    console.log('  • notifications - Notificações');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
analyzeDatabase();
