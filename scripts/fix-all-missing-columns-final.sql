-- Script completo para adicionar todas as colunas faltantes nas tabelas CRM
-- Execute este script diretamente no Supabase SQL Editor

-- 1. Verificar status atual das colunas
SELECT 
    'crm_contacts' as table_name,
    'type' as column_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND column_name = 'type'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'crm_contacts' as table_name,
    'name' as column_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND column_name = 'name'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
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

-- 2. Adicionar coluna type na tabela crm_contacts se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE crm_contacts ADD COLUMN type VARCHAR(20) DEFAULT 'person' CHECK (type IN ('person', 'company'));
        RAISE NOTICE 'Coluna type adicionada à tabela crm_contacts';
    ELSE
        RAISE NOTICE 'Coluna type já existe na tabela crm_contacts';
    END IF;
END $$;

-- 3. Adicionar coluna name na tabela crm_contacts se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE crm_contacts ADD COLUMN name VARCHAR(255);
        RAISE NOTICE 'Coluna name adicionada à tabela crm_contacts';
    ELSE
        RAISE NOTICE 'Coluna name já existe na tabela crm_contacts';
    END IF;
END $$;

-- 4. Adicionar coluna organization_id na tabela crm_contacts se não existir
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

-- 5. Adicionar coluna fantasy_name na tabela crm_contacts se não existir
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

-- 6. Adicionar coluna organization_id na tabela crm_accounts se não existir
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

-- 7. Verificar se todas as colunas foram adicionadas com sucesso
SELECT 
    'crm_contacts' as table_name,
    'type' as column_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND column_name = 'type'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'crm_contacts' as table_name,
    'name' as column_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND column_name = 'name'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
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
