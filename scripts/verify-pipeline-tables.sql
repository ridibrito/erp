-- Verificar todas as tabelas de pipelines
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar tabela crm_pipelines
SELECT 'crm_pipelines' as tabela, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'crm_pipelines' 
ORDER BY ordinal_position;

-- 2. Verificar tabela crm_pipeline_stages
SELECT 'crm_pipeline_stages' as tabela, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'crm_pipeline_stages' 
ORDER BY ordinal_position;

-- 3. Verificar se existem dados nas tabelas
SELECT 'Pipelines existentes:' as info, COUNT(*) as total FROM crm_pipelines;
SELECT 'Etapas existentes:' as info, COUNT(*) as total FROM crm_pipeline_stages;
SELECT 'Negócios existentes:' as info, COUNT(*) as total FROM crm_negocios;

-- 4. Verificar permissões
SELECT schemaname, tablename, hasinserts, hasselects, hasupdates, hasdeletes
FROM pg_tables 
WHERE tablename IN ('crm_pipelines', 'crm_pipeline_stages', 'crm_negocios');
