-- =====================================================
-- SCRIPT SIMPLES PARA VERIFICAR TABELAS
-- =====================================================

-- 1. Listar todas as tabelas (método simples)
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Verificar se crm_contacts existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'crm_contacts'
        ) 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as status_crm_contacts;

-- 3. Verificar se crm_accounts existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'crm_accounts'
        ) 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as status_crm_accounts;

-- 4. Listar colunas da crm_contacts
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'crm_contacts'
ORDER BY ordinal_position;

-- 5. Testar inserção simples (comentado para não executar acidentalmente)
-- INSERT INTO crm_contacts (org_id, email, status) 
-- VALUES ('00000000-0000-0000-0000-000000000001', 'teste@teste.com', 'active');
