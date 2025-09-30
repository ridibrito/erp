const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Iniciando migration CRM...\n');

    // Ler arquivo de migration
    const migrationPath = path.join(__dirname, '../supabase/migrations/005_crm_pipelines_negocios.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Executando migration 005_crm_pipelines_negocios.sql...');

    // Executar migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migration
    });

    if (error) {
      console.error('❌ Erro ao executar migration:', error.message);
      console.error('Detalhes:', error);
      
      // Tentar executar cada statement separadamente
      console.log('\n⚠️  Tentando executar statements individualmente...\n');
      
      const statements = migration
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', {
              sql: statement + ';'
            });
            
            if (stmtError) {
              console.error(`❌ Erro no statement: ${statement.substring(0, 80)}...`);
              console.error('   ', stmtError.message);
            } else {
              console.log(`✅ Statement executado com sucesso`);
            }
          } catch (err) {
            console.error(`❌ Erro: ${err.message}`);
          }
        }
      }
    } else {
      console.log('✅ Migration executada com sucesso!');
    }

    console.log('\n✨ Migration concluída!\n');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    process.exit(1);
  }
}

runMigration();

