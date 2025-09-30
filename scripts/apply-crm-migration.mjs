import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  console.error('Certifique-se de que as variáveis do Supabase estão definidas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('🚀 Aplicando migration CRM...\n');

    // Ler arquivo de migration
    const migrationPath = join(__dirname, '../supabase/migrations/005_crm_pipelines_negocios.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    // Dividir em statements executáveis
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));

    console.log(`📝 Encontrados ${statements.length} statements para executar\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        try {
          // Tentar determinar o tipo de statement
          const statementType = statement.match(/^(CREATE|ALTER|INSERT|DROP|GRANT)/i)?.[1] || 'EXEC';
          const preview = statement.substring(0, 100).replace(/\s+/g, ' ');
          
          process.stdout.write(`[${i+1}/${statements.length}] ${statementType}: ${preview}...`);
          
          const { error } = await supabase.rpc('exec', {
            query: statement + ';'
          });

          if (error) {
            console.log(` ❌`);
            console.error(`     Erro: ${error.message}`);
            errorCount++;
          } else {
            console.log(` ✅`);
            successCount++;
          }
        } catch (err) {
          console.log(` ❌`);
          console.error(`     Erro: ${err.message}`);
          errorCount++;
        }
      }
    }

    console.log(`\n📊 Resultado:`);
    console.log(`   ✅ Sucesso: ${successCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    console.log(`\n✨ Migration concluída!\n`);

  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error);
    process.exit(1);
  }
}

applyMigration();

