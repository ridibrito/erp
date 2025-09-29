-- Script para configurar RLS (Row Level Security) nas tabelas CRM
-- Execute este script diretamente no Supabase SQL Editor

-- 1. Habilitar RLS nas tabelas se não estiver habilitado
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_accounts ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view contacts in their org" ON crm_contacts;
DROP POLICY IF EXISTS "Users can insert contacts in their org" ON crm_contacts;
DROP POLICY IF EXISTS "Users can update contacts in their org" ON crm_contacts;
DROP POLICY IF EXISTS "Users can delete contacts in their org" ON crm_contacts;

DROP POLICY IF EXISTS "Users can view accounts in their org" ON crm_accounts;
DROP POLICY IF EXISTS "Users can insert accounts in their org" ON crm_accounts;
DROP POLICY IF EXISTS "Users can update accounts in their org" ON crm_accounts;
DROP POLICY IF EXISTS "Users can delete accounts in their org" ON crm_accounts;

-- 3. Criar políticas para crm_contacts
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

-- 4. Criar políticas para crm_accounts
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

-- 5. Verificar se as políticas foram criadas
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
