-- Verificar estrutura atual da tabela crm_contacts
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todas as colunas da tabela crm_contacts
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'crm_contacts'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar constraints NOT NULL
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'crm_contacts'
AND tc.table_schema = 'public'
AND tc.constraint_type = 'CHECK'
ORDER BY kcu.ordinal_position;
