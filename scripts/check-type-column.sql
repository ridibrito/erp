-- Verificar se a coluna type existe na tabela crm_contacts
SELECT 
    'crm_contacts' as table_name,
    'type' as column_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND column_name = 'type'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Adicionar coluna type se não existir
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

-- Verificar se a coluna name existe na tabela crm_contacts
SELECT 
    'crm_contacts' as table_name,
    'name' as column_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_contacts' 
        AND column_name = 'name'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Adicionar coluna name se não existir
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
