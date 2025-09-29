-- Verificar campos UUID na tabela crm_contacts
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela crm_contacts
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'crm_contacts'
AND table_schema = 'public'
AND data_type = 'uuid'
ORDER BY ordinal_position;

-- 2. Verificar constraints de chave estrangeira
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'crm_contacts'
AND tc.table_schema = 'public';
