-- Adicionar coluna position que está faltando na tabela crm_contacts
-- Execute este script no Supabase SQL Editor

-- 1. Verificar colunas atuais da tabela crm_contacts
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'crm_contacts'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar coluna position se não existir
DO $$ 
BEGIN
    -- Verificar se a coluna position existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND column_name = 'position' 
        AND table_schema = 'public'
    ) THEN
        -- Adicionar coluna position
        ALTER TABLE crm_contacts ADD COLUMN position TEXT;
        RAISE NOTICE 'Coluna position adicionada à tabela crm_contacts';
    ELSE
        RAISE NOTICE 'Coluna position já existe na tabela crm_contacts';
    END IF;
END $$;

-- 3. Verificar se a coluna foi adicionada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'crm_contacts'
AND table_schema = 'public'
AND column_name = 'position';

-- 4. Listar todas as colunas da tabela crm_contacts
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'crm_contacts'
AND table_schema = 'public'
ORDER BY ordinal_position;
