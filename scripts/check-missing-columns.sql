-- Verificar colunas da tabela crm_contacts
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'crm_contacts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar colunas da tabela crm_accounts
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'crm_accounts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se as colunas específicas existem
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
