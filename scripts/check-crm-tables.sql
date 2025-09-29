-- =====================================================
-- SCRIPT PARA VERIFICAR TABELAS CRM NO SUPABASE SQL EDITOR
-- =====================================================

-- 1. Listar todas as tabelas
SELECT 
    tablename as "Nome da Tabela",
    tableowner as "Proprietário",
    CASE WHEN hasindexes THEN 'Sim' ELSE 'Não' END as "Tem Índices",
    CASE WHEN hastriggers THEN 'Sim' ELSE 'Não' END as "Tem Triggers",
    CASE WHEN rowsecurity THEN 'Sim' ELSE 'Não' END as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Verificar especificamente as tabelas CRM
SELECT 
    tablename as "Tabela CRM",
    CASE WHEN rowsecurity THEN 'Sim' ELSE 'Não' END as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename LIKE 'crm_%'
ORDER BY tablename;

-- 3. Verificar se crm_contacts existe
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
        AND table_name = 'crm_contacts'
) as "crm_contacts existe";

-- 4. Verificar se crm_accounts existe
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
        AND table_name = 'crm_accounts'
) as "crm_accounts existe";

-- 5. Listar colunas da crm_contacts (se existir)
SELECT 
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'crm_contacts'
ORDER BY ordinal_position;

-- 6. Contar total de tabelas
SELECT 
    COUNT(*) as "Total de Tabelas"
FROM pg_tables 
WHERE schemaname = 'public';