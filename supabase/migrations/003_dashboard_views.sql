-- =====================================================
-- NEXUS ERP - DASHBOARD VIEWS (MVP)
-- Migração: 003_dashboard_views.sql
-- Data: 2024-01-XX
-- =====================================================

-- =====================================================
-- 1. VIEWS FINANCEIRAS
-- =====================================================

-- KPIs Financeiros Gerais
CREATE OR REPLACE VIEW v_financial_kpis AS
SELECT 
  org_id,
  -- A receber aberto (faturas não pagas)
  COALESCE(SUM(CASE WHEN status IN ('sent', 'overdue', 'partially_paid') THEN total ELSE 0 END), 0) as receivables_open,
  
  -- Pagos no mês atual
  COALESCE(SUM(CASE 
    WHEN status = 'paid' 
    AND paid_date >= DATE_TRUNC('month', CURRENT_DATE)
    AND paid_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    THEN total 
    ELSE 0 
  END), 0) as paid_this_month,
  
  -- Vencendo hoje
  COALESCE(SUM(CASE 
    WHEN status IN ('sent', 'overdue', 'partially_paid')
    AND due_date = CURRENT_DATE
    THEN total 
    ELSE 0 
  END), 0) as due_today,
  
  -- Total de faturas emitidas no mês
  COUNT(CASE 
    WHEN issue_date >= DATE_TRUNC('month', CURRENT_DATE)
    AND issue_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    THEN 1 
  END) as invoices_this_month,
  
  -- Valor total emitido no mês
  COALESCE(SUM(CASE 
    WHEN issue_date >= DATE_TRUNC('month', CURRENT_DATE)
    AND issue_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    THEN total 
    ELSE 0 
  END), 0) as total_issued_this_month

FROM fin_invoices 
WHERE org_id IS NOT NULL
GROUP BY org_id;

-- Faturas vencendo hoje
CREATE OR REPLACE VIEW fin_invoices_due_today AS
SELECT 
  i.*,
  c.name as customer_name,
  c.email as customer_email
FROM fin_invoices i
LEFT JOIN crm_accounts c ON i.customer_id = c.id
WHERE i.status IN ('sent', 'overdue', 'partially_paid')
  AND i.due_date = CURRENT_DATE
ORDER BY i.due_date ASC, i.total DESC;

-- =====================================================
-- 2. VIEWS CRM - FUNIL DE VENDAS
-- =====================================================

-- Funil de vendas por stage
CREATE OR REPLACE VIEW v_sales_funnel AS
SELECT 
  s.org_id,
  s.id as stage_id,
  s.name as stage_name,
  s.color as stage_color,
  s.order as stage_order,
  s.probability,
  COUNT(d.id) as deals_count,
  COALESCE(SUM(d.value), 0) as deals_value,
  p.name as pipeline_name
FROM crm_stages s
LEFT JOIN crm_pipelines p ON s.pipeline_id = p.id
LEFT JOIN crm_deals d ON s.id = d.stage_id AND d.status = 'open'
WHERE s.org_id IS NOT NULL
GROUP BY s.org_id, s.id, s.name, s.color, s.order, s.probability, p.name
ORDER BY p.name, s.order;

-- =====================================================
-- 3. VIEWS TIMESHEETS
-- =====================================================

-- Timesheets dos últimos 7 dias
CREATE OR REPLACE VIEW v_timesheets_live AS
SELECT 
  t.org_id,
  t.user_id,
  t.project_id,
  t.task_id,
  t.date,
  t.hours,
  t.minutes_live,
  t.description,
  t.status,
  p.name as project_name,
  u.name as user_name,
  u.email as user_email
FROM ops_timesheets t
LEFT JOIN ops_projects p ON t.project_id = p.id
LEFT JOIN org_members u ON t.user_id = u.user_id
WHERE t.date >= CURRENT_DATE - INTERVAL '7 days'
  AND t.date <= CURRENT_DATE
  AND t.org_id IS NOT NULL
ORDER BY t.date DESC, t.hours DESC;

-- Produtividade por usuário (últimos 7 dias)
CREATE OR REPLACE VIEW v_user_productivity AS
SELECT 
  t.org_id,
  t.user_id,
  u.name as user_name,
  u.email as user_email,
  COUNT(DISTINCT t.date) as days_worked,
  SUM(t.hours) as total_hours,
  SUM(t.minutes_live) as total_minutes,
  COUNT(DISTINCT t.project_id) as projects_count,
  COUNT(DISTINCT t.task_id) as tasks_count
FROM ops_timesheets t
LEFT JOIN org_members u ON t.user_id = u.user_id
WHERE t.date >= CURRENT_DATE - INTERVAL '7 days'
  AND t.date <= CURRENT_DATE
  AND t.org_id IS NOT NULL
GROUP BY t.org_id, t.user_id, u.name, u.email
ORDER BY total_hours DESC;

-- =====================================================
-- 4. VIEWS ATIVIDADES RECENTES
-- =====================================================

-- Atividades recentes do CRM
CREATE OR REPLACE VIEW v_recent_activities AS
SELECT 
  a.org_id,
  a.id,
  a.type,
  a.subject,
  a.description,
  a.related_type,
  a.related_id,
  a.assigned_to,
  a.due_date,
  a.completed_at,
  a.status,
  a.created_at,
  u.name as assigned_user_name,
  u.email as assigned_user_email
FROM crm_activities a
LEFT JOIN org_members u ON a.assigned_to = u.user_id
WHERE a.org_id IS NOT NULL
  AND a.created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY a.created_at DESC
LIMIT 50;

-- =====================================================
-- 5. VIEWS DE RESUMO GERAL
-- =====================================================

-- Resumo geral da organização
CREATE OR REPLACE VIEW v_org_summary AS
SELECT 
  o.id as org_id,
  o.name as org_name,
  o.slug as org_slug,
  
  -- Contadores CRM
  (SELECT COUNT(*) FROM crm_leads WHERE org_id = o.id AND status = 'new') as new_leads,
  (SELECT COUNT(*) FROM crm_accounts WHERE org_id = o.id AND status = 'active') as active_accounts,
  (SELECT COUNT(*) FROM crm_deals WHERE org_id = o.id AND status = 'open') as open_deals,
  
  -- Contadores Financeiro
  (SELECT COUNT(*) FROM fin_invoices WHERE org_id = o.id AND status = 'sent') as pending_invoices,
  (SELECT COUNT(*) FROM fin_subscriptions WHERE org_id = o.id AND status = 'active') as active_subscriptions,
  
  -- Contadores Projetos
  (SELECT COUNT(*) FROM ops_projects WHERE org_id = o.id AND status = 'active') as active_projects,
  (SELECT COUNT(*) FROM ops_tasks WHERE org_id = o.id AND status = 'todo') as pending_tasks

FROM orgs o
WHERE o.id IS NOT NULL;

-- =====================================================
-- 6. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON VIEW v_financial_kpis IS 'KPIs financeiros principais para o dashboard';
COMMENT ON VIEW fin_invoices_due_today IS 'Faturas que vencem hoje';
COMMENT ON VIEW v_sales_funnel IS 'Funil de vendas agrupado por stage';
COMMENT ON VIEW v_timesheets_live IS 'Timesheets dos últimos 7 dias';
COMMENT ON VIEW v_user_productivity IS 'Produtividade por usuário (últimos 7 dias)';
COMMENT ON VIEW v_recent_activities IS 'Atividades recentes do CRM';
COMMENT ON VIEW v_org_summary IS 'Resumo geral da organização';
