-- Script para adicionar colunas faltantes nas tabelas CRM
-- Execute este script diretamente no Supabase SQL Editor

-- 1. Verificar se as colunas existem
SELECT 
    'crm_contacts' as table_name,
    'organization_id' as column_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND column_name = 'organization_id'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'crm_contacts' as table_name,
    'fantasy_name' as column_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND column_name = 'fantasy_name'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'crm_accounts' as table_name,
    'organization_id' as column_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_accounts' 
        AND column_name = 'organization_id'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status;

-- 2. Adicionar coluna organization_id na tabela crm_contacts se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE crm_contacts ADD COLUMN organization_id UUID;
        RAISE NOTICE 'Coluna organization_id adicionada à tabela crm_contacts';
    ELSE
        RAISE NOTICE 'Coluna organization_id já existe na tabela crm_contacts';
    END IF;
END $$;

-- 3. Adicionar coluna fantasy_name na tabela crm_contacts se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND column_name = 'fantasy_name'
    ) THEN
        ALTER TABLE crm_contacts ADD COLUMN fantasy_name VARCHAR(255);
        RAISE NOTICE 'Coluna fantasy_name adicionada à tabela crm_contacts';
    ELSE
        RAISE NOTICE 'Coluna fantasy_name já existe na tabela crm_contacts';
    END IF;
END $$;

-- 4. Adicionar coluna organization_id na tabela crm_accounts se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_accounts' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE crm_accounts ADD COLUMN organization_id UUID;
        RAISE NOTICE 'Coluna organization_id adicionada à tabela crm_accounts';
    ELSE
        RAISE NOTICE 'Coluna organization_id já existe na tabela crm_accounts';
    END IF;
END $$;

-- 5. Verificar se as colunas foram adicionadas com sucesso
SELECT 
    'crm_contacts' as table_name,
    'organization_id' as column_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND column_name = 'organization_id'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'crm_contacts' as table_name,
    'fantasy_name' as column_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND column_name = 'fantasy_name'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'crm_accounts' as table_name,
    'organization_id' as column_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_accounts' 
        AND column_name = 'organization_id'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status;
