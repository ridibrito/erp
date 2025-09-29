const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMissingColumns() {
  try {
    console.log('🔍 Verificando colunas faltantes nas tabelas CRM...\n');

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'check-missing-columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Executar as consultas
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Erro ao executar consulta:', error);
      return;
    }

    console.log('📊 Resultado da verificação:');
    console.log(JSON.stringify(data, null, 2));

    // Verificar se há colunas faltantes
    const missingColumns = data.filter(row => row.status === 'MISSING');
    
    if (missingColumns.length > 0) {
      console.log('\n❌ Colunas faltantes encontradas:');
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

checkMissingColumns();
