const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedInitialData() {
  try {
    console.log('🌱 Iniciando seed de dados iniciais...');
    
    // 1. Inserir permissões básicas
    console.log('📝 Inserindo permissões básicas...');
    
    const permissions = [
      // Dashboard
      { name: 'dashboard.view', description: 'Visualizar dashboard', module: 'dashboard', action: 'view', resource: 'dashboard' },
      
      // Usuários e Organização
      { name: 'users.view', description: 'Visualizar usuários', module: 'users', action: 'view', resource: 'users' },
      { name: 'users.create', description: 'Criar usuários', module: 'users', action: 'create', resource: 'users' },
      { name: 'users.edit', description: 'Editar usuários', module: 'users', action: 'edit', resource: 'users' },
      { name: 'users.delete', description: 'Excluir usuários', module: 'users', action: 'delete', resource: 'users' },
      
      // CRM
      { name: 'crm.leads.view', description: 'Visualizar leads', module: 'crm', action: 'view', resource: 'leads' },
      { name: 'crm.leads.create', description: 'Criar leads', module: 'crm', action: 'create', resource: 'leads' },
      { name: 'crm.leads.edit', description: 'Editar leads', module: 'crm', action: 'edit', resource: 'leads' },
      { name: 'crm.leads.delete', description: 'Excluir leads', module: 'crm', action: 'delete', resource: 'leads' },
      { name: 'crm.accounts.view', description: 'Visualizar contas', module: 'crm', action: 'view', resource: 'accounts' },
      { name: 'crm.accounts.create', description: 'Criar contas', module: 'crm', action: 'create', resource: 'accounts' },
      { name: 'crm.accounts.edit', description: 'Editar contas', module: 'crm', action: 'edit', resource: 'accounts' },
      { name: 'crm.accounts.delete', description: 'Excluir contas', module: 'crm', action: 'delete', resource: 'accounts' },
      { name: 'crm.deals.view', description: 'Visualizar negócios', module: 'crm', action: 'view', resource: 'deals' },
      { name: 'crm.deals.create', description: 'Criar negócios', module: 'crm', action: 'create', resource: 'deals' },
      { name: 'crm.deals.edit', description: 'Editar negócios', module: 'crm', action: 'edit', resource: 'deals' },
      { name: 'crm.deals.delete', description: 'Excluir negócios', module: 'crm', action: 'delete', resource: 'deals' },
      
      // Financeiro
      { name: 'finance.invoices.view', description: 'Visualizar faturas', module: 'finance', action: 'view', resource: 'invoices' },
      { name: 'finance.invoices.create', description: 'Criar faturas', module: 'finance', action: 'create', resource: 'invoices' },
      { name: 'finance.invoices.edit', description: 'Editar faturas', module: 'finance', action: 'edit', resource: 'invoices' },
      { name: 'finance.invoices.delete', description: 'Excluir faturas', module: 'finance', action: 'delete', resource: 'invoices' },
      { name: 'finance.payments.view', description: 'Visualizar pagamentos', module: 'finance', action: 'view', resource: 'payments' },
      { name: 'finance.payments.create', description: 'Criar pagamentos', module: 'finance', action: 'create', resource: 'payments' },
      { name: 'finance.payments.edit', description: 'Editar pagamentos', module: 'finance', action: 'edit', resource: 'payments' },
      { name: 'finance.payments.delete', description: 'Excluir pagamentos', module: 'finance', action: 'delete', resource: 'payments' },
      
      // Projetos
      { name: 'projects.view', description: 'Visualizar projetos', module: 'projects', action: 'view', resource: 'projects' },
      { name: 'projects.create', description: 'Criar projetos', module: 'projects', action: 'create', resource: 'projects' },
      { name: 'projects.edit', description: 'Editar projetos', module: 'projects', action: 'edit', resource: 'projects' },
      { name: 'projects.delete', description: 'Excluir projetos', module: 'projects', action: 'delete', resource: 'projects' },
      
      // Relatórios
      { name: 'reports.view', description: 'Visualizar relatórios', module: 'reports', action: 'view', resource: 'reports' },
      { name: 'reports.create', description: 'Criar relatórios', module: 'reports', action: 'create', resource: 'reports' },
      { name: 'reports.export', description: 'Exportar relatórios', module: 'reports', action: 'export', resource: 'reports' },
      
      // Configurações
      { name: 'settings.view', description: 'Visualizar configurações', module: 'settings', action: 'view', resource: 'settings' },
      { name: 'settings.edit', description: 'Editar configurações', module: 'settings', action: 'edit', resource: 'settings' },
      
      // Sistema
      { name: 'system.admin', description: 'Acesso administrativo completo', module: 'system', action: 'admin', resource: 'system' },
      { name: 'system.audit', description: 'Visualizar logs de auditoria', module: 'system', action: 'audit', resource: 'system' }
    ];
    
    for (const permission of permissions) {
      const { error } = await supabase
        .from('permissions')
        .upsert(permission, { onConflict: 'name' });
      
      if (error) {
        console.warn(`⚠️  Erro ao inserir permissão ${permission.name}:`, error.message);
      } else {
        console.log(`✅ Permissão ${permission.name} inserida`);
      }
    }
    
    // 2. Criar organização de desenvolvimento
    console.log('🏢 Criando organização de desenvolvimento...');
    
    const devOrgId = '00000000-0000-0000-0000-000000000001';
    
    // 3. Inserir roles básicos
    console.log('👥 Inserindo roles básicos...');
    
    const roles = [
      {
        id: '00000000-0000-0000-0000-000000000010',
        org_id: devOrgId,
        name: 'owner',
        description: 'Proprietário da organização',
        is_system: true,
        is_active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000011',
        org_id: devOrgId,
        name: 'admin',
        description: 'Administrador',
        is_system: true,
        is_active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000012',
        org_id: devOrgId,
        name: 'supervisor',
        description: 'Supervisor',
        is_system: true,
        is_active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000013',
        org_id: devOrgId,
        name: 'financeiro',
        description: 'Usuário financeiro',
        is_system: true,
        is_active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000014',
        org_id: devOrgId,
        name: 'vendedor',
        description: 'Vendedor',
        is_system: true,
        is_active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000015',
        org_id: devOrgId,
        name: 'operacional',
        description: 'Usuário operacional',
        is_system: true,
        is_active: true
      }
    ];
    
    for (const role of roles) {
      const { error } = await supabase
        .from('roles')
        .upsert(role, { onConflict: 'id' });
      
      if (error) {
        console.warn(`⚠️  Erro ao inserir role ${role.name}:`, error.message);
      } else {
        console.log(`✅ Role ${role.name} inserido`);
      }
    }
    
    // 4. Associar permissões aos roles
    console.log('🔗 Associando permissões aos roles...');
    
    // Owner - todas as permissões
    const { data: allPermissions } = await supabase
      .from('permissions')
      .select('id');
    
    if (allPermissions) {
      for (const permission of allPermissions) {
        const { error } = await supabase
          .from('role_permissions')
          .upsert({
            role_id: '00000000-0000-0000-0000-000000000010', // owner
            permission_id: permission.id
          }, { onConflict: 'role_id,permission_id' });
        
        if (error) {
          console.warn(`⚠️  Erro ao associar permissão ao owner:`, error.message);
        }
      }
      console.log('✅ Permissões associadas ao owner');
    }
    
    // Admin - permissões administrativas
    const adminPermissions = [
      'dashboard.view', 'users.view', 'users.create', 'users.edit', 'users.delete',
      'crm.leads.view', 'crm.leads.create', 'crm.leads.edit', 'crm.leads.delete',
      'crm.accounts.view', 'crm.accounts.create', 'crm.accounts.edit', 'crm.accounts.delete',
      'crm.deals.view', 'crm.deals.create', 'crm.deals.edit', 'crm.deals.delete',
      'finance.invoices.view', 'finance.invoices.create', 'finance.invoices.edit', 'finance.invoices.delete',
      'finance.payments.view', 'finance.payments.create', 'finance.payments.edit', 'finance.payments.delete',
      'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
      'reports.view', 'reports.create', 'reports.export',
      'settings.view', 'settings.edit'
    ];
    
    for (const permName of adminPermissions) {
      const { data: permission } = await supabase
        .from('permissions')
        .select('id')
        .eq('name', permName)
        .single();
      
      if (permission) {
        const { error } = await supabase
          .from('role_permissions')
          .upsert({
            role_id: '00000000-0000-0000-0000-000000000011', // admin
            permission_id: permission.id
          }, { onConflict: 'role_id,permission_id' });
        
        if (error) {
          console.warn(`⚠️  Erro ao associar permissão ${permName} ao admin:`, error.message);
        }
      }
    }
    console.log('✅ Permissões associadas ao admin');
    
    // 5. Criar configurações da organização
    console.log('⚙️  Criando configurações da organização...');
    
    const orgSettings = [
      {
        org_id: devOrgId,
        key: 'general',
        value: {
          name: 'Organização de Desenvolvimento',
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
          language: 'pt-BR'
        }
      },
      {
        org_id: devOrgId,
        key: 'features',
        value: {
          crm: true,
          finance: true,
          projects: true,
          reports: true,
          integrations: true
        }
      }
    ];
    
    for (const setting of orgSettings) {
      const { error } = await supabase
        .from('tenant_settings')
        .upsert(setting, { onConflict: 'org_id,key' });
      
      if (error) {
        console.warn(`⚠️  Erro ao inserir configuração ${setting.key}:`, error.message);
      } else {
        console.log(`✅ Configuração ${setting.key} inserida`);
      }
    }
    
    console.log('🎉 Seed de dados iniciais concluído com sucesso!');
    
    // 6. Verificar dados inseridos
    console.log('📊 Verificando dados inseridos...');
    
    const { data: permCount } = await supabase
      .from('permissions')
      .select('count', { count: 'exact' });
    
    const { data: roleCount } = await supabase
      .from('roles')
      .select('count', { count: 'exact' });
    
    const { data: rolePermCount } = await supabase
      .from('role_permissions')
      .select('count', { count: 'exact' });
    
    console.log(`📈 Estatísticas:`);
    console.log(`   - Permissões: ${permCount?.[0]?.count || 0}`);
    console.log(`   - Roles: ${roleCount?.[0]?.count || 0}`);
    console.log(`   - Associações role-permissão: ${rolePermCount?.[0]?.count || 0}`);
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  }
}

seedInitialData();
