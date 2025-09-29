-- Inserir negócio de teste
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar pipelines e etapas existentes
SELECT 'Pipelines:' as info, id, name, is_default FROM crm_pipelines;
SELECT 'Etapas:' as info, id, pipeline_id, name, "order" FROM crm_pipeline_stages ORDER BY pipeline_id, "order";

-- 2. Inserir negócio de teste
INSERT INTO crm_negocios (
    title, 
    client, 
    value, 
    probability, 
    stage_id, 
    pipeline_id, 
    org_id, 
    responsible, 
    status
) 
SELECT 
    'Negócio de Teste',
    'Cliente Teste',
    50000.00,
    75,
    ps.id,
    p.id,
    o.id,
    'Usuário Teste',
    'active'
FROM crm_pipelines p
JOIN crm_pipeline_stages ps ON ps.pipeline_id = p.id
JOIN orgs o ON o.id = p.org_id
WHERE p.is_default = true 
AND ps."order" = 1  -- Primeira etapa
LIMIT 1;

-- 3. Verificar se foi inserido
SELECT 'Negócio inserido:' as info, id, title, client, stage_id, pipeline_id FROM crm_negocios ORDER BY created_at DESC LIMIT 1;
