const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

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

// Função para criar tabelas uma por uma
async function createTables() {
  console.log('🔄 Criando tabelas do Nexus ERP...');
  
  try {
    // 1. Tabela de permissões
    console.log('📋 Criando tabela permissions...');
    const { error: permError } = await supabase.rpc('exec_sql', {
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
    });
    
    if (permError && !permError.message.includes('already exists')) {
      console.error('❌ Erro ao criar tabela permissions:', permError);
    } else {
      console.log('✅ Tabela permissions criada!');
    }

    // 2. Tabela de papéis
    console.log('👥 Criando tabela roles...');
    const { error: rolesError } = await supabase.rpc('exec_sql', {
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
    });
    
    if (rolesError && !rolesError.message.includes('already exists')) {
      console.error('❌ Erro ao criar tabela roles:', rolesError);
    } else {
      console.log('✅ Tabela roles criada!');
    }

    // 3. Tabela de relacionamento papel-permissão
    console.log('🔗 Criando tabela role_permissions...');
    const { error: rolePermError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS role_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(role_id, permission_id)
        );
      `
    });
    
    if (rolePermError && !rolePermError.message.includes('already exists')) {
      console.error('❌ Erro ao criar tabela role_permissions:', rolePermError);
    } else {
      console.log('✅ Tabela role_permissions criada!');
    }

    // 4. Tabela de permissões especiais por usuário
    console.log('🔐 Criando tabela user_permissions...');
    const { error: userPermError } = await supabase.rpc('exec_sql', {
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
    });
    
    if (userPermError && !userPermError.message.includes('already exists')) {
      console.error('❌ Erro ao criar tabela user_permissions:', userPermError);
    } else {
      console.log('✅ Tabela user_permissions criada!');
    }

    // 5. Tabela de sessões
    console.log('🔑 Criando tabela user_sessions...');
    const { error: sessionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          org_id UUID NOT NULL,
          session_token VARCHAR(255) UNIQUE NOT NULL,
          device_info JSONB,
          ip_address INET,
          user_agent TEXT,
          expires_at TIMESTAMP NOT NULL,
          revoked_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (sessionsError && !sessionsError.message.includes('already exists')) {
      console.error('❌ Erro ao criar tabela user_sessions:', sessionsError);
    } else {
      console.log('✅ Tabela user_sessions criada!');
    }

    // 6. Tabela de auditoria
    console.log('📊 Criando tabela audit_logs...');
    const { error: auditError } = await supabase.rpc('exec_sql', {
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
    });
    
    if (auditError && !auditError.message.includes('already exists')) {
      console.error('❌ Erro ao criar tabela audit_logs:', auditError);
    } else {
      console.log('✅ Tabela audit_logs criada!');
    }

    console.log('🎉 Todas as tabelas foram criadas com sucesso!');
    
  } catch (error) {
    console.error('💥 Erro ao criar tabelas:', error);
    throw error;
  }
}

// Função para inserir dados iniciais
async function insertInitialData() {
  console.log('🌱 Inserindo dados iniciais...');
  
  try {
    // Inserir permissões básicas
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
    
  } catch (error) {
    console.error('💥 Erro ao inserir dados iniciais:', error);
    throw error;
  }
}

// Função principal
async function main() {
  try {
    console.log('🚀 Configurando banco de dados do Nexus ERP...');
    console.log(`📡 Conectando ao Supabase: ${supabaseUrl}`);
    
    // Criar tabelas
    await createTables();
    
    // Inserir dados iniciais
    await insertInitialData();
    
    console.log('🎉 Configuração do banco de dados concluída com sucesso!');
    console.log('✨ O Nexus ERP está pronto para uso!');
    
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { createTables, insertInitialData };
