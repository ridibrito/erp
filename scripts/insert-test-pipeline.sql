-- Inserir pipeline de teste
-- Execute este SQL no Supabase SQL Editor

-- 1. Inserir pipeline de teste
INSERT INTO crm_pipelines (id, name, description, org_id, is_default) 
SELECT 
    gen_random_uuid(),
    'Pipeline de Vendas',
    'Pipeline padrão para gerenciamento de vendas',
    id,
    true
FROM orgs 
WHERE NOT EXISTS (
    SELECT 1 FROM crm_pipelines WHERE org_id = orgs.id
)
LIMIT 1;

-- 2. Inserir etapas para o pipeline
INSERT INTO crm_pipeline_stages (pipeline_id, name, color, "order", is_won, is_lost)
SELECT 
    p.id,
    stage_data.name,
    stage_data.color,
    stage_data."order",
    stage_data.is_won,
    stage_data.is_lost
FROM crm_pipelines p
CROSS JOIN (
    VALUES 
        ('Prospecting', '#3B82F6', 1, false, false),
        ('Qualification', '#8B5CF6', 2, false, false),
        ('Proposal', '#F59E0B', 3, false, false),
        ('Negotiation', '#EF4444', 4, false, false),
        ('Closed Won', '#10B981', 5, true, false),
        ('Closed Lost', '#6B7280', 6, false, true)
) AS stage_data(name, color, "order", is_won, is_lost)
WHERE p.is_default = true
AND NOT EXISTS (
    SELECT 1 FROM crm_pipeline_stages WHERE pipeline_id = p.id
);

-- 3. Verificar se foi inserido corretamente
SELECT 'Pipeline criado:' as info, name, description, is_default FROM crm_pipelines WHERE is_default = true;
SELECT 'Etapas criadas:' as info, name, color, "order" FROM crm_pipeline_stages ORDER BY "order";
