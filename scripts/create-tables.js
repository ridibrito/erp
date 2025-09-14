const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  console.log('🔄 Criando tabelas do Nexus ERP...');
  
  try {
    // 1. Criar tabela de permissões
    console.log('📋 Criando tabela permissions...');
    const { error: permError } = await supabase
      .from('permissions')
      .select('*')
      .limit(1);
    
    if (permError && permError.code === 'PGRST116') {
      // Tabela não existe, vamos criar via SQL
      console.log('📋 Tabela permissions não existe, criando...');
      
      // Vamos usar uma abordagem diferente - inserir dados diretamente
      const permissions = [
        { name: 'dashboard.view', description: 'Visualizar dashboard', module: 'dashboard', action: 'view', resource: 'dashboard' },
        { name: 'users.view', description: 'Visualizar usuários', module: 'users', action: 'view', resource: 'users' },
        { name: 'users.create', description: 'Criar usuários', module: 'users', action: 'create', resource: 'users' },
        { name: 'users.edit', description: 'Editar usuários', module: 'users', action: 'edit', resource: 'users' },
        { name: 'users.delete', description: 'Excluir usuários', module: 'users', action: 'delete', resource: 'users' },
        { name: 'crm.leads.view', description: 'Visualizar leads', module: 'crm', action: 'view', resource: 'leads' },
        { name: 'crm.leads.create', description: 'Criar leads', module: 'crm', action: 'create', resource: 'leads' },
        { name: 'crm.leads.edit', description: 'Editar leads', module: 'crm', action: 'edit', resource: 'leads' },
        { name: 'crm.leads.delete', description: 'Excluir leads', module: 'crm', action: 'delete', resource: 'leads' },
        { name: 'finance.invoices.view', description: 'Visualizar faturas', module: 'finance', action: 'view', resource: 'invoices' },
        { name: 'finance.invoices.create', description: 'Criar faturas', module: 'finance', action: 'create', resource: 'invoices' },
        { name: 'finance.invoices.edit', description: 'Editar faturas', module: 'finance', action: 'edit', resource: 'invoices' },
        { name: 'finance.invoices.delete', description: 'Excluir faturas', module: 'finance', action: 'delete', resource: 'invoices' },
        { name: 'projects.view', description: 'Visualizar projetos', module: 'projects', action: 'view', resource: 'projects' },
        { name: 'projects.create', description: 'Criar projetos', module: 'projects', action: 'create', resource: 'projects' },
        { name: 'projects.edit', description: 'Editar projetos', module: 'projects', action: 'edit', resource: 'projects' },
        { name: 'projects.delete', description: 'Excluir projetos', module: 'projects', action: 'delete', resource: 'projects' },
        { name: 'reports.view', description: 'Visualizar relatórios', module: 'reports', action: 'view', resource: 'reports' },
        { name: 'settings.view', description: 'Visualizar configurações', module: 'settings', action: 'view', resource: 'settings' },
        { name: 'settings.edit', description: 'Editar configurações', module: 'settings', action: 'edit', resource: 'settings' },
        { name: 'system.admin', description: 'Acesso administrativo completo', module: 'system', action: 'admin', resource: 'system' }
      ];

      console.log('⚠️  Tabela permissions não existe. Por favor, crie as tabelas manualmente no Supabase Studio.');
      console.log('📝 SQL para criar a tabela permissions:');
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
    } else {
      console.log('✅ Tabela permissions já existe!');
    }

    // 2. Inserir permissões se a tabela existir
    console.log('🌱 Inserindo permissões iniciais...');
    const permissions = [
      { name: 'dashboard.view', description: 'Visualizar dashboard', module: 'dashboard', action: 'view', resource: 'dashboard' },
      { name: 'users.view', description: 'Visualizar usuários', module: 'users', action: 'view', resource: 'users' },
      { name: 'users.create', description: 'Criar usuários', module: 'users', action: 'create', resource: 'users' },
      { name: 'users.edit', description: 'Editar usuários', module: 'users', action: 'edit', resource: 'users' },
      { name: 'users.delete', description: 'Excluir usuários', module: 'users', action: 'delete', resource: 'users' },
      { name: 'crm.leads.view', description: 'Visualizar leads', module: 'crm', action: 'view', resource: 'leads' },
      { name: 'crm.leads.create', description: 'Criar leads', module: 'crm', action: 'create', resource: 'leads' },
      { name: 'crm.leads.edit', description: 'Editar leads', module: 'crm', action: 'edit', resource: 'leads' },
      { name: 'crm.leads.delete', description: 'Excluir leads', module: 'crm', action: 'delete', resource: 'leads' },
      { name: 'finance.invoices.view', description: 'Visualizar faturas', module: 'finance', action: 'view', resource: 'invoices' },
      { name: 'finance.invoices.create', description: 'Criar faturas', module: 'finance', action: 'create', resource: 'invoices' },
      { name: 'finance.invoices.edit', description: 'Editar faturas', module: 'finance', action: 'edit', resource: 'invoices' },
      { name: 'finance.invoices.delete', description: 'Excluir faturas', module: 'finance', action: 'delete', resource: 'invoices' },
      { name: 'projects.view', description: 'Visualizar projetos', module: 'projects', action: 'view', resource: 'projects' },
      { name: 'projects.create', description: 'Criar projetos', module: 'projects', action: 'create', resource: 'projects' },
      { name: 'projects.edit', description: 'Editar projetos', module: 'projects', action: 'edit', resource: 'projects' },
      { name: 'projects.delete', description: 'Excluir projetos', module: 'projects', action: 'delete', resource: 'projects' },
      { name: 'reports.view', description: 'Visualizar relatórios', module: 'reports', action: 'view', resource: 'reports' },
      { name: 'settings.view', description: 'Visualizar configurações', module: 'settings', action: 'view', resource: 'settings' },
      { name: 'settings.edit', description: 'Editar configurações', module: 'settings', action: 'edit', resource: 'settings' },
      { name: 'system.admin', description: 'Acesso administrativo completo', module: 'system', action: 'admin', resource: 'system' }
    ];

    for (const permission of permissions) {
      const { error } = await supabase
        .from('permissions')
        .upsert(permission, { onConflict: 'name' });
      
      if (error && !error.message.includes('duplicate key')) {
        console.error(`❌ Erro ao inserir permissão ${permission.name}:`, error);
      }
    }
    
    console.log('✅ Permissões iniciais inseridas!');
    return true;
    
  } catch (error) {
    console.error('💥 Erro ao criar tabelas:', error);
    throw error;
  }
}

// Função principal
async function main() {
  try {
    console.log('🚀 Configurando banco de dados do Nexus ERP...');
    console.log(`📡 Conectando ao Supabase: ${supabaseUrl}`);
    
    const success = await createTables();
    
    if (success) {
      console.log('🎉 Configuração do banco de dados concluída com sucesso!');
      console.log('✨ O Nexus ERP está pronto para uso!');
    } else {
      console.log('⚠️  Configure as tabelas manualmente no Supabase Studio e execute novamente.');
    }
    
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { createTables };
