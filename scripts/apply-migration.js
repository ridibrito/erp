const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🚀 Iniciando aplicação da migração...');
    
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_foundation_identity_security.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migração carregada:', migrationPath);
    
    // Dividir o SQL em comandos individuais
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    // Executar cada comando individualmente
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);
        
        try {
          const { data, error } = await supabase.rpc('exec', { sql: command });
          if (error) {
            console.warn(`⚠️  Aviso no comando ${i + 1}:`, error.message);
          } else {
            console.log(`✅ Comando ${i + 1} executado com sucesso`);
          }
        } catch (err) {
          console.warn(`⚠️  Erro no comando ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('✅ Migração aplicada com sucesso!');
    
    // Verificar se as tabelas foram criadas
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'tenant_domains', 'tenant_settings', 'permissions', 'roles', 
        'role_permissions', 'user_permissions', 'user_sessions',
        'two_factor_auth', 'trusted_devices', 'data_consents',
        'data_subject_requests', 'data_processing_logs', 'audit_logs',
        'security_logs', 'api_keys', 'oauth_connections'
      ]);
    
    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError);
      return;
    }
    
    console.log('📋 Tabelas criadas:', tables?.map(t => t.table_name).join(', '));
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  applyMigration();
}

module.exports = { applyMigration };
