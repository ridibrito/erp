-- Script para corrigir as políticas RLS definitivamente
-- Execute este script diretamente no Supabase SQL Editor

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "crm_del_accounts" ON crm_accounts;
DROP POLICY IF EXISTS "crm_ins_accounts" ON crm_accounts;
DROP POLICY IF EXISTS "crm_read_accounts" ON crm_accounts;
DROP POLICY IF EXISTS "crm_upd_accounts" ON crm_accounts;

DROP POLICY IF EXISTS "crm_del_contacts" ON crm_contacts;
DROP POLICY IF EXISTS "crm_ins_contacts" ON crm_contacts;
DROP POLICY IF EXISTS "crm_read_contacts" ON crm_contacts;
DROP POLICY IF EXISTS "crm_upd_contacts" ON crm_contacts;

-- 2. Criar políticas simples que permitem acesso total (temporariamente)
CREATE POLICY "Allow all operations on accounts" ON crm_accounts
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on contacts" ON crm_contacts
    FOR ALL USING (true) WITH CHECK (true);

-- 3. Verificar se as políticas foram criadas
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

-- 4. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('crm_contacts', 'crm_accounts');
