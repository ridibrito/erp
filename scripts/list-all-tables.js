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

async function listAllTables() {
  console.log('🔍 Listando todas as tabelas do Supabase...\n');
  
  try {
    // 1. Listar tabelas básicas
    console.log('📋 1. TABELAS BÁSICAS:');
    console.log('='.repeat(50));
    const { data: basicTables, error: basicError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname,
          tablename,
          tableowner,
          hasindexes,
          hasrules,
          hastriggers,
          rowsecurity
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `
    });
    
    if (basicError) {
      console.error('❌ Erro ao listar tabelas básicas:', basicError);
    } else {
      console.table(basicTables);
    }

    // 2. Listar tabelas com informações detalhadas
    console.log('\n📊 2. TABELAS COM INFORMAÇÕES DETALHADAS:');
    console.log('='.repeat(50));
    const { data: detailedTables, error: detailedError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          t.table_schema,
          t.table_name,
          t.table_type,
          pg_size_pretty(pg_total_relation_size(c.oid)) as table_size
        FROM information_schema.tables t
        LEFT JOIN pg_class c ON c.relname = t.table_name
        WHERE t.table_schema = 'public'
          AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name;
      `
    });
    
    if (detailedError) {
      console.error('❌ Erro ao listar tabelas detalhadas:', detailedError);
    } else {
      console.table(detailedTables);
    }

    // 3. Listar tabelas com estatísticas
    console.log('\n📈 3. ESTATÍSTICAS DAS TABELAS:');
    console.log('='.repeat(50));
    const { data: statsTables, error: statsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        ORDER BY n_live_tup DESC;
      `
    });
    
    if (statsError) {
      console.error('❌ Erro ao listar estatísticas:', statsError);
    } else {
      console.table(statsTables);
    }

    // 4. Listar colunas das tabelas
    console.log('\n🏗️ 4. COLUNAS DAS TABELAS:');
    console.log('='.repeat(50));
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          t.table_name,
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default,
          c.character_maximum_length
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name
        WHERE t.table_schema = 'public'
          AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name, c.ordinal_position;
      `
    });
    
    if (columnsError) {
      console.error('❌ Erro ao listar colunas:', columnsError);
    } else {
      console.table(columns);
    }

    // 5. Listar chaves estrangeiras
    console.log('\n🔗 5. CHAVES ESTRANGEIRAS:');
    console.log('='.repeat(50));
    const { data: foreignKeys, error: fkError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
        ORDER BY tc.table_name, kcu.column_name;
      `
    });
    
    if (fkError) {
      console.error('❌ Erro ao listar chaves estrangeiras:', fkError);
    } else {
      if (foreignKeys && foreignKeys.length > 0) {
        console.table(foreignKeys);
      } else {
        console.log('ℹ️ Nenhuma chave estrangeira encontrada.');
      }
    }

    // 6. Listar índices
    console.log('\n📇 6. ÍNDICES:');
    console.log('='.repeat(50));
    const { data: indexes, error: indexesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          t.table_name,
          i.indexname,
          i.indexdef,
          pg_size_pretty(pg_relation_size(i.indexrelid)) as index_size
        FROM information_schema.tables t
        LEFT JOIN pg_indexes i ON t.table_name = i.tablename
        WHERE t.table_schema = 'public'
          AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name, i.indexname;
      `
    });
    
    if (indexesError) {
      console.error('❌ Erro ao listar índices:', indexesError);
    } else {
      console.table(indexes);
    }

    // 7. Listar políticas RLS
    console.log('\n🔒 7. POLÍTICAS RLS (ROW LEVEL SECURITY):');
    console.log('='.repeat(50));
    const { data: rlsPolicies, error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          schemaname,
          tablename,
          rowsecurity as rls_enabled,
          (SELECT count(*) FROM pg_policies WHERE schemaname = pg_tables.schemaname AND tablename = pg_tables.tablename) as policy_count
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `
    });
    
    if (rlsError) {
      console.error('❌ Erro ao listar políticas RLS:', rlsError);
    } else {
      console.table(rlsPolicies);
    }

    // 8. Resumo geral
    console.log('\n📊 8. RESUMO GERAL:');
    console.log('='.repeat(50));
    const { data: summary, error: summaryError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          'Total de tabelas' as metric,
          count(*) as value
        FROM pg_tables 
        WHERE schemaname = 'public'

        UNION ALL

        SELECT 
          'Tabelas com RLS habilitado' as metric,
          count(*) as value
        FROM pg_tables 
        WHERE schemaname = 'public' AND rowsecurity = true

        UNION ALL

        SELECT 
          'Tabelas com triggers' as metric,
          count(*) as value
        FROM pg_tables 
        WHERE schemaname = 'public' AND hastriggers = true

        UNION ALL

        SELECT 
          'Tabelas com índices' as metric,
          count(*) as value
        FROM pg_tables 
        WHERE schemaname = 'public' AND hasindexes = true;
      `
    });
    
    if (summaryError) {
      console.error('❌ Erro ao gerar resumo:', summaryError);
    } else {
      console.table(summary);
    }

    console.log('\n✅ Listagem concluída com sucesso!');

  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

// Função para listar apenas as tabelas CRM
async function listCRMTables() {
  console.log('🔍 Listando tabelas CRM...\n');
  
  try {
    const { data: crmTables, error: crmError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          tablename,
          tableowner,
          hasindexes,
          hasrules,
          hastriggers,
          rowsecurity
        FROM pg_tables 
        WHERE schemaname = 'public'
          AND tablename LIKE 'crm_%'
        ORDER BY tablename;
      `
    });
    
    if (crmError) {
      console.error('❌ Erro ao listar tabelas CRM:', crmError);
    } else {
      if (crmTables && crmTables.length > 0) {
        console.table(crmTables);
        } else {
        console.log('ℹ️ Nenhuma tabela CRM encontrada. Execute o script create-crm-tables.js para criar as tabelas.');
      }
    }

  } catch (error) {
    console.error('💥 Erro ao listar tabelas CRM:', error.message);
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
if (args.includes('--crm-only')) {
  listCRMTables();
} else {
listAllTables();
}