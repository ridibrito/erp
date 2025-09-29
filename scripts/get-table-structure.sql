-- Script para obter estrutura detalhada das tabelas CRM
-- Execute no SQL Editor do Supabase

-- Estrutura da tabela crm_accounts
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'crm_accounts'
ORDER BY ordinal_position;

-- Estrutura da tabela crm_contacts  
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'crm_contacts'
ORDER BY ordinal_position;
