-- Diagnóstico completo das tabelas CRM
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se as tabelas existem
SELECT 
    schemaname, 
    tablename, 
    tableowner,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename IN ('crm_accounts', 'crm_contacts')
AND schemaname = 'public';

-- 2. Verificar políticas ativas
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
WHERE tablename IN ('crm_accounts', 'crm_contacts')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Verificar colunas das tabelas
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('crm_accounts', 'crm_contacts')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 4. Verificar permissões do usuário atual
SELECT 
    grantee, 
    table_name, 
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name IN ('crm_accounts', 'crm_contacts')
AND table_schema = 'public'
ORDER BY table_name, privilege_type;

-- 5. Testar inserção simples (se possível)
-- SELECT 'Teste de acesso às tabelas CRM' as status;
