-- Adicionar colunas faltantes na tabela crm_accounts
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual da tabela crm_accounts
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'crm_accounts'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar colunas faltantes
DO $$ 
BEGIN
    -- Adicionar coluna document se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'crm_accounts' 
        AND column_name = 'document' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE crm_accounts ADD COLUMN document TEXT;
        RAISE NOTICE 'Coluna document adicionada à tabela crm_accounts';
    ELSE
        RAISE NOTICE 'Coluna document já existe na tabela crm_accounts';
    END IF;

    -- Adicionar coluna document_type se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'crm_accounts' 
        AND column_name = 'document_type' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE crm_accounts ADD COLUMN document_type TEXT;
        RAISE NOTICE 'Coluna document_type adicionada à tabela crm_accounts';
    ELSE
        RAISE NOTICE 'Coluna document_type já existe na tabela crm_accounts';
    END IF;

    -- Adicionar coluna status se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'crm_accounts' 
        AND column_name = 'status' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE crm_accounts ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE 'Coluna status adicionada à tabela crm_accounts';
    ELSE
        RAISE NOTICE 'Coluna status já existe na tabela crm_accounts';
    END IF;

    -- Adicionar coluna notes se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'crm_accounts' 
        AND column_name = 'notes' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE crm_accounts ADD COLUMN notes TEXT;
        RAISE NOTICE 'Coluna notes adicionada à tabela crm_accounts';
    ELSE
        RAISE NOTICE 'Coluna notes já existe na tabela crm_accounts';
    END IF;

    -- Adicionar coluna fantasy_name se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'crm_accounts' 
        AND column_name = 'fantasy_name' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE crm_accounts ADD COLUMN fantasy_name TEXT;
        RAISE NOTICE 'Coluna fantasy_name adicionada à tabela crm_accounts';
    ELSE
        RAISE NOTICE 'Coluna fantasy_name já existe na tabela crm_accounts';
    END IF;
END $$;

-- 3. Verificar estrutura final da tabela crm_accounts
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'crm_accounts'
AND table_schema = 'public'
ORDER BY ordinal_position;
