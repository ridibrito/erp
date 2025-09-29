-- Script para corrigir permissões das tabelas CRM
-- Execute este script no Supabase SQL Editor

-- Habilitar RLS nas tabelas CRM
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_accounts ENABLE ROW LEVEL SECURITY;

-- Criar políticas para crm_accounts
DROP POLICY IF EXISTS "Users can view accounts from their organization" ON crm_accounts;
CREATE POLICY "Users can view accounts from their organization" ON crm_accounts
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert accounts in their organization" ON crm_accounts;
CREATE POLICY "Users can insert accounts in their organization" ON crm_accounts
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update accounts from their organization" ON crm_accounts;
CREATE POLICY "Users can update accounts from their organization" ON crm_accounts
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete accounts from their organization" ON crm_accounts;
CREATE POLICY "Users can delete accounts from their organization" ON crm_accounts
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

-- Criar políticas para crm_contacts
DROP POLICY IF EXISTS "Users can view contacts from their organization" ON crm_contacts;
CREATE POLICY "Users can view contacts from their organization" ON crm_contacts
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert contacts in their organization" ON crm_contacts;
CREATE POLICY "Users can insert contacts in their organization" ON crm_contacts
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update contacts from their organization" ON crm_contacts;
CREATE POLICY "Users can update contacts from their organization" ON crm_contacts
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete contacts from their organization" ON crm_contacts;
CREATE POLICY "Users can delete contacts from their organization" ON crm_contacts
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

-- Verificar se as colunas existem e criar se necessário
DO $$
BEGIN
    -- Verificar e adicionar colunas em crm_accounts se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_accounts' AND column_name = 'document') THEN
        ALTER TABLE crm_accounts ADD COLUMN document TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_accounts' AND column_name = 'document_type') THEN
        ALTER TABLE crm_accounts ADD COLUMN document_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_accounts' AND column_name = 'fantasy_name') THEN
        ALTER TABLE crm_accounts ADD COLUMN fantasy_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_accounts' AND column_name = 'phone') THEN
        ALTER TABLE crm_accounts ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_accounts' AND column_name = 'address') THEN
        ALTER TABLE crm_accounts ADD COLUMN address JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_accounts' AND column_name = 'status') THEN
        ALTER TABLE crm_accounts ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_accounts' AND column_name = 'organization_id') THEN
        ALTER TABLE crm_accounts ADD COLUMN organization_id UUID REFERENCES organizations(id);
    END IF;

    -- Verificar e adicionar colunas em crm_contacts se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_contacts' AND column_name = 'first_name') THEN
        ALTER TABLE crm_contacts ADD COLUMN first_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_contacts' AND column_name = 'last_name') THEN
        ALTER TABLE crm_contacts ADD COLUMN last_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_contacts' AND column_name = 'document') THEN
        ALTER TABLE crm_contacts ADD COLUMN document TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_contacts' AND column_name = 'document_type') THEN
        ALTER TABLE crm_contacts ADD COLUMN document_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_contacts' AND column_name = 'position') THEN
        ALTER TABLE crm_contacts ADD COLUMN position TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_contacts' AND column_name = 'account_id') THEN
        ALTER TABLE crm_contacts ADD COLUMN account_id UUID REFERENCES crm_accounts(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_contacts' AND column_name = 'phone') THEN
        ALTER TABLE crm_contacts ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_contacts' AND column_name = 'address') THEN
        ALTER TABLE crm_contacts ADD COLUMN address JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_contacts' AND column_name = 'status') THEN
        ALTER TABLE crm_contacts ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_contacts' AND column_name = 'organization_id') THEN
        ALTER TABLE crm_contacts ADD COLUMN organization_id UUID REFERENCES organizations(id);
    END IF;
END $$;

-- Verificar estrutura final
SELECT 'crm_accounts' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'crm_accounts' 
ORDER BY ordinal_position;

SELECT 'crm_contacts' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'crm_contacts' 
ORDER BY ordinal_position;
