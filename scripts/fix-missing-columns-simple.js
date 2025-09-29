const { createClient } = require('@supabase/supabase-js');

// Carregar configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixMissingColumns() {
  try {
    console.log('🔧 Corrigindo colunas faltantes nas tabelas CRM...\n');

    // SQL para adicionar colunas faltantes
    const sql = `
      -- Adicionar coluna organization_id na tabela crm_contacts se não existir
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'crm_contacts' 
              AND column_name = 'organization_id'
          ) THEN
              ALTER TABLE crm_contacts ADD COLUMN organization_id UUID;
              RAISE NOTICE 'Coluna organization_id adicionada à tabela crm_contacts';
          ELSE
              RAISE NOTICE 'Coluna organization_id já existe na tabela crm_contacts';
          END IF;
      END $$;

      -- Adicionar coluna fantasy_name na tabela crm_contacts se não existir
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'crm_contacts' 
              AND column_name = 'fantasy_name'
          ) THEN
              ALTER TABLE crm_contacts ADD COLUMN fantasy_name VARCHAR(255);
              RAISE NOTICE 'Coluna fantasy_name adicionada à tabela crm_contacts';
          ELSE
              RAISE NOTICE 'Coluna fantasy_name já existe na tabela crm_contacts';
          END IF;
      END $$;

      -- Adicionar coluna organization_id na tabela crm_accounts se não existir
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'crm_accounts' 
              AND column_name = 'organization_id'
          ) THEN
              ALTER TABLE crm_accounts ADD COLUMN organization_id UUID;
              RAISE NOTICE 'Coluna organization_id adicionada à tabela crm_accounts';
          ELSE
              RAISE NOTICE 'Coluna organization_id já existe na tabela crm_accounts';
          END IF;
      END $$;
    `;

    // Executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      return;
    }

    console.log('✅ SQL executado com sucesso!');
    console.log('Resultado:', data);

    // Verificar se as colunas foram adicionadas
    console.log('\n🔍 Verificando se as colunas foram adicionadas...');
    
    const checkSql = `
      SELECT 
          'crm_contacts' as table_name,
          'organization_id' as column_name,
          CASE WHEN EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'crm_contacts' 
              AND column_name = 'organization_id'
          ) THEN 'EXISTS' ELSE 'MISSING' END as status
      UNION ALL
      SELECT 
          'crm_contacts' as table_name,
          'fantasy_name' as column_name,
          CASE WHEN EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'crm_contacts' 
              AND column_name = 'fantasy_name'
          ) THEN 'EXISTS' ELSE 'MISSING' END as status
      UNION ALL
      SELECT 
          'crm_accounts' as table_name,
          'organization_id' as column_name,
          CASE WHEN EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'crm_accounts' 
              AND column_name = 'organization_id'
          ) THEN 'EXISTS' ELSE 'MISSING' END as status;
    `;

    const { data: checkData, error: checkError } = await supabase.rpc('exec_sql', { sql_query: checkSql });

    if (checkError) {
      console.error('❌ Erro ao verificar colunas:', checkError);
      return;
    }

    console.log('📊 Status das colunas:');
    console.table(checkData);

    // Verificar se há colunas faltantes
    const missingColumns = checkData.filter(row => row.status === 'MISSING');
    
    if (missingColumns.length > 0) {
      console.log('\n❌ Ainda há colunas faltantes:');
      missingColumns.forEach(col => {
        console.log(`   - ${col.table_name}.${col.column_name}`);
      });
    } else {
      console.log('\n✅ Todas as colunas necessárias estão presentes!');
    }

  } catch (err) {
    console.error('❌ Erro:', err);
  }
}

fixMissingColumns();
