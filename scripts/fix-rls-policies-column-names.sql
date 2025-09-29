-- Script para corrigir as políticas RLS com os nomes corretos das colunas
-- Execute este script diretamente no Supabase SQL Editor

-- 1. Remover políticas existentes que usam nomes incorretos de colunas
DROP POLICY IF EXISTS "Users can view contacts in their org" ON crm_contacts;
DROP POLICY IF EXISTS "Users can insert contacts in their org" ON crm_contacts;
DROP POLICY IF EXISTS "Users can update contacts in their org" ON crm_contacts;
DROP POLICY IF EXISTS "Users can delete contacts in their org" ON crm_contacts;

DROP POLICY IF EXISTS "Users can view accounts in their org" ON crm_accounts;
DROP POLICY IF EXISTS "Users can insert accounts in their org" ON crm_accounts;
DROP POLICY IF EXISTS "Users can update accounts in their org" ON crm_accounts;
DROP POLICY IF EXISTS "Users can delete accounts in their org" ON crm_accounts;

-- 2. Criar políticas corretas para crm_contacts usando organization_id
CREATE POLICY "Users can view contacts in their org" ON crm_contacts
    FOR SELECT USING (
        organization_id = (
            SELECT org_id FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert contacts in their org" ON crm_contacts
    FOR INSERT WITH CHECK (
        organization_id = (
            SELECT org_id FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update contacts in their org" ON crm_contacts
    FOR UPDATE USING (
        organization_id = (
            SELECT org_id FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete contacts in their org" ON crm_contacts
    FOR DELETE USING (
        organization_id = (
            SELECT org_id FROM users 
            WHERE id = auth.uid()
        )
    );

-- 3. Criar políticas corretas para crm_accounts usando organization_id
CREATE POLICY "Users can view accounts in their org" ON crm_accounts
    FOR SELECT USING (
        organization_id = (
            SELECT org_id FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert accounts in their org" ON crm_accounts
    FOR INSERT WITH CHECK (
        organization_id = (
            SELECT org_id FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update accounts in their org" ON crm_accounts
    FOR UPDATE USING (
        organization_id = (
            SELECT org_id FROM users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete accounts in their org" ON crm_accounts
    FOR DELETE USING (
        organization_id = (
            SELECT org_id FROM users 
            WHERE id = auth.uid()
        )
    );

-- 4. Verificar se as políticas foram criadas corretamente
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
    AND policyname LIKE 'Users can%'
ORDER BY tablename, policyname;
