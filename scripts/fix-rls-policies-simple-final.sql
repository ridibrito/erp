-- Script para corrigir políticas RLS definitivamente
-- Execute este script no Supabase SQL Editor

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "crm_del_accounts" ON crm_accounts;
DROP POLICY IF EXISTS "crm_ins_accounts" ON crm_accounts;
DROP POLICY IF EXISTS "crm_read_accounts" ON crm_accounts;
DROP POLICY IF EXISTS "crm_upd_accounts" ON crm_accounts;

DROP POLICY IF EXISTS "crm_del_contacts" ON crm_contacts;
DROP POLICY IF EXISTS "crm_ins_contacts" ON crm_contacts;
DROP POLICY IF EXISTS "crm_read_contacts" ON crm_contacts;
DROP POLICY IF EXISTS "crm_upd_contacts" ON crm_contacts;

-- 2. Criar políticas simples e permissivas
CREATE POLICY "allow_all_accounts" ON crm_accounts FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_contacts" ON crm_contacts FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. Verificar se RLS está habilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename IN ('crm_accounts', 'crm_contacts')
AND schemaname = 'public';

-- 4. Verificar políticas criadas
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
AND schemaname = 'public';
