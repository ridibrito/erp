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

// Função para executar SQL via API REST
async function executeSQL(sql) {
  try {
    console.log('🔄 Executando migração via API REST...');
    
    // Usar a API REST para executar SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erro na API:', error);
      return false;
    }

    const result = await response.text();
    console.log('✅ Resultado:', result);
    return true;
  } catch (error) {
    console.error('❌ Erro ao executar SQL:', error.message);
    return false;
  }
}

// Função para verificar conexão
async function testConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (error) {
      console.error('❌ Erro de conexão:', error.message);
      return false;
    }

    console.log('✅ Conexão estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    return false;
  }
}

// Função para criar tabelas uma por uma
async function createTables() {
  console.log('🔄 Criando tabelas...');
  
  const tables = [
    {
      name: 'permissions',
      sql: `
        CREATE TABLE IF NOT EXISTS permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          module VARCHAR(100) NOT NULL,
          action VARCHAR(100) NOT NULL,
          resource VARCHAR(100),
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(module, action, resource)
        );
      `
    },
    {
      name: 'roles',
      sql: `
        CREATE TABLE IF NOT EXISTS roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          org_id UUID NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          is_system BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(org_id, name)
        );
      `
    },
    {
      name: 'role_permissions',
      sql: `
        CREATE TABLE IF NOT EXISTS role_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(role_id, permission_id)
        );
      `
    },
    {
      name: 'user_permissions',
      sql: `
        CREATE TABLE IF NOT EXISTS user_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          org_id UUID NOT NULL,
          permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
          granted_by UUID,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, org_id, permission_id)
        );
      `
    },
    {
      name: 'audit_logs',
      sql: `
        CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          org_id UUID NOT NULL,
          user_id UUID,
          action VARCHAR(100) NOT NULL,
          table_name VARCHAR(100) NOT NULL,
          record_id UUID,
          old_values JSONB,
          new_values JSONB,
          ip_address INET,
          user_agent TEXT,
          session_id UUID,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    }
  ];

  for (const table of tables) {
    try {
      console.log(`📝 Criando tabela: ${table.name}`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: table.sql
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Tabela ${table.name} já existe (ignorado)`);
        } else {
          console.error(`❌ Erro ao criar tabela ${table.name}:`, error.message);
        }
      } else {
        console.log(`✅ Tabela ${table.name} criada com sucesso!`);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar tabela ${table.name}:`, error.message);
    }
  }
}

// Função para inserir permissões básicas
async function insertPermissions() {
  console.log('🔄 Inserindo permissões básicas...');
  
  const permissions = [
    { name: 'dashboard.view', description: 'Visualizar dashboard', module: 'dashboard', action: 'view', resource: 'dashboard' },
    { name: 'users.view', description: 'Visualizar usuários', module: 'users', action: 'view', resource: 'users' },
    { name: 'users.create', description: 'Criar usuários', module: 'users', action: 'create', resource: 'users' },
    { name: 'users.edit', description: 'Editar usuários', module: 'users', action: 'edit', resource: 'users' },
    { name: 'users.delete', description: 'Excluir usuários', module: 'users', action: 'delete', resource: 'users' },
    { name: 'crm.clients.view', description: 'Visualizar clientes', module: 'crm', action: 'view', resource: 'clients' },
    { name: 'crm.clients.create', description: 'Criar clientes', module: 'crm', action: 'create', resource: 'clients' },
    { name: 'crm.clients.edit', description: 'Editar clientes', module: 'crm', action: 'edit', resource: 'clients' },
    { name: 'crm.clients.delete', description: 'Excluir clientes', module: 'crm', action: 'delete', resource: 'clients' },
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

    // 2. Criar tabelas
    await createTables();

    // 3. Inserir permissões
    await insertPermissions();

    console.log('🎉 Configuração do banco de dados concluída!');
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

module.exports = { testConnection, createTables, insertPermissions };
