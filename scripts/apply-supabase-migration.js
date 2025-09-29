const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
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

// Função para executar SQL
async function executeSQL(sql) {
  try {
    console.log('🔄 Executando migração...');
    
    // Dividir o SQL em comandos individuais
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    for (const command of commands) {
      if (command.trim()) {
        console.log(`📝 Executando: ${command.substring(0, 50)}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: command + ';'
        });

        if (error) {
          // Ignorar erros de "já existe" para comandos CREATE
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('relation already exists')) {
            console.log(`⚠️  ${error.message} (ignorado)`);
            continue;
          }
          console.error(`❌ Erro: ${error.message}`);
          return false;
        }
      }
    }
    
    console.log('✅ Migração executada com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error.message);
    return false;
  }
}

// Função para verificar se as tabelas foram criadas
async function verifyTables() {
  try {
    console.log('🔍 Verificando tabelas criadas...');
    
    const expectedTables = [
      'tenant_domains', 'tenant_settings', 'permissions', 'roles', 
      'role_permissions', 'user_permissions', 'user_sessions',
      'two_factor_auth', 'trusted_devices', 'data_consents',
      'data_subject_requests', 'data_processing_logs', 'audit_logs',
      'security_logs', 'api_keys', 'oauth_connections'
    ];

    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', expectedTables);

    if (error) {
      console.error('❌ Erro ao verificar tabelas:', error.message);
      return false;
    }

    const existingTables = data?.map(t => t.table_name) || [];
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));

    console.log('✅ Tabelas existentes:', existingTables.join(', '));
    
    if (missingTables.length > 0) {
      console.log('❌ Tabelas faltando:', missingTables.join(', '));
      return false;
    } else {
      console.log('✅ Todas as tabelas foram criadas com sucesso!');
      return true;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
    return false;
  }
}

// Função para verificar permissões
async function verifyPermissions() {
  try {
    console.log('🔍 Verificando permissões...');
    
    const { data, error } = await supabase
      .from('permissions')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao verificar permissões:', error.message);
      return false;
    }

    console.log('✅ Permissões verificadas com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar permissões:', error.message);
    return false;
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando aplicação de migração do Cortus ERP...');
  console.log('📡 Conectando ao Supabase:', supabaseUrl);

  try {
    // 1. Ler arquivo de migração
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_foundation_identity_security.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Arquivo de migração não encontrado:', migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Arquivo de migração carregado');

    // 2. Executar migração
    const success = await executeSQL(migrationSQL);
    
    if (!success) {
      console.error('❌ Falha na execução da migração');
      process.exit(1);
    }

    // 3. Verificar tabelas
    const tablesOk = await verifyTables();
    
    if (!tablesOk) {
      console.error('❌ Verificação de tabelas falhou');
      process.exit(1);
    }

    // 4. Verificar permissões
    const permissionsOk = await verifyPermissions();
    
    if (!permissionsOk) {
      console.error('❌ Verificação de permissões falhou');
      process.exit(1);
    }

    console.log('🎉 Migração aplicada com sucesso!');
    console.log('✅ Banco de dados configurado e pronto para uso');
    console.log('🔗 Acesse o Supabase Studio para visualizar as tabelas');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { executeSQL, verifyTables, verifyPermissions };
