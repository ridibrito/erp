-- Verificar e corrigir constraint da coluna account_id
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da coluna account_id
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'crm_contacts'
AND table_schema = 'public'
AND column_name = 'account_id';

-- 2. Verificar constraints da tabela
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
AND kcu.column_name = 'account_id';

-- 3. Tornar a coluna account_id nullable (opcional)
ALTER TABLE crm_contacts ALTER COLUMN account_id DROP NOT NULL;

-- 4. Verificar se a alteração foi aplicada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'crm_contacts'
AND table_schema = 'public'
AND column_name = 'account_id';
