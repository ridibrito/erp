-- =====================================================
-- SEED DE DADOS INICIAIS - NEXUS ERP
-- =====================================================

-- Inserir permissões básicas do sistema
INSERT INTO permissions (name, description, module, action, resource) VALUES
-- Dashboard
('dashboard.view', 'Visualizar dashboard', 'dashboard', 'view', 'dashboard'),

-- Usuários e Organização
('users.view', 'Visualizar usuários', 'users', 'view', 'users'),
('users.create', 'Criar usuários', 'users', 'create', 'users'),
('users.edit', 'Editar usuários', 'users', 'edit', 'users'),
('users.delete', 'Excluir usuários', 'users', 'delete', 'users'),

-- CRM
('crm.leads.view', 'Visualizar leads', 'crm', 'view', 'leads'),
('crm.leads.create', 'Criar leads', 'crm', 'create', 'leads'),
('crm.leads.edit', 'Editar leads', 'crm', 'edit', 'leads'),
('crm.leads.delete', 'Excluir leads', 'crm', 'delete', 'leads'),
('crm.accounts.view', 'Visualizar contas', 'crm', 'view', 'accounts'),
('crm.accounts.create', 'Criar contas', 'crm', 'create', 'accounts'),
('crm.accounts.edit', 'Editar contas', 'crm', 'edit', 'accounts'),
('crm.accounts.delete', 'Excluir contas', 'crm', 'delete', 'accounts'),
('crm.deals.view', 'Visualizar negócios', 'crm', 'view', 'deals'),
('crm.deals.create', 'Criar negócios', 'crm', 'create', 'deals'),
('crm.deals.edit', 'Editar negócios', 'crm', 'edit', 'deals'),
('crm.deals.delete', 'Excluir negócios', 'crm', 'delete', 'deals'),

-- Financeiro
('finance.invoices.view', 'Visualizar faturas', 'finance', 'view', 'invoices'),
('finance.invoices.create', 'Criar faturas', 'finance', 'create', 'invoices'),
('finance.invoices.edit', 'Editar faturas', 'finance', 'edit', 'invoices'),
('finance.invoices.delete', 'Excluir faturas', 'finance', 'delete', 'invoices'),
('finance.payments.view', 'Visualizar pagamentos', 'finance', 'view', 'payments'),
('finance.payments.create', 'Criar pagamentos', 'finance', 'create', 'payments'),
('finance.payments.edit', 'Editar pagamentos', 'finance', 'edit', 'payments'),
('finance.payments.delete', 'Excluir pagamentos', 'finance', 'delete', 'payments'),

-- Projetos
('projects.view', 'Visualizar projetos', 'projects', 'view', 'projects'),
('projects.create', 'Criar projetos', 'projects', 'create', 'projects'),
('projects.edit', 'Editar projetos', 'projects', 'edit', 'projects'),
('projects.delete', 'Excluir projetos', 'projects', 'delete', 'projects'),

-- Relatórios
('reports.view', 'Visualizar relatórios', 'reports', 'view', 'reports'),
('reports.create', 'Criar relatórios', 'reports', 'create', 'reports'),
('reports.export', 'Exportar relatórios', 'reports', 'export', 'reports'),

-- Configurações
('settings.view', 'Visualizar configurações', 'settings', 'view', 'settings'),
('settings.edit', 'Editar configurações', 'settings', 'edit', 'settings'),

-- Sistema
('system.admin', 'Acesso administrativo completo', 'system', 'admin', 'system'),
('system.audit', 'Visualizar logs de auditoria', 'system', 'audit', 'system')
ON CONFLICT (name) DO NOTHING;

-- Criar organização de desenvolvimento
INSERT INTO tenant_settings (org_id, key, value) VALUES
('00000000-0000-0000-0000-000000000001', 'general', '{
  "name": "Organização de Desenvolvimento",
  "timezone": "America/Sao_Paulo",
  "currency": "BRL",
  "language": "pt-BR"
}'),
('00000000-0000-0000-0000-000000000001', 'features', '{
  "crm": true,
  "finance": true,
  "projects": true,
  "reports": true,
  "integrations": true
}')
ON CONFLICT (org_id, key) DO NOTHING;

