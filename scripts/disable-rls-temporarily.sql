-- Script para desabilitar temporariamente o RLS nas tabelas CRM
-- Execute este script diretamente no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente nas tabelas
ALTER TABLE crm_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_accounts DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se RLS foi desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('crm_contacts', 'crm_accounts');

-- 3. Verificar se ainda há políticas ativas
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
WHERE tablename IN ('crm_contacts', 'crm_accounts')
ORDER BY tablename, policyname;
