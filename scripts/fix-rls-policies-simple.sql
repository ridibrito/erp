-- Script alternativo para configurar RLS (Row Level Security) nas tabelas CRM
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

-- 3. Criar políticas simples para crm_contacts (permitir tudo por enquanto)
CREATE POLICY "Allow all operations on contacts" ON crm_contacts
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Criar políticas simples para crm_accounts (permitir tudo por enquanto)
CREATE POLICY "Allow all operations on accounts" ON crm_accounts
    FOR ALL USING (true) WITH CHECK (true);

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

-- 6. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('crm_contacts', 'crm_accounts');