-- Inserir roles básicos
INSERT INTO roles (id, org_id, name, description, is_system, is_active) VALUES
('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'owner', 'Proprietário da organização', true, true),
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'admin', 'Administrador', true, true),
('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'supervisor', 'Supervisor', true, true),
('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'financeiro', 'Usuário financeiro', true, true),
('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'vendedor', 'Vendedor', true, true),
('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'operacional', 'Usuário operacional', true, true)
ON CONFLICT (id) DO NOTHING;

-- Associar todas as permissões ao role owner
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '00000000-0000-0000-0000-000000000010' as role_id,
    p.id as permission_id
FROM permissions p
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Associar permissões específicas ao role admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '00000000-0000-0000-0000-000000000011' as role_id,
    p.id as permission_id
FROM permissions p
WHERE p.name IN (
    'dashboard.view',
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'crm.leads.view', 'crm.leads.create', 'crm.leads.edit', 'crm.leads.delete',
    'crm.accounts.view', 'crm.accounts.create', 'crm.accounts.edit', 'crm.accounts.delete',
    'crm.deals.view', 'crm.deals.create', 'crm.deals.edit', 'crm.deals.delete',
    'finance.invoices.view', 'finance.invoices.create', 'finance.invoices.edit', 'finance.invoices.delete',
    'finance.payments.view', 'finance.payments.create', 'finance.payments.edit', 'finance.payments.delete',
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
    'reports.view', 'reports.create', 'reports.export',
    'settings.view', 'settings.edit'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Associar permissões ao role supervisor
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '00000000-0000-0000-0000-000000000012' as role_id,
    p.id as permission_id
FROM permissions p
WHERE p.name IN (
    'dashboard.view',
    'users.view',
    'crm.leads.view', 'crm.leads.create', 'crm.leads.edit',
    'crm.accounts.view', 'crm.accounts.create', 'crm.accounts.edit',
    'crm.deals.view', 'crm.deals.create', 'crm.deals.edit',
    'finance.invoices.view', 'finance.payments.view',
    'projects.view', 'projects.create', 'projects.edit',
    'reports.view'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Associar permissões ao role financeiro
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '00000000-0000-0000-0000-000000000013' as role_id,
    p.id as permission_id
FROM permissions p
WHERE p.name IN (
    'dashboard.view',
    'finance.invoices.view', 'finance.invoices.create', 'finance.invoices.edit', 'finance.invoices.delete',
    'finance.payments.view', 'finance.payments.create', 'finance.payments.edit', 'finance.payments.delete',
    'reports.view', 'reports.export'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Associar permissões ao role vendedor
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '00000000-0000-0000-0000-000000000014' as role_id,
    p.id as permission_id
FROM permissions p
WHERE p.name IN (
    'dashboard.view',
    'crm.leads.view', 'crm.leads.create', 'crm.leads.edit',
    'crm.accounts.view', 'crm.accounts.create', 'crm.accounts.edit',
    'crm.deals.view', 'crm.deals.create', 'crm.deals.edit',
    'reports.view'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Associar permissões ao role operacional
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    '00000000-0000-0000-0000-000000000015' as role_id,
    p.id as permission_id
FROM permissions p
WHERE p.name IN (
    'dashboard.view',
    'projects.view', 'projects.create', 'projects.edit',
    'reports.view'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Verificar dados inseridos
SELECT 'Permissões' as tipo, COUNT(*) as quantidade FROM permissions
UNION ALL
SELECT 'Roles' as tipo, COUNT(*) as quantidade FROM roles
UNION ALL
SELECT 'Associações Role-Permissão' as tipo, COUNT(*) as quantidade FROM role_permissions
UNION ALL
SELECT 'Configurações' as tipo, COUNT(*) as quantidade FROM tenant_settings;
