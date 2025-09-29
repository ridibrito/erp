-- Script para executar a correção das políticas RLS
-- Execute este script diretamente no Supabase SQL Editor

-- 1. Remover apenas as políticas problemáticas que usam nomes incorretos de colunas
DROP POLICY IF EXISTS "Users can view contacts in their org" ON crm_contacts;
DROP POLICY IF EXISTS "Users can insert contacts in their org" ON crm_contacts;
DROP POLICY IF EXISTS "Users can update contacts in their org" ON crm_contacts;
DROP POLICY IF EXISTS "Users can delete contacts in their org" ON crm_contacts;

DROP POLICY IF EXISTS "Users can view accounts in their org" ON crm_accounts;
DROP POLICY IF EXISTS "Users can insert accounts in their org" ON crm_accounts;
DROP POLICY IF EXISTS "Users can update accounts in their org" ON crm_accounts;
DROP POLICY IF EXISTS "Users can delete accounts in their org" ON crm_accounts;

-- 2. Verificar se as políticas com app_has_scope estão funcionando
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
    AND policyname LIKE 'crm_%'
ORDER BY tablename, policyname;

-- 3. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('crm_contacts', 'crm_accounts');
