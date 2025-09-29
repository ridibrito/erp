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

async function checkTypeColumn() {
  try {
    console.log('🔍 Verificando colunas type e name na tabela crm_contacts...\n');

    // SQL para verificar e adicionar colunas
    const sql = `
      -- Verificar se a coluna type existe na tabela crm_contacts
      SELECT 
          'crm_contacts' as table_name,
          'type' as column_name,
          CASE WHEN EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'crm_contacts' 
              AND column_name = 'type'
          ) THEN 'EXISTS' ELSE 'MISSING' END as status;

      -- Adicionar coluna type se não existir
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'crm_contacts' 
              AND column_name = 'type'
          ) THEN
              ALTER TABLE crm_contacts ADD COLUMN type VARCHAR(20) DEFAULT 'person' CHECK (type IN ('person', 'company'));
              RAISE NOTICE 'Coluna type adicionada à tabela crm_contacts';
          ELSE
              RAISE NOTICE 'Coluna type já existe na tabela crm_contacts';
          END IF;
      END $$;

      -- Verificar se a coluna name existe na tabela crm_contacts
      SELECT 
          'crm_contacts' as table_name,
          'name' as column_name,
          CASE WHEN EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'crm_contacts' 
              AND column_name = 'name'
          ) THEN 'EXISTS' ELSE 'MISSING' END as status;

      -- Adicionar coluna name se não existir
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'crm_contacts' 
              AND column_name = 'name'
          ) THEN
              ALTER TABLE crm_contacts ADD COLUMN name VARCHAR(255);
              RAISE NOTICE 'Coluna name adicionada à tabela crm_contacts';
          ELSE
              RAISE NOTICE 'Coluna name já existe na tabela crm_contacts';
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
          'type' as column_name,
          CASE WHEN EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'crm_contacts' 
              AND column_name = 'type'
          ) THEN 'EXISTS' ELSE 'MISSING' END as status
      UNION ALL
      SELECT 
          'crm_contacts' as table_name,
          'name' as column_name,
          CASE WHEN EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'crm_contacts' 
              AND column_name = 'name'
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

checkTypeColumn();
