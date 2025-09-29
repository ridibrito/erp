-- Script para analisar estrutura das tabelas CRM
-- Execute este script no SQL Editor do Supabase

-- 1. Estrutura da tabela crm_accounts
SELECT 
    'crm_accounts' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'crm_accounts'
ORDER BY ordinal_position;

-- 2. Estrutura da tabela crm_contacts
SELECT 
    'crm_contacts' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'crm_contacts'
ORDER BY ordinal_position;

-- 3. Relacionamentos entre as tabelas
SELECT 
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
    AND (tc.table_name = 'crm_accounts' OR tc.table_name = 'crm_contacts')
ORDER BY tc.table_name, kcu.column_name;

-- 4. Índices das tabelas CRM
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND (tablename = 'crm_accounts' OR tablename = 'crm_contacts')
ORDER BY tablename, indexname;

-- 5. Políticas RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND (tablename = 'crm_accounts' OR tablename = 'crm_contacts')
ORDER BY tablename, policyname;

-- 6. Contagem de registros (se houver dados)
SELECT 
    'crm_accounts' as table_name,
    COUNT(*) as record_count
FROM crm_accounts
UNION ALL
SELECT 
    'crm_contacts' as table_name,
    COUNT(*) as record_count
FROM crm_contacts;
