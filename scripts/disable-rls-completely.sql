-- Desabilitar RLS completamente nas tabelas CRM
-- Execute este script no Supabase SQL Editor

-- 1. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "crm_del_accounts" ON crm_accounts;
DROP POLICY IF EXISTS "crm_ins_accounts" ON crm_accounts;
DROP POLICY IF EXISTS "crm_read_accounts" ON crm_accounts;
DROP POLICY IF EXISTS "crm_upd_accounts" ON crm_accounts;
DROP POLICY IF EXISTS "allow_all_accounts" ON crm_accounts;

DROP POLICY IF EXISTS "crm_del_contacts" ON crm_contacts;
DROP POLICY IF EXISTS "crm_ins_contacts" ON crm_contacts;
DROP POLICY IF EXISTS "crm_read_contacts" ON crm_contacts;
DROP POLICY IF EXISTS "crm_upd_contacts" ON crm_contacts;
DROP POLICY IF EXISTS "allow_all_contacts" ON crm_contacts;

-- 2. Desabilitar RLS nas tabelas
ALTER TABLE crm_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts DISABLE ROW LEVEL SECURITY;

-- 3. Verificar status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename IN ('crm_accounts', 'crm_contacts')
AND schemaname = 'public';

-- 4. Verificar se ainda há políticas
SELECT 
    schemaname, 
    tablename, 
    policyname
FROM pg_policies 
WHERE tablename IN ('crm_accounts', 'crm_contacts')
AND schemaname = 'public';
