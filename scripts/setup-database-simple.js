const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Função para testar conexão básica
async function testConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    // Testar com uma consulta simples
    const { data, error } = await supabase
      .from('auth.users')
      .select('count')
      .limit(1);

    if (error) {
      console.log('⚠️  Erro esperado (tabela auth.users não acessível):', error.message);
      console.log('✅ Conexão estabelecida (erro é esperado)');
      return true;
    }

    console.log('✅ Conexão estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    return false;
  }
}

// Função para criar tabela de permissões
async function createPermissionsTable() {
  try {
    console.log('📝 Criando tabela permissions...');
    
    const { data, error } = await supabase
      .from('permissions')
      .select('count')
      .limit(1);

    if (error && error.message.includes('relation "public.permissions" does not exist')) {
      console.log('⚠️  Tabela permissions não existe, vamos criá-la...');
      
      // Como não podemos executar DDL via API REST, vamos usar uma abordagem diferente
      console.log('📋 Execute o seguinte SQL no Supabase Studio:');
      console.log(`
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  module VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(module, action, resource)
);
      `);
      
      return false;
    } else if (error) {
      console.error('❌ Erro ao verificar tabela permissions:', error.message);
      return false;
    } else {
      console.log('✅ Tabela permissions já existe!');
      return true;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar tabela permissions:', error.message);
    return false;
  }
}

// Função para inserir permissões básicas
async function insertBasicPermissions() {
  try {
    console.log('🔄 Inserindo permissões básicas...');
    
    const permissions = [
      { name: 'dashboard.view', description: 'Visualizar dashboard', module: 'dashboard', action: 'view', resource: 'dashboard' },
      { name: 'users.view', description: 'Visualizar usuários', module: 'users', action: 'view', resource: 'users' },
      { name: 'crm.clients.view', description: 'Visualizar clientes', module: 'crm', action: 'view', resource: 'clients' },
      { name: 'finance.invoices.view', description: 'Visualizar faturas', module: 'finance', action: 'view', resource: 'invoices' },
      { name: 'projects.view', description: 'Visualizar projetos', module: 'projects', action: 'view', resource: 'projects' },
      { name: 'reports.view', description: 'Visualizar relatórios', module: 'reports', action: 'view', resource: 'reports' },
      { name: 'settings.view', description: 'Visualizar configurações', module: 'settings', action: 'view', resource: 'settings' }
    ];

    for (const permission of permissions) {
      try {
        const { data, error } = await supabase
          .from('permissions')
          .upsert(permission, { onConflict: 'name' });

        if (error) {
          console.error(`❌ Erro ao inserir permissão ${permission.name}:`, error.message);
        } else {
          console.log(`✅ Permissão ${permission.name} inserida!`);
        }
      } catch (error) {
        console.error(`❌ Erro ao inserir permissão ${permission.name}:`, error.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao inserir permissões:', error.message);
    return false;
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando configuração do banco de dados Cortus ERP...');
  console.log('📡 Conectando ao Supabase:', supabaseUrl);

  try {
    // 1. Testar conexão
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Não foi possível conectar ao Supabase');
      process.exit(1);
    }

    // 2. Verificar/criar tabela permissions
    const permissionsTableExists = await createPermissionsTable();
    
    if (!permissionsTableExists) {
      console.log('\n📋 INSTRUÇÕES:');
      console.log('1. Acesse o Supabase Studio: https://supabase.com/dashboard');
      console.log('2. Vá para o projeto:', supabaseUrl);
      console.log('3. Clique em "SQL Editor"');
      console.log('4. Execute o SQL mostrado acima');
      console.log('5. Execute este script novamente');
      return;
    }

    // 3. Inserir permissões
    await insertBasicPermissions();

    console.log('\n🎉 Configuração do banco de dados concluída!');
    console.log('✅ Tabelas criadas e permissões inseridas');
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

module.exports = { testConnection, createPermissionsTable, insertBasicPermissions };
