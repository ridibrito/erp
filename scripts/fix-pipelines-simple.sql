-- SQL SIMPLES para executar no Supabase
-- Execute este SQL no SQL Editor do Supabase

-- 1. Adicionar colunas faltantes
ALTER TABLE crm_pipelines 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE crm_pipelines 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- 2. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'crm_pipelines' 
ORDER BY ordinal_position;
